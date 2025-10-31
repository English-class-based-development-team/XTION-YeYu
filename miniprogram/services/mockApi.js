/**
 * Mock API 服务封装层
 * 封装Mock数据操作方法、错误处理、重试机制
 */

const { handleError, formatError, checkApiResult } = require('../utils/errorHandler.js');

// Mock数据存储（在阶段三会从mockData.js导入）
let mockPosts = [];

/**
 * 模拟网络延迟
 * @param {Number} ms - 延迟时间（毫秒）
 * @returns {Promise} Promise对象
 */
function delay(ms = 500) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * 统一API响应格式
 * @param {Boolean} success - 是否成功
 * @param {Any} data - 返回数据
 * @param {String} message - 消息
 * @param {Number} code - 错误码
 * @returns {Object} 统一响应格式
 */
function createResponse(success, data = null, message = '', code = 0) {
  return {
    success: success,
    data: data,
    message: message,
    code: code,
  };
}

/**
 * 带重试机制的API调用包装器
 * @param {Function} apiFunction - API函数
 * @param {Number} maxRetries - 最大重试次数（默认3次）
 * @param {Number} retryDelay - 重试延迟（毫秒，默认1000）
 * @returns {Promise} Promise对象
 */
async function callWithRetry(apiFunction, maxRetries = 3, retryDelay = 1000) {
  let lastError = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await apiFunction();
      return result;
    } catch (error) {
      lastError = error;
      
      // 如果不是最后一次重试，等待后继续
      if (i < maxRetries - 1) {
        await delay(retryDelay);
        console.log(`API调用失败，正在重试 (${i + 1}/${maxRetries})...`);
      }
    }
  }
  
  // 所有重试都失败
  throw lastError;
}

/**
 * 执行Mock API调用（统一封装）
 * @param {Function} handler - API处理函数
 * @param {Object} params - 参数对象
 * @param {Boolean} enableDelay - 是否启用延迟（默认true）
 * @param {Boolean} enableRetry - 是否启用重试（默认false）
 * @returns {Promise} Promise对象
 */
async function callMockApi(handler, params = {}, enableDelay = true, enableRetry = false) {
  try {
    // 模拟网络延迟
    if (enableDelay) {
      await delay(300 + Math.random() * 200); // 300-500ms随机延迟
    }

    // 执行API处理函数
    let result;
    if (enableRetry) {
      result = await callWithRetry(() => handler(params));
    } else {
      result = await handler(params);
    }

    // 检查返回结果
    const checkedResult = checkApiResult(result);
    
    if (checkedResult.success) {
      return createResponse(true, checkedResult.data, '操作成功', 0);
    } else {
      return createResponse(
        false,
        null,
        checkedResult.error.message,
        checkedResult.error.code
      );
    }
  } catch (error) {
    const formattedError = formatError(error);
    return createResponse(
      false,
      null,
      formattedError.message,
      formattedError.code
    );
  }
}

/**
 * 发布帖子（接口定义，具体实现在阶段三）
 * @param {Object} data - 帖子数据 {valence, arousal, content}
 * @returns {Promise} Promise对象
 */
async function publishPost(data) {
  return callMockApi(
    async (params) => {
      // 这里将在阶段三实现具体逻辑
      // 暂时返回成功响应
      return createResponse(true, { postId: 'mock_' + Date.now() }, '发布成功');
    },
    data,
    true,
    false
  );
}

/**
 * 获取共鸣流（接口定义，具体实现在阶段三）
 * @param {Object} params - 查询参数 {valence, arousal, page, pageSize}
 * @returns {Promise} Promise对象
 */
async function getFeed(params) {
  return callMockApi(
    async (queryParams) => {
      // 这里将在阶段三实现具体逻辑
      // 暂时返回空列表
      return createResponse(true, { posts: [], total: 0, page: 1, pageSize: 20 });
    },
    params,
    true,
    false
  );
}

/**
 * 点赞/取消点赞（接口定义，具体实现在阶段三）
 * @param {String} postId - 帖子ID
 * @param {String} action - 操作类型：'like' 或 'unlike'
 * @returns {Promise} Promise对象
 */
async function likePost(postId, action = 'like') {
  return callMockApi(
    async (params) => {
      // 这里将在阶段三实现具体逻辑
      // 暂时返回成功响应
      return createResponse(true, { likeCount: 0 }, '操作成功');
    },
    { postId, action },
    true,
    false
  );
}

/**
 * 发布评论（接口定义，具体实现在阶段三）
 * @param {String} postId - 帖子ID
 * @param {String} content - 评论内容
 * @returns {Promise} Promise对象
 */
async function commentPost(postId, content) {
  return callMockApi(
    async (params) => {
      // 这里将在阶段三实现具体逻辑
      // 暂时返回成功响应
      return createResponse(true, { commentId: 'mock_' + Date.now() }, '评论成功');
    },
    { postId, content },
    true,
    false
  );
}

module.exports = {
  callMockApi,
  callWithRetry,
  delay,
  createResponse,
  publishPost,
  getFeed,
  likePost,
  commentPost,
  // 导出mock数据存储（供阶段三使用）
  setMockPosts: (posts) => { mockPosts = posts; },
  getMockPosts: () => mockPosts,
};

