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
        
        Args:
            text: 用户输入的文本
        
        Returns:
            包含总结内容的字典
        """
        # 如果文本本身就很简洁，直接返回
        if len(text) <= 200:
            return {
                'success': True,
                'summary': text.strip(),
                'word_count': len(text),
                'is_original': True
            }
        
        # 否则使用 LLM 总结
        prompt = get_summary_from_text_prompt(text, max_length=200)
        
        response = self.llm.chat(
            prompt,
            conversation_history=[],
            temperature=0.4,
            max_tokens=250
        )
        
        if not response['success']:
            # 如果失败，截取前 200 字
            return {
                'success': True,
                'summary': text[:200].strip(),
                'word_count': min(len(text), 200),
                'is_truncated': True
            }
        
        summary = self._clean_summary(response['message'])
        
        return {
            'success': True,
            'summary': summary,
            'word_count': len(summary)
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
        
        Args:
            user_history: 用户历史帖子列表
            username: 用户名
            max_messages: 最多生成的消息数量
        
        Returns:
            包含关怀消息列表的字典
        """
        if not user_history:
            # 没有历史记录，返回默认关怀消息（不添加 [proactive] 标记）
            default_messages = [
                "你好呀！很高兴见到你。有什么想聊的吗？",
                "嗨！今天过得怎么样？",
                "你好呀！有什么想分享的吗？",
                "很高兴见到你！最近有什么新鲜事吗？",
                "你好！我在这里陪你聊天～",
                "嗨！想聊些什么呢？",
                "你好呀！今天心情如何？",
                "很开心见到你！有什么想说的吗？"
            ]
            return {
                'success': True,
                'messages': default_messages[:max_messages],
                'is_personalized': False,
                'is_llm_generated': False  # 默认消息不是大模型生成的
            }
        
        # 构建历史摘要（取更多历史以生成多样化的关怀消息）
        history_summary = self._format_history_for_care(user_history, max_items=10)
        
        prompt = get_proactive_care_prompt(history_summary, username, max_messages)
        
        response = self.llm.chat(
            prompt,
            conversation_history=[],
            temperature=0.6,  # 降低 temperature 加快响应速度
            max_tokens=300    # 减少 token 数量加快生成速度
        )
        
        if not response['success']:
            # 如果 LLM 生成失败，返回基于历史的简单关怀消息（不添加 [proactive] 标记）
            fallback_messages = self._generate_fallback_care_messages(user_history, max_messages)
            return {
                'success': True,
                'messages': fallback_messages,
                'is_personalized': True,
                'is_fallback': True,
                'is_llm_generated': False  # 标记这些不是大模型生成的
            }
        
        # 解析 LLM 返回的消息列表
        messages = self._parse_care_messages(response['message'], max_messages)
        
        # 标记大模型生成的消息（添加 [proactive] 标记）
        llm_messages = [f"[proactive] {msg}" for msg in messages]
        
        # 如果解析失败或消息数量不足，补充默认消息（不添加标记）
        if len(llm_messages) < max_messages:
            fallback_messages = self._generate_fallback_care_messages(user_history, max_messages - len(llm_messages))
            llm_messages.extend(fallback_messages[:max_messages - len(llm_messages)])
        
        return {
            'success': True,
            'messages': llm_messages[:max_messages],
            'is_personalized': True,
            'is_llm_generated': True  # 标记这些消息来自大模型
        }
    
    def _format_history_for_care(self, user_history: List[Dict], max_items: int = 10) -> str:
        """
        格式化用户历史（用于关怀消息生成，包含更多细节）
        优先使用最近的数据（从最新的开始）
        """
        lines = []
        # 取最近的 max_items 条数据（user_history 已经按时间倒序排列，最新的在前）
        # 但为了确保，我们取前 max_items 条（最新的）
        recent_history = user_history[:max_items] if len(user_history) > max_items else user_history
        
        # 从最新到最旧排列（确保优先处理最近的数据）
        for i, post in enumerate(recent_history, 1):
            emotion = post.get('emotion_tag', '')
            content = post.get('content', '')[:100]  # 截取前 100 字以获取更多细节
            timestamp = post.get('timestamp', '')
            intensity = post.get('emotion_intensity', 5)
            
            # 标记这是最近的（优先处理）
            priority = "【最新】" if i <= 3 else ""
            lines.append(f"{i}. {priority}{timestamp} [情绪:{emotion}, 强度:{intensity}] {content}")
        
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
    
    def _generate_fallback_care_messages(self, user_history: List[Dict], count: int) -> List[str]:
        """
        生成备用的关怀消息（当 LLM 生成失败时使用）
        
        Args:
            user_history: 用户历史帖子
            count: 需要生成的数量
        
        Returns:
            关怀消息列表
        """
        messages = []
        
        # 从历史中提取关键事件关键词
        keywords = []
        for post in user_history[-5:]:
            content = post.get('content', '')
            emotion = post.get('emotion_tag', '')
            
            # 提取可能的关键词
            if '考试' in content or '考' in content:
                keywords.append(('考试', emotion))
            if '项目' in content:
                keywords.append(('项目', emotion))
            if '朋友' in content or '吵架' in content:
                keywords.append(('朋友', emotion))
            if '睡眠' in content or '睡' in content:
                keywords.append(('睡眠', emotion))
            if '运动' in content:
                keywords.append(('运动', emotion))
            if '家人' in content:
                keywords.append(('家人', emotion))
            if '学习' in content or '技能' in content:
                keywords.append(('学习', emotion))
            if '发烧' in content or '生病' in content:
                keywords.append(('健康', emotion))
        
        # 基于关键词生成关怀消息模板
        templates = {
            '考试': ["那个让你焦虑的考试过去了，感觉如何？", "还记得你提到的考试吗？结果怎么样？"],
            '项目': ["还记得你提到的那个项目吗？进展得怎么样了？", "你之前说的项目现在怎么样了？"],
            '朋友': ["你说你最近和朋友吵架了，你们和好了吗？主动找他吧。", "你和朋友的关系现在怎么样了？"],
            '睡眠': ["上次你说睡眠不太好，最近有改善吗？", "你的睡眠质量最近有改善吗？"],
            '运动': ["你说想多运动，坚持下来了吗？为你加油！", "你提到想运动，开始行动了吗？"],
            '家人': ["上次聊到的家人，最近有联系吗？", "你和家人的关系最近怎么样？"],
            '学习': ["你提到想学习新技能，开始行动了吗？", "你之前想学的技能，现在有进展吗？"],
            '健康': ["你说你昨天发烧了，今天好点儿了吗？", "你的身体恢复得怎么样了？"]
        }
        
        used_keywords = set()
        for keyword, emotion in keywords[:count]:
            if keyword in templates and keyword not in used_keywords:
                messages.append(templates[keyword][0] if emotion in ['anxious', 'sad'] else templates[keyword][-1] if len(templates[keyword]) > 1 else templates[keyword][0])
                used_keywords.add(keyword)
        
        # 如果消息数量不足，补充通用消息
        default_messages = [
            "今天过得怎么样？",
            "最近有什么想分享的吗？",
            "我在这里陪着你呢",
            "有什么想聊的吗？"
        ]
        
        while len(messages) < count:
            for msg in default_messages:
                if msg not in messages:
                    messages.append(msg)
                    break
                if len(messages) >= count:
                    break
        
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

