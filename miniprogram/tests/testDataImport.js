/**
 * 测试数据导入
 * 验证来自 Yeyu_ui_design 的数据是否正确导入
 */

const { mockPosts, realUserData, emotionToValenceArousal } = require('../mock/mockData.js');
const { 
  defaultUserProfile, 
  myBottles, 
  myResonances, 
  savedConversations,
  emotionData7Days,
  emotionColors,
  getTimeGreeting,
  getCompanionDays,
  formatRelativeTime
} = require('../mock/userProfileData.js');

// 测试结果统计
let passCount = 0;
let failCount = 0;
const results = [];

// 辅助函数：打印测试结果
function test(description, assertion) {
  try {
    if (assertion) {
      passCount++;
      results.push(`✅ ${description}`);
    } else {
      failCount++;
      results.push(`❌ ${description} - 断言失败`);
    }
  } catch (error) {
    failCount++;
    results.push(`❌ ${description} - 错误: ${error.message}`);
  }
}

console.log('====================================');
console.log('Yeyu_ui_design 数据导入测试');
console.log('====================================\n');

// 测试1: 真实用户数据导入
console.log('1️⃣ 测试真实用户数据导入...');
test('realUserData 应该存在', realUserData !== undefined);
test('realUserData 应该是数组', Array.isArray(realUserData));
test('realUserData 应该有 26 条数据', realUserData.length === 26);
test('realUserData 每条数据应该有 tag 和 content', 
  realUserData.every(item => item.tag && item.content));

// 检查情绪标签的多样性
const uniqueTags = [...new Set(realUserData.map(item => item.tag))];
test('realUserData 应该包含多种情绪标签', uniqueTags.length >= 10);
console.log(`   - 包含情绪标签: ${uniqueTags.join(', ')}`);
console.log('');

// 测试2: mockPosts 数据生成
console.log('2️⃣ 测试 mockPosts 数据生成...');
test('mockPosts 应该存在', mockPosts !== undefined);
test('mockPosts 应该是数组', Array.isArray(mockPosts));
test('mockPosts 应该至少有 120 条数据', mockPosts.length >= 120);

// 检查前 26 条是否为真实数据
const realPostsInMock = mockPosts.filter(post => post.isRealUserData === true);
test('mockPosts 应该包含 26 条真实数据', realPostsInMock.length === 26);

// 检查数据结构
const firstPost = mockPosts[0];
test('每条帖子应该有必要的字段', 
  firstPost.postId && 
  firstPost.content && 
  firstPost.emotion &&
  typeof firstPost.valence === 'number' &&
  typeof firstPost.arousal === 'number'
);
console.log(`   - mockPosts 总数: ${mockPosts.length}`);
console.log(`   - 真实数据数量: ${realPostsInMock.length}`);
console.log('');

// 测试3: 情绪映射
console.log('3️⃣ 测试情绪映射...');
test('emotionToValenceArousal 应该存在', emotionToValenceArousal !== undefined);
test('应该包含所有 12 种情绪的映射', Object.keys(emotionToValenceArousal).length === 12);

// 检查每个映射是否有效
const emotionMappingValid = Object.values(emotionToValenceArousal).every(
  mapping => 
    typeof mapping.valence === 'number' && 
    typeof mapping.arousal === 'number' &&
    mapping.valence >= 0 && mapping.valence <= 10 &&
    mapping.arousal >= 0 && mapping.arousal <= 10
);
test('所有情绪映射的价度和唤醒度应该在 0-10 范围内', emotionMappingValid);
console.log(`   - 情绪映射数量: ${Object.keys(emotionToValenceArousal).length}`);
console.log('');

// 测试4: 用户个人资料数据
console.log('4️⃣ 测试用户个人资料数据...');
test('defaultUserProfile 应该存在', defaultUserProfile !== undefined);
test('defaultUserProfile 应该有必要的字段', 
  defaultUserProfile.avatar && 
  defaultUserProfile.nickname && 
  defaultUserProfile.greeting &&
  defaultUserProfile.joinDate
);

test('myBottles 应该有 3 条数据', Array.isArray(myBottles) && myBottles.length === 3);
test('myResonances 应该有 2 条数据', Array.isArray(myResonances) && myResonances.length === 2);
test('savedConversations 应该有 2 条数据', Array.isArray(savedConversations) && savedConversations.length === 2);
test('emotionData7Days 应该有 7 天的数据', Array.isArray(emotionData7Days) && emotionData7Days.length === 7);

