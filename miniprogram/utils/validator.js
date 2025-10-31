/**
 * 数据验证工具
 * 验证情绪值、文本内容、帖子数据等
 */

const { EMOTION, TEXT_LIMIT } = require('../constants/index.js');

/**
 * 验证情绪值范围
 * @param {Number} valence - 价度值
 * @param {Number} arousal - 唤醒度值
 * @returns {Object} 验证结果 {valid: boolean, message: string}
 */
function validateEmotion(valence, arousal) {
  // 检查参数是否存在
  if (valence === undefined || valence === null || arousal === undefined || arousal === null) {
    return {
      valid: false,
      message: '情绪值不能为空',
    };
  }

  // 检查是否为数字
  if (typeof valence !== 'number' || typeof arousal !== 'number') {
    return {
      valid: false,
      message: '情绪值必须是数字',
    };
  }

  // 检查是否在有效范围内
  if (
    valence < EMOTION.MIN_VALENCE || valence > EMOTION.MAX_VALENCE ||
    arousal < EMOTION.MIN_AROUSAL || arousal > EMOTION.MAX_AROUSAL
  ) {
    return {
      valid: false,
      message: `情绪值必须在${EMOTION.MIN_VALENCE}-${EMOTION.MAX_VALENCE}范围内`,
    };
  }

  return {
    valid: true,
    message: '验证通过',
  };
}

/**
 * 验证文本内容
 * @param {String} content - 文本内容
 * @returns {Object} 验证结果 {valid: boolean, message: string}
 */
function validateContent(content) {
  // 检查参数是否存在
  if (content === undefined || content === null) {
    return {
      valid: false,
      message: '内容不能为空',
    };
  }

  // 检查是否为字符串
  if (typeof content !== 'string') {
    return {
      valid: false,
      message: '内容必须是字符串',
    };
  }

  // 去除首尾空格后检查
  const trimmedContent = content.trim();

  // 检查是否为空
  if (trimmedContent.length === 0) {
    return {
      valid: false,
      message: '内容不能为空',
    };
  }

  // 检查长度（按字符数，不是字节数）
  if (trimmedContent.length < TEXT_LIMIT.MIN_CONTENT_LENGTH) {
    return {
      valid: false,
      message: `内容长度不能少于${TEXT_LIMIT.MIN_CONTENT_LENGTH}个字符`,
    };
  }

  if (trimmedContent.length > TEXT_LIMIT.MAX_CONTENT_LENGTH) {
    return {
      valid: false,
      message: `内容长度不能超过${TEXT_LIMIT.MAX_CONTENT_LENGTH}个字符`,
    };
  }

  return {
    valid: true,
    message: '验证通过',
  };
}

/**
 * 验证帖子数据完整性
 * @param {Object} data - 帖子数据对象
 * @returns {Object} 验证结果 {valid: boolean, message: string}
 */
function validatePostData(data) {
  // 检查参数是否存在
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      message: '帖子数据不能为空',
    };
  }

  // 验证情绪值
  const emotionValidation = validateEmotion(data.valence, data.arousal);
  if (!emotionValidation.valid) {
    return emotionValidation;
  }

  // 验证内容
  const contentValidation = validateContent(data.content);
  if (!contentValidation.valid) {
    return contentValidation;
  }

  // 验证可选字段（如果存在）
  if (data.emotionValue !== undefined) {
    if (typeof data.emotionValue !== 'number' ||
        data.emotionValue < EMOTION.MIN_VALENCE ||
        data.emotionValue > EMOTION.MAX_VALENCE) {
      return {
        valid: false,
        message: `emotionValue必须在${EMOTION.MIN_VALENCE}-${EMOTION.MAX_VALENCE}范围内`,
      };
    }
  }

  if (data.arousalValue !== undefined) {
    if (typeof data.arousalValue !== 'number' ||
        data.arousalValue < EMOTION.MIN_AROUSAL ||
        data.arousalValue > EMOTION.MAX_AROUSAL) {
      return {
        valid: false,
        message: `arousalValue必须在${EMOTION.MIN_AROUSAL}-${EMOTION.MAX_AROUSAL}范围内`,
      };
    }
  }

  return {
    valid: true,
    message: '验证通过',
  };
}

/**
 * 验证评论数据
 * @param {Object} data - 评论数据对象
 * @returns {Object} 验证结果 {valid: boolean, message: string}
 */
function validateCommentData(data) {
  // 检查参数是否存在
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      message: '评论数据不能为空',
    };
  }

  // 验证内容
  const contentValidation = validateContent(data.content);
  if (!contentValidation.valid) {
    return contentValidation;
  }

  // 验证帖子ID（如果存在）
  if (data.postId !== undefined && (!data.postId || typeof data.postId !== 'string')) {
    return {
      valid: false,
      message: '帖子ID无效',
    };
  }

  return {
    valid: true,
    message: '验证通过',
  };
}

module.exports = {
  validateEmotion,
  validateContent,
  validatePostData,
  validateCommentData,
};

