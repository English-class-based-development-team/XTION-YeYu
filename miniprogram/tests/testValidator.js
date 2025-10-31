/**
 * 数据验证工具测试
 * 测试各种输入场景：正常、边界、异常
 */

const { test, assertTrue, assertFalse, resetTestResults, printTestReport } = require('../utils/testUtils.js');
const {
  validateEmotion,
  validateContent,
  validatePostData,
  validateCommentData,
} = require('../utils/validator.js');

/**
 * 运行所有测试
 */
function runAllTests() {
  console.log('\n开始测试：数据验证工具\n');
  resetTestResults();

  // 测试1：正常情绪值
  test('测试正常情绪值 - 应该通过验证', () => {
    const result = validateEmotion(5, 5);
    assertTrue(result.valid, '正常情绪值应该通过验证');
    return true;
  });

  // 测试2：边界值 - 最小值
  test('测试边界值 - 最小值0,0', () => {
    const result = validateEmotion(0, 0);
    assertTrue(result.valid, '最小值应该通过验证');
    return true;
  });

  // 测试3：边界值 - 最大值
  test('测试边界值 - 最大值10,10', () => {
    const result = validateEmotion(10, 10);
    assertTrue(result.valid, '最大值应该通过验证');
    return true;
  });

  // 测试4：超出范围 - 负数
  test('测试超出范围 - 负数应该失败', () => {
    const result = validateEmotion(-1, 5);
    assertFalse(result.valid, '负数应该验证失败');
    return true;
  });

  // 测试5：超出范围 - 超过最大值
  test('测试超出范围 - 超过10应该失败', () => {
    const result = validateEmotion(11, 5);
    assertFalse(result.valid, '超过10应该验证失败');
    return true;
  });

  // 测试6：类型错误 - 非数字
  test('测试类型错误 - 非数字应该失败', () => {
    const result = validateEmotion('5', 5);
    assertFalse(result.valid, '非数字应该验证失败');
    return true;
  });

  // 测试7：空值测试
  test('测试空值 - null/undefined应该失败', () => {
    const result1 = validateEmotion(null, 5);
    const result2 = validateEmotion(5, undefined);
    assertFalse(result1.valid, 'null应该验证失败');
    assertFalse(result2.valid, 'undefined应该验证失败');
    return true;
  });

  // 测试8：正常内容
  test('测试正常内容 - 应该通过验证', () => {
    const result = validateContent('这是一段正常的文本内容');
    assertTrue(result.valid, '正常内容应该通过验证');
    return true;
  });

  // 测试9：空内容
  test('测试空内容 - 应该失败', () => {
    const result = validateContent('');
    assertFalse(result.valid, '空内容应该验证失败');
    return true;
  });

  // 测试10：超长内容
  test('测试超长内容 - 超过300字应该失败', () => {
    const longContent = 'a'.repeat(301);
    const result = validateContent(longContent);
    assertFalse(result.valid, '超过300字应该验证失败');
    return true;
  });

  // 测试11：边界内容 - 300字
  test('测试边界内容 - 300字应该通过', () => {
    const boundaryContent = 'a'.repeat(300);
    const result = validateContent(boundaryContent);
    assertTrue(result.valid, '300字应该通过验证');
    return true;
  });

  // 测试12：空白字符
  test('测试空白字符 - 只有空格应该失败', () => {
    const result = validateContent('   ');
    assertFalse(result.valid, '只有空格应该验证失败');
    return true;
  });

  // 测试13：完整帖子数据验证
  test('测试完整帖子数据 - 应该通过验证', () => {
    const postData = {
      valence: 5,
      arousal: 5,
      content: '这是一段正常的帖子内容',
    };
    const result = validatePostData(postData);
    assertTrue(result.valid, '完整帖子数据应该通过验证');
    return true;
  });

  // 测试14：帖子数据 - 缺少字段
  test('测试帖子数据 - 缺少必填字段应该失败', () => {
    const postData1 = { arousal: 5, content: '内容' };
    const postData2 = { valence: 5, content: '内容' };
    const postData3 = { valence: 5, arousal: 5 };
    assertFalse(validatePostData(postData1).valid, '缺少valence应该失败');
    assertFalse(validatePostData(postData2).valid, '缺少arousal应该失败');
    assertFalse(validatePostData(postData3).valid, '缺少content应该失败');
    return true;
  });

  // 测试15：评论数据验证
  test('测试评论数据 - 应该通过验证', () => {
    const commentData = {
      content: '这是一条正常的评论',
      postId: 'post_123',
    };
    const result = validateCommentData(commentData);
    assertTrue(result.valid, '正常评论数据应该通过验证');
    return true;
  });

  // 测试16：评论数据 - 空内容
  test('测试评论数据 - 空内容应该失败', () => {
    const result = validateCommentData({ content: '', postId: 'post_123' });
    assertFalse(result.valid, '空内容应该验证失败');
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

