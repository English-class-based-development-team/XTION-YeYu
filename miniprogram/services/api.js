/**
 * API 服务封装层
 * 封装后端 API 调用，统一错误处理
 */

// 导入 mockApi 作为后备方案
const mockApi = require('./mockApi.js');

// 后端 API 基础地址
// 注意：微信小程序无法直接访问 localhost，必须使用本机 IP 地址
// 
// 开发环境：使用本机局域网 IP 地址
// 获取方法：
//   macOS/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
//   Windows: ipconfig 查看 IPv4 地址
// 
// 检测到的本机 IP: 172.16.23.57
// 如果无法连接，请检查：
// 1. 后端服务是否正常运行在 8000 端口
// 2. 防火墙是否允许 8000 端口的连接
// 3. 微信开发者工具 -> 设置 -> 项目设置 -> 本地设置 -> 不校验合法域名（开发环境）
const LOCAL_IP = '172.16.23.57'; // 本机 IP 地址
const API_BASE = `http://${LOCAL_IP}:8000`;

// 如果需要使用 localhost（仅在某些环境下可用）
// const API_BASE = 'http://localhost:8000';

// Mock 模式配置：当后端不可用时是否自动使用 Mock 数据
const USE_MOCK_FALLBACK = true;

/**
 * 构建 URL 查询字符串
 * @param {Object} params - 查询参数对象
 * @returns {String} 查询字符串
 */
