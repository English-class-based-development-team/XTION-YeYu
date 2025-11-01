/**
 * API 服务封装层
 * 封装后端 API 调用，统一错误处理
 */

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
// 快速健康检查（用于验证 API_BASE 是否可达）
function healthCheck(timeout = 3000) {
  return new Promise((resolve, reject) => {
    const base = getApiBase();
    wx.request({
      url: `${base}/health`,
      method: 'GET',
      timeout,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(`健康检查失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(new Error(`健康检查不可达（当前地址：${base}）: ${err.errMsg || '未知错误'}`));
      }
    });
  });
}

// 允许通过本地存储覆盖后端地址：wx.setStorageSync('API_BASE', 'http://<IP>:8000')
function getApiBase() {
  try {
    const override = wx.getStorageSync && wx.getStorageSync('API_BASE');
    if (override && typeof override === 'string' && override.startsWith('http')) {
      return override.replace(/\/$/, ''); // 去掉末尾斜杠
    }
  } catch (e) {}
  return API_BASE;
}

function setApiBase(newBase) {
  try {
    if (typeof newBase === 'string' && newBase.startsWith('http')) {
      wx.setStorageSync('API_BASE', newBase.replace(/\/$/, ''));
    }
  } catch (e) {}
}

// 如果需要使用 localhost（仅在某些环境下可用）
// const API_BASE = 'http://localhost:8000';

/**
 * 统一 API 请求封装
 * @param {String} url - API 路径
 * @param {Object} options - 请求选项 {method, data, timeout}
 * @returns {Promise} Promise 对象
 */
function request(url, options = {}) {
  // 对于 proactive_care 这种可能需要调用大模型的接口，使用更长的超时时间
  const defaultTimeout = url.includes('proactive_care') || url.includes('generate_summary') 
    ? 60000  // 60秒（大模型生成可能需要较长时间）
    : 30000; // 30秒（其他接口）
  const { method = 'POST', data = {}, timeout = options.timeout || defaultTimeout } = options;
  
  return new Promise((resolve, reject) => {
    const base = getApiBase();
    wx.request({
      url: `${base}${url}`,
      method: method,
      header: {
        'Content-Type': 'application/json'
      },
      data: data,
      timeout: timeout, // 设置超时时间（30秒）
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(`请求失败: ${res.statusCode} - ${res.data?.detail || '未知错误'}`));
        }
      },
      fail: (err) => {
        let errorMsg = err.errMsg || '未知错误';
        
        // 处理常见的网络错误
        if (errorMsg.includes('timeout')) {
          errorMsg = `请求超时，请检查后端服务是否正常运行（当前地址：${base}）`;
        } else if (errorMsg.includes('localhost') || errorMsg.includes('127.0.0.1')) {
          errorMsg = '无法连接后端服务，请确保使用本机 IP 地址而不是 localhost';
        }
        
        reject(new Error(`网络错误: ${errorMsg}`));
      }
    });
  });
}

/**
 * 获取主动关怀消息列表（无重试，失败立即报错）
 * @param {String} userId - 用户 ID
 * @param {String} username - 用户名（可选）
 * @returns {Promise} Promise 对象，返回 {messages: [], context_posts: []}
 */
function getProactiveCareMessages(userId, username = '朋友') {
  return request('/proactive_care', {
    method: 'POST',
    data: {
      user_id: userId,
      username: username,
      max_messages: 8
    },
    timeout: 60000 // 60秒超时（大模型生成需要时间）
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

module.exports = {
  request,
  getProactiveCareMessages,
  chat,
  publishPost,
  getResonancePosts,
  getGreeting,
  generateSummary,
  // 便于在开发者工具控制台动态切换后端地址：
  // wx.setStorageSync('API_BASE', 'http://192.168.x.x:8000');
  setApiBase,
  getApiBase,
  healthCheck
};

