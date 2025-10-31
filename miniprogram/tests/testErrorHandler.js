/**
 * 错误处理工具测试
 * 测试异常捕获、错误格式化
 */

const { test, assertTrue, assertFalse, assertEqual, resetTestResults, printTestReport } = require('../utils/testUtils.js');
const { formatError, createError, checkApiResult } = require('../utils/errorHandler.js');
const { ERROR_CODE } = require('../constants/index.js');

/**
 * 运行所有测试
 */
function runAllTests() {
  console.log('\n开始测试：错误处理工具\n');
  resetTestResults();

  // 测试1：格式化Error对象
  test('测试格式化Error对象', () => {
    const error = new Error('测试错误');
    const formatted = formatError(error);
    assertTrue(formatted.hasOwnProperty('code'), '格式化错误应该包含code');
    assertTrue(formatted.hasOwnProperty('message'), '格式化错误应该包含message');
    assertTrue(formatted.hasOwnProperty('originalError'), '格式化错误应该包含originalError');
    return true;
  });

  // 测试2：格式化字符串错误
  test('测试格式化字符串错误', () => {
    const formatted = formatError('字符串错误');
    assertTrue(formatted.code === ERROR_CODE.INTERNAL_ERROR, '字符串错误应该转换为内部错误');
    assertEqual(formatted.message, '字符串错误', '错误消息应该正确');
    return true;
  });

  // 测试3：网络错误识别
  test('测试网络错误识别', () => {
    const error = new Error('network timeout');
    const formatted = formatError(error);
    assertTrue(formatted.code === ERROR_CODE.NETWORK_ERROR, '应该识别为网络错误');
    return true;
  });

  // 测试4：创建错误对象
  test('测试创建错误对象', () => {
    const error = createError(ERROR_CODE.INVALID_PARAM, '参数错误');
    assertEqual(error.code, ERROR_CODE.INVALID_PARAM, '错误码应该正确');
    assertEqual(error.message, '参数错误', '错误消息应该正确');
    return true;
  });

  // 测试5：API结果检查 - 成功
  test('测试API结果检查 - 成功响应', () => {
    const result = { success: true, data: { id: 1 } };
    const checked = checkApiResult(result);
    assertTrue(checked.success, '应该识别为成功');
    assertTrue(checked.data !== null, '数据应该存在');
    assertTrue(checked.error === null, '错误应该为null');
    return true;
  });

  // 测试6：API结果检查 - 失败
  test('测试API结果检查 - 失败响应', () => {
    const result = { success: false, code: ERROR_CODE.NETWORK_ERROR };
    const checked = checkApiResult(result);
    assertFalse(checked.success, '应该识别为失败');
    assertTrue(checked.error !== null, '错误应该存在');
    return true;
  });

  // 测试7：API结果检查 - null/undefined
  test('测试API结果检查 - null/undefined', () => {
    const checked1 = checkApiResult(null);
    const checked2 = checkApiResult(undefined);
    assertFalse(checked1.success, 'null应该识别为失败');
    assertFalse(checked2.success, 'undefined应该识别为失败');
    return true;
  });

  // 打印测试报告
  return printTestReport();
}

// 如果在页面中调用，可以直接运行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
  };
}

