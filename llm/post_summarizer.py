"""
帖子总结服务
根据对话历史生成帖子总结草稿
"""

from typing import List, Dict, Optional
import re

try:
    from .llm_service import LLMService
    from .prompts import (
        SUMMARY_FROM_CONVERSATION_PROMPT,
        get_summary_from_text_prompt,
        get_enhance_post_prompt,
        get_greeting_prompt,
        get_proactive_care_prompt,
        FOLLOW_UP_POSITIVE_AFTER_CHAT,
        FOLLOW_UP_NEGATIVE_AFTER_CHAT,
        FOLLOW_UP_POSITIVE_NO_CHAT,
        FOLLOW_UP_NEGATIVE_NO_CHAT
    )
except ImportError:
    from llm_service import LLMService
    from prompts import (
        SUMMARY_FROM_CONVERSATION_PROMPT,
        get_summary_from_text_prompt,
        get_enhance_post_prompt,
        get_greeting_prompt,
        get_proactive_care_prompt,
        FOLLOW_UP_POSITIVE_AFTER_CHAT,
        FOLLOW_UP_NEGATIVE_AFTER_CHAT,
        FOLLOW_UP_POSITIVE_NO_CHAT,
        FOLLOW_UP_NEGATIVE_NO_CHAT
    )


class PostSummarizer:
    """帖子总结器"""
    
    def __init__(self, llm_service: LLMService = None):
        """
        初始化帖子总结器
        
        Args:
            llm_service: LLM 服务实例，默认创建新实例
        """
        self.llm = llm_service or LLMService()
        
        # 总结提示词 - 从配置文件加载
        self.summary_prompt = SUMMARY_FROM_CONVERSATION_PROMPT
    
    def generate_summary(
        self,
        conversation_history: List[Dict[str, str]],
        max_length: int = 200
    ) -> Dict:
        """
        生成帖子总结
        
        Args:
            conversation_history: 对话历史
            max_length: 最大字数
        
        Returns:
            包含总结内容的字典
        """
        if not conversation_history:
            return {
                'success': False,
                'summary': '',
                'error': '没有对话内容可供总结'
            }
        
        # 构建对话文本
        conversation_text = self._format_conversation(conversation_history)
        
        # 构建完整提示
        full_prompt = self.summary_prompt + "\n" + conversation_text + f"\n\n请生成一个不超过{max_length}字的帖子："
        
        # 调用 LLM
        response = self.llm.chat(
            full_prompt,
            conversation_history=[],
            temperature=0.5,
            max_tokens=300
        )
        
        if not response['success']:
            return {
                'success': False,
                'summary': '',
                'error': response.get('error')
            }
        
        # 清理总结文本
        summary = self._clean_summary(response['message'])
        
        return {
            'success': True,
            'summary': summary,
            'word_count': len(summary)
        }
    
    def generate_summary_from_text(self, text: str) -> Dict:
        """
        直接从文本生成总结
        
        策略：所有文本都经过 LLM 总结，确保生成有意义的摘要
        
        Args:
            text: 用户输入的文本（对话文本）
        
        Returns:
            包含总结内容的字典
        """
        # 如果文本太短（少于20字），可能不是完整对话
        if len(text) < 20:
            return {
                'success': True,
                'summary': text.strip(),
                'word_count': len(text),
                'is_original': True,
                'note': '文本过短，直接返回'
            }
        
        # 所有对话文本都使用 LLM 总结，生成有意义的摘要
        prompt = get_summary_from_text_prompt(text, max_length=200)
        
        print(f"生成总结：文本长度 {len(text)} 字，开始调用 LLM...")
        
        response = self.llm.chat(
            prompt,
            conversation_history=[],
            temperature=0.4,
            max_tokens=250
        )
        
        if not response['success']:
            # 如果 LLM 失败，截取前 200 字作为降级方案
            print(f"LLM 总结失败，使用降级方案")
            return {
                'success': True,
                'summary': text[:200].strip(),
                'word_count': min(len(text), 200),
                'is_truncated': True,
                'is_fallback': True
            }
        
        summary = self._clean_summary(response['message'])
        
        print(f"LLM 总结成功：{summary[:50]}...")
        
        return {
            'success': True,
            'summary': summary,
            'word_count': len(summary),
            'original_length': len(text)
        }
    
    def enhance_post(self, text: str) -> Dict:
        """
        优化帖子表达
        
        Args:
            text: 原始帖子文本
        
        Returns:
            优化后的帖子
        """
        prompt = get_enhance_post_prompt(text)
        
        response = self.llm.chat(
            prompt,
            conversation_history=[],
            temperature=0.6,
            max_tokens=250
        )
        
        if not response['success']:
            return {
                'success': False,
                'enhanced_text': text,
                'is_enhanced': False
            }
        
        enhanced = self._clean_summary(response['message'])
        
        return {
            'success': True,
            'enhanced_text': enhanced,
            'original_text': text,
            'is_enhanced': True
        }
    
    def _format_conversation(self, conversation_history: List[Dict[str, str]]) -> str:
        """格式化对话历史"""
        lines = []
        for msg in conversation_history:
            role = "我" if msg['role'] == 'user' else "伙伴"
            lines.append(f"{role}: {msg['content']}")
        return "\n".join(lines)
    
    def _clean_summary(self, text: str) -> str:
        """
        清理总结文本
        
        Args:
            text: 原始文本
        
        Returns:
            清理后的文本
        """
        # 移除引号
        text = text.strip().strip('"').strip("'").strip("「").strip("」")
        
        # 移除可能的前缀
        prefixes = ['总结：', '帖子：', '内容：', '精炼：', '优化后：']
        for prefix in prefixes:
            if text.startswith(prefix):
                text = text[len(prefix):].strip()
        
        return text.strip()


