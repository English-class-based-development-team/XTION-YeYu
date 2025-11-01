/**
 * LLM API 集成测试
 * 测试小程序与后端LLM服务的集成
 */

const llmApi = require('../services/llmApi.js');

/**
 * 测试LLM API集成
 */
async function testLLMIntegration() {
  console.log('========================================');
  console.log('LLM API 集成测试开始');
  console.log('========================================');

  let successCount = 0;
  let failCount = 0;

  // 测试用例
  const testCases = [
    {
      name: '健康检查',
      test: async () => {
        const result = await llmApi.healthCheck();
        if (result.success && result.status === 'healthy') {
          console.log('✅ 健康检查通过');
          return true;
        } else {
          console.log('❌ 健康检查失败:', result);
          return false;
        }
      }
    },
    {
      name: '基本对话测试',
      test: async () => {
        const messages = [
          {
            role: 'user',
            content: '你好，我今天心情很好！',
            id: '1'
          }
        ];
        
        const result = await llmApi.sendChatMessage(messages, 'test_user_happy');
        
        if (result.success && result.data.response) {
          console.log('✅ 基本对话测试通过');
          console.log('   AI回复:', result.data.response.substring(0, 50) + '...');
          if (result.data.emotion_detected) {
            console.log('   检测情绪:', result.data.emotion_detected.emotion_tag, 
                       '强度:', result.data.emotion_detected.emotion_intensity);
          }
          return true;
        } else {
          console.log('❌ 基本对话测试失败:', result);
          return false;
        }
      }
    },
    {
      name: '负面情绪对话测试',
      test: async () => {
        const messages = [
          {
            role: 'user',
            content: '我今天很难过，工作上遇到了挫折',
            id: '2'
          }
        ];
        
        const result = await llmApi.sendChatMessage(messages, 'test_user_sad');
        
        if (result.success && result.data.response) {
          console.log('✅ 负面情绪对话测试通过');
          console.log('   AI回复:', result.data.response.substring(0, 50) + '...');
          if (result.data.emotion_detected) {
            console.log('   检测情绪:', result.data.emotion_detected.emotion_tag, 
                       '强度:', result.data.emotion_detected.emotion_intensity);
          }
          return true;
        } else {
          console.log('❌ 负面情绪对话测试失败:', result);
          return false;
        }
      }
    },
    {
      name: '多轮对话测试',
      test: async () => {
        // 模拟多轮对话，但API只使用最后一条用户消息
        const messages = [
          {
            role: 'ai',
            content: '你好！我是你的心理陪伴助手。',
            id: '1'
          },
          {
            role: 'user',
            content: '我想聊聊我的焦虑问题',
            id: '2'
          }
        ];
        
        const result = await llmApi.sendChatMessage(messages, 'test_user_anxiety');
        
        if (result.success && result.data.response) {
          console.log('✅ 多轮对话测试通过');
          console.log('   AI回复:', result.data.response.substring(0, 50) + '...');
          return true;
        } else {
          console.log('❌ 多轮对话测试失败:', result);
          return false;
        }
      }
    },
    {
      name: '模拟回复备用方案测试',
      test: async () => {
        const result = await llmApi.getMockReply('我需要帮助');
        
        if (result.success && result.data.response) {
          console.log('✅ 模拟回复测试通过');
          console.log('   模拟回复:', result.data.response);
          console.log('   是否为模拟:', result.data.is_mock);
          return true;
        } else {
          console.log('❌ 模拟回复测试失败:', result);
          return false;
        }
      }
    }
  ];

  // 执行测试
  for (const testCase of testCases) {
    try {
      console.log(`\n=== 测试: ${testCase.name} ===`);
      const success = await testCase.test();
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (error) {
      console.log(`❌ ${testCase.name} 测试异常:`, error.message);
      failCount++;
    }
  }

  // 测试结果汇总
  console.log('\n========================================');
  console.log('测试结果汇总');
  console.log('========================================');
  console.log(`✅ 成功: ${successCount} 个测试`);
  console.log(`❌ 失败: ${failCount} 个测试`);
  console.log(`📊 成功率: ${((successCount / (successCount + failCount)) * 100).toFixed(1)}%`);
  
  if (failCount === 0) {
    console.log('\n🎉 所有测试通过！LLM API 集成成功！');
  } else {
    console.log('\n⚠️  部分测试失败，请检查配置和网络连接');
  }
  
  console.log('========================================');
}

/**
 * 运行测试（如果直接执行此文件）
 */
if (typeof module !== 'undefined' && require.main === module) {
  testLLMIntegration().catch(error => {
    console.error('测试执行失败:', error);
  });
}

module.exports = {
  testLLMIntegration
};
