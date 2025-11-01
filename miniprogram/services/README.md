# API 服务使用指南

## 快速开始

```javascript
const apiService = require('../../services/api.js');

// 发布帖子
await apiService.publishPost({
  user_id: 'user_001',
  username: '用户名',
  content: '今天心情不错',
  emotion_tag: 'joy',
  emotion_intensity: 0.8
});

// 获取用户资料
const profile = await apiService.getUserProfile('user_001');
```

## 核心功能

### 1. 智能错误处理
- ✅ 自动区分不同类型的错误（404、5xx、网络错误）
- ✅ 新用户 404 错误静默处理（不显示错误提示）
- ✅ 服务器错误自动重试（可配置）

### 2. URL 查询参数构建
```javascript
// 使用 buildQueryString 工具函数
const queryString = buildQueryString({
  limit: 50,
  offset: 0,
  keyword: '搜索关键词'
});
// 输出: "limit=50&offset=0&keyword=%E6%90%9C%E7%B4%A2%E5%85%B3%E9%94%AE%E8%AF%8D"
```

### 3. 请求重试
```javascript
// 自动重试（最多 3 次）
await apiService.request('/api/endpoint', {
  method: 'GET',
  retries: 3  // 可选参数
});
```

## API 列表

### 主动关怀与对话
- `getProactiveCareMessages(userId, username, maxMessages, offset)` - 获取主动关怀消息
- `chat(userId, message)` - 对话接口
- `getGreeting(userId, username)` - 生成问候语
- `generateSummary(userId, conversationId, text)` - 生成对话总结

### 内容发布与推荐
- `publishPost(data)` - 发布漂流瓶
- `getResonancePosts(params)` - 获取共鸣推荐

### 个人中心
- `getUserProfile(userId)` - 获取用户资料
- `updateUserProfile(userId, data)` - 更新用户资料
- `getUserBottles(userId, limit, offset)` - 获取我的漂流瓶列表
- `getUserResonances(userId, limit)` - 获取共鸣浏览记录
- `getSavedConversations(userId, limit, offset)` - 获取保存的对话列表
- `getEmotionStats(userId, forceUpdate)` - 获取情绪统计数据
- `getProfileStats(userId)` - 获取个人中心统计概览

## 错误处理示例

```javascript
try {
  const profile = await apiService.getUserProfile(userId);
  // 处理成功响应
} catch (error) {
  if (error.statusCode === 404) {
    // 资源不存在（新用户）
    console.log('使用默认值');
  } else if (error.statusCode >= 500) {
    // 服务器错误
    wx.showToast({ title: '服务器繁忙，请稍后重试', icon: 'none' });
  } else {
    // 其他错误
    console.error('请求失败:', error);
  }
}
```

## 最佳实践

### ✅ 推荐
1. 使用 `Promise.allSettled()` 并行请求多个 API
2. 对新用户（404 错误）使用默认值，不显示错误
3. 使用 `buildQueryString()` 构建 URL 参数
4. 为重要的 API 添加重试机制

### ❌ 避免
1. 不要使用 `URLSearchParams`（微信小程序不支持）
2. 不要对所有 404 错误都显示错误提示
3. 不要使用 `localhost`，改用本机 IP 地址
4. 不要在循环中发起大量并发请求

## 配置说明

### API 基础地址
```javascript
// 开发环境配置
const LOCAL_IP = '172.16.23.57';  // 修改为你的本机 IP
const API_BASE = `http://${LOCAL_IP}:8000`;
```

### 获取本机 IP
- macOS/Linux: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Windows: `ipconfig` 查看 IPv4 地址

### 微信开发者工具设置
1. 打开微信开发者工具
2. 设置 → 项目设置 → 本地设置
3. 勾选 "不校验合法域名"（仅开发环境）

## 常见问题

### Q1: 出现 "URLSearchParams is not defined" 错误？
**A**: 已修复。现在使用 `buildQueryString()` 函数替代。

### Q2: 新用户访问个人中心时出现大量 404 错误？
**A**: 已优化。404 错误会静默处理，使用默认值，不影响用户体验。

### Q3: 请求超时怎么办？
**A**: 可以配置自动重试：
```javascript
request('/api/endpoint', { retries: 3 });
```

### Q4: 如何调试网络请求？
**A**: 
1. 在微信开发者工具中打开 "Console" 面板
2. 查看网络请求日志（包含重试信息）
3. 使用 "Network" 面板查看详细的请求信息

## 更新日志

### v2.0.0 (2024-11-01)
- ✨ 新增 `buildQueryString()` 工具函数
- ✨ 新增自动重试机制
- 🐛 修复 URLSearchParams 不支持的问题
- 💄 优化 404 错误处理逻辑
- 📝 完善错误信息和日志输出

### v1.0.0
- 🎉 初始版本

## 参考资料

- [API优化说明.md](../../API优化说明.md) - 详细的优化说明
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)

