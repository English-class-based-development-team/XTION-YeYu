# Yeyu_ui_design 用户数据导入说明

## 概述

本文档说明如何使用从 Yeyu_ui_design 导入的用户数据。这些数据已经被整合到微信小程序的 mock 数据中。

## 已导入的数据

### 1. 真实帖子内容 (mockData.js)

从 `Yeyu_ui_design/components/ResonanceWall.tsx` 和 `SearchResultsWall.tsx` 中导入了 26 条真实的用户帖子内容。

**位置**: `/miniprogram/mock/mockData.js`

**数据内容**:
- `realUserData`: 包含 26 条真实的用户帖子，每条包含：
  - `tag`: 情绪标签（快乐、悲伤、焦虑、愤怒、平静、兴奋、疲惫、困惑、感恩、孤独、希望、恐惧）
  - `content`: 帖子内容

**使用方式**:
```javascript
const { realUserData, mockPosts } = require('../mock/mockData.js');

// mockPosts 的前 26 条数据来自 realUserData
// 这些数据会自动标记为 isRealUserData: true
const realPosts = mockPosts.filter(post => post.isRealUserData);
```

### 2. 用户个人资料数据 (userProfileData.js)

从 `Yeyu_ui_design/components/ProfilePage.tsx` 中导入的用户个人资料相关数据。

**位置**: `/miniprogram/mock/userProfileData.js`

**数据内容**:

#### a. 默认用户个人资料
```javascript
const { defaultUserProfile } = require('../mock/userProfileData.js');

// 包含:
// - avatar: 用户头像 (emoji)
// - nickname: 用户昵称
// - greeting: 个性化问候语
// - joinDate: 加入日期
// - userId: 用户ID
```

#### b. 我的漂流瓶
```javascript
const { myBottles } = require('../mock/userProfileData.js');

// 包含 3 条用户发布的漂流瓶记录
// 每条记录包含: id, tag, content, date, fullContent, timestamp, likeCount, commentCount
```

#### c. 我的共鸣记录
```javascript
const { myResonances } = require('../mock/userProfileData.js');

// 包含 2 条用户查看的共鸣记录
// 每条记录包含: id, tag, content, date, fullContent, timestamp, originalPostId
```

#### d. 保存的对话
```javascript
const { savedConversations } = require('../mock/userProfileData.js');

// 包含 2 条保存的对话记录
// 每条记录包含: id, title, preview, date, timestamp, messages
```

#### e. 7天情绪数据
```javascript
const { emotionData7Days } = require('../mock/userProfileData.js');

// 包含 7 天的情绪统计数据
// 每天包含: date, 平静, 快乐, 焦虑, 感恩, day
```

### 3. 情绪配置

**情绪标签映射** (`mockData.js`):
```javascript
const { emotionToValenceArousal } = require('../mock/mockData.js');

// 将中文情绪标签映射到价度(valence)和唤醒度(arousal)值
// 用于生成符合情绪模型的数据
```

**情绪颜色配置** (`userProfileData.js`):
```javascript
const { emotionColors } = require('../mock/userProfileData.js');

// 定义情绪的可视化颜色
// 平静: #98D8C8, 快乐: #FFD89C, 焦虑: #FFB09C, 感恩: #E89B6D
```

## 在页面中使用

### 在主页面中使用真实帖子数据

```javascript
// pages/index/index.js
const { mockPosts } = require('../../mock/mockData.js');

Page({
  data: {
    posts: []
  },
  
  onLoad() {
    // 加载帖子数据（包含真实用户数据）
    this.setData({
      posts: mockPosts
    });
  }
});
```

### 在个人中心页面使用

```javascript
// pages/profile/profile.js
const { 
  defaultUserProfile, 
  myBottles, 
  myResonances, 
  savedConversations,
  emotionData7Days,
  getTimeGreeting,
  getCompanionDays
} = require('../../mock/userProfileData.js');

Page({
  data: {
    userProfile: defaultUserProfile,
    myBottles: myBottles,
    myResonances: myResonances,
    conversations: savedConversations,
    emotionData: emotionData7Days,
    timeGreeting: getTimeGreeting(),
  },
  
  onLoad() {
    const companionDays = getCompanionDays(defaultUserProfile.joinDate);
    this.setData({
      companionDays: companionDays
    });
  }
});
```

### 在共鸣墙组件中使用

```javascript
// components/resonanceWall/resonanceWall.js
const { mockPosts } = require('../../mock/mockData.js');

Component({
  methods: {
    loadResonances(userTag) {
      // 过滤与用户标签相关的共鸣
      const resonances = mockPosts.filter(post => {
        return post.emotion === userTag || this.isSimilarEmotion(post.emotion, userTag);
      });
      
      this.setData({
        resonances: resonances
      });
    }
  }
});
```

## 辅助函数

### 时间格式化
```javascript
const { formatRelativeTime } = require('../../mock/userProfileData.js');

// 将时间戳转换为相对时间（如：2小时前、3天前）
const relativeTime = formatRelativeTime(timestamp);
```

### 时间问候
```javascript
const { getTimeGreeting } = require('../../mock/userProfileData.js');

// 获取当前时间段的问候语（早上、中午、下午、晚上等）
const greeting = getTimeGreeting();
```

### 陪伴天数计算
```javascript
const { getCompanionDays } = require('../../mock/userProfileData.js');

// 计算从加入日期到现在的天数
const days = getCompanionDays(joinDate);
```

## 数据特点

1. **真实性**: 所有导入的内容都来自 Yeyu_ui_design 的实际设计数据，更贴近真实用户场景
2. **情绪多样性**: 覆盖 12 种不同的情绪标签，包括快乐、悲伤、焦虑、愤怒、平静、兴奋、疲惫、困惑、感恩、孤独、希望、恐惧
3. **时间真实性**: 包含合理的时间戳分布，模拟真实的时间流
4. **互动数据**: 包含点赞数、评论数等互动数据
5. **标记识别**: 真实用户数据标记为 `isRealUserData: true`，便于区分和筛选

## 注意事项

1. **数据持久化**: 这些是 mock 数据，不会持久化到数据库。如需持久化，请配合后端 API
2. **数据更新**: 如需更新数据，直接修改 `mockData.js` 或 `userProfileData.js` 文件
3. **数据扩展**: 可以在现有数据基础上添加更多字段，但请保持数据结构的一致性
4. **测试环境**: 建议在开发和测试环境使用这些 mock 数据，生产环境应使用真实 API

## 数据来源

所有数据均来自 `Yeyu_ui_design` 项目的以下组件：
- `ResonanceWall.tsx`: 共鸣墙数据
- `SearchResultsWall.tsx`: 搜索结果数据
- `ProfilePage.tsx`: 用户个人资料数据
- `emotions.ts`: 情绪标签配置

## 更新日志

- 2024-11-01: 初始导入，包含 26 条帖子数据和完整的用户资料数据

