/**
 * 情绪标签英文到中文映射工具
 * 用于将后端返回的英文情绪标签转换为中文显示
 */

// 英文到中文的映射表（与后端 llm/emotion_config.py 保持一致）
const EMOTION_TAG_EN_TO_CN = {
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
  'fearful': '恐惧'
};

/**
 * 将英文情绪标签转换为中文
 * @param {String} emotionTag - 英文情绪标签（如 'happy', 'anxious'）
 * @returns {String} 中文情绪标签（如 '快乐', '焦虑'）
 */
function getEmotionTagCN(emotionTag) {
  if (!emotionTag) return '未知';
  
  // 如果已经是中文，直接返回
  if (Object.values(EMOTION_TAG_EN_TO_CN).includes(emotionTag)) {
    return emotionTag;
  }
  
  // 转换为小写后查找
  const tagLower = emotionTag.toLowerCase();
  return EMOTION_TAG_EN_TO_CN[tagLower] || emotionTag;
}

/**
 * 获取所有中文情绪标签列表
 * @returns {Array} 中文情绪标签数组
 */
function getAllEmotionTagsCN() {
  return Object.values(EMOTION_TAG_EN_TO_CN);
}

module.exports = {
  getEmotionTagCN,
  getAllEmotionTagsCN,
  EMOTION_TAG_EN_TO_CN
};

