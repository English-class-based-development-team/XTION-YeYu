/**
 * 错误处理工具
 * 格式化错误信息、统一错误处理、记录错误日志
 */

const { ERROR_CODE, ERROR_MESSAGE } = require('../constants/index.js');

/**
 * 格式化错误信息
 * @param {Error|Object|String} error - 错误对象、错误对象或错误字符串
 * @returns {Object} 格式化后的错误对象 {code, message, originalError}
 */
function formatError(error) {
  // 如果是字符串，转换为错误对象
  if (typeof error === 'string') {
    return {
      code: ERROR_CODE.INTERNAL_ERROR,
      message: error,
      originalError: null,
    };
  }

  // 如果是Error对象
  if (error instanceof Error) {
    // 检查是否是网络错误
    if (error.message && (
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('networkError')
    )) {
      return {
        code: ERROR_CODE.NETWORK_ERROR,
        message: ERROR_MESSAGE[ERROR_CODE.NETWORK_ERROR],
        originalError: error,
      };
    }

    // 检查是否是参数错误
    if (error.message && (
      error.message.includes('param') ||
      error.message.includes('invalid')
    )) {
      return {
        code: ERROR_CODE.INVALID_PARAM,
        message: ERROR_MESSAGE[ERROR_CODE.INVALID_PARAM],
        originalError: error,
      };
    }

    // 默认内部错误
    return {
      code: ERROR_CODE.INTERNAL_ERROR,
      message: error.message || ERROR_MESSAGE[ERROR_CODE.INTERNAL_ERROR],
      originalError: error,
    };
  }

  // 如果已经是格式化后的错误对象
  if (error && typeof error === 'object' && error.code) {
    return {
      code: error.code,
      message: error.message || ERROR_MESSAGE[error.code] || '未知错误',
      originalError: error.originalError || error,
    };
  }

  // 默认错误
  return {
    code: ERROR_CODE.INTERNAL_ERROR,
    message: ERROR_MESSAGE[ERROR_CODE.INTERNAL_ERROR],
    originalError: error,
  };
}

/**
 * 统一错误处理逻辑
 * @param {Error|Object|String} error - 错误对象
 * @param {Object} context - 上下文信息 {function, params}
 * @param {Boolean} showToast - 是否显示提示（默认true）
 * @returns {Object} 格式化后的错误对象
 */
function handleError(error, context = {}, showToast = true) {
  const formattedError = formatError(error);

  // 记录错误日志
  logError(formattedError, context);

  // 显示用户友好的错误提示
  if (showToast) {
    wx.showToast({
      title: formattedError.message,
      icon: 'none',
      duration: 2000,
    });
  }

  return formattedError;
}

/**
 * 记录错误日志
 * @param {Object} error - 格式化后的错误对象
 * @param {Object} context - 上下文信息
 */
function logError(error, context = {}) {
  const logMessage = {
    error: {
      code: error.code,
      message: error.message,
    },
    context: context,
    timestamp: new Date().toISOString(),
  };

  // 在开发环境下输出详细错误信息
  if (error.originalError) {
    console.error('错误详情:', logMessage, error.originalError);
  } else {
    console.error('错误详情:', logMessage);
  }

  // 在实际项目中，这里可以将错误上报到监控平台
  // 例如：上报到Sentry、监控平台等
}

/**
 * 创建错误对象
 * @param {Number} code - 错误码
 * @param {String} message - 错误信息
 * @param {Any} originalError - 原始错误
 * @returns {Object} 错误对象
 */
function createError(code, message, originalError = null) {
  return {
    code: code,
    message: message || ERROR_MESSAGE[code] || '未知错误',
    originalError: originalError,
  };
}

/**
 * 检查错误并返回统一格式
 * @param {Any} result - API返回结果
 * @returns {Object} {success: boolean, data: any, error: Object|null}
 */
function checkApiResult(result) {
  if (!result) {
    return {
      success: false,
      data: null,
      error: createError(ERROR_CODE.NETWORK_ERROR, '请求失败'),
    };
  }

  // 如果明确标记为失败，或者有错误码且不是成功码
  if (result.success === false || (result.code !== undefined && result.code !== ERROR_CODE.SUCCESS && result.code !== 0)) {
    return {
      success: false,
      data: null,
      error: formatError(result),
    };
  }

  return {
    success: true,
    data: result.data || result,
    error: null,
  };
}

module.exports = {
  formatError,
  handleError,
  logError,
  createError,
  checkApiResult,
};

