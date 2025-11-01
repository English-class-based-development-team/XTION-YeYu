/**
 * 发布功能测试
 * 测试目标：2.3 发布功能开发
 */

const mockApi = require('../services/mockApi.js');
const validator = require('../utils/validator.js');
const emotionTagMapper = require('../utils/emotionTagMapper.js');

/**
 * 测试工具函数
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(`断言失败: ${message}`);
  }
}

function logTestResult(testName, passed, error = null) {
  if (passed) {
    console.log(`✅ ${testName} - 通过`);
  } else {
    console.error(`❌ ${testName} - 失败: ${error}`);
  }
  return passed;
}

/**
 * 测试 1: 测试发布按钮禁用状态
 */
function testSubmitButtonDisabledState() {
  console.log('\n=== 测试 1: 发布按钮禁用状态 ===');
  let allPassed = true;

  // 测试用例 1.1: 标签为空
  try {
    const tag = '';
    const content = '这是一段测试内容';
    const canSubmit = tag.trim().length > 0 && content.trim().length > 0 && content !== '点击编辑你想分享的内容...';
    assert(!canSubmit, '标签为空时应该禁用按钮');
    logTestResult('1.1 标签为空时按钮禁用', true);
  } catch (error) {
    allPassed = false;
    logTestResult('1.1 标签为空时按钮禁用', false, error.message);
  }

  // 测试用例 1.2: 内容为空
  try {
    const tag = '开心';
    const content = '';
    const canSubmit = tag.trim().length > 0 && content.trim().length > 0 && content !== '点击编辑你想分享的内容...';
    assert(!canSubmit, '内容为空时应该禁用按钮');
    logTestResult('1.2 内容为空时按钮禁用', true);
  } catch (error) {
    allPassed = false;
    logTestResult('1.2 内容为空时按钮禁用', false, error.message);
  }

  // 测试用例 1.3: 内容是占位符
  try {
    const tag = '开心';
    const content = '点击编辑你想分享的内容...';
    const canSubmit = tag.trim().length > 0 && content.trim().length > 0 && content !== '点击编辑你想分享的内容...';
    assert(!canSubmit, '内容是占位符时应该禁用按钮');
    logTestResult('1.3 内容是占位符时按钮禁用', true);
  } catch (error) {
    allPassed = false;
    logTestResult('1.3 内容是占位符时按钮禁用', false, error.message);
  }

  // 测试用例 1.4: 标签和内容都有效
  try {
    const tag = '开心';
    const content = '今天真是开心的一天！';
    const canSubmit = tag.trim().length > 0 && content.trim().length > 0 && content !== '点击编辑你想分享的内容...';
    assert(canSubmit, '标签和内容都有效时应该启用按钮');
    logTestResult('1.4 标签和内容有效时按钮启用', true);
  } catch (error) {
    allPassed = false;
    logTestResult('1.4 标签和内容有效时按钮启用', false, error.message);
  }

  return allPassed;
}

/**
 * 测试 2: 测试数据验证
 */
function testDataValidation() {
  console.log('\n=== 测试 2: 数据验证 ===');
  let allPassed = true;

  // 测试用例 2.1: 内容长度验证
  try {
    const validContent = '这是一段有效的内容';
    const validation = validator.validateContent(validContent);
    assert(validation.valid, '有效内容应该通过验证');
    logTestResult('2.1 有效内容通过验证', true);
  } catch (error) {
    allPassed = false;
    logTestResult('2.1 有效内容通过验证', false, error.message);
  }

  // 测试用例 2.2: 内容为空
  try {
    const emptyContent = '';
    const validation = validator.validateContent(emptyContent);
    assert(!validation.valid, '空内容应该验证失败');
    logTestResult('2.2 空内容验证失败', true);
  } catch (error) {
    allPassed = false;
    logTestResult('2.2 空内容验证失败', false, error.message);
  }

  // 测试用例 2.3: 内容超长（300字）
  try {
    const longContent = 'a'.repeat(301);
    const validation = validator.validateContent(longContent);
    assert(!validation.valid, '超长内容应该验证失败');
    logTestResult('2.3 超长内容验证失败', true);
  } catch (error) {
    allPassed = false;
    logTestResult('2.3 超长内容验证失败', false, error.message);
  }

  // 测试用例 2.4: 标签长度验证
  try {
    const validTag = '开心';
    const validation = validator.validateTag(validTag);
    assert(validation.valid, '有效标签应该通过验证');
    logTestResult('2.4 有效标签通过验证', true);
  } catch (error) {
    allPassed = false;
    logTestResult('2.4 有效标签通过验证', false, error.message);
  }

  // 测试用例 2.5: 标签超长（10字）
  try {
    const longTag = '12345678901'; // 11个字符，超过10个字符限制
    const validation = validator.validateTag(longTag);
    assert(!validation.valid, '超长标签应该验证失败');
    logTestResult('2.5 超长标签验证失败', true);
  } catch (error) {
    allPassed = false;
    logTestResult('2.5 超长标签验证失败', false, error.message);
  }

  return allPassed;
}

