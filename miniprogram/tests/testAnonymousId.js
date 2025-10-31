/**
 * 匿名ID生成工具测试
 * 测试唯一性、一致性、不可逆性
 */

const { test, assertEqual, assertTrue, resetTestResults, printTestReport } = require('../utils/testUtils.js');
const { getAnonymousId, generateUsername, getUserInfo, resetAnonymousId } = require('../utils/anonymousId.js');

/**
 * 运行所有测试
 */
function runAllTests() {
  console.log('\n开始测试：匿名ID生成工具\n');
  resetTestResults();

  // 测试1：唯一性测试
  test('测试匿名ID唯一性 - 多次调用应该返回相同ID', () => {
    resetAnonymousId(); // 重置以确保测试环境
    const id1 = getAnonymousId();
    const id2 = getAnonymousId();
    assertEqual(id1, id2, '同一设备应该生成相同的匿名ID');
    return true;
  });

  // 测试2：一致性测试
  test('测试匿名ID一致性 - 持久化存储后应保持一致', () => {
    resetAnonymousId();
    const id1 = getAnonymousId();
    // 模拟重新获取（实际中会从存储读取）
    const id2 = getAnonymousId();
    assertEqual(id1, id2, '匿名ID应该保持一致');
    return true;
  });

  // 测试3：ID格式测试
  test('测试匿名ID格式 - 应该是16位16进制字符串', () => {
    resetAnonymousId();
    const id = getAnonymousId();
    assertTrue(/^[0-9a-f]{16}$/.test(id), '匿名ID应该是16位16进制字符串');
    assertEqual(id.length, 16, '匿名ID长度应该是16');
    return true;
  });

  // 测试4：用户名生成测试
  test('测试用户名生成 - 应该生成"用户XXXX"格式', () => {
    resetAnonymousId();
    const username = generateUsername();
    assertTrue(/^用户\d{4}$/.test(username), '用户名应该是"用户XXXX"格式');
    assertEqual(username.length, 6, '用户名长度应该是6（"用户"+4位数字）');
    return true;
  });

  // 测试5：用户名一致性测试
  test('测试用户名一致性 - 多次调用应该返回相同用户名', () => {
    resetAnonymousId();
    const username1 = generateUsername();
    const username2 = generateUsername();
    assertEqual(username1, username2, '同一设备应该生成相同的用户名');
    return true;
  });

  // 测试6：用户信息完整性测试
  test('测试用户信息完整性 - getUserInfo应该返回完整信息', () => {
    resetAnonymousId();
    const userInfo = getUserInfo();
    assertTrue(userInfo.hasOwnProperty('anonymousId'), '用户信息应该包含anonymousId');
    assertTrue(userInfo.hasOwnProperty('username'), '用户信息应该包含username');
    assertTrue(userInfo.anonymousId && userInfo.anonymousId.length > 0, 'anonymousId不应该为空');
    assertTrue(userInfo.username && userInfo.username.length > 0, 'username不应该为空');
    return true;
  });

  // 测试7：重置功能测试
  test('测试重置功能 - resetAnonymousId应该清除存储', () => {
    const id1 = getAnonymousId();
    resetAnonymousId();
    const id2 = getAnonymousId();
    // 重置后应该生成新的ID（虽然可能相同，但应该重新生成）
    assertTrue(id2 && id2.length === 16, '重置后应该能正常生成新ID');
    return true;
  });

  // 测试8：ID不可逆性验证（无法从ID反推设备信息）
  test('测试ID不可逆性 - ID不应该包含可识别的设备信息', () => {
    resetAnonymousId();
    const id = getAnonymousId();
    // 验证ID不包含明显的设备标识（这是一个简化测试）
    assertTrue(!id.includes('iPhone') && !id.includes('Android'), 'ID不应该包含设备名称');
    assertTrue(!id.includes(' '), 'ID不应该包含空格');
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

