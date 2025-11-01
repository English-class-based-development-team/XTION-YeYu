/**
 * LLM API 服务
 * 连接后端 FastAPI 服务，调用大模型进行对话
 */

// 导入配置
const apiConfig = require('../config/api.js');
const { getAnonymousId } = require('../utils/anonymousId.js');

/**
 * 发送聊天消息到 LLM 服务
 * @param {Array} messages - 消息历史（只使用最后一条用户消息）
 * @param {string} userId - 用户ID（可选，默认使用 anonymousId）
 * @returns {Promise} API响应
 */
function sendChatMessage(messages, userId = null) {
  return new Promise((resolve, reject) => {
    // 获取最后一条用户消息
    const lastUserMessage = messages.slice().reverse().find(msg => 
      msg.role === 'user' || msg.isUser === true
    );
    
    if (!lastUserMessage) {
      reject(new Error('未找到用户消息'));
      return;
    }

    // 优先使用传入的 userId，否则使用 anonymousId，最后才使用配置的默认值
    let finalUserId;
    if (userId) {
      finalUserId = userId;
    } else {
      try {
        finalUserId = getAnonymousId();
        // 如果 anonymousId 格式不符合要求，添加 user_ 前缀
        if (!finalUserId.startsWith('user_')) {
          finalUserId = `user_${finalUserId}`;
        }
      } catch (e) {
        console.warn('获取 anonymousId 失败，使用默认值:', e);
        finalUserId = apiConfig.DEFAULT_USER_ID || `user_${Date.now()}`;
      }
    }

    const requestData = {
      user_id: finalUserId,
      message: lastUserMessage.content || lastUserMessage.text,
      conversation_id: finalUserId // 使用 user_id 作为 conversation_id，让服务器自动管理对话历史
    };

    if (apiConfig.DEBUG) {
      console.log('发送聊天请求:', requestData);
    }

    wx.request({
      url: `${apiConfig.LLM_BASE_URL}${apiConfig.ENDPOINTS.CHAT}`,
      method: 'POST',
      header: apiConfig.DEFAULT_HEADERS,
      data: requestData,
      timeout: apiConfig.REQUEST_TIMEOUT,
      success: (res) => {
        if (apiConfig.DEBUG) {
          console.log('LLM API 响应:', res);
        }
        
        if (res.statusCode === 200 && res.data) {
          // 转换API响应格式为小程序期望的格式
          resolve({
            success: true,
            data: {
              response: res.data.reply,
              conversation_id: res.data.conversation_id,
              emotion_detected: res.data.emotion_detected
            }
          });
        } else {
          reject(new Error(`API错误: ${res.statusCode} ${res.data?.detail || '未知错误'}`));
        }
      },
      fail: (err) => {
        if (apiConfig.DEBUG) {
          console.error('LLM API 请求失败:', err);
        }
        
        // 网络错误处理
        let errorMessage = '网络连接失败';
        if (err.errMsg) {
          if (err.errMsg.includes('timeout')) {
            errorMessage = '请求超时，请检查网络连接';
          } else if (err.errMsg.includes('fail')) {
            errorMessage = '无法连接到服务器，请稍后重试';
          }
        }
        
        reject(new Error(errorMessage));
      }
    });
  });
}

/**
 * 获取用户的对话历史
 * @param {string} userId - 用户ID
 * @param {number} limit - 限制条数，默认50
 * @returns {Promise} 对话历史
 */
