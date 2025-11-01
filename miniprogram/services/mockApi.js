/**
 * Mock API 服务封装层
 * 封装Mock数据操作方法、错误处理、重试机制
 */

const { handleError, formatError, checkApiResult } = require('../utils/errorHandler.js');
const { mockPosts: initialMockPosts, realUserData } = require('../mock/mockData.js');

// Mock数据存储（从 mockData.js 导入，包含来自 Yeyu_ui_design 的真实用户数据）
let mockPosts = [...initialMockPosts];

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
 * 发布帖子（使用真实数据存储）
 * @param {Object} data - 帖子数据 {valence, arousal, content, emotion, userId, username}
 * @returns {Promise} Promise对象
 */
async function publishPost(data) {
  return callMockApi(
    async (params) => {
      const { valence, arousal, content, emotion, userId, username } = params;
      
      // 生成新帖子
      const newPost = {
        postId: `post_${Date.now()}`,
        userId: userId || 'user_default',
        username: username || '匿名用户',
        content: content,
        emotion: emotion || '中性',
        emotionValue: valence || 5,
        arousalValue: arousal || 5,
        valence: valence || 5,
        arousal: arousal || 5,
        timestamp: Date.now(),
        likeCount: 0,
        commentCount: 0,
        comments: [],
        isUserPost: true, // 标记为用户发布的帖子
      };
      
      // 添加到列表开头（最新的在前）
      mockPosts.unshift(newPost);
      
      return createResponse(true, { 
        postId: newPost.postId,
        post: newPost
      }, '发布成功');
    },
    data,
    true,
    false
  );
}

/**
 * 获取共鸣流（使用导入的真实数据）
 * @param {Object} params - 查询参数 {valence, arousal, page, pageSize}
 * @returns {Promise} Promise对象
 */
async function getFeed(params) {
  return callMockApi(
    async (queryParams) => {
      const { page = 1, pageSize = 20 } = queryParams;
      
      // 计算分页
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      
      // 获取当前页的数据
      const posts = mockPosts.slice(start, end);
      
      return createResponse(true, { 
        posts: posts, 
        total: mockPosts.length, 
        page: page, 
        pageSize: pageSize,
        hasMore: end < mockPosts.length
      }, '获取成功');
    },
    params,
    true,
    false
  );
}

/**
 * 点赞/取消点赞（使用真实数据操作）
 * @param {String} postId - 帖子ID
 * @param {String} action - 操作类型：'like' 或 'unlike'
 * @returns {Promise} Promise对象
 */
async function likePost(postId, action = 'like') {
  return callMockApi(
    async (params) => {
      const { postId, action } = params;
      
      // 查找帖子
      const post = mockPosts.find(p => p.postId === postId);
      
      if (!post) {
        return createResponse(false, null, '帖子不存在', 1004);
      }
      
      // 更新点赞数
      if (action === 'like') {
        post.likeCount = (post.likeCount || 0) + 1;
      } else if (action === 'unlike' && post.likeCount > 0) {
        post.likeCount = post.likeCount - 1;
      }
      
      return createResponse(true, { 
        likeCount: post.likeCount,
        postId: postId
      }, '操作成功');
    },
    { postId, action },
    true,
    false
  );
}

/**
 * 发布评论（使用真实数据操作）
 * @param {String} postId - 帖子ID
 * @param {String} content - 评论内容
 * @param {String} userId - 用户ID（可选）
 * @param {String} username - 用户名（可选）
 * @returns {Promise} Promise对象
 */
async function commentPost(postId, content, userId, username) {
  return callMockApi(
    async (params) => {
      const { postId, content, userId, username } = params;
      
      // 查找帖子
      const post = mockPosts.find(p => p.postId === postId);
      
      if (!post) {
        return createResponse(false, null, '帖子不存在', 1004);
      }
      
      // 创建新评论
      const newComment = {
        commentId: `comment_${Date.now()}`,
        userId: userId || 'user_default',
        username: username || '匿名用户',
        content: content,
        timestamp: Date.now(),
      };
      
      // 添加评论
      if (!post.comments) {
        post.comments = [];
      }
      post.comments.push(newComment);
      post.commentCount = post.comments.length;
      
      return createResponse(true, { 
        commentId: newComment.commentId,
        comment: newComment,
        commentCount: post.commentCount
      }, '评论成功');
    },
    { postId, content, userId, username },
    true,
    false
  );
}

/**
 * 搜索帖子（使用真实数据搜索）
 * @param {String} query - 搜索关键词
 * @param {Number} limit - 返回数量限制（默认 20）
 * @param {Number} offset - 偏移量（默认 0）
 * @returns {Promise} Promise对象
 */
async function searchPosts(query, limit = 20, offset = 0) {
  return callMockApi(
    async (params) => {
      const { query, limit, offset } = params;
      
      if (!query || !query.trim()) {
        return createResponse(true, { 
          posts: [], 
          total: 0 
        }, '请输入搜索关键词');
      }
      
      const lowerQuery = query.trim().toLowerCase();
      
      // 搜索逻辑：匹配内容或情绪标签
      const matchedPosts = mockPosts.filter(post => {
        // 匹配内容
        const contentMatch = post.content && 
                           post.content.toLowerCase().includes(lowerQuery);
        
        // 匹配情绪标签
        const emotionMatch = post.emotion && 
                            post.emotion.toLowerCase().includes(lowerQuery);
        
        // 匹配用户名
        const usernameMatch = post.username && 
                             post.username.toLowerCase().includes(lowerQuery);
        
        return contentMatch || emotionMatch || usernameMatch;
      });
      
      // 应用分页
      const start = offset;
      const end = start + limit;
      const paginatedPosts = matchedPosts.slice(start, end);
      
      // 转换为搜索结果格式
      const searchResults = paginatedPosts.map(post => ({
        id: post.postId || post._id,
        post_id: post.postId,
        emotion_tag: post.emotion,
        tag: post.emotion,
        content: post.content,
        created_at: new Date(post.timestamp).toISOString(),
        timestamp: post.timestamp,
        anonymous_id: post.userId,
        like_count: post.likeCount || 0,
        comment_count: post.commentCount || 0,
        valence: post.valence,
        arousal: post.arousal,
      }));
      
      return createResponse(true, { 
        posts: searchResults, 
        total: matchedPosts.length,
        query: query,
        offset: offset,
        limit: limit,
        hasMore: end < matchedPosts.length
      }, `找到 ${matchedPosts.length} 条结果`);
    },
    { query, limit, offset },
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
  searchPosts,
  // 导出mock数据存储和操作方法
  setMockPosts: (posts) => { mockPosts = posts; },
  getMockPosts: () => mockPosts,
  getRealUserData: () => realUserData, // 导出来自 Yeyu_ui_design 的真实用户数据
  // 获取只包含真实用户数据的帖子
  getRealUserPosts: () => mockPosts.filter(post => post.isRealUserData === true),
};

