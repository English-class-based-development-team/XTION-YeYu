/**
 * 情绪相似度计算工具测试
 * 测试计算准确性、边界值、正常值、性能
 */

const { test, assertEqual, assertTrue, assertInRange, resetTestResults, printTestReport } = require('../utils/testUtils.js');
const {
  calculateSimilarity,
  calculateSimilarityByEuclidean,
  calculateSimilarityByCosine,
  calculateSimilarityForPosts,
} = require('../utils/emotionSimilarity.js');

/**
 * 运行所有测试
 */
function runAllTests() {
  console.log('\n开始测试：情绪相似度计算工具\n');
  resetTestResults();

  // 测试1：完全相同的情况
  test('测试完全相同情绪值 - 相似度应该为1', () => {
    const similarity = calculateSimilarityByEuclidean(5, 5, 5, 5);
    assertEqual(similarity, 1, '完全相同的情绪值相似度应该为1');
    return true;
  });

  // 测试2：完全相反的情况
  test('测试完全相反情绪值 - 相似度应该接近0', () => {
    const similarity = calculateSimilarityByEuclidean(0, 0, 10, 10);
    assertInRange(similarity, 0, 0.1, '完全相反的情绪值相似度应该接近0');
    return true;
  });

  // 测试3：边界值测试 - 最小值
  test('测试边界值 - 最小值0,0', () => {
    const similarity = calculateSimilarityByEuclidean(0, 0, 1, 1);
    assertInRange(similarity, 0, 1, '边界值相似度应该在0-1范围内');
    return true;
  });

  // 测试4：边界值测试 - 最大值
  test('测试边界值 - 最大值10,10', () => {
    const similarity = calculateSimilarityByEuclidean(10, 10, 9, 9);
    assertInRange(similarity, 0, 1, '边界值相似度应该在0-1范围内');
    return true;
  });

  // 测试5：正常值测试 - 中等相似
  test('测试正常值 - 中等相似度', () => {
    const similarity = calculateSimilarityByEuclidean(5, 5, 7, 7);
    assertInRange(similarity, 0, 1, '中等相似度应该在0-1范围内');
    assertTrue(similarity > 0.5 && similarity < 1, '中等距离的相似度应该在0.5-1之间');
    return true;
  });

  // 测试6：超出范围测试
  test('测试超出范围 - 应该返回0', () => {
    const similarity = calculateSimilarityByEuclidean(-1, 15, 5, 5);
    assertEqual(similarity, 0, '超出范围的输入应该返回0');
    return true;
  });

  // 测试7：余弦相似度测试
  test('测试余弦相似度计算', () => {
    const similarity = calculateSimilarityByCosine(5, 5, 5, 5);
    assertEqual(similarity, 1, '完全相同的向量余弦相似度应该为1');
    return true;
  });

  // 测试8：两种算法结果对比
  test('测试两种算法 - 应该都能正常工作', () => {
    const euclidean = calculateSimilarityByEuclidean(5, 5, 7, 7);
    const cosine = calculateSimilarityByCosine(5, 5, 7, 7);
    assertInRange(euclidean, 0, 1, '欧氏距离相似度应该在0-1范围内');
    assertInRange(cosine, 0, 1, '余弦相似度应该在0-1范围内');
    return true;
  });

  // 测试9：批量计算测试
  test('测试批量计算 - 应该正确排序', () => {
    const posts = [
      { emotionValue: 5, arousalValue: 5, postId: '1' },
      { emotionValue: 8, arousalValue: 8, postId: '2' },
      { emotionValue: 2, arousalValue: 2, postId: '3' },
      { emotionValue: 5, arousalValue: 5, postId: '4' },
    ];
    const result = calculateSimilarityForPosts(5, 5, posts);
    assertTrue(result.length === 4, '结果应该包含所有帖子');
    // 完全相同的帖子(5,5)应该排在前面，相似度为1
    const exactMatchPosts = result.filter(p => p.postId === '1' || p.postId === '4');
    assertTrue(exactMatchPosts.length === 2, '应该包含两个完全相同的帖子');
    assertTrue(exactMatchPosts[0].similarity === 1 && exactMatchPosts[1].similarity === 1, '完全相同的帖子相似度应该为1');
    // 验证排序：相似度应该按降序排列
    for (let i = 0; i < result.length - 1; i++) {
      assertTrue(result[i].similarity >= result[i + 1].similarity, `应该按相似度降序排序，但第${i}个(${result[i].similarity}) < 第${i+1}个(${result[i+1].similarity})`);
    }
    return true;
  });

  // 测试10：性能测试 - 100条数据应该 < 2秒
  test('测试性能 - 100条数据计算应该 < 2秒', () => {
    const posts = [];
    for (let i = 0; i < 100; i++) {
      posts.push({
        emotionValue: Math.floor(Math.random() * 11),
        arousalValue: Math.floor(Math.random() * 11),
        postId: `post_${i}`,
      });
    }
    const startTime = Date.now();
    const result = calculateSimilarityForPosts(5, 5, posts);
    const endTime = Date.now();
    const duration = endTime - startTime;
    assertTrue(duration < 2000, `计算100条数据耗时 ${duration}ms，应该 < 2000ms`);
    assertTrue(result.length === 100, '应该处理所有100条数据');
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

