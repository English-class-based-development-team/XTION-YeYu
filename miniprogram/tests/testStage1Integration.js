/**
 * 阶段一综合测试
 * 测试环境、架构、代码质量
 */

const { test, assertEqual, assertTrue, assertFalse, resetTestResults, getTestResults } = require('../utils/testUtils.js');
const testAnonymousId = require('./testAnonymousId.js');
const testEmotionSimilarity = require('./testEmotionSimilarity.js');
const testValidator = require('./testValidator.js');
const testErrorHandler = require('./testErrorHandler.js');
const { callMockApi, delay, createResponse } = require('../services/mockApi.js');

/**
 * 环境测试
 */
function testEnvironment() {
  console.log('\n【环境测试】');
  
  // 测试1: 微信API可用性
  test('微信API可用性测试', () => {
    assertTrue(typeof wx !== 'undefined', 'wx对象应该存在');
    assertTrue(typeof getApp !== 'undefined', 'getApp函数应该存在');
    assertTrue(typeof Page !== 'undefined', 'Page函数应该存在');
    assertTrue(typeof App !== 'undefined', 'App函数应该存在');
    return true;
  });

  // 测试2: 页面路由配置
  test('页面路由配置测试', () => {
    try {
      const app = getApp();
      assertTrue(app !== null, 'App实例应该存在');
      
      // 检查全局数据初始化
      assertTrue(app.globalData !== undefined, 'globalData应该存在');
      assertTrue(typeof app.globalData.env === 'string', 'env应该存在');
      assertTrue(typeof app.globalData.isLoggedIn === 'boolean', 'isLoggedIn应该存在');
      assertTrue(app.globalData.cache !== undefined, 'cache应该存在');
      return true;
    } catch (error) {
      throw new Error(`页面路由配置测试失败: ${error.message}`);
    }
  });

  // 测试3: 页面路由跳转（模拟测试）
  test('页面路由跳转测试', () => {
    // 检查app.json中的页面配置
    // 注意：实际路由跳转需要在页面中测试，这里只做基础验证
    const expectedPages = ['pages/feed/index', 'pages/publish/index', 'pages/profile/index'];
    // 由于无法直接读取app.json，这里只验证路由相关函数存在
    assertTrue(typeof wx.navigateTo === 'function', 'wx.navigateTo应该存在');
    assertTrue(typeof wx.switchTab === 'function', 'wx.switchTab应该存在');
    assertTrue(typeof wx.redirectTo === 'function', 'wx.redirectTo应该存在');
    return true;
  });

  // 测试4: tabBar配置
  test('tabBar配置测试', () => {
    // 验证tabBar相关API存在
    assertTrue(typeof wx.switchTab === 'function', 'wx.switchTab应该存在');
    // 验证tabBar页面的基本结构
    // 注意：实际tabBar配置需要在app.json中验证，这里只做API检查
    return true;
  });
}

/**
 * 架构测试
 */
