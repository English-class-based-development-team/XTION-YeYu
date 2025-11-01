/**
 * API 配置文件
 * 用于配置后端服务地址和相关参数
 */

// 开发环境配置
const development = {
  // 后端 LLM 服务地址 (FastAPI)
  LLM_BASE_URL: 'http://localhost:8000',
  
  // 请求超时时间（毫秒）
  REQUEST_TIMEOUT: 30000,
  
  // 是否启用调试日志
  DEBUG: true,
  
  // 默认用户ID（开发测试用）
  DEFAULT_USER_ID: 'user_dev_001'
};

// 生产环境配置
const production = {
  // 生产环境的后端服务地址
  // 请根据实际部署情况修改
  LLM_BASE_URL: 'https://your-domain.com/api',
  
  // 请求超时时间（毫秒）
  REQUEST_TIMEOUT: 30000,
  
  // 是否启用调试日志
  DEBUG: false,
  
  // 生产环境用户ID生成策略
  DEFAULT_USER_ID: null // 将使用动态生成的用户ID
};

// 根据环境选择配置
// 微信小程序没有 NODE_ENV，这里使用简单的判断
// 开发者可以根据需要修改判断逻辑
function getEnvironment() {
  // 可以根据 wx.getAccountInfoSync() 的信息判断环境
  try {
    const accountInfo = wx.getAccountInfoSync();
    // 如果是开发版或体验版，使用开发环境配置
    if (accountInfo.miniProgram.envVersion === 'develop' || 
        accountInfo.miniProgram.envVersion === 'trial') {
      return 'development';
    }
  } catch (e) {
    console.warn('无法获取小程序环境信息，使用开发环境配置');
  }
  
  // 默认使用开发环境（便于本地开发）
  // 发布时可以修改为 'production'
  return 'development';
}

const env = getEnvironment();
const config = env === 'production' ? production : development;

// 导出配置
module.exports = {
  ...config,
  
  // 当前环境
  ENVIRONMENT: env,
  
  // API 端点配置
  ENDPOINTS: {
    // 聊天对话
    CHAT: '/chat',
    // 聊天历史
    CHAT_HISTORY: '/chat/history',
    // 健康检查
    HEALTH: '/health',
    // 发布帖子
    PUBLISH_POST: '/posts',
    // 情绪分析
    EMOTION_ANALYZE: '/emotion/analyze'
  },
  
  // 请求头配置
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  },
  
  // 重试配置
  RETRY: {
    // 最大重试次数
    MAX_ATTEMPTS: 3,
    // 重试延迟（毫秒）
    DELAY: 1000
  },
  
  // 缓存配置
  CACHE: {
    // 聊天历史缓存时间（毫秒）
    CHAT_HISTORY_TTL: 5 * 60 * 1000, // 5分钟
    // 最大缓存条目数
    MAX_ENTRIES: 100
  }
};

// 打印当前配置（仅开发环境）
if (config.DEBUG) {
  console.log('API配置已加载:', {
    environment: env,
    baseUrl: config.LLM_BASE_URL,
    timeout: config.REQUEST_TIMEOUT,
    debug: config.DEBUG
  });
}
