/**
 * 情绪标签组件测试
 * 测试情绪标签选择组件的功能
 */

const emotionTagMapper = require('../utils/emotionTagMapper.js');

/**
 * 测试情绪标签到情绪值的映射
 */
function testTagToEmotionMapping() {
  console.log('=== 测试情绪标签到情绪值的映射 ===');
  
  const testCases = [
    { tag: '兴奋', expectedValence: 9, expectedArousal: 9 },
    { tag: '开心', expectedValence: 8, expectedArousal: 8 },
    { tag: '平静', expectedValence: 8, expectedArousal: 2 },
    { tag: '焦虑', expectedValence: 2, expectedArousal: 9 },
    { tag: '沮丧', expectedValence: 2, expectedArousal: 2 },
    { tag: '我的心情', expectedValence: 5, expectedArousal: 5 },
    { tag: '中性', expectedValence: 5, expectedArousal: 5 },
  ];
  
  let passCount = 0;
  let failCount = 0;
  
  testCases.forEach(({ tag, expectedValence, expectedArousal }) => {
    const result = emotionTagMapper.mapTagToEmotion(tag);
    const passed = result.valence === expectedValence && result.arousal === expectedArousal;
    
    if (passed) {
      console.log(`✅ "${tag}" → valence: ${result.valence}, arousal: ${result.arousal}`);
      passCount++;
    } else {
      console.error(`❌ "${tag}" → 期望: valence=${expectedValence}, arousal=${expectedArousal}, 实际: valence=${result.valence}, arousal=${result.arousal}`);
      failCount++;
    }
  });
  
  console.log(`\n映射测试结果: ${passCount} 通过, ${failCount} 失败\n`);
  return failCount === 0;
}

/**
 * 测试自定义标签的情绪值推断
 */
function testCustomTagInference() {
  console.log('=== 测试自定义标签的情绪值推断 ===');
  
  const testCases = [
    { tag: '非常开心', description: '正面情绪关键词' },
    { tag: '超级难过', description: '负面情绪关键词' },
    { tag: '紧张不安', description: '高唤醒度关键词' },
    { tag: '放松舒适', description: '低唤醒度关键词' },
    { tag: 'abc123', description: '无意义标签' },
  ];
  
  testCases.forEach(({ tag, description }) => {
    const result = emotionTagMapper.mapTagToEmotion(tag);
    const isValid = emotionTagMapper.validateEmotionValues(result.valence, result.arousal);
    
    if (isValid) {
      console.log(`✅ "${tag}" (${description}) → valence: ${result.valence}, arousal: ${result.arousal}`);
    } else {
      console.error(`❌ "${tag}" (${description}) → 情绪值超出范围: valence=${result.valence}, arousal=${result.arousal}`);
    }
  });
  
  console.log('');
}

/**
 * 测试情绪值范围验证
 */
function testEmotionValueValidation() {
  console.log('=== 测试情绪值范围验证 ===');
  
  const testCases = [
    { valence: 0, arousal: 0, expected: true },
    { valence: 5, arousal: 5, expected: true },
    { valence: 10, arousal: 10, expected: true },
    { valence: -1, arousal: 5, expected: false },
    { valence: 5, arousal: 11, expected: false },
    { valence: 11, arousal: 11, expected: false },
  ];
  
  let passCount = 0;
  let failCount = 0;
  
  testCases.forEach(({ valence, arousal, expected }) => {
    const result = emotionTagMapper.validateEmotionValues(valence, arousal);
    const passed = result === expected;
    
    if (passed) {
      console.log(`✅ valence=${valence}, arousal=${arousal} → ${result}`);
      passCount++;
    } else {
      console.error(`❌ valence=${valence}, arousal=${arousal} → 期望: ${expected}, 实际: ${result}`);
      failCount++;
    }
  });
  
  console.log(`\n验证测试结果: ${passCount} 通过, ${failCount} 失败\n`);
  return failCount === 0;
}

/**
 * 测试边界值
 */
function testEdgeCases() {
  console.log('=== 测试边界值 ===');
  
  const testCases = [
    { tag: '', description: '空字符串' },
    { tag: null, description: 'null值' },
    { tag: undefined, description: 'undefined值' },
    { tag: '   ', description: '空白字符' },
  ];
  
  testCases.forEach(({ tag, description }) => {
    const result = emotionTagMapper.mapTagToEmotion(tag);
    const isValid = emotionTagMapper.validateEmotionValues(result.valence, result.arousal);
    
    if (isValid) {
      console.log(`✅ "${tag}" (${description}) → 返回默认值: valence=${result.valence}, arousal=${result.arousal}`);
    } else {
      console.error(`❌ "${tag}" (${description}) → 情绪值无效: valence=${result.valence}, arousal=${result.arousal}`);
    }
  });
  
  console.log('');
}

/**
 * 运行所有测试
 */
function runAllTests() {
  console.log('========================================');
  console.log('情绪标签组件测试开始');
  console.log('========================================\n');
  
  const results = [
    testTagToEmotionMapping(),
    testEmotionValueValidation(),
  ];
  
  testCustomTagInference();
  testEdgeCases();
  
  const allPassed = results.every(result => result === true);
  
  console.log('========================================');
  if (allPassed) {
    console.log('✅ 所有测试通过！');
  } else {
    console.log('❌ 部分测试失败');
  }
  console.log('========================================');
  
  return allPassed;
}

// 如果在 Node.js 环境中运行
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testTagToEmotionMapping,
    testCustomTagInference,
    testEmotionValueValidation,
    testEdgeCases,
    runAllTests,
  };
}

// 如果在浏览器或小程序环境中运行
if (typeof global !== 'undefined') {
  global.testEmotionTag = {
    testTagToEmotionMapping,
    testCustomTagInference,
    testEmotionValueValidation,
    testEdgeCases,
    runAllTests,
  };
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  runAllTests();
}

