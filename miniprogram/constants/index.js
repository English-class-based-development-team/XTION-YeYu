/**
 * 常量定义文件
 * 定义项目中使用的所有常量
 */

// 情绪值范围常量
const EMOTION = {
  MIN_VALENCE: 0,
  MAX_VALENCE: 10,
  MIN_AROUSAL: 0,
  MAX_AROUSAL: 10,
};

// 文本长度限制常量
const TEXT_LIMIT = {
  MAX_CONTENT_LENGTH: 300,
  MIN_CONTENT_LENGTH: 1,
  MAX_TAG_LENGTH: 10,
};

// Mock API接口常量
const API = {
  PUBLISH_POST: 'publishPost',
  GET_FEED: 'getFeed',
  LIKE_POST: 'likePost',
  COMMENT_POST: 'commentPost',
};

// 错误码常量
const ERROR_CODE = {
  SUCCESS: 0,
  INVALID_PARAM: 1001,
  NETWORK_ERROR: 1002,
  VALIDATION_ERROR: 1003,
  NOT_FOUND: 1004,
  UNAUTHORIZED: 1005,
  FORBIDDEN: 1006,
  INTERNAL_ERROR: 1007,
};

// 错误信息常量
const ERROR_MESSAGE = {
  [ERROR_CODE.SUCCESS]: '操作成功',
  [ERROR_CODE.INVALID_PARAM]: '参数错误',
  [ERROR_CODE.NETWORK_ERROR]: '网络错误',
  [ERROR_CODE.VALIDATION_ERROR]: '数据验证失败',
  [ERROR_CODE.NOT_FOUND]: '资源不存在',
  [ERROR_CODE.UNAUTHORIZED]: '未授权',
  [ERROR_CODE.FORBIDDEN]: '禁止访问',
  [ERROR_CODE.INTERNAL_ERROR]: '服务器内部错误',
};

// 分页常量
const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_PAGE: 1,
};

// 缓存常量
const CACHE = {
  USER_INFO_KEY: 'yeyu_user_info',
  CACHE_EXPIRE_TIME: 24 * 60 * 60 * 1000, // 24小时
};

// 情感标签枚举（英文）
const EMOTION_TAGS = [
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
];

// 情感标签中英文映射
const EMOTION_TAGS_CN = {
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

module.exports = {
  EMOTION,
  TEXT_LIMIT,
  API,
  ERROR_CODE,
  ERROR_MESSAGE,
  PAGINATION,
  CACHE,
  EMOTION_TAGS,
  EMOTION_TAGS_CN,
};

