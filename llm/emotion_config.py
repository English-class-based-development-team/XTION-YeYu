"""
情感标签配置文件
可根据需求灵活调整情感标签和映射关系
"""

# 情感标签枚举（英文）
EMOTION_TAGS = [
    'happy',      # 快乐
    'sad',        # 悲伤
    'anxious',    # 焦虑
    'angry',      # 愤怒
    'calm',       # 平静
    'excited',    # 兴奋
    'tired',      # 疲惫
    'confused',   # 困惑
    'grateful',   # 感恩
    'lonely',     # 孤独
    'hopeful',    # 希望
    'fearful',    # 恐惧
]

# 情感标签中英文映射
EMOTION_TAGS_CN = {
    'happy': '快乐',
    'sad': '悲伤',
    'anxious': '焦虑',
    'angry': '愤怒',
    'calm': '平静',
    'excited': '兴奋',
    'tired': '疲惫',
    'confused': '困惑',
    'grateful': '感恩',
    'lonely': '孤独',
    'hopeful': '希望',
    'fearful': '恐惧',
}

# 英文到中文的反向映射（自动生成）
EMOTION_TAGS_EN = {v: k for k, v in EMOTION_TAGS_CN.items()}


def get_emotion_cn(emotion_tag: str) -> str:
    """
    获取情感标签的中文名称
    
    Args:
        emotion_tag: 英文情感标签
    
    Returns:
        中文情感标签，如果不存在则返回原标签
    """
    return EMOTION_TAGS_CN.get(emotion_tag, emotion_tag)


def get_emotion_en(emotion_cn: str) -> str:
    """
    获取情感标签的英文名称
    
    Args:
        emotion_cn: 中文情感标签
    
    Returns:
        英文情感标签，如果不存在则返回原标签
    """
    return EMOTION_TAGS_EN.get(emotion_cn, emotion_cn)


def is_valid_emotion(emotion_tag: str) -> bool:
    """
    验证情感标签是否有效
    
    Args:
        emotion_tag: 情感标签（中文或英文）
    
    Returns:
        是否有效
    """
    return emotion_tag in EMOTION_TAGS or emotion_tag in EMOTION_TAGS_EN


def get_all_emotions_display() -> list:
    """
    获取所有情感标签的显示格式（英文 - 中文）
    
    Returns:
        格式化的情感标签列表
    """
    return [f"{tag} - {EMOTION_TAGS_CN[tag]}" for tag in EMOTION_TAGS]

