"""
情绪分析服务
使用 LLM 分析用户输入，提取情感标签和量化情绪强度
"""

import json
import re
from typing import Dict, Tuple, Optional

try:
    from .llm_service import LLMService
    from .emotion_config import EMOTION_TAGS, EMOTION_TAGS_CN, get_emotion_cn
    from .prompts import get_emotion_analysis_prompt
except ImportError:
    from llm_service import LLMService
    from emotion_config import EMOTION_TAGS, EMOTION_TAGS_CN, get_emotion_cn
    from prompts import get_emotion_analysis_prompt


class EmotionAnalyzer:
    """情绪分析器"""
    
    def __init__(self, llm_service: LLMService = None):
        """
        初始化情绪分析器
        
        Args:
            llm_service: LLM 服务实例，默认创建新实例
        """
        self.llm = llm_service or LLMService()
        
        # 构建情感标签列表（中英文）
        emotion_list = [f"{tag}({get_emotion_cn(tag)})" for tag in EMOTION_TAGS]
        emotion_str = "、".join(emotion_list)
        
        # 情绪分析提示词 - 从配置文件加载
        self.analysis_prompt = get_emotion_analysis_prompt(emotion_str)
    
    def analyze(self, text: str) -> Dict:
        """
        分析文本的情感
        
        Args:
            text: 待分析的文本
        
        Returns:
            包含情感标签和强度的字典
        """
        # 构建完整提示
        full_prompt = self.analysis_prompt + f"\n\n「{text}」"
        
        # 调用 LLM
        response = self.llm.chat(
            full_prompt,
            conversation_history=[],
            temperature=0.3,  # 降低温度以获得更稳定的结果
            max_tokens=200
        )
        
        if not response['success']:
            # 分析失败，返回默认值
            return {
                'success': False,
                'emotion_tag': 'calm',
                'emotion_intensity': 5,
                'reason': '情绪分析失败，使用默认值',
                'error': response.get('error')
            }
        
        # 解析 LLM 返回的 JSON
        try:
            result = self._parse_analysis_result(response['message'])
            
            # 验证情感标签
            if result['emotion_tag'] not in EMOTION_TAGS:
                result['emotion_tag'] = self._find_closest_emotion(text)
            
            # 验证强度范围
            result['emotion_intensity'] = max(1, min(10, result['emotion_intensity']))
            
            result['success'] = True
            return result
            
        except Exception as e:
            # 解析失败，使用备用方法
            return self._fallback_analysis(text)
    
    def _parse_analysis_result(self, response_text: str) -> Dict:
        """
        解析 LLM 返回的分析结果
        
        Args:
            response_text: LLM 返回的文本
        
        Returns:
            解析后的字典
        """
        # 尝试提取 JSON
        json_match = re.search(r'\{[^{}]*\}', response_text, re.DOTALL)
        
        if json_match:
            json_str = json_match.group(0)
            result = json.loads(json_str)
            
            # 确保包含必需字段
            if 'emotion_tag' in result and 'emotion_intensity' in result:
                return {
                    'emotion_tag': result['emotion_tag'],
                    'emotion_intensity': int(result['emotion_intensity']),
                    'reason': result.get('reason', '')
                }
        
        # 如果无法解析 JSON，尝试从文本中提取
        return self._extract_from_text(response_text)
    
    def _extract_from_text(self, text: str) -> Dict:
        """从非 JSON 文本中提取情感信息"""
        # 查找情感标签
        emotion_tag = 'calm'
        for tag in EMOTION_TAGS:
            if tag in text.lower():
                emotion_tag = tag
                break
        
        # 查找强度数字
        intensity_match = re.search(r'(\d+)', text)
        emotion_intensity = int(intensity_match.group(1)) if intensity_match else 5
        emotion_intensity = max(1, min(10, emotion_intensity))
        
        return {
            'emotion_tag': emotion_tag,
            'emotion_intensity': emotion_intensity,
            'reason': '从文本中提取'
        }
    
    def _fallback_analysis(self, text: str) -> Dict:
        """
        备用分析方法（基于关键词）
        
        Args:
            text: 待分析文本
        
        Returns:
            分析结果
        """
        text_lower = text.lower()
        
        # 关键词情感映射
        emotion_keywords = {
            'happy': ['开心', '快乐', '高兴', '兴奋', '喜悦', '哈哈', '😊', '😄'],
            'sad': ['难过', '悲伤', '伤心', '失落', '沮丧', '哭', '😢', '😭'],
            'anxious': ['焦虑', '担心', '紧张', '不安', '害怕', '恐慌'],
            'angry': ['生气', '愤怒', '气愤', '恼火', '讨厌', '烦'],
            'tired': ['累', '疲惫', '困', '乏', '疲劳'],
            'excited': ['兴奋', '激动', '期待', '!', '！'],
            'grateful': ['感谢', '感恩', '谢谢', '感激'],
            'lonely': ['孤独', '寂寞', '孤单', '独自'],
            'confused': ['困惑', '迷茫', '不知道', '？', '疑惑'],
        }
        
        # 统计匹配的关键词
        emotion_scores = {}
        for emotion, keywords in emotion_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text or keyword in text_lower)
            if score > 0:
                emotion_scores[emotion] = score
        
        # 选择得分最高的情感
        if emotion_scores:
            emotion_tag = max(emotion_scores, key=emotion_scores.get)
            emotion_intensity = min(10, 5 + emotion_scores[emotion_tag])
        else:
            emotion_tag = 'calm'
            emotion_intensity = 5
        
        return {
            'success': True,
            'emotion_tag': emotion_tag,
            'emotion_intensity': emotion_intensity,
            'reason': '基于关键词分析',
            'method': 'fallback'
        }
    
    def _find_closest_emotion(self, text: str) -> str:
        """查找最接近的情感标签"""
        # 简单实现：使用备用分析
        result = self._fallback_analysis(text)
        return result['emotion_tag']
    
    def analyze_conversation(self, messages: list) -> Dict:
        """
        分析整个对话的情感倾向
        
        Args:
            messages: 消息列表
        
        Returns:
            整体情感分析结果
        """
        # 合并所有用户消息
        user_messages = [msg['content'] for msg in messages if msg['role'] == 'user']
        combined_text = " ".join(user_messages)
        
        return self.analyze(combined_text)


def quick_analyze(text: str) -> Tuple[str, int]:
    """
    快速分析情感（便捷函数）
    
    Args:
        text: 待分析文本
    
    Returns:
        (emotion_tag, emotion_intensity) 元组
    """
    analyzer = EmotionAnalyzer()
    result = analyzer.analyze(text)
    return result['emotion_tag'], result['emotion_intensity']


if __name__ == "__main__":
    # 测试情绪分析
    print("测试情绪分析服务...")
    
    analyzer = EmotionAnalyzer()
    
    # 测试用例
    test_cases = [
        "今天考试考得很好，我太开心了！",
        "我感觉很累，什么都不想做...",
        "明天要面试了，我好紧张啊",
        "他怎么能这样对我，我真的很生气！",
        "今天天气不错"
    ]
    
    print("\n情感分析测试：")
    for i, text in enumerate(test_cases, 1):
        print(f"\n{i}. 文本: 「{text}」")
        result = analyzer.analyze(text)
        
        if result['success']:
            emotion_cn = get_emotion_cn(result['emotion_tag'])
            print(f"   情感: {result['emotion_tag']}({emotion_cn})")
            print(f"   强度: {result['emotion_intensity']}/10")
            print(f"   原因: {result['reason']}")
        else:
            print(f"   分析失败: {result.get('error')}")
    
    print("\n✓ 情绪分析服务测试完成")

