// 情感标签枚举（英文）
export const EMOTION_TAGS = [
  'happy',      // 快乐
  'sad',        // 悲伤
  'anxious',    // 焦虑
  'angry',      // 愤怒
  'calm',       // 平静
  'excited',    // 兴奋
  'tired',      // 疲惫
  'confused',   // 困惑
  'grateful',   // 感恩
  'lonely',     // 孤独
  'hopeful',    // 希望
  'fearful',    // 恐惧
] as const;

// 情感标签中英文映射
export const EMOTION_TAGS_CN: Record<string, string> = {
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
};

export type EmotionTag = typeof EMOTION_TAGS[number];
