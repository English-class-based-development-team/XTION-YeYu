/**
 * 测试工具函数
 * 用于在微信小程序中进行单元测试
 */

/**
 * 测试结果统计
 */
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
};

/**
 * 运行单个测试用例
 * @param {String} testName - 测试名称
 * @param {Function} testFunc - 测试函数，返回true或Promise表示通过，false或抛错表示失败
 */
function test(testName, testFunc) {
  testResults.total++;
  try {
    const result = testFunc();
    
    // 如果返回Promise，等待Promise完成
    if (result && typeof result.then === 'function') {
      result.then((resolvedResult) => {
        if (resolvedResult === true || resolvedResult === undefined) {
          testResults.passed++;
          console.log(`✅ ${testName} - 通过`);
        } else {
          testResults.failed++;
          testResults.errors.push(`${testName}: ${resolvedResult}`);
          console.error(`❌ ${testName} - 失败: ${resolvedResult}`);
        }
      }).catch((error) => {
        testResults.failed++;
        const errorMsg = error.message || String(error);
        testResults.errors.push(`${testName}: ${errorMsg}`);
        console.error(`❌ ${testName} - 错误: ${errorMsg}`);
      });
      // 异步测试，先返回true，结果会在Promise完成后更新
      return true;
    }
    
    // 同步测试
    if (result === true || result === undefined) {
      testResults.passed++;
      console.log(`✅ ${testName} - 通过`);
      return true;
    } else {
      testResults.failed++;
      testResults.errors.push(`${testName}: ${result}`);
      console.error(`❌ ${testName} - 失败: ${result}`);
      return false;
    }
  } catch (error) {
    testResults.failed++;
    const errorMsg = error.message || String(error);
    testResults.errors.push(`${testName}: ${errorMsg}`);
    console.error(`❌ ${testName} - 错误: ${errorMsg}`);
    return false;
  }
}

/**
 * 断言相等
 * @param {Any} actual - 实际值
 * @param {Any} expected - 期望值
 * @param {String} message - 错误消息
 */
function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `期望 ${expected}，实际得到 ${actual}`);
  }
  return true;
}

/**
 * 断言为真
 * @param {Any} value - 要断言的值
 * @param {String} message - 错误消息
 */
function assertTrue(value, message) {
  if (!value) {
    throw new Error(message || '断言失败：值应该为真');
  }
  return true;
}

/**
 * 断言为假
 * @param {Any} value - 要断言的值
 * @param {String} message - 错误消息
 */
function assertFalse(value, message) {
  if (value) {
    throw new Error(message || '断言失败：值应该为假');
  }
  return true;
}

/**
 * 断言在范围内
 * @param {Number} value - 值
 * @param {Number} min - 最小值
 * @param {Number} max - 最大值
 * @param {String} message - 错误消息
 */
function assertInRange(value, min, max, message) {
  if (value < min || value > max) {
    throw new Error(message || `值 ${value} 应该在 ${min}-${max} 范围内`);
  }
  return true;
}

/**
 * 获取测试结果
 * @returns {Object} 测试结果统计
 */
function getTestResults() {
  return {
    total: testResults.total,
    passed: testResults.passed,
    failed: testResults.failed,
    errors: testResults.errors,
    successRate: testResults.total > 0 ? (testResults.passed / testResults.total * 100).toFixed(2) + '%' : '0%',
  };
}

/**
 * 重置测试结果
 */
function resetTestResults() {
  testResults.total = 0;
  testResults.passed = 0;
  testResults.failed = 0;
  testResults.errors = [];
}

/**
 * 打印测试报告
 */
function printTestReport() {
  const results = getTestResults();
  console.log('\n========== 测试报告 ==========');
  console.log(`总测试数: ${results.total}`);
  console.log(`通过: ${results.passed}`);
  console.log(`失败: ${results.failed}`);
  console.log(`成功率: ${results.successRate}`);
  if (results.errors.length > 0) {
    console.log('\n错误详情:');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  console.log('================================\n');
  return results;
}

module.exports = {
  test,
  assertEqual,
  assertTrue,
  assertFalse,
  assertInRange,
  getTestResults,
  resetTestResults,
  printTestReport,
};

