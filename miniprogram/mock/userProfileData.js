/**
 * 用户个人资料模拟数据
 * 从 Yeyu_ui_design 导入的用户个人资料相关数据
 */

// 默认用户个人资料
const defaultUserProfile = {
  avatar: '😊',
  nickname: '爱敲代码的你',
  greeting: '继续保持热爱',
  joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天前
  userId: 'user_current',
};

// 我的漂流瓶数据
const myBottles = [
  { 
    id: '1', 
    tag: '平静', 
    content: '今天感觉心里很乱，希望能找到一个安静的角落...', 
    date: '2天前',
    fullContent: '今天感觉心里很乱，希望能找到一个安静的角落，让自己的思绪沉淀下来。',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    likeCount: 15,
    commentCount: 3,
  },
  { 
    id: '2', 
    tag: '快乐', 
    content: '终于完成了一个大项目，心情特别好！', 
    date: '5天前',
    fullContent: '终于完成了一个大项目，心情特别好！',
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    likeCount: 28,
    commentCount: 5,
  },
  { 
    id: '3', 
    tag: '焦虑', 
    content: '对未来有些迷茫，不知道该怎么办...', 
    date: '1周前',
    fullContent: '对未来有些迷茫，不知道该怎么办。希望能找到方向。',
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    likeCount: 12,
    commentCount: 2,
  },
];

// 我的共鸣记录
const myResonances = [
  { 
    id: '1', 
    tag: '孤独', 
    content: '总觉得没人能真正理解我的感受...', 
    date: '1天前',
    fullContent: '总觉得没人能真正理解我的感受，这种孤独感让我很难受。',
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
    originalPostId: 'post_resonance_1',
  },
  { 
    id: '2', 
    tag: '希望', 
    content: '虽然现在很难，但我相信会变好的', 
    date: '3天前',
    fullContent: '虽然现在很难，但我相信会变好的。一切都会过去的。',
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    originalPostId: 'post_resonance_2',
  },
];

// 保存的对话
const savedConversations = [
  { 
    id: '1', 
    title: '关于焦虑的对话', 
    preview: 'AI帮我分析了焦虑的来源...', 
    date: '昨天',
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
    messages: [
      { role: 'user', content: '我最近总是感到焦虑，不知道是为什么。' },
      { role: 'assistant', content: '焦虑是一种很常见的情绪。让我们一起探讨一下可能的原因...' },
    ],
  },
  { 
    id: '2', 
    title: '如何放松心情', 
    preview: '学到了一些冥想的技巧...', 
    date: '4天前',
    timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
    messages: [
      { role: 'user', content: '有什么好的放松方法吗？' },
      { role: 'assistant', content: '冥想是一个很好的放松方式。让我教你一些简单的冥想技巧...' },
    ],
  },
];

// 7天情绪数据 - 时间序列格式
const emotionData7Days = [
  { date: '周一', 平静: 30, 快乐: 20, 焦虑: 15, 感恩: 10, day: 0 },
  { date: '周二', 平静: 25, 快乐: 30, 焦虑: 10, 感恩: 15, day: 1 },
  { date: '周三', 平静: 20, 快乐: 25, 焦虑: 25, 感恩: 8, day: 2 },
  { date: '周四', 平静: 35, 快乐: 15, 焦虑: 18, 感恩: 12, day: 3 },
  { date: '周五', 平静: 28, 快乐: 28, 焦虑: 12, 感恩: 18, day: 4 },
  { date: '周六', 平静: 40, 快乐: 22, 焦虑: 8, 感恩: 15, day: 5 },
  { date: '今天', 平静: 32, 快乐: 26, 焦虑: 14, 感恩: 20, day: 6 },
];

// 情绪颜色配置 - 使用应用的暖色调
const emotionColors = {
  平静: '#98D8C8',    // 温柔的青绿色
  快乐: '#FFD89C',    // 柔和的金色
  焦虑: '#FFB09C',    // 温暖的桃橙色
  感恩: '#E89B6D',    // 应用主色调
};

// 获取时间段问候语
function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return '凌晨';
  if (hour < 12) return '早上';
  if (hour < 14) return '中午';
  if (hour < 18) return '下午';
  if (hour < 22) return '晚上';
  return '深夜';
}

// 计算陪伴天数
function getCompanionDays(joinDate) {
  const start = new Date(joinDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

// 格式化时间戳为相对时间
function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.floor(diff / (60 * 1000));
  
  if (days > 0) {
    return `${days}天前`;
  } else if (hours > 0) {
    return `${hours}小时前`;
  } else if (minutes > 0) {
    return `${minutes}分钟前`;
  } else {
    return '刚刚';
  }
}

module.exports = {
  defaultUserProfile,
  myBottles,
  myResonances,
  savedConversations,
  emotionData7Days,
  emotionColors,
  getTimeGreeting,
  getCompanionDays,
  formatRelativeTime,
};

