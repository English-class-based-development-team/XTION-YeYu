/**
 * 情绪相似度计算工具
 * 基于欧氏距离或余弦相似度计算情绪相似度
 */

const { EMOTION } = require('../constants/index.js');

/**
 * 计算欧氏距离
 * @param {Number} x1 - 第一个点的x坐标（价度）
 * @param {Number} y1 - 第一个点的y坐标（唤醒度）
 * @param {Number} x2 - 第二个点的x坐标（价度）
 * @param {Number} y2 - 第二个点的y坐标（唤醒度）
 * @returns {Number} 欧氏距离
 */
function euclideanDistance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 计算最大可能的欧氏距离（用于归一化）
 * 在0-10的范围内，最大距离是(0,0)到(10,10)的距离
 * @returns {Number} 最大距离
 */
function getMaxDistance() {
  return euclideanDistance(
    EMOTION.MIN_VALENCE,
    EMOTION.MIN_AROUSAL,
    EMOTION.MAX_VALENCE,
    EMOTION.MAX_AROUSAL
  );
}

/**
 * 使用欧氏距离计算相似度
 * 相似度 = 1 - (距离 / 最大距离)
 * @param {Number} valence1 - 用户价度值
 * @param {Number} arousal1 - 用户唤醒度值
 * @param {Number} valence2 - 目标价度值
 * @param {Number} arousal2 - 目标唤醒度值
 * @returns {Number} 相似度分数（0-1，1表示完全相同）
 */
function calculateSimilarityByEuclidean(valence1, arousal1, valence2, arousal2) {
  // 验证输入范围
  if (
    valence1 < EMOTION.MIN_VALENCE || valence1 > EMOTION.MAX_VALENCE ||
    arousal1 < EMOTION.MIN_AROUSAL || arousal1 > EMOTION.MAX_AROUSAL ||
    valence2 < EMOTION.MIN_VALENCE || valence2 > EMOTION.MAX_VALENCE ||
    arousal2 < EMOTION.MIN_AROUSAL || arousal2 > EMOTION.MAX_AROUSAL
  ) {
    console.warn('情绪值超出范围，使用默认相似度0');
    return 0;
  }

  // 计算欧氏距离
  const distance = euclideanDistance(valence1, arousal1, valence2, arousal2);
  
  // 获取最大距离
  const maxDistance = getMaxDistance();
  
  // 归一化到0-1范围：相似度 = 1 - (距离 / 最大距离)
  const similarity = 1 - (distance / maxDistance);
  
  // 确保相似度在0-1范围内
  return Math.max(0, Math.min(1, similarity));
}

/**
 * 计算余弦相似度
 * @param {Number} valence1 - 用户价度值
 * @param {Number} arousal1 - 用户唤醒度值
 * @param {Number} valence2 - 目标价度值
 * @param {Number} arousal2 - 目标唤醒度值
 * @returns {Number} 相似度分数（0-1）
 */
function calculateSimilarityByCosine(valence1, arousal1, valence2, arousal2) {
  // 验证输入范围
  if (
    valence1 < EMOTION.MIN_VALENCE || valence1 > EMOTION.MAX_VALENCE ||
    arousal1 < EMOTION.MIN_AROUSAL || arousal1 > EMOTION.MAX_AROUSAL ||
    valence2 < EMOTION.MIN_VALENCE || valence2 > EMOTION.MAX_VALENCE ||
    arousal2 < EMOTION.MIN_AROUSAL || arousal2 > EMOTION.MAX_AROUSAL
  ) {
    console.warn('情绪值超出范围，使用默认相似度0');
    return 0;
  }

  // 计算向量点积
  const dotProduct = valence1 * valence2 + arousal1 * arousal2;
  
  // 计算向量模长
  const magnitude1 = Math.sqrt(valence1 * valence1 + arousal1 * arousal1);
  const magnitude2 = Math.sqrt(valence2 * valence2 + arousal2 * arousal2);
  
  // 避免除以0
  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }
  
  // 计算余弦相似度（范围-1到1，归一化到0-1）
  const cosineSimilarity = dotProduct / (magnitude1 * magnitude2);
  return (cosineSimilarity + 1) / 2; // 归一化到0-1
}

/**
 * 计算情绪相似度（默认使用欧氏距离）
 * @param {Number} valence1 - 用户价度值
 * @param {Number} arousal1 - 用户唤醒度值
 * @param {Number} valence2 - 目标价度值
 * @param {Number} arousal2 - 目标唤醒度值
 * @param {String} method - 计算方法：'euclidean'（默认）或'cosine'
 * @returns {Number} 相似度分数（0-1，1表示完全相同）
 */
function calculateSimilarity(valence1, arousal1, valence2, arousal2, method = 'euclidean') {
  if (method === 'cosine') {
    return calculateSimilarityByCosine(valence1, arousal1, valence2, arousal2);
  } else {
    return calculateSimilarityByEuclidean(valence1, arousal1, valence2, arousal2);
  }
}

/**
 * 批量计算相似度（用于列表排序）
 * @param {Number} userValence - 用户价度值
 * @param {Number} userArousal - 用户唤醒度值
 * @param {Array} posts - 帖子列表，每个帖子包含emotionValue和arousalValue
 * @param {String} method - 计算方法
 * @returns {Array} 带相似度的帖子列表，按相似度降序排序
 */
function calculateSimilarityForPosts(userValence, userArousal, posts, method = 'euclidean') {
  if (!posts || !Array.isArray(posts) || posts.length === 0) {
    return [];
  }

  // 为每个帖子计算相似度
  const postsWithSimilarity = posts.map((post) => {
    const similarity = calculateSimilarity(
      userValence,
      userArousal,
      post.emotionValue || post.valence || 0,
      post.arousalValue || post.arousal || 0,
      method
    );
    
    return {
      ...post,
      similarity: similarity,
    };
  });

  // 按相似度降序排序
  postsWithSimilarity.sort((a, b) => b.similarity - a.similarity);

  return postsWithSimilarity;
}

module.exports = {
  calculateSimilarity,
  calculateSimilarityByEuclidean,
  calculateSimilarityByCosine,
  calculateSimilarityForPosts,
  euclideanDistance,
};