console.log(`   - 用户昵称: ${defaultUserProfile.nickname}`);
console.log(`   - 漂流瓶数量: ${myBottles.length}`);
console.log(`   - 共鸣记录数量: ${myResonances.length}`);
console.log(`   - 保存的对话数量: ${savedConversations.length}`);
console.log('');

// 测试5: 辅助函数
console.log('5️⃣ 测试辅助函数...');
const greeting = getTimeGreeting();
test('getTimeGreeting 应该返回问候语', typeof greeting === 'string' && greeting.length > 0);
console.log(`   - 当前问候语: ${greeting}`);

const days = getCompanionDays(defaultUserProfile.joinDate);
test('getCompanionDays 应该返回正数', typeof days === 'number' && days > 0);
console.log(`   - 陪伴天数: ${days}`);

const relativeTime = formatRelativeTime(Date.now() - 2 * 60 * 60 * 1000);
test('formatRelativeTime 应该返回相对时间', typeof relativeTime === 'string');
console.log(`   - 2小时前的格式化: ${relativeTime}`);
console.log('');

// 测试6: 情绪颜色配置
console.log('6️⃣ 测试情绪颜色配置...');
test('emotionColors 应该存在', emotionColors !== undefined);
test('emotionColors 应该包含 4 种情绪颜色', Object.keys(emotionColors).length === 4);

// 检查颜色是否为有效的十六进制颜色
const colorValid = Object.values(emotionColors).every(
  color => /^#[0-9A-Fa-f]{6}$/.test(color)
);
test('所有颜色应该是有效的十六进制格式', colorValid);
console.log(`   - 情绪颜色: ${Object.keys(emotionColors).join(', ')}`);
console.log('');

// 测试7: 数据内容质量
console.log('7️⃣ 测试数据内容质量...');

// 检查真实数据的内容长度
const contentLengths = realUserData.map(item => item.content.length);
const avgLength = contentLengths.reduce((a, b) => a + b, 0) / contentLengths.length;
test('真实数据内容平均长度应该合理（10-200字符）', avgLength >= 10 && avgLength <= 200);
console.log(`   - 内容平均长度: ${Math.round(avgLength)} 字符`);

// 检查是否有重复内容
const uniqueContents = [...new Set(realUserData.map(item => item.content))];
test('真实数据应该没有完全重复的内容', uniqueContents.length === realUserData.length);

// 检查时间戳是否合理
const timestampsValid = mockPosts.every(
  post => post.timestamp > Date.now() - 365 * 24 * 60 * 60 * 1000 && 
          post.timestamp <= Date.now()
);
test('所有帖子的时间戳应该在过去一年内', timestampsValid);
console.log('');

// 测试8: 情绪数据一致性
console.log('8️⃣ 测试情绪数据一致性...');

// 检查真实数据中的情绪标签是否都有映射
const unmappedEmotions = realUserData.filter(
  item => !emotionToValenceArousal[item.tag]
);
test('所有真实数据的情绪标签都应该有映射', unmappedEmotions.length === 0);

// 检查 7 天情绪数据的结构
const emotionDataValid = emotionData7Days.every(
  day => day.date && 
         typeof day.平静 === 'number' && 
         typeof day.快乐 === 'number' && 
         typeof day.焦虑 === 'number' && 
         typeof day.感恩 === 'number'
);
test('7天情绪数据结构应该正确', emotionDataValid);
console.log('');

// 输出测试结果
console.log('====================================');
console.log('测试结果汇总');
console.log('====================================\n');

results.forEach(result => console.log(result));

console.log('');
console.log(`总计: ${passCount + failCount} 个测试`);
console.log(`✅ 通过: ${passCount}`);
console.log(`❌ 失败: ${failCount}`);
console.log(`成功率: ${((passCount / (passCount + failCount)) * 100).toFixed(2)}%`);

if (failCount === 0) {
  console.log('\n🎉 所有测试通过！数据导入成功！');
} else {
  console.log('\n⚠️ 有测试失败，请检查数据导入。');
}

console.log('====================================\n');

// 导出测试结果供其他模块使用
module.exports = {
  passCount,
  failCount,
  success: failCount === 0,
  results
};

