// pages/test/index.js
/**
 * 测试页面
 * 用于在微信开发者工具中运行所有测试
 */

const runAllTests = require('../../tests/runAllTests.js');

Page({
  data: {
    testResults: null,
    isRunning: false,
  },

  onLoad() {
    console.log('测试页面加载完成');
  },

  /**
   * 运行所有测试
   */
  runAllTests() {
    this.setData({ isRunning: true, testResults: null });
    
    console.log('开始运行所有测试...');
    
    try {
      const results = runAllTests.runAllTestSuites();
      
      // 如果返回Promise，等待完成
      if (results && typeof results.then === 'function') {
        results.then((resolvedResults) => {
          this.setData({
            testResults: resolvedResults,
            isRunning: false,
          });
          
          // 显示测试结果
          wx.showModal({
            title: '测试完成',
            content: `总测试数: ${resolvedResults.totalTests}\n通过: ${resolvedResults.totalPassed}\n失败: ${resolvedResults.totalFailed}\n成功率: ${resolvedResults.successRate}`,
            showCancel: false,
          });
        }).catch((error) => {
          console.error('测试执行失败:', error);
          this.setData({ isRunning: false });
          wx.showToast({
            title: '测试执行失败',
            icon: 'none',
          });
        });
      } else {
        // 同步结果
      this.setData({
        testResults: results,
        isRunning: false,
      });
      
      // 显示测试结果
      wx.showModal({
        title: '测试完成',
        content: `总测试数: ${results.totalTests}\n通过: ${results.totalPassed}\n失败: ${results.totalFailed}\n成功率: ${results.successRate}`,
        showCancel: false,
      });
      }
      
    } catch (error) {
      console.error('测试执行失败:', error);
      this.setData({ isRunning: false });
      wx.showToast({
        title: '测试执行失败',
        icon: 'none',
      });
    }
  },

  /**
   * 查看控制台输出
   */
  viewConsole() {
    wx.showModal({
      title: '查看控制台',
      content: '请在微信开发者工具的控制台面板查看详细的测试输出',
      showCancel: false,
    });
  },
});

