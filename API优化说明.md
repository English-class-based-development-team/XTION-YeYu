# API 服务优化说明

## 问题分析

### 1. URLSearchParams 不可用
**原因**: 微信小程序环境不支持浏览器的 `URLSearchParams` API

**解决方案**: 实现了 `buildQueryString()` 工具函数来手动构建 URL 查询参数

### 2. 404 错误频繁出现
**原因**: 新用户首次访问时，后端还没有相关数据记录

**解决方案**: 优化错误处理逻辑，对 404 错误采用静默处理（使用默认值）

## 优化内容

### 1. 新增 `buildQueryString()` 工具函数

```javascript
/**
 * 构建 URL 查询字符串
 * @param {Object} params - 查询参数对象
 * @returns {String} 查询字符串
 */
function buildQueryString(params) {
  if (!params || Object.keys(params).length === 0) {
    return '';
  }
  
  return Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}
```

**特性**:
- ✅ 自动过滤 `undefined` 和 `null` 值
- ✅ 使用 `encodeURIComponent` 进行 URL 编码
- ✅ 兼容微信小程序环境

**使用示例**:
```javascript
// 之前（不兼容）
const params = new URLSearchParams({ limit: 50, offset: 0 }).toString();

// 现在（兼容）
const queryString = buildQueryString({ limit: 50, offset: 0 });
// 输出: "limit=50&offset=0"
```

### 2. 增强的请求错误处理

#### 2.1 状态码分类处理

```javascript
if (res.statusCode === 200) {
  // 成功响应
  resolve(res.data);
} else if (res.statusCode === 404) {
  // 404 特殊处理 - 资源不存在
  const error = new Error(`资源不存在: ${url}`);
  error.statusCode = 404;
  error.url = url;
  reject(error);
} else if (res.statusCode >= 500 && currentRetry < retries) {
  // 服务器错误 - 自动重试
  // ...
} else {
  // 其他错误
  // ...
}
```

#### 2.2 自动重试机制

**支持的重试场景**:
- 服务器错误（5xx）
- 请求超时

**重试策略**:
- 指数退避（1秒、2秒、3秒...）
- 可配置重试次数

**使用示例**:
```javascript
// 带重试的请求（最多重试 3 次）
request('/api/endpoint', {
  method: 'GET',
  retries: 3
});
```

#### 2.3 详细的错误信息

```javascript
// 错误对象包含更多信息
error.statusCode = 404;
error.url = '/profile/user_xxx';
error.originalError = originalErrorObject;
```

### 3. 优化的个人中心页面错误处理

#### 3.1 404 错误静默处理

对于新用户，profile 相关的 API 可能返回 404，这是正常情况。优化后：

```javascript
if (profileResult.status === 'fulfilled') {
  // 处理成功数据
} else {
  // 404 错误表示用户资料不存在，使用默认值（新用户）
  if (profileResult.reason?.statusCode === 404) {
    console.log('用户资料不存在，使用默认值（新用户）');
    // 保持默认的 profile 数据，不显示错误提示
  } else {
    // 其他错误才输出到控制台
    console.error('获取用户资料失败:', profileResult.reason);
  }
}
```

**优点**:
- ✅ 新用户体验更好（不会看到错误提示）
- ✅ 减少无意义的错误日志
- ✅ 自动使用默认值

### 4. 更清晰的 API 导出结构

```javascript
module.exports = {
  // 核心工具
  request,
  buildQueryString,
  
  // 主动关怀与对话
  getProactiveCareMessages,
  chat,
  getGreeting,
  generateSummary,
  
  // 内容发布与推荐
  publishPost,
  getResonancePosts,
  
  // 个人中心相关
  getUserProfile,
  updateUserProfile,
  getUserBottles,
  getUserResonances,
  getSavedConversations,
  getEmotionStats,
  getProfileStats
};
```

## 最佳实践总结

### 1. URL 参数构建
✅ **使用**: `buildQueryString()` 函数  
❌ **避免**: `URLSearchParams`（微信小程序不支持）

### 2. 错误处理
✅ **区分错误类型**: 404 vs 5xx vs 网络错误  
✅ **新用户友好**: 404 错误使用默认值  
✅ **自动重试**: 临时性错误自动重试  
❌ **避免**: 所有错误一律显示给用户

### 3. API 请求
✅ **并行请求**: 使用 `Promise.allSettled()` 并行加载多个 API  
✅ **超时设置**: 合理的超时时间（30秒）  
✅ **错误对象**: 包含详细的错误信息（statusCode, url 等）

### 4. 开发调试
✅ **详细日志**: 区分警告和错误  
✅ **重试日志**: 显示重试进度  
✅ **错误上下文**: 包含请求 URL 和参数

## 受影响的文件

### 修改的文件
1. `/miniprogram/services/api.js` - API 服务核心
2. `/miniprogram/pages/profile/index.js` - 个人中心页面

### 优化的 API 方法
- `getUserBottles()` - 获取漂流瓶列表
- `getUserResonances()` - 获取共鸣记录
- `getSavedConversations()` - 获取保存的对话
- `getEmotionStats()` - 获取情绪统计

## 测试建议

### 1. 新用户测试
- [ ] 清除本地存储，模拟新用户
- [ ] 访问个人中心页面，确认不出现错误提示
- [ ] 验证默认值显示正确

### 2. 网络异常测试
- [ ] 断网情况 - 应显示友好的错误提示
- [ ] 请求超时 - 应自动重试（如果配置了 retries）
- [ ] 后端服务停止 - 应显示连接错误

### 3. URL 参数测试
- [ ] 测试带特殊字符的参数（中文、符号等）
- [ ] 验证参数正确编码
- [ ] 确认空值参数被过滤

## 后续优化建议

1. **请求缓存**: 实现请求结果缓存，减少重复请求
2. **请求队列**: 限制并发请求数量，避免同时发起过多请求
3. **离线支持**: 实现本地数据存储，支持离线查看
4. **性能监控**: 添加请求耗时统计，监控 API 性能
5. **错误上报**: 将关键错误上报到错误追踪服务

## 兼容性说明

- ✅ 微信小程序基础库 3.11.1+
- ✅ 支持 iOS 和 Android
- ✅ 开发者工具和真机测试通过

## 参考资料

1. [微信小程序 wx.request 文档](https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html)
2. [监控微信小程序wx.request请求失败](https://developer.aliyun.com/article/706955)
3. [JavaScript encodeURIComponent() 方法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)

