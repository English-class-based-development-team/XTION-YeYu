/**
 * Node.js环境测试脚本
 * 用于在Node.js环境中运行测试（模拟微信小程序环境）
 */

// 模拟wx对象
global.wx = {
  getStorageSync: function(key) {
    if (!global.mockStorage) {
      global.mockStorage = {};
    }
    return global.mockStorage[key] || '';
  },
  setStorageSync: function(key, value) {
    if (!global.mockStorage) {
      global.mockStorage = {};
    }
    global.mockStorage[key] = value;
  },
  removeStorageSync: function(key) {
    if (global.mockStorage) {
      delete global.mockStorage[key];
    }
  },
  getSystemInfoSync: function() {
    return {
      brand: 'iPhone',
      model: 'iPhone 13',
      system: 'iOS 15.0',
    };
  },
  showToast: function(options) {
    console.log('[Toast]', options.title);
  },
  showModal: function(options) {
    console.log('[Modal]', options.title, options.content);
  },
};

// 重置模拟存储
function resetMockStorage() {
  global.mockStorage = {};
}

// 运行测试
console.log('========================================');
console.log('在Node.js环境中运行测试（模拟微信小程序环境）');
console.log('========================================\n');

// 重置存储
resetMockStorage();

// 导入测试
const testAnonymousId = require('./testAnonymousId.js');
const testEmotionSimilarity = require('./testEmotionSimilarity.js');
const testValidator = require('./testValidator.js');
const testErrorHandler = require('./testErrorHandler.js');

const results = [];

// 运行匿名ID测试
console.log('【测试套件1】匿名ID生成工具');
try {
  resetMockStorage();
  const result1 = testAnonymousId.runAllTests();
  results.push({ name: '匿名ID生成工具', ...result1 });
} catch (error) {
  console.error('匿名ID测试失败:', error);
  results.push({ name: '匿名ID生成工具', error: error.message });
}

// 运行情绪相似度测试
console.log('\n【测试套件2】情绪相似度计算工具');
try {
  resetMockStorage();
  const result2 = testEmotionSimilarity.runAllTests();
  results.push({ name: '情绪相似度计算工具', ...result2 });
} catch (error) {
  console.error('情绪相似度测试失败:', error);
  results.push({ name: '情绪相似度计算工具', error: error.message });
}

// 运行数据验证测试
console.log('\n【测试套件3】数据验证工具');
try {
  resetMockStorage();
  const result3 = testValidator.runAllTests();
  results.push({ name: '数据验证工具', ...result3 });
} catch (error) {
  console.error('数据验证测试失败:', error);
  results.push({ name: '数据验证工具', error: error.message });
}

// 运行错误处理测试
console.log('\n【测试套件4】错误处理工具');
try {
  resetMockStorage();
  const result4 = testErrorHandler.runAllTests();
  results.push({ name: '错误处理工具', ...result4 });
} catch (error) {
  console.error('错误处理测试失败:', error);
  results.push({ name: '错误处理工具', error: error.message });
}

// 打印总结
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
    if (result.errors && result.errors.length > 0) {
      console.log('  错误详情:');
      result.errors.forEach((err, idx) => {
        console.log(`    ${idx + 1}. ${err}`);
      });
    }
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

// 如果有失败的测试，退出码为1
if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

