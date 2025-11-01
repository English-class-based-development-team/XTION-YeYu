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

// 从 Yeyu_ui_design 导入的真实用户数据
const realUserData = [
  { tag: '平静', content: '今天感觉心里很乱，希望能找到一个安静的角落，让自己的思绪沉淀下来。' },
  { tag: '悲伤', content: '有些话憋在心里太久了，真想找个人好好聊聊，把这些情绪都说出来。' },
  { tag: '孤独', content: '总觉得没人能真正理解我的感受，这种孤独感让我很难受。' },
  { tag: '焦虑', content: '最近压力好大，需要一些鼓励和支持，让我知道我不是一个人在战斗。' },
  { tag: '疲惫', content: '不知道为什么，就是感觉很累，什么都不想做，只想静静待着。' },
  { tag: '焦虑', content: '对未来感到很迷茫，不知道自己在做什么，该往哪里去。' },
  { tag: '孤独', content: '有时候真的很需要有人在身边，哪怕什么都不说，只是陪着也好。' },
  { tag: '困惑', content: '感觉自己像迷失在森林里，找不到出路，希望有人能给我一些指引。' },
  { tag: '困惑', content: '心里有很多矛盾的感受，不知道该如何处理这些复杂的情绪。' },
  { tag: '希望', content: '虽然现在很难，但我相信这些经历会让我变得更强大。' },
  { tag: '悲伤', content: '总是在怀疑自己，觉得自己不够好，不够优秀。' },
  { tag: '悲伤', content: '今天真的很难过，需要一些温暖的话语来治愈我的心。' },
  { tag: '孤独', content: '周围有很多人，但还是感觉很孤单，好像没人真正懂我。' },
  { tag: '希望', content: '不想再这样下去了，想要做出一些改变，让生活变得更好。' },
  { tag: '快乐', content: '今天终于把压抑已久的情绪都释放出来了，感觉轻松了很多。' },
  { tag: '希望', content: '虽然很累，但我还是要继续前进，为了更好的自己。' },
  { tag: '恐惧', content: '害怕未知的事情会发生，但我知道我需要勇敢面对。' },
  { tag: '感恩', content: '感谢生命中所有的遇见，让我成为更好的自己。' },
  { tag: '愤怒', content: '有些事情真的让我很生气，但我在学着控制情绪。' },
  { tag: '兴奋', content: '对明天充满期待，感觉有很多美好的事情在等着我。' },
  { tag: '平静', content: '今天做了冥想，感觉内心平静了很多，思绪也清晰了。' },
  { tag: '焦虑', content: '总是担心会出错，这种不安的感觉让我很疲惫。' },
  { tag: '孤独', content: '深夜里特别想念有人陪伴的感觉，这种孤独真的很难受。' },
  { tag: '感恩', content: '今天有人主动关心我，让我感到特别温暖和感激。' },
  { tag: '平静', content: '终于完成了一个大项目，心情特别好！' },
  { tag: '快乐', content: '和朋友一起玩得很开心，今天过得很充实！' },
];

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
  // 添加与 EMOTION_TAGS_CN 对应的标签
  快乐: [
    '今天终于把压抑已久的情绪都释放出来了，感觉轻松了很多。',
    '和朋友一起玩得很开心，今天过得很充实！',
    '收到好消息，整个人都兴奋起来了！',
  ],
  悲伤: [
    '有些话憋在心里太久了，真想找个人好好聊聊，把这些情绪都说出来。',
    '总是在怀疑自己，觉得自己不够好，不够优秀。',
    '今天真的很难过，需要一些温暖的话语来治愈我的心。',
  ],
  愤怒: [
    '有些事情真的让我很生气，但我在学着控制情绪。',
  ],
  疲惫: [
    '不知道为什么，就是感觉很累，什么都不想做，只想静静待着。',
  ],
  困惑: [
    '感觉自己像迷失在森林里，找不到出路，希望有人能给我一些指引。',
    '心里有很多矛盾的感受，不知道该如何处理这些复杂的情绪。',
  ],
  感恩: [
    '感谢生命中所有的遇见，让我成为更好的自己。',
    '今天有人主动关心我，让我感到特别温暖和感激。',
  ],
  孤独: [
    '总觉得没人能真正理解我的感受，这种孤独感让我很难受。',
    '有时候真的很需要有人在身边，哪怕什么都不说，只是陪着也好。',
    '周围有很多人，但还是感觉很孤单，好像没人真正懂我。',
    '深夜里特别想念有人陪伴的感觉，这种孤独真的很难受。',
  ],
  希望: [
    '虽然现在很难，但我相信这些经历会让我变得更强大。',
    '不想再这样下去了，想要做出一些改变，让生活变得更好。',
    '虽然很累，但我还是要继续前进，为了更好的自己。',
  ],
  恐惧: [
    '害怕未知的事情会发生，但我知道我需要勇敢面对。',
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

// 标签到情绪值的映射
const emotionToValenceArousal = {
  '快乐': { valence: 8, arousal: 7 },
  '悲伤': { valence: 2, arousal: 4 },
  '焦虑': { valence: 3, arousal: 8 },
  '愤怒': { valence: 2, arousal: 9 },
  '平静': { valence: 7, arousal: 2 },
  '兴奋': { valence: 9, arousal: 9 },
  '疲惫': { valence: 3, arousal: 2 },
  '困惑': { valence: 4, arousal: 5 },
  '感恩': { valence: 8, arousal: 4 },
  '孤独': { valence: 2, arousal: 3 },
  '希望': { valence: 7, arousal: 6 },
  '恐惧': { valence: 2, arousal: 8 },
};

// 生成模拟数据列表（至少100条）
function generateMockData(count = 120) {
  const posts = [];
  
  // 前26条：使用来自 Yeyu_ui_design 的真实用户数据
  for (let i = 0; i < Math.min(realUserData.length, count); i++) {
    const realData = realUserData[i];
    const emotionValues = emotionToValenceArousal[realData.tag] || { valence: 5, arousal: 5 };
    
    const userId = generateMockUserId(i);
    const username = generateMockUsername(i);
    const hoursAgo = i * 2 + Math.floor(Math.random() * 5); // 逐渐增加时间间隔
    const timestamp = Date.now() - hoursAgo * 60 * 60 * 1000;
    const likeCount = Math.floor(Math.random() * 30) + 5; // 5-34
    const commentCount = Math.floor(Math.random() * 4); // 0-3
    const comments = generateComments(`post_${i}`, commentCount);
    
    posts.push({
      postId: `post_${i}`,
      userId: userId,
      username: username,
      content: realData.content,
      emotion: realData.tag,
      emotionValue: emotionValues.valence,
      arousalValue: emotionValues.arousal,
      valence: emotionValues.valence,
      arousal: emotionValues.arousal,
      timestamp: timestamp,
      likeCount: likeCount,
      commentCount: commentCount,
      comments: comments,
      isRealUserData: true, // 标记为真实用户数据
    });
  }
  
  // 剩余部分：使用原有的生成逻辑
  const startIndex = realUserData.length;
  
  // 接下来30条：覆盖极端值
  for (let i = startIndex; i < Math.min(startIndex + 30, count); i++) {
    let valence, arousal;
    const idx = i - startIndex;
    if (idx < 10) {
      // 高价度 + 不同唤醒度
      valence = 8 + Math.floor(Math.random() * 3); // 8-10
      arousal = Math.floor(Math.random() * 11); // 0-10
    } else if (idx < 20) {
      // 低价度 + 不同唤醒度
      valence = Math.floor(Math.random() * 3); // 0-2
      arousal = Math.floor(Math.random() * 11); // 0-10
    } else {
      // 中价度 + 极端唤醒度
      valence = 4 + Math.floor(Math.random() * 3); // 4-6
      arousal = idx % 2 === 0 ? Math.floor(Math.random() * 3) : 8 + Math.floor(Math.random() * 3); // 0-2 or 8-10
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
  for (let i = startIndex + 30; i < count; i++) {
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
  realUserData: realUserData,
  emotionToValenceArousal: emotionToValenceArousal,
};