function testArchitecture() {
  console.log('\n【架构测试】');
  
  // 测试1: 全局状态管理 - 用户信息
  test('全局状态管理 - 用户信息', () => {
    try {
      const app = getApp();
      
      // 测试设置用户信息
      const testUserInfo = { anonymousId: 'test_id_123', username: '测试用户' };
      app.setUserInfo(testUserInfo);
      
      // 验证设置成功
      assertEqual(app.getUserInfo().anonymousId, testUserInfo.anonymousId, '匿名ID应该设置成功');
      assertEqual(app.getUserInfo().username, testUserInfo.username, '用户名应该设置成功');
      assertTrue(app.getLoginStatus() === true, '登录状态应该为true');
      
      // 测试获取用户信息
      const userInfo = app.getUserInfo();
      assertTrue(userInfo !== null, '用户信息应该存在');
      assertTrue(userInfo.anonymousId !== undefined, '匿名ID应该存在');
      
      return true;
    } catch (error) {
      throw new Error(`全局状态管理测试失败: ${error.message}`);
    }
  });

  // 测试2: 全局状态管理 - 登录状态
  test('全局状态管理 - 登录状态', () => {
    try {
      const app = getApp();
      
      // 测试设置登录状态
      app.setLoginStatus(true);
      assertTrue(app.getLoginStatus() === true, '登录状态应该为true');
      
      app.setLoginStatus(false);
      assertTrue(app.getLoginStatus() === false, '登录状态应该为false');
      
      return true;
    } catch (error) {
      throw new Error(`登录状态管理测试失败: ${error.message}`);
    }
  });

  // 测试3: 全局状态管理 - 情绪值
  test('全局状态管理 - 情绪值', () => {
    try {
      const app = getApp();
      
      // 测试设置情绪值
      app.setCurrentEmotion(5, 7);
      const emotion = app.getCurrentEmotion();
      assertEqual(emotion.valence, 5, '价度值应该为5');
      assertEqual(emotion.arousal, 7, '唤醒度值应该为7');
      
      // 测试边界值
      app.setCurrentEmotion(0, 0);
      const emotion2 = app.getCurrentEmotion();
      assertEqual(emotion2.valence, 0, '价度值应该为0');
      assertEqual(emotion2.arousal, 0, '唤醒度值应该为0');
      
      app.setCurrentEmotion(10, 10);
      const emotion3 = app.getCurrentEmotion();
      assertEqual(emotion3.valence, 10, '价度值应该为10');
      assertEqual(emotion3.arousal, 10, '唤醒度值应该为10');
      
      return true;
    } catch (error) {
      throw new Error(`情绪值管理测试失败: ${error.message}`);
    }
  });

  // 测试4: 全局状态管理 - 缓存
  test('全局状态管理 - 缓存', () => {
    try {
      const app = getApp();
      
      // 测试设置缓存
      app.setCache('test_key', 'test_value');
      const cachedValue = app.getCache('test_key');
      assertEqual(cachedValue, 'test_value', '缓存值应该正确');
      
      // 测试设置带过期时间的缓存
      app.setCache('test_key_expire', 'test_value_expire', 1000);
      const cachedValue2 = app.getCache('test_key_expire');
      assertEqual(cachedValue2, 'test_value_expire', '缓存值应该正确');
      
      // 测试清除缓存
      app.clearCache('test_key');
      const clearedValue = app.getCache('test_key');
      assertTrue(clearedValue === null, '缓存应该被清除');
      
      return true;
    } catch (error) {
      throw new Error(`缓存管理测试失败: ${error.message}`);
    }
  });

  // 测试5: 工具函数 - 运行所有工具函数测试
  test('工具函数 - 匿名ID生成', () => {
    try {
      const result = testAnonymousId.runAllTests();
      assertTrue(result.passed === result.total, '所有匿名ID测试应该通过');
      return true;
    } catch (error) {
      throw new Error(`匿名ID工具函数测试失败: ${error.message}`);
    }
  });

  test('工具函数 - 情绪相似度计算', () => {
    try {
      const result = testEmotionSimilarity.runAllTests();
      assertTrue(result.passed === result.total, '所有情绪相似度测试应该通过');
      return true;
    } catch (error) {
      throw new Error(`情绪相似度工具函数测试失败: ${error.message}`);
    }
  });

  test('工具函数 - 数据验证', () => {
    try {
      const result = testValidator.runAllTests();
      assertTrue(result.passed === result.total, '所有数据验证测试应该通过');
      return true;
    } catch (error) {
      throw new Error(`数据验证工具函数测试失败: ${error.message}`);
    }
  });

  test('工具函数 - 错误处理', () => {
    try {
      const result = testErrorHandler.runAllTests();
      assertTrue(result.passed === result.total, '所有错误处理测试应该通过');
      return true;
    } catch (error) {
      throw new Error(`错误处理工具函数测试失败: ${error.message}`);
    }
  });

  // 测试6: 服务封装层 - Mock API调用
  test('服务封装层 - Mock API调用', () => {
    return new Promise((resolve, reject) => {
      try {
        const handler = async (params) => {
          return createResponse(true, { test: 'data' }, '测试成功');
        };
        
        callMockApi(handler, {}, true, false).then((result) => {
          assertTrue(result.success === true, 'API调用应该成功');
          assertTrue(result.data !== null, '返回数据应该存在');
          assertEqual(result.data.test, 'data', '返回数据应该正确');
          resolve(true);
        }).catch((error) => {
          reject(new Error(`Mock API调用测试失败: ${error.message}`));
        });
      } catch (error) {
        reject(new Error(`Mock API调用测试失败: ${error.message}`));
      }
    });
  });

  // 测试7: 服务封装层 - 错误处理
  test('服务封装层 - 错误处理', () => {
    return new Promise((resolve, reject) => {
      try {
        const handler = async (params) => {
          throw new Error('模拟错误');
        };
        
        callMockApi(handler, {}, true, false).then((result) => {
          assertTrue(result.success === false, 'API调用应该失败');
          assertTrue(result.message !== '', '错误消息应该存在');
          resolve(true);
        }).catch((error) => {
          reject(new Error(`错误处理测试失败: ${error.message}`));
        });
      } catch (error) {
        reject(new Error(`错误处理测试失败: ${error.message}`));
      }
    });
  });

  // 测试8: 服务封装层 - 延迟功能
  test('服务封装层 - 延迟功能', () => {
    return new Promise((resolve, reject) => {
      try {
        const startTime = Date.now();
        delay(100).then(() => {
          const endTime = Date.now();
          const elapsed = endTime - startTime;
          
          // 延迟应该在合理范围内（90-150ms，考虑执行时间）
          assertTrue(elapsed >= 90 && elapsed <= 150, `延迟应该在合理范围内，实际: ${elapsed}ms`);
          resolve(true);
        }).catch((error) => {
          reject(new Error(`延迟功能测试失败: ${error.message}`));
        });
      } catch (error) {
        reject(new Error(`延迟功能测试失败: ${error.message}`));
      }
    });
  });
}

/**
 * 代码质量测试
 */
