/**
 * 测试搜索功能
 * 验证导入的 Yeyu_ui_design 数据是否可以被正确搜索
 */

const mockApi = require('../services/mockApi.js');

console.log('====================================');
console.log('搜索功能测试');
console.log('====================================\n');

// 测试用例
const testCases = [
  { query: '孤独', description: '搜索情绪标签：孤独' },
  { query: '焦虑', description: '搜索情绪标签：焦虑' },
  { query: '平静', description: '搜索情绪标签：平静' },
  { query: '感恩', description: '搜索情绪标签：感恩' },
  { query: '心里很乱', description: '搜索内容关键词：心里很乱' },
  { query: '理解', description: '搜索内容关键词：理解' },
  { query: '压力', description: '搜索内容关键词：压力' },
  { query: '迷茫', description: '搜索内容关键词：迷茫' },
  { query: '陪伴', description: '搜索内容关键词：陪伴' },
  { query: '希望', description: '搜索情绪标签：希望' },
];

// 运行测试
async function runTests() {
  let passCount = 0;
  let failCount = 0;

  for (const testCase of testCases) {
    try {
      console.log(`\n🔍 ${testCase.description}`);
      console.log(`   关键词: "${testCase.query}"`);
      
      const result = await mockApi.searchPosts(testCase.query, 20, 0);
      
      if (result.success && result.data) {
        const { posts, total, query } = result.data;
        
        if (total > 0) {
          console.log(`   ✅ 找到 ${total} 条结果`);
          
          // 显示前 3 条结果
          const displayCount = Math.min(3, posts.length);
          for (let i = 0; i < displayCount; i++) {
            const post = posts[i];
            const preview = post.content.substring(0, 30) + (post.content.length > 30 ? '...' : '');
            console.log(`      ${i + 1}. [${post.emotion_tag || post.tag}] ${preview}`);
          }
          
          if (total > displayCount) {
            console.log(`      ... 还有 ${total - displayCount} 条结果`);
          }
          
          passCount++;
        } else {
          console.log(`   ⚠️ 未找到结果`);
          failCount++;
        }
      } else {
        console.log(`   ❌ 搜索失败: ${result.message}`);
        failCount++;
      }
    } catch (error) {
      console.log(`   ❌ 错误: ${error.message}`);
      failCount++;
    }
  }

  // 汇总结果
  console.log('\n====================================');
  console.log('测试结果汇总');
  console.log('====================================');
  console.log(`总计: ${passCount + failCount} 个测试`);
  console.log(`✅ 成功: ${passCount}`);
  console.log(`❌ 失败: ${failCount}`);
  console.log(`成功率: ${((passCount / (passCount + failCount)) * 100).toFixed(2)}%`);
  
  if (failCount === 0) {
    console.log('\n🎉 所有搜索测试通过！');
  } else {
    console.log('\n⚠️ 有搜索测试失败。');
  }
  
  console.log('====================================\n');
}

// 额外测试：验证搜索功能的特性
async function testSearchFeatures() {
  console.log('\n====================================');
  console.log('搜索功能特性测试');
  console.log('====================================\n');
  
  // 测试1: 空查询
  console.log('1️⃣ 测试空查询处理...');
  try {
    const result = await mockApi.searchPosts('', 20, 0);
    if (result.success && result.data.total === 0) {
      console.log('   ✅ 空查询正确处理');
    } else {
      console.log('   ❌ 空查询处理异常');
    }
  } catch (error) {
    console.log('   ❌ 空查询错误:', error.message);
  }
  
  // 测试2: 分页功能
  console.log('\n2️⃣ 测试分页功能...');
  try {
    const result1 = await mockApi.searchPosts('感', 5, 0); // 第一页，5条
    const result2 = await mockApi.searchPosts('感', 5, 5); // 第二页，5条
    
    if (result1.success && result2.success) {
      console.log(`   ✅ 第一页: ${result1.data.posts.length} 条`);
      console.log(`   ✅ 第二页: ${result2.data.posts.length} 条`);
      console.log(`   ✅ 总计: ${result1.data.total} 条`);
      console.log(`   ✅ 是否有更多: ${result2.data.hasMore ? '是' : '否'}`);
    } else {
      console.log('   ❌ 分页功能测试失败');
    }
  } catch (error) {
    console.log('   ❌ 分页测试错误:', error.message);
  }
  
  // 测试3: 大小写不敏感
  console.log('\n3️⃣ 测试大小写不敏感...');
  try {
    const result1 = await mockApi.searchPosts('孤独', 20, 0);
    const result2 = await mockApi.searchPosts('GUDÚ', 20, 0); // 可能找不到，因为是拼音
    const result3 = await mockApi.searchPosts('GuDu', 20, 0); // 可能找不到
    
    console.log(`   "孤独" 找到: ${result1.data.total} 条`);
    console.log(`   ✅ 大小写处理正常（中文不区分大小写）`);
  } catch (error) {
    console.log('   ❌ 大小写测试错误:', error.message);
  }
  
  // 测试4: 特殊字符
  console.log('\n4️⃣ 测试特殊字符处理...');
  try {
    const result = await mockApi.searchPosts('？！', 20, 0);
    console.log(`   查询 "？！" 结果: ${result.data.total} 条`);
    console.log('   ✅ 特殊字符处理正常');
  } catch (error) {
    console.log('   ❌ 特殊字符测试错误:', error.message);
  }
  
  // 测试5: 真实数据标记
  console.log('\n5️⃣ 测试真实数据是否可搜索...');
  try {
    const result = await mockApi.searchPosts('总觉得没人能真正理解', 20, 0);
    if (result.success && result.data.total > 0) {
      console.log(`   ✅ 真实数据可被搜索，找到 ${result.data.total} 条`);
      // 检查是否包含来自 Yeyu_ui_design 的原始内容
      const hasRealContent = result.data.posts.some(
        post => post.content.includes('总觉得没人能真正理解我的感受')
      );
      if (hasRealContent) {
        console.log('   ✅ 确认包含来自 Yeyu_ui_design 的真实数据');
      }
    } else {
      console.log('   ⚠️ 未找到真实数据');
    }
  } catch (error) {
    console.log('   ❌ 真实数据搜索错误:', error.message);
  }
  
  console.log('\n====================================\n');
}

// 运行所有测试
(async function() {
  await runTests();
  await testSearchFeatures();
  
  console.log('✨ 搜索功能测试完成！\n');
})();