/**
 * 测试 3: 测试情绪值映射
 */
function testEmotionMapping() {
  console.log('\n=== 测试 3: 情绪值映射 ===');
  let allPassed = true;

  // 测试用例 3.1: 默认标签映射
  try {
    const { valence, arousal } = emotionTagMapper.mapTagToEmotion('我的心情');
    assert(valence === 5 && arousal === 5, '默认标签应该映射到中性情绪（5, 5）');
    logTestResult('3.1 默认标签映射到中性情绪', true);
  } catch (error) {
    allPassed = false;
    logTestResult('3.1 默认标签映射到中性情绪', false, error.message);
  }

  // 测试用例 3.2: 正面情绪标签
  try {
    const { valence, arousal } = emotionTagMapper.mapTagToEmotion('开心');
    assert(valence >= 7 && arousal >= 7, '开心标签应该映射到高价度高唤醒度');
    logTestResult('3.2 开心标签映射正确', true);
  } catch (error) {
    allPassed = false;
    logTestResult('3.2 开心标签映射正确', false, error.message);
  }

  // 测试用例 3.3: 负面情绪标签
  try {
    const { valence, arousal } = emotionTagMapper.mapTagToEmotion('悲伤');
    assert(valence <= 3 && arousal <= 3, '悲伤标签应该映射到低价度低唤醒度');
    logTestResult('3.3 悲伤标签映射正确', true);
  } catch (error) {
    allPassed = false;
    logTestResult('3.3 悲伤标签映射正确', false, error.message);
  }

  // 测试用例 3.4: 情绪值范围验证
  try {
    const { valence, arousal } = emotionTagMapper.mapTagToEmotion('开心');
    const isValid = emotionTagMapper.validateEmotionValues(valence, arousal);
    assert(isValid, '映射的情绪值应该在有效范围内（0-10）');
    logTestResult('3.4 情绪值范围有效', true);
  } catch (error) {
    allPassed = false;
    logTestResult('3.4 情绪值范围有效', false, error.message);
  }

  return allPassed;
}

/**
 * 测试 4: 测试发布逻辑（Mock API）
 */
async function testPublishLogic() {
  console.log('\n=== 测试 4: 发布逻辑（Mock API） ===');
  let allPassed = true;

  // 测试用例 4.1: 正常发布
  try {
    const postData = {
      tag: '开心',
      valence: 8,
      arousal: 8,
      content: '今天真是开心的一天！',
    };
    const response = await mockApi.publishPost(postData);
    assert(response.success, '发布应该成功');
    assert(response.data && response.data.postId, '返回应该包含 postId');
    logTestResult('4.1 正常发布成功', true);
  } catch (error) {
    allPassed = false;
    logTestResult('4.1 正常发布成功', false, error.message);
  }

  // 测试用例 4.2: 发布响应格式正确
  try {
    const postData = {
      tag: '平静',
      valence: 7,
      arousal: 2,
      content: '感受到内心的平静',
    };
    const response = await mockApi.publishPost(postData);
    assert(typeof response === 'object', '返回应该是对象');
    assert('success' in response, '返回应该包含 success 字段');
    assert('data' in response, '返回应该包含 data 字段');
    assert('message' in response, '返回应该包含 message 字段');
    logTestResult('4.2 发布响应格式正确', true);
  } catch (error) {
    allPassed = false;
    logTestResult('4.2 发布响应格式正确', false, error.message);
  }

  return allPassed;
}

