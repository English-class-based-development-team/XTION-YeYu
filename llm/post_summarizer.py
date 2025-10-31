"""
帖子总结服务
根据对话历史生成帖子总结草稿
"""

from typing import List, Dict, Optional

try:
    from .llm_service import LLMService
    from .prompts import (
        SUMMARY_FROM_CONVERSATION_PROMPT,
        get_summary_from_text_prompt,
        get_enhance_post_prompt,
        get_greeting_prompt,
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

