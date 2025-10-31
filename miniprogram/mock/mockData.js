/**
 * 模拟数据文件
 * 生成至少100条测试帖子数据，包含0-3条评论数据，覆盖不同情绪类型
 */

// 情绪标签映射（根据价度和唤醒度确定）
function getEmotionLabel(valence, arousal) {
  // 高价度 + 高唤醒度 = 兴奋/开心
  if (valence >= 7 && arousal >= 7) return '兴奋';
  // 高价度 + 低唤醒度 = 平静/满足
  if (valence >= 7 && arousal <= 3) return '平静';
  // 高价度 + 中唤醒度 = 开心/愉悦
  if (valence >= 7) return '愉悦';
  // 低价度 + 高唤醒度 = 焦虑/愤怒
  if (valence <= 3 && arousal >= 7) return '焦虑';
  // 低价度 + 低唤醒度 = 沮丧/悲伤
  if (valence <= 3 && arousal <= 3) return '沮丧';
  // 低价度 + 中唤醒度 = 悲伤/难过
  if (valence <= 3) return '难过';
  // 中价度 + 高唤醒度 = 紧张/不安
  if (arousal >= 7) return '紧张';
  // 中价度 + 低唤醒度 = 无聊/平淡
  if (arousal <= 3) return '平淡';
  // 默认：中性
  return '中性';
}

// 生成匿名用户ID和用户名
function generateMockUserId(index) {
  const idNumber = (1000 + index).toString().padStart(16, '0');
  return `user_${idNumber}`;
}

function generateMockUsername(index) {
  const userNumber = (1000 + index).toString().padStart(4, '0');
  return `用户${userNumber}`;
}

// 帖子内容模板（根据不同情绪类型）
const contentTemplates = {
  兴奋: [
    '今天天气真好，心情特别棒！',
    '终于完成了这个项目，太开心了！',
    '收到好消息，整个人都兴奋起来了！',
    '和朋友一起玩得很开心，今天过得很充实！',
    '学到了新东西，感觉很充实！',
  ],
  平静: [
    '今天的阳光很温暖，心情很平静。',
    '坐在窗边，看着外面的风景，感觉很放松。',
    '今天没有太多事情，享受一下慢节奏的生活。',
    '泡了一杯茶，静静地享受这个时刻。',
    '今天心情很平和，没有什么烦恼。',
  ],
  愉悦: [
    '今天心情不错，一切都很好。',
    '和家人一起吃饭，感觉很幸福。',
    '工作进展顺利，心情很好。',
    '看到了美丽的风景，心情愉悦。',
    '今天遇到了好人好事，心情不错。',
  ],
  焦虑: [
    '最近压力有点大，总是感觉焦虑不安。',
    '明天有重要的事情，现在就开始紧张了。',
    '很多事情要处理，感觉有点焦虑。',
    '不知道该怎么办，心里很不安。',
    '担心事情做不好，一直很紧张。',
  ],
  沮丧: [
    '今天心情很低落，什么都不想做。',
    '感觉生活没有意思，很沮丧。',
    '最近很多事情都不顺利，心情很差。',
    '感觉自己很失败，很沮丧。',
    '没有动力，感觉很疲惫。',
  ],
  难过: [
    '今天心情不好，有点难过。',
    '有些事情让人不开心。',
    '感觉有点委屈，心情不太好。',
    '失去了什么重要的东西，很难过。',
    '有些事情无法改变，只能接受。',
  ],
  紧张: [
    '明天有考试，现在就开始紧张了。',
    '要做一个重要的决定，心里很紧张。',
    '面对新的挑战，有点紧张不安。',
    '不知道会发生什么，心里很紧张。',
    '需要面对一些困难，感觉压力很大。',
  ],
  平淡: [
    '今天过得比较平淡，没什么特别的事情。',
    '日复一日的生活，感觉有点无聊。',
    '没什么特别的心情，就是普通的一天。',
    '生活节奏很规律，但有点单调。',
    '今天没有太多感受，就是普通的一天。',
  ],
  中性: [
    '今天心情一般，不好不坏。',
    '生活还是老样子，没什么变化。',
    '没有特别的感觉，就是普通的一天。',
    '心情很平静，没什么波动。',
    '今天过得还可以，没什么特别的事情。',
  ],
};

// 评论内容模板
const commentTemplates = [
  '我也有同样的感受',
  '理解你的心情',
  '加油，一切都会好起来的',
  '我也经历过类似的事情',
  '支持你',
  '一起加油吧',
  '你并不孤单',
  '相信明天会更好',
  '我懂你的感受',
  '坚持就是胜利',
];

