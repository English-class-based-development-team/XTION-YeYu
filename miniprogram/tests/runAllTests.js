/**
 * 运行所有测试
 * 统一执行所有工具函数的测试
 */

const testAnonymousId = require('./testAnonymousId.js');
const testEmotionSimilarity = require('./testEmotionSimilarity.js');
const testValidator = require('./testValidator.js');
const testErrorHandler = require('./testErrorHandler.js');
const testStage1Integration = require('./testStage1Integration.js');

/**
 * 运行所有测试套件
 */
function runAllTestSuites() {
  console.log('\n========================================');
  console.log('开始运行所有测试套件');
  console.log('========================================\n');

  const results = [];

  // 运行匿名ID测试
  console.log('【测试套件1】匿名ID生成工具');
  try {
    const result1 = testAnonymousId.runAllTests();
    results.push({ name: '匿名ID生成工具', ...result1 });
  } catch (error) {
    console.error('匿名ID测试失败:', error);
    results.push({ name: '匿名ID生成工具', error: error.message });
  }

  // 运行情绪相似度测试
  console.log('\n【测试套件2】情绪相似度计算工具');
  try {
    const result2 = testEmotionSimilarity.runAllTests();
    results.push({ name: '情绪相似度计算工具', ...result2 });
  } catch (error) {
    console.error('情绪相似度测试失败:', error);
    results.push({ name: '情绪相似度计算工具', error: error.message });
  }

  // 运行数据验证测试
  console.log('\n【测试套件3】数据验证工具');
  try {
    const result3 = testValidator.runAllTests();
    results.push({ name: '数据验证工具', ...result3 });
  } catch (error) {
    console.error('数据验证测试失败:', error);
    results.push({ name: '数据验证工具', error: error.message });
  }

  // 运行错误处理测试
  console.log('\n【测试套件4】错误处理工具');
  try {
    const result4 = testErrorHandler.runAllTests();
    results.push({ name: '错误处理工具', ...result4 });
  } catch (error) {
    console.error('错误处理测试失败:', error);
    results.push({ name: '错误处理工具', error: error.message });
  }

  // 运行阶段一综合测试
  console.log('\n【测试套件5】阶段一综合测试');
  try {
    const result5 = testStage1Integration.runAllTests();
    // 如果返回Promise，等待完成
    if (result5 && typeof result5.then === 'function') {
      return result5.then((resolvedResult) => {
        results.push({ name: '阶段一综合测试', ...resolvedResult });
        return printFinalResults(results);
      }).catch((error) => {
        console.error('阶段一综合测试失败:', error);
        results.push({ name: '阶段一综合测试', error: error.message });
        return printFinalResults(results);
      });
    } else {
      results.push({ name: '阶段一综合测试', ...result5 });
    }
  } catch (error) {
    console.error('阶段一综合测试失败:', error);
    results.push({ name: '阶段一综合测试', error: error.message });
  }

  // 打印总结
  return printFinalResults(results);
}

/**
 * 打印最终测试结果
 */
function printFinalResults(results) {
  console.log('\n========================================');
  console.log('测试总结');
  console.log('========================================');
  
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  results.forEach((result) => {
    if (result.error) {
      console.log(`\n${result.name}: 测试执行失败 - ${result.error}`);
    } else {
      console.log(`\n${result.name}:`);
      console.log(`  总测试数: ${result.total}`);
      console.log(`  通过: ${result.passed}`);
      console.log(`  失败: ${result.failed}`);
      console.log(`  成功率: ${result.successRate}`);
      totalTests += result.total;
      totalPassed += result.passed;
      totalFailed += result.failed;
    }
  });

  console.log('\n----------------------------------------');
  console.log('总计:');
  console.log(`  总测试数: ${totalTests}`);
  console.log(`  通过: ${totalPassed}`);
  console.log(`  失败: ${totalFailed}`);
  console.log(`  总成功率: ${totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(2) + '%' : '0%'}`);
  console.log('========================================\n');

  return {
    results: results,
    totalTests: totalTests,
    totalPassed: totalPassed,
    totalFailed: totalFailed,
    successRate: totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(2) + '%' : '0%',
  };
}

// 如果在页面中调用，可以直接运行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTestSuites,
  };
}

// 如果在Node.js环境或可以直接执行
if (typeof wx === 'undefined') {
  // 非微信小程序环境，可以用于开发时的单元测试
  console.log('注意：此测试需要在微信小程序环境中运行');
}