function buildQueryString(params) {
  if (!params || Object.keys(params).length === 0) {
    return '';
  }
  
  return Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

/**
 * 统一 API 请求封装
 * @param {String} url - API 路径
 * @param {Object} options - 请求选项 {method, data, timeout, retries}
 * @returns {Promise} Promise 对象
 */
function request(url, options = {}) {
  const { 
    method = 'POST', 
    data = {}, 
    timeout = 30000,
    retries = 0,
    currentRetry = 0
  } = options;
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}${url}`,
      method: method,
      header: {
        'Content-Type': 'application/json'
      },
      data: data,
      timeout: timeout,
      success: (res) => {
        // 处理不同的状态码
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 404) {
          // 404 错误特殊处理
          const error = new Error(`资源不存在: ${url}`);
          error.statusCode = 404;
          error.url = url;
          reject(error);
        } else if (res.statusCode >= 500 && currentRetry < retries) {
          // 服务器错误且还有重试次数，进行重试
          console.warn(`请求失败，正在重试 (${currentRetry + 1}/${retries}):`, url);
          setTimeout(() => {
            request(url, { ...options, currentRetry: currentRetry + 1 })
              .then(resolve)
              .catch(reject);
          }, 1000 * (currentRetry + 1)); // 指数退避
        } else {
          // 其他错误
          const errorMsg = res.data?.detail || res.data?.message || '未知错误';
          const error = new Error(`请求失败: ${res.statusCode} - ${errorMsg}`);
          error.statusCode = res.statusCode;
          error.data = res.data;
          reject(error);
        }
      },
      fail: (err) => {
        let errorMsg = err.errMsg || '未知错误';
        
        // 处理常见的网络错误
        if (errorMsg.includes('timeout')) {
          errorMsg = '请求超时，请检查网络连接';
          // 超时也可以重试
          if (currentRetry < retries) {
            console.warn(`请求超时，正在重试 (${currentRetry + 1}/${retries}):`, url);
            setTimeout(() => {
              request(url, { ...options, currentRetry: currentRetry + 1 })
                .then(resolve)
                .catch(reject);
            }, 1000 * (currentRetry + 1));
            return;
          }
        } else if (errorMsg.includes('localhost') || errorMsg.includes('127.0.0.1')) {
          errorMsg = '无法连接后端服务，请确保使用本机 IP 地址而不是 localhost';
        } else if (errorMsg.includes('fail')) {
          errorMsg = '网络连接失败，请检查网络设置和后端服务是否正常运行';
        }
        
        const error = new Error(`网络错误: ${errorMsg}`);
        error.originalError = err;
        reject(error);
      }
    });
  });
}

/**
 * 获取主动关怀消息列表
 * @param {String} userId - 用户 ID
 * @param {String} username - 用户名（可选）
 * @param {Number} maxMessages - 每批请求的消息数量（默认 3）
 * @param {Number} offset - 历史记录读取偏移量（默认 0）
 * @returns {Promise} Promise 对象，返回 {messages: [], context_posts: []}
 */
function getProactiveCareMessages(userId, username = '朋友', maxMessages = 3, offset = 0) {
  return request('/proactive_care', {
    method: 'POST',
    data: {
      user_id: userId,
      username: username,
      max_messages: maxMessages,
      offset: offset
    }
  });
}

/**
 * 对话接口
 * @param {String} userId - 用户 ID
 * @param {String} message - 用户消息
 * @returns {Promise} Promise 对象
 */
function chat(userId, message) {
  return request('/chat', {
    method: 'POST',
    data: {
      user_id: userId,
      message: message
    }
  });
}

/**
 * 发布帖子
 * @param {Object} data - 帖子数据 {user_id, username, content, emotion_tag, emotion_intensity}
 * @returns {Promise} Promise 对象
 */
function publishPost(data) {
  return request('/publish_post', {
    method: 'POST',
    data: data
  });
}

/**
 * 获取共鸣推荐
 * @param {Object} params - 查询参数 {user_id, emotion_tag, emotion_intensity, content, k}
 * @returns {Promise} Promise 对象
 */
function getResonancePosts(params) {
  return request('/resonance_posts', {
    method: 'POST',
    data: params
  });
}

/**
 * 生成问候语
 * @param {String} userId - 用户 ID
 * @param {String} username - 用户名（可选）
 * @returns {Promise} Promise 对象
 */
function getGreeting(userId, username = '朋友') {
  return request('/greeting', {
    method: 'POST',
    data: {
      user_id: userId,
      username: username,
      max_greetings: 3
    }
  });
}

/**
 * 生成对话总结
 * @param {String} userId - 用户 ID
 * @param {String} conversationId - 对话 ID（可选，如果提供则从对话生成）
 * @param {String} text - 直接文本（可选，与 conversationId 二选一）
 * @returns {Promise} Promise 对象，返回 {summary, emotion_tag, emotion_intensity}
 */
function generateSummary(userId, conversationId = null, text = null) {
  const data = {
    user_id: userId
  };
  
  if (conversationId) {
    data.conversation_id = conversationId;
  } else if (text) {
    data.text = text;
  }
  
  return request('/generate_summary', {
    method: 'POST',
    data: data
  });
}

// ==================== 个人中心相关 API ====================

/**
 * 获取用户资料
 * @param {String} userId - 用户 ID
 * @returns {Promise} Promise 对象，返回用户资料
 */
function getUserProfile(userId) {
  return request(`/profile/${userId}`, {
    method: 'GET'
  });
}

/**
 * 更新用户资料
 * @param {String} userId - 用户 ID
 * @param {Object} data - 资料数据 {avatar, nickname, greeting, wechat_user_id}
 * @returns {Promise} Promise 对象，返回更新后的用户资料
 */
function updateUserProfile(userId, data) {
  return request(`/profile/${userId}`, {
    method: 'PUT',
    data: data
  });
}

/**
 * 获取我的漂流瓶列表
 * @param {String} userId - 用户 ID
 * @param {Number} limit - 返回数量限制（默认 50）
 * @param {Number} offset - 偏移量（默认 0）
 * @returns {Promise} Promise 对象，返回 {bottles: [], total: number}
 */
function getUserBottles(userId, limit = 50, offset = 0) {
  const queryString = buildQueryString({ limit, offset });
  return request(`/profile/${userId}/bottles?${queryString}`, {
    method: 'GET'
  });
}

/**
 * 获取共鸣浏览记录
 * @param {String} userId - 用户 ID
 * @param {Number} limit - 返回数量限制（默认 25，最多 25）
 * @returns {Promise} Promise 对象，返回 {resonances: [], total: number}
 */
function getUserResonances(userId, limit = 25) {
  const queryString = buildQueryString({ limit });
  return request(`/profile/${userId}/resonances?${queryString}`, {
    method: 'GET'
  });
}

/**
 * 获取保存的对话列表
 * @param {String} userId - 用户 ID
 * @param {Number} limit - 返回数量限制（默认 50）
 * @param {Number} offset - 偏移量（默认 0）
 * @returns {Promise} Promise 对象，返回 {conversations: [], total: number}
 */
function getSavedConversations(userId, limit = 50, offset = 0) {
  const queryString = buildQueryString({ limit, offset });
  return request(`/profile/${userId}/conversations?${queryString}`, {
    method: 'GET'
  });
}

/**
 * 获取情绪统计数据（7天情绪曲线）
 * @param {String} userId - 用户 ID
 * @param {Boolean} forceUpdate - 是否强制更新（默认 false）
 * @returns {Promise} Promise 对象，返回 {success, week_data: [], total_posts: number}
 */
function getEmotionStats(userId, forceUpdate = false) {
  const queryString = buildQueryString({ force_update: forceUpdate });
  return request(`/profile/${userId}/emotion-stats?${queryString}`, {
    method: 'GET'
  });
}

/**
 * 获取个人中心统计概览
 * @param {String} userId - 用户 ID
 * @returns {Promise} Promise 对象，返回 {bottles_count, resonances_count, conversations_count, companion_days}
 */
function getProfileStats(userId) {
  return request(`/profile/${userId}/stats`, {
    method: 'GET'
  });
}

// ==================== 搜索相关 API ====================

/**
 * 搜索漂流瓶内容（带 Mock 回退功能）
 * @param {String} query - 搜索关键词
 * @param {Number} limit - 返回数量限制（默认 20）
 * @param {Number} offset - 偏移量（默认 0）
 * @returns {Promise} Promise 对象，返回 {posts: [], total: number}
 */
async function searchPosts(query, limit = 20, offset = 0) {
  // 如果启用了 Mock 回退，先尝试后端 API
  if (USE_MOCK_FALLBACK) {
    try {
      const queryString = buildQueryString({ q: query, limit, offset });
      const result = await request(`/search?${queryString}`, {
        method: 'GET',
        timeout: 5000 // 搜索使用较短超时
      });
      console.log('使用后端搜索 API');
      return result;
    } catch (error) {
      console.warn('后端搜索 API 不可用，使用 Mock 数据:', error.message);
      
      // 使用 mockApi 搜索
      const mockResult = await mockApi.searchPosts(query, limit, offset);
      
      if (mockResult.success) {
        console.log(`Mock 搜索成功，找到 ${mockResult.data.total} 条结果`);
        return mockResult.data;
      } else {
        throw new Error(mockResult.message || '搜索失败');
      }
    }
  } else {
    // 不使用 Mock 回退，直接调用后端 API
    const queryString = buildQueryString({ q: query, limit, offset });
    return request(`/search?${queryString}`, {
      method: 'GET'
    });
  }
}

module.exports = {
  // 核心工具
  request,
  buildQueryString,
  // 主动关怀与对话
  getProactiveCareMessages,
  chat,
  getGreeting,
  generateSummary,
  // 内容发布与推荐
  publishPost,
  getResonancePosts,
  // 个人中心相关
  getUserProfile,
  updateUserProfile,
  getUserBottles,
  getUserResonances,
  getSavedConversations,
  getEmotionStats,
  getProfileStats,
  // 搜索相关
  searchPosts
};