function getChatHistory(userId = null, limit = 50) {
  return new Promise((resolve, reject) => {
    const finalUserId = userId || apiConfig.DEFAULT_USER_ID || `user_${Date.now()}`;
    
    wx.request({
      url: `${apiConfig.LLM_BASE_URL}${apiConfig.ENDPOINTS.CHAT_HISTORY}/${finalUserId}`,
      method: 'GET',
      header: apiConfig.DEFAULT_HEADERS,
      data: {
        limit: limit
      },
      timeout: apiConfig.REQUEST_TIMEOUT,
      success: (res) => {
        if (res.statusCode === 200) {
          // 转换格式：API格式 -> 小程序格式
          const messages = (res.data.messages || []).map(msg => ({
            role: msg.role === 'assistant' ? 'ai' : msg.role,
            content: msg.content,
            timestamp: msg.timestamp
          }));
          
          resolve({
            success: true,
            messages: messages
          });
        } else {
          reject(new Error(`获取历史失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        if (apiConfig.DEBUG) {
          console.error('获取聊天历史失败:', err);
        }
        reject(new Error('获取聊天历史失败'));
      }
    });
  });
}

/**
 * 清除用户的对话历史
 * @param {string} userId - 用户ID
 * @returns {Promise} 清除结果
 */
function clearChatHistory(userId = null) {
  return new Promise((resolve, reject) => {
    const finalUserId = userId || apiConfig.DEFAULT_USER_ID || `user_${Date.now()}`;
    
    wx.request({
      url: `${apiConfig.LLM_BASE_URL}${apiConfig.ENDPOINTS.CHAT_HISTORY}/${finalUserId}`,
      method: 'DELETE',
      header: apiConfig.DEFAULT_HEADERS,
      timeout: apiConfig.REQUEST_TIMEOUT,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve({
            success: true,
            message: '聊天历史已清除'
          });
        } else {
          reject(new Error(`清除历史失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        if (apiConfig.DEBUG) {
          console.error('清除聊天历史失败:', err);
        }
        reject(new Error('清除聊天历史失败'));
      }
    });
  });
}

/**
 * 健康检查 - 检查后端服务是否可用
 * @returns {Promise} 服务状态
 */
function healthCheck() {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${apiConfig.LLM_BASE_URL}${apiConfig.ENDPOINTS.HEALTH}`,
      method: 'GET',
      timeout: 5000, // 健康检查超时时间较短
      success: (res) => {
        if (res.statusCode === 200) {
          resolve({
            success: true,
            status: res.data.status,
            message: '服务正常'
          });
        } else {
          reject(new Error(`服务异常: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        if (apiConfig.DEBUG) {
          console.error('健康检查失败:', err);
        }
        reject(new Error('无法连接到后端服务'));
      }
    });
  });
}

/**
 * 模拟回复（备用方案）
 * 当后端服务不可用时使用
 * @param {string} userMessage - 用户消息
 * @returns {Promise} 模拟回复
 */
function getMockReply(userMessage) {
  return new Promise((resolve) => {
    // 简单的模拟回复逻辑
    const mockReplies = [
      "我理解你的感受。能告诉我更多关于这件事的情况吗？",
      "这听起来很有趣。你对此有什么想法？",
      "我在这里倾听你的想法。请继续分享。",
      "谢谢你的分享。这对你来说一定很重要。",
      "我明白了。你希望我如何帮助你？"
    ];
    
    // 根据用户消息长度和内容选择回复
    let replyIndex = userMessage.length % mockReplies.length;
    
    // 添加一些基于关键词的智能回复
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes('难过') || lowerMessage.includes('悲伤')) {
      replyIndex = 0;
    } else if (lowerMessage.includes('开心') || lowerMessage.includes('高兴')) {
      replyIndex = 1;
    } else if (lowerMessage.includes('帮助') || lowerMessage.includes('建议')) {
      replyIndex = 4;
    }
    
    // 模拟网络延迟
    setTimeout(() => {
      resolve({
        success: true,
        data: {
          response: mockReplies[replyIndex],
          is_mock: true
        }
      });
    }, 800 + Math.random() * 1200); // 0.8-2秒随机延迟
  });
}

module.exports = {
  sendChatMessage,
  getChatHistory,
  clearChatHistory,
  healthCheck,
  getMockReply,
  config: apiConfig
};