class GreetingGenerator:
    """问候语生成器（用于长期记忆和主动关怀）"""
    
    def __init__(self, llm_service: LLMService = None):
        """
        初始化问候语生成器
        
        Args:
            llm_service: LLM 服务实例
        """
        self.llm = llm_service or LLMService()
    
    def generate_greeting(
        self,
        user_history: List[Dict],
        username: str = "朋友"
    ) -> Dict:
        """
        根据用户历史生成问候语
        
        Args:
            user_history: 用户历史帖子（包含时间、情感等信息）
            username: 用户名
        
        Returns:
            包含问候语的字典
        """
        if not user_history:
            return {
                'success': True,
                'greeting': f"你好呀！很高兴见到你 😊",
                'is_personalized': False
            }
        
        # 构建历史摘要
        history_summary = self._format_history(user_history)
        
        prompt = get_greeting_prompt(history_summary, username)
        
        response = self.llm.chat(
            prompt,
            conversation_history=[],
            temperature=0.7,
            max_tokens=100
        )
        
        if not response['success']:
            return {
                'success': True,
                'greeting': f"你好呀，{username}！今天过得怎么样？",
                'is_personalized': False
            }
        
        greeting = response['message'].strip().strip('"').strip("'")
        
        return {
            'success': True,
            'greeting': greeting,
            'is_personalized': True
        }
    
    def generate_follow_up(
        self,
        post_content: str,
        emotion_tag: str,
        emotion_intensity: int,
        had_conversation: bool = False
    ) -> str:
        """
        生成发帖后的跟进消息
        
        Args:
            post_content: 帖子内容
            emotion_tag: 情感标签
            emotion_intensity: 情绪强度
            had_conversation: 是否已经有过对话
        
        Returns:
            跟进消息
        """
        import random
        
        # 根据情感类型选择跟进策略
        positive_emotions = ['happy', 'excited', 'grateful', 'calm', 'hopeful']
        
        if had_conversation:
            # 已经聊过，发帖后的跟进
            if emotion_tag in positive_emotions:
                templates = FOLLOW_UP_POSITIVE_AFTER_CHAT
            else:
                templates = FOLLOW_UP_NEGATIVE_AFTER_CHAT
        else:
            # 没聊过直接发帖，引导对话
            if emotion_tag in positive_emotions:
                templates = FOLLOW_UP_POSITIVE_NO_CHAT
            else:
                templates = FOLLOW_UP_NEGATIVE_NO_CHAT
        
        # 随机选择一个模板
        return random.choice(templates)
    
    def generate_proactive_care_messages(
        self,
        user_history: List[Dict],
        username: str = "朋友",
        max_messages: int = 8
    ) -> Dict:
        """
        生成主动关怀消息列表
        基于用户历史生成多条关怀消息
        
        策略：优先使用真实历史记录，模拟消息最多占 1/6
        
        Args:
            user_history: 用户历史帖子列表
            username: 用户名
            max_messages: 最多生成的消息数量
        
        Returns:
            包含关怀消息列表的字典
        """
        # 计算允许的最大模拟消息数量（每 6 条中最多 1 条）
        max_simulated = max(1, max_messages // 6)
        
        if not user_history:
            # 没有历史记录，只返回 1 条欢迎消息（符合 1/6 规则）
            welcome_message = "你好呀！很高兴见到你。有什么想聊的吗？"
            return {
                'success': True,
                'messages': [welcome_message],
                'is_personalized': False,
                'note': '无历史记录，返回欢迎消息'
            }
        
        # 检查历史记录数量，如果太少，减少请求的消息数量
        history_count = len(user_history)
        if history_count < 3:
            # 历史记录太少，最多生成 1 条消息
            max_messages = min(1, max_messages)
        elif history_count < 5:
            # 历史记录较少，限制生成数量
            max_messages = min(2, max_messages)
        
        # 构建历史摘要（取更多历史以生成多样化的关怀消息）
        history_summary = self._format_history_for_care(user_history, max_items=10)
        
        prompt = get_proactive_care_prompt(history_summary, username, max_messages)
        
        response = self.llm.chat(
            prompt,
            conversation_history=[],
            temperature=0.8,
            max_tokens=500
        )
        
        if not response['success']:
            # 如果 LLM 生成失败，返回基于历史的简单关怀消息（不使用默认消息）
            fallback_messages = self._generate_fallback_care_messages(user_history, max_messages, use_generic=False)
            return {
                'success': True,
                'messages': fallback_messages,
                'is_personalized': True,
                'is_fallback': True,
                'note': 'LLM生成失败，使用基于真实历史的备用消息'
            }
        
        # 解析 LLM 返回的消息列表
        messages = self._parse_care_messages(response['message'], max_messages)
        
        # 如果解析失败或消息数量不足，优先返回已解析的消息
        # 只在消息数量远低于预期时才补充（且限制补充数量）
        if len(messages) < max_messages * 0.5:  # 少于预期的一半时才补充
            shortage = max_messages - len(messages)
            # 最多补充 max_simulated 条基于历史的消息
            supplement_count = min(shortage, max_simulated)
            fallback_messages = self._generate_fallback_care_messages(
                user_history, 
                supplement_count, 
                use_generic=False
            )
            messages.extend(fallback_messages)
            
            print(f"ProactiveCare: LLM返回消息不足，补充了 {len(fallback_messages)} 条基于历史的消息")
        
        return {
            'success': True,
            'messages': messages[:max_messages],
            'is_personalized': True,
            'history_count': history_count,
            'note': f'基于 {history_count} 条真实历史记录生成'
        }
    
    def _format_history_for_care(self, user_history: List[Dict], max_items: int = 10) -> str:
        """格式化用户历史（用于关怀消息生成，包含更多细节）"""
        lines = []
        for i, post in enumerate(user_history[-max_items:], 1):
            emotion = post.get('emotion_tag', '')
            content = post.get('content', '')[:100]  # 截取前 100 字以获取更多细节
            timestamp = post.get('timestamp', '')
            intensity = post.get('emotion_intensity', 5)
            
            lines.append(f"{i}. {timestamp} [情绪:{emotion}, 强度:{intensity}] {content}")
        
        return "\n".join(lines)
    
    def _parse_care_messages(self, text: str, max_messages: int) -> List[str]:
        """
        解析 LLM 返回的关怀消息文本
        
        Args:
            text: LLM 返回的文本
            max_messages: 最多解析的消息数量
        
        Returns:
            关怀消息列表
        """
        messages = []
        lines = text.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # 移除编号前缀（如 "1. "、"1、"等）
            line = re.sub(r'^\d+[\.、]\s*', '', line)
            
            # 移除引号
            line = line.strip().strip('"').strip("'").strip("「").strip("」")
            
            if line and len(line) > 10:  # 过滤太短的消息
                messages.append(line)
            
            if len(messages) >= max_messages:
                break
        
        return messages
    
    def _generate_fallback_care_messages(
        self, 
        user_history: List[Dict], 
        count: int,
        use_generic: bool = False
    ) -> List[str]:
        """
        生成备用的关怀消息（当 LLM 生成失败时使用）
        
        策略：优先基于真实历史内容生成，避免使用通用默认消息
        
        Args:
            user_history: 用户历史帖子
            count: 需要生成的数量
            use_generic: 是否允许使用通用默认消息（默认 False，遵循 1/6 规则）
        
        Returns:
            关怀消息列表
        """
        messages = []
        
        # 从历史中提取关键事件关键词和上下文
        keywords = []
        for post in user_history[-10:]:  # 查看更多历史以获取更多关键词
            content = post.get('content', '')
            emotion = post.get('emotion_tag', '')
            
            # 提取可能的关键词和上下文
            keyword_mapping = {
                '考试': '考试',
                '考': '考试',
                '复习': '考试',
                '项目': '项目',
                '朋友': '朋友',
                '吵架': '朋友',
                '队友': '团队',
                '打篮球': '运动',
                '篮球': '运动',
                '生日': '生日',
                '宿舍': '宿舍生活',
                '睡眠': '睡眠',
                '睡': '睡眠',
                '运动': '运动',
                '家人': '家人',
                '妈妈': '家人',
                '学习': '学习',
                '技能': '学习',
                '发烧': '健康',
                '生病': '健康',
                '实习': '职业',
                '工作': '职业',
                '喜欢': '感情',
                '表白': '感情'
            }
            
            for key, category in keyword_mapping.items():
                if key in content:
                    keywords.append((category, emotion, content[:80]))  # 保留上下文
        
        # 基于真实历史内容生成关怀消息（提取实际内容片段）
        for category, emotion, context in keywords[:count]:
            # 根据上下文生成更贴切的关怀消息
            if '打篮球' in context or '篮球' in context:
                if '队友' in context or '发脾气' in context:
                    messages.append("上次打篮球的事情，和队友的关系缓和了吗？")
                elif '失误' in context or '没投进' in context:
                    messages.append("那个关键球的失误，现在释怀了吗？不要太自责")
                else:
                    messages.append("还在坚持打篮球吗？运动是很好的放松方式")
            elif '生日' in context:
                messages.append("生日过后，心情有没有好一些？")
            elif '宿舍' in context and '一个人' in context:
                messages.append("最近和宿舍朋友们相处得怎么样？")
            elif '考试' in context or '复习' in context:
                messages.append("考试的压力缓解了吗？要记得劳逸结合")
            elif '朋友' in context and ('冷落' in context or '亲近' in context):
                messages.append("你和那位朋友的关系，有没有找机会聊聊？")
            elif '发烧' in context or '生病' in context:
                messages.append("身体完全恢复了吗？要好好照顾自己")
            elif '实习' in context or '工作' in context:
                messages.append("对未来的规划有新的想法了吗？")
            elif '喜欢' in context or '表白' in context:
                messages.append("那个让你在意的人，最近相处得如何？")
            
            if len(messages) >= count:
                break
        
        # 如果基于历史生成的消息不足，且允许使用通用消息
        if len(messages) < count and use_generic:
            # 只在明确允许的情况下才使用通用消息，且数量有限
            generic_messages = [
                "今天过得怎么样？",
                "最近有什么想分享的吗？"
            ]
            shortage = count - len(messages)
            messages.extend(generic_messages[:shortage])
        
        return messages[:count]
    
    def _format_history(self, user_history: List[Dict]) -> str:
        """格式化用户历史"""
        lines = []
        for i, post in enumerate(user_history[-3:], 1):  # 只取最近 3 条
            emotion = post.get('emotion_tag', '')
            content = post.get('content', '')[:50]  # 截取前 50 字
            timestamp = post.get('timestamp', '')
            
            lines.append(f"{i}. {timestamp} [{emotion}] {content}...")
        
        return "\n".join(lines)


if __name__ == "__main__":
    # 测试帖子总结
    print("测试帖子总结服务...")
    
    summarizer = PostSummarizer()
    
    # 测试对话总结
    print("\n1. 测试对话总结：")
    test_conversation = [
        {"role": "user", "content": "今天考试没考好"},
        {"role": "assistant", "content": "听起来你有点失落"},
        {"role": "user", "content": "是的，我很难过，准备了很久但还是考砸了"},
        {"role": "assistant", "content": "我理解你的感受，准备了那么久却没达到期望确实很让人沮丧"}
    ]
    
    result = summarizer.generate_summary(test_conversation)
    if result['success']:
        print(f"✓ 总结: {result['summary']}")
        print(f"  字数: {result['word_count']}")
    
    # 测试直接文本总结
    print("\n2. 测试直接文本总结：")
    long_text = "今天真的太倒霉了，早上起来就迟到了，然后考试的时候发现自己复习错了重点，考得一塌糊涂。下午本来想去图书馆放松一下，结果手机还丢了。现在心情糟透了，不知道该怎么办。"
    
    result = summarizer.generate_summary_from_text(long_text)
    if result['success']:
        print(f"✓ 总结: {result['summary']}")
    
    # 测试问候语生成
    print("\n3. 测试问候语生成：")
    greeting_gen = GreetingGenerator()
    
    test_history = [
        {
            'timestamp': '昨天',
            'emotion_tag': 'anxious',
            'content': '明天要考试了，好紧张'
        }
    ]
    
    greeting_result = greeting_gen.generate_greeting(test_history, "小明")
    if greeting_result['success']:
        print(f"✓ 问候语: {greeting_result['greeting']}")
    
    # 测试跟进消息
    print("\n4. 测试跟进消息：")
    follow_up = greeting_gen.generate_follow_up(
        "今天考试考得不好",
        "sad",
        7,
        had_conversation=False
    )
    print(f"✓ 跟进: {follow_up}")
    
    print("\n✓ 帖子总结服务测试完成")