/**
 * 测试 5: 测试边界条件
 */
function testEdgeCases() {
  console.log('\n=== 测试 5: 边界条件 ===');
  let allPassed = true;

  // 测试用例 5.1: 标签长度正好10字符
  try {
    const tag = '1234567890';
    const validation = validator.validateTag(tag);
    assert(validation.valid, '10字符标签应该有效');
    logTestResult('5.1 标签长度正好10字符有效', true);
  } catch (error) {
    allPassed = false;
    logTestResult('5.1 标签长度正好10字符有效', false, error.message);
  }

  // 测试用例 5.2: 内容长度正好300字符
  try {
    const content = 'a'.repeat(300);
    const validation = validator.validateContent(content);
    assert(validation.valid, '300字符内容应该有效');
    logTestResult('5.2 内容长度正好300字符有效', true);
  } catch (error) {
    allPassed = false;
    logTestResult('5.2 内容长度正好300字符有效', false, error.message);
  }

  // 测试用例 5.3: 标签包含空格
  try {
    const tag = ' 开心 ';
    const trimmedTag = tag.trim();
    const validation = validator.validateTag(trimmedTag);
    assert(validation.valid, '标签trim后应该有效');
    logTestResult('5.3 标签包含空格trim后有效', true);
  } catch (error) {
    allPassed = false;
    logTestResult('5.3 标签包含空格trim后有效', false, error.message);
  }

  // 测试用例 5.4: 内容包含换行符
  try {
    const content = '第一行\n第二行\n第三行';
    const validation = validator.validateContent(content);
    assert(validation.valid, '包含换行符的内容应该有效');
    logTestResult('5.4 内容包含换行符有效', true);
  } catch (error) {
    allPassed = false;
    logTestResult('5.4 内容包含换行符有效', false, error.message);
  }

  return allPassed;
}

/**
 * 主测试函数
 */
async function runPublishTests() {
  console.log('\n========================================');
  console.log('开始发布功能测试（2.3）');
  console.log('========================================');

  const results = {
    test1: false,
    test2: false,
    test3: false,
    test4: false,
    test5: false,
  };

  try {
    // 测试 1: 发布按钮禁用状态
    results.test1 = testSubmitButtonDisabledState();

    // 测试 2: 数据验证
    results.test2 = testDataValidation();

    // 测试 3: 情绪值映射
    results.test3 = testEmotionMapping();

    // 测试 4: 发布逻辑（Mock API）
    results.test4 = await testPublishLogic();

    // 测试 5: 边界条件
    results.test5 = testEdgeCases();

    // 汇总测试结果
    console.log('\n========================================');
    console.log('测试结果汇总');
    console.log('========================================');
    console.log(`测试 1 - 发布按钮禁用状态: ${results.test1 ? '✅ 通过' : '❌ 失败'}`);
    console.log(`测试 2 - 数据验证: ${results.test2 ? '✅ 通过' : '❌ 失败'}`);
    console.log(`测试 3 - 情绪值映射: ${results.test3 ? '✅ 通过' : '❌ 失败'}`);
    console.log(`测试 4 - 发布逻辑（Mock API）: ${results.test4 ? '✅ 通过' : '❌ 失败'}`);
    console.log(`测试 5 - 边界条件: ${results.test5 ? '✅ 通过' : '❌ 失败'}`);

    const allPassed = Object.values(results).every(result => result === true);
    console.log('\n========================================');
    if (allPassed) {
      console.log('✅ 所有测试通过！');
    } else {
      console.log('❌ 部分测试失败，请检查上述详细信息');
    }
    console.log('========================================\n');

    return allPassed;
  } catch (error) {
    console.error('测试执行出错：', error);
    return false;
  }
}

// 导出测试函数
module.exports = {
  runPublishTests,
};