// 生成随机评论
function generateComments(postId, numComments) {
  const comments = [];
  for (let i = 0; i < numComments; i++) {
    const commentUserId = generateMockUserId(Math.floor(Math.random() * 100) + 200);
    const commentUsername = generateMockUsername(Math.floor(Math.random() * 100) + 200);
    const commentContent = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
    
    comments.push({
      commentId: `comment_${postId}_${i + 1}`,
      userId: commentUserId,
      username: commentUsername,
      content: commentContent,
      timestamp: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000), // 最近7天内
    });
  }
  return comments;
}

// 生成单条帖子数据
function generatePost(index) {
  // 生成情绪值（覆盖0-10范围）
  const valence = Math.floor(Math.random() * 11); // 0-10
  const arousal = Math.floor(Math.random() * 11); // 0-10
  
  // 根据情绪值确定情绪标签
  const emotion = getEmotionLabel(valence, arousal);
  
  // 从对应模板中选择内容
  const templates = contentTemplates[emotion] || contentTemplates['中性'];
  const content = templates[Math.floor(Math.random() * templates.length)];
  
  // 生成用户信息
  const userId = generateMockUserId(index);
  const username = generateMockUsername(index);
  
  // 生成时间戳（最近30天内）
  const daysAgo = Math.floor(Math.random() * 30);
  const timestamp = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
  
  // 生成共鸣数和评论数
  const likeCount = Math.floor(Math.random() * 50); // 0-49
  const commentCount = Math.floor(Math.random() * 4); // 0-3
  
  // 生成评论
  const comments = generateComments(`post_${index}`, commentCount);
  
  return {
    postId: `post_${index}`,
    userId: userId,
    username: username,
    content: content,
    emotion: emotion,
    emotionValue: valence,
    arousalValue: arousal,
    valence: valence, // 兼容字段
    arousal: arousal, // 兼容字段
    timestamp: timestamp,
    likeCount: likeCount,
    commentCount: commentCount,
    comments: comments,
  };
}

// 生成模拟数据列表（至少100条）
function generateMockData(count = 120) {
  const posts = [];
  
  // 确保覆盖不同的情绪类型和范围
  // 前30条：覆盖极端值
  for (let i = 0; i < 30; i++) {
    let valence, arousal;
    if (i < 10) {
      // 高价度 + 不同唤醒度
      valence = 8 + Math.floor(Math.random() * 3); // 8-10
      arousal = Math.floor(Math.random() * 11); // 0-10
    } else if (i < 20) {
      // 低价度 + 不同唤醒度
      valence = Math.floor(Math.random() * 3); // 0-2
      arousal = Math.floor(Math.random() * 11); // 0-10
    } else {
      // 中价度 + 极端唤醒度
      valence = 4 + Math.floor(Math.random() * 3); // 4-6
      arousal = i % 2 === 0 ? Math.floor(Math.random() * 3) : 8 + Math.floor(Math.random() * 3); // 0-2 or 8-10
    }
    
    const emotion = getEmotionLabel(valence, arousal);
    const templates = contentTemplates[emotion] || contentTemplates['中性'];
    const content = templates[Math.floor(Math.random() * templates.length)];
    
    const userId = generateMockUserId(i);
    const username = generateMockUsername(i);
    const daysAgo = Math.floor(Math.random() * 30);
    const timestamp = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
    const likeCount = Math.floor(Math.random() * 50);
    const commentCount = Math.floor(Math.random() * 4);
    const comments = generateComments(`post_${i}`, commentCount);
    
    posts.push({
      postId: `post_${i}`,
      userId: userId,
      username: username,
      content: content,
      emotion: emotion,
      emotionValue: valence,
      arousalValue: arousal,
      valence: valence,
      arousal: arousal,
      timestamp: timestamp,
      likeCount: likeCount,
      commentCount: commentCount,
      comments: comments,
    });
  }
  
  // 剩余随机生成
  for (let i = 30; i < count; i++) {
    posts.push(generatePost(i));
  }
  
  // 按时间戳降序排序（最新的在前）
  posts.sort((a, b) => b.timestamp - a.timestamp);
  
  return posts;
}

// 生成模拟数据
const mockPosts = generateMockData(120);

module.exports = {
  mockPosts: mockPosts,
  generateMockData: generateMockData,
};

