/**
 * 情绪标签到情绪值映射工具
 * 将用户输入的情绪标签文本映射到价度（valence）和唤醒度（arousal）值
 */

const { EMOTION } = require('../constants/index.js');

/**
 * 预设情绪标签映射表
 * 格式：{标签文本: {valence: 价度值, arousal: 唤醒度值}}
 */
const EMOTION_TAG_MAP = {
  // 高价度 + 高唤醒度
  '兴奋': { valence: 9, arousal: 9 },
  '开心': { valence: 8, arousal: 8 },
  '快乐': { valence: 8, arousal: 8 },
  '愉悦': { valence: 7, arousal: 7 },
  '激动': { valence: 8, arousal: 9 },
  
  // 高价度 + 低唤醒度
  '平静': { valence: 8, arousal: 2 },
  '满足': { valence: 7, arousal: 3 },
  '放松': { valence: 7, arousal: 2 },
  '舒适': { valence: 8, arousal: 3 },
  
  // 高价度 + 中唤醒度
  '高兴': { valence: 7, arousal: 5 },
  '满意': { valence: 7, arousal: 4 },
  
  // 低价度 + 高唤醒度
  '焦虑': { valence: 2, arousal: 9 },
  '愤怒': { valence: 1, arousal: 9 },
  '紧张': { valence: 3, arousal: 8 },
  '不安': { valence: 2, arousal: 8 },
  '烦躁': { valence: 2, arousal: 7 },
  
  // 低价度 + 低唤醒度
  '沮丧': { valence: 2, arousal: 2 },
  '悲伤': { valence: 1, arousal: 2 },
  '难过': { valence: 2, arousal: 3 },
  '失落': { valence: 2, arousal: 2 },
  '孤独': { valence: 1, arousal: 1 },
  
  // 低价度 + 中唤醒度
  '忧郁': { valence: 2, arousal: 4 },
  '烦恼': { valence: 2, arousal: 5 },
  
  // 中价度 + 高唤醒度
  '担心': { valence: 4, arousal: 7 },
  '困惑': { valence: 5, arousal: 6 },
  
  // 中价度 + 低唤醒度
  '平淡': { valence: 5, arousal: 2 },
  '无聊': { valence: 4, arousal: 1 },
  '疲倦': { valence: 4, arousal: 2 },
  
  // 默认（中性）
  '中性': { valence: 5, arousal: 5 },
  '我的心情': { valence: 5, arousal: 5 },
  '': { valence: 5, arousal: 5 },
};

/**
 * 基于关键词推断情绪值
 * 使用文本分析的方法，根据标签中的关键词推断情绪值
 * @param {String} tag - 情绪标签文本
 * @returns {Object} {valence: 价度值, arousal: 唤醒度值}
 */
function inferEmotionFromKeywords(tag) {
  if (!tag || typeof tag !== 'string') {
    return { valence: 5, arousal: 5 }; // 默认中性
  }

  const tagLower = tag.toLowerCase();
  
  // 正面情绪关键词
  const positiveKeywords = ['开心', '快乐', '高兴', '愉悦', '兴奋', '激动', '满足', '满意', '放松', '舒适', '平静', '好', '棒', '赞', '爱'];
  // 负面情绪关键词
  const negativeKeywords = ['难过', '悲伤', '沮丧', '失落', '焦虑', '紧张', '不安', '愤怒', '烦躁', '烦恼', '忧郁', '孤独', '坏', '糟', '差', '累'];
  
  // 高唤醒度关键词
  const highArousalKeywords = ['兴奋', '激动', '焦虑', '紧张', '愤怒', '不安', '烦躁', '担心'];
  // 低唤醒度关键词
  const lowArousalKeywords = ['平静', '放松', '满足', '舒适', '沮丧', '悲伤', '失落', '孤独', '平淡', '无聊', '疲倦'];
  
  // 计算价度值（0-10）
  let valence = 5; // 默认中性
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveKeywords.forEach(keyword => {
    if (tagLower.includes(keyword.toLowerCase())) {
      positiveCount++;
    }
  });
  
  negativeKeywords.forEach(keyword => {
    if (tagLower.includes(keyword.toLowerCase())) {
      negativeCount++;
    }
  });
  
  if (positiveCount > negativeCount) {
    // 正面情绪，价度值偏高（6-9）
    valence = Math.min(9, 5 + positiveCount * 1.5);
  } else if (negativeCount > positiveCount) {
    // 负面情绪，价度值偏低（1-4）
    valence = Math.max(1, 5 - negativeCount * 1.5);
  }
  
  // 计算唤醒度值（0-10）
  let arousal = 5; // 默认中性
  
  let highArousalCount = 0;
  let lowArousalCount = 0;
  
  highArousalKeywords.forEach(keyword => {
    if (tagLower.includes(keyword.toLowerCase())) {
      highArousalCount++;
    }
  });
  
  lowArousalKeywords.forEach(keyword => {
    if (tagLower.includes(keyword.toLowerCase())) {
      lowArousalCount++;
    }
  });
  
  if (highArousalCount > lowArousalCount) {
    // 高唤醒度（7-9）
    arousal = Math.min(9, 5 + highArousalCount * 1.5);
  } else if (lowArousalCount > highArousalCount) {
    // 低唤醒度（1-3）
    arousal = Math.max(1, 5 - lowArousalCount * 1.5);
  }
  
  // 确保值在有效范围内
  valence = Math.max(EMOTION.MIN_VALENCE, Math.min(EMOTION.MAX_VALENCE, Math.round(valence)));
  arousal = Math.max(EMOTION.MIN_AROUSAL, Math.min(EMOTION.MAX_AROUSAL, Math.round(arousal)));
  
  return { valence, arousal };
}

/**
 * 将情绪标签文本映射到情绪值（价度和唤醒度）
 * @param {String} tag - 情绪标签文本
 * @returns {Object} {valence: 价度值(0-10), arousal: 唤醒度值(0-10)}
 */
function mapTagToEmotion(tag) {
  if (!tag || typeof tag !== 'string') {
    return { valence: 5, arousal: 5 }; // 默认中性
  }

  const tagTrimmed = tag.trim();
  
  // 首先检查预设映射表
  if (EMOTION_TAG_MAP.hasOwnProperty(tagTrimmed)) {
    return EMOTION_TAG_MAP[tagTrimmed];
  }
  
  // 如果没有匹配，使用关键词推断
  return inferEmotionFromKeywords(tagTrimmed);
}

/**
 * 验证情绪值是否在有效范围内
 * @param {Number} valence - 价度值
 * @param {Number} arousal - 唤醒度值
 * @returns {Boolean} 是否有效
 */
function validateEmotionValues(valence, arousal) {
  return (
    valence >= EMOTION.MIN_VALENCE && valence <= EMOTION.MAX_VALENCE &&
    arousal >= EMOTION.MIN_AROUSAL && arousal <= EMOTION.MAX_AROUSAL
  );
}

module.exports = {
  mapTagToEmotion,
  validateEmotionValues,
  inferEmotionFromKeywords,
  EMOTION_TAG_MAP,
};