function testCodeQuality() {
  console.log('\n【代码质量测试】');
  
  // 测试1: 常量定义完整性
  test('常量定义完整性', () => {
    try {
      const constants = require('../constants/index.js');
      
      assertTrue(constants.EMOTION !== undefined, 'EMOTION常量应该存在');
      assertTrue(constants.TEXT_LIMIT !== undefined, 'TEXT_LIMIT常量应该存在');
      assertTrue(constants.API !== undefined, 'API常量应该存在');
      assertTrue(constants.ERROR_CODE !== undefined, 'ERROR_CODE常量应该存在');
      assertTrue(constants.ERROR_MESSAGE !== undefined, 'ERROR_MESSAGE常量应该存在');
      assertTrue(constants.PAGINATION !== undefined, 'PAGINATION常量应该存在');
      assertTrue(constants.CACHE !== undefined, 'CACHE常量应该存在');
      
      // 验证常量值
      assertEqual(constants.EMOTION.MIN_VALENCE, 0, 'MIN_VALENCE应该为0');
      assertEqual(constants.EMOTION.MAX_VALENCE, 10, 'MAX_VALENCE应该为10');
      assertEqual(constants.TEXT_LIMIT.MAX_CONTENT_LENGTH, 300, 'MAX_CONTENT_LENGTH应该为300');
      
      return true;
    } catch (error) {
      throw new Error(`常量定义测试失败: ${error.message}`);
    }
  });

  // 测试2: 目录结构规范性
  test('目录结构规范性', () => {
    try {
      // 验证关键目录和文件存在
      // 注意：由于无法直接访问文件系统，这里只验证require是否成功
      assertTrue(typeof require('../utils/anonymousId.js') === 'object', 'anonymousId.js应该存在');
      assertTrue(typeof require('../utils/emotionSimilarity.js') === 'object', 'emotionSimilarity.js应该存在');
      assertTrue(typeof require('../utils/validator.js') === 'object', 'validator.js应该存在');
      assertTrue(typeof require('../utils/errorHandler.js') === 'object', 'errorHandler.js应该存在');
      assertTrue(typeof require('../services/mockApi.js') === 'object', 'mockApi.js应该存在');
      
      return true;
    } catch (error) {
      throw new Error(`目录结构测试失败: ${error.message}`);
    }
  });

  // 测试3: 模块导出规范
  test('模块导出规范', () => {
    try {
      // 验证关键模块的导出
      const anonymousId = require('../utils/anonymousId.js');
      assertTrue(typeof anonymousId.getAnonymousId === 'function', 'getAnonymousId应该导出');
      
      const emotionSimilarity = require('../utils/emotionSimilarity.js');
      assertTrue(typeof emotionSimilarity.calculateSimilarity === 'function', 'calculateSimilarity应该导出');
      
      const validator = require('../utils/validator.js');
      assertTrue(typeof validator.validateEmotion === 'function', 'validateEmotion应该导出');
      assertTrue(typeof validator.validateContent === 'function', 'validateContent应该导出');
      
      const errorHandler = require('../utils/errorHandler.js');
      assertTrue(typeof errorHandler.handleError === 'function', 'handleError应该导出');
      assertTrue(typeof errorHandler.formatError === 'function', 'formatError应该导出');
      
      const mockApi = require('../services/mockApi.js');
      assertTrue(typeof mockApi.callMockApi === 'function', 'callMockApi应该导出');
      assertTrue(typeof mockApi.publishPost === 'function', 'publishPost应该导出');
      assertTrue(typeof mockApi.getFeed === 'function', 'getFeed应该导出');
      
      return true;
    } catch (error) {
      throw new Error(`模块导出测试失败: ${error.message}`);
    }
  });
}

/**
 * 运行所有阶段一综合测试
 */
function runAllTests() {
  console.log('\n========================================');
  console.log('阶段一综合测试');
  console.log('========================================\n');
  
  resetTestResults();
  
  // 运行环境测试
  testEnvironment();
  
  // 运行架构测试（包含异步测试）
  testArchitecture();
  
  // 运行代码质量测试
  testCodeQuality();
  
  // 等待异步测试完成（给Promise时间完成）
  return new Promise((resolve) => {
    setTimeout(() => {
      // 获取测试结果
      const results = getTestResults();
      
      // 打印测试报告
      console.log('\n========================================');
      console.log('阶段一综合测试结果');
      console.log('========================================');
      console.log(`总测试数: ${results.total}`);
      console.log(`通过: ${results.passed}`);
      console.log(`失败: ${results.failed}`);
      console.log(`成功率: ${results.successRate}`);
      
      if (results.errors.length > 0) {
        console.log('\n失败的测试:');
        results.errors.forEach((error, index) => {
          console.log(`${index + 1}. ${error}`);
        });
      }
      
      console.log('========================================\n');
      
      resolve(results);
    }, 2000); // 等待2秒让异步测试完成
  });
}

module.exports = {
  runAllTests,
  testEnvironment,
  testArchitecture,
  testCodeQuality,
};

