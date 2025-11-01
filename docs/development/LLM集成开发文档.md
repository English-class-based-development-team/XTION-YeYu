# LLM API 集成开发文档

## 📋 概述

本文档记录了小程序与后端LLM服务的完整集成过程，包括API配置、服务连接、UI更新和测试验证。

**开发时间**：2025年11月1日  
**集成状态**：✅ 已完成  
**测试状态**：✅ 通过

---

## 🎯 集成目标

1. ✅ 将小程序UI更接近 `Yeyu_ui_design` 设计
2. ✅ 集成真正的大模型API（SiliconFlow）
3. ✅ 实现主页对话功能
4. ✅ 支持情绪检测和分析
5. ✅ 提供备用方案（模拟回复）

---

## 🏗️ 技术架构

### 前端（小程序）
- **ChatInterface组件**：底部聊天输入框，支持消息预览
- **FullscreenChat组件**：全屏聊天界面
- **LLM API服务**：`services/llmApi.js`
- **配置管理**：`config/api.js`

### 后端（FastAPI）
- **LLM服务**：基于SiliconFlow API的DeepSeek-V3.2模型
- **情绪分析**：自动检测用户情绪状态
- **对话管理**：维护用户对话历史

---

## 📁 文件结构

```
miniprogram/
├── config/
│   └── api.js                 # API配置文件
├── services/
│   └── llmApi.js             # LLM API服务
├── components/
│   ├── chatInterface/        # 底部聊天组件
│   └── fullscreenChat/       # 全屏聊天组件
├── pages/index/              # 主页
└── tests/
    └── testLLMIntegration.js # 集成测试

llm/
├── main.py                   # FastAPI服务入口
├── config.py                 # 后端配置（含API密钥）
└── ...                       # 其他LLM服务文件
```

---

## ⚙️ 配置说明

### 1. 后端配置 (`llm/config.py`)

```python
# SiliconFlow API 配置
SILICONFLOW_API_KEY = "sk-raldzuewpoizujmnljvffzmtrtswjzpuwovaluslgdqnkcix"
SILICONFLOW_CHAT_URL = "https://api.siliconflow.cn/v1/chat/completions"
SILICONFLOW_EMBEDDING_URL = "https://api.siliconflow.cn/v1/embeddings"

# 模型配置
CHAT_MODEL = "deepseek-ai/DeepSeek-V3.2-Exp"
EMBEDDING_MODEL = "Qwen/Qwen3-Embedding-8B"

# 服务器配置
HOST = "0.0.0.0"
PORT = 8000
```

### 2. 前端配置 (`miniprogram/config/api.js`)

```javascript
// 开发环境配置
const development = {
  LLM_BASE_URL: 'http://localhost:8000',
  REQUEST_TIMEOUT: 30000,
  DEBUG: true,
  DEFAULT_USER_ID: 'user_dev_001'
};

// API端点配置
ENDPOINTS: {
  CHAT: '/chat',
  CHAT_HISTORY: '/chat/history',
  HEALTH: '/health'
}
```

---

## 🔌 API接口说明

### 1. 聊天接口

**请求格式**：
```javascript
POST /chat
{
  "user_id": "user_001",
  "message": "你好，我今天心情不太好",
  "conversation_id": null
}
```

**响应格式**：
```javascript
{
  "conversation_id": "user_001",
  "reply": "听起来你今天过得不太轻松呢。我在这里陪着你，愿意和我聊聊发生了什么吗？",
  "emotion_detected": {
    "emotion_tag": "sad",
    "emotion_intensity": 5
  }
}
```

### 2. 健康检查接口

**请求**：`GET /health`

**响应**：
```javascript
{
  "status": "healthy",
  "timestamp": "2025-11-01T09:41:35.906995",
  "version": "1.0.0"
}
```

---

## 🎨 UI设计实现

### 1. ChatInterface组件更新

**设计参考**：`Yeyu_ui_design/components/ChatInterface.tsx`

**主要特性**：
- ✅ 消息气泡设计（用户：`#ff9966`，AI：`#ffe8d9`）
- ✅ 圆角输入框（`border-radius: 48rpx`）
- ✅ 发送按钮动画和加载状态
- ✅ 消息预览（最后2条消息）
- ✅ 点击预览区域打开全屏聊天

**样式对比**：
```css
/* UI设计 */
.bg-[#ff9966] rounded-[20px] text-white

/* 小程序实现 */
.message-user .message-bubble {
  background: #ff9966;
  border-radius: 40rpx;
  color: white;
}
```

### 2. FullscreenChat组件更新

**主要特性**：
- ✅ 全屏模态框设计
- ✅ 实时LLM API调用
- ✅ 加载状态指示
- ✅ 错误处理和备用方案
- ✅ 自动滚动到底部

---

## 🔧 核心功能实现

### 1. LLM API集成 (`services/llmApi.js`)

```javascript
/**
 * 发送聊天消息到 LLM 服务
 */
async function sendChatMessage(messages, userId = null) {
  // 获取最后一条用户消息
  const lastUserMessage = messages.slice().reverse().find(msg => 
    msg.role === 'user' || msg.isUser === true
  );
  
  const requestData = {
    user_id: finalUserId,
    message: lastUserMessage.content,
    conversation_id: null
  };
  
  // 调用微信小程序网络API
  wx.request({
    url: `${apiConfig.LLM_BASE_URL}${apiConfig.ENDPOINTS.CHAT}`,
    method: 'POST',
    header: apiConfig.DEFAULT_HEADERS,
    data: requestData,
    timeout: apiConfig.REQUEST_TIMEOUT,
    // ... 错误处理和响应处理
  });
}
```

### 2. 组件集成 (`components/chatInterface/index.js`)

```javascript
async onSend() {
  try {
    // 调用 LLM API
    const response = await llmApi.sendChatMessage(currentMessages);
    
    if (response.success && response.data.response) {
      const aiMessage = {
        role: 'ai',
        content: response.data.response,
        id: (Date.now() + 1).toString()
      };
      
      // 触发消息更新事件
      this.triggerEvent('messageupdate', {
        messages: [...currentMessages, aiMessage]
      });
    }
  } catch (error) {
    // 备用方案：使用模拟回复
    const mockResponse = await llmApi.getMockReply(input);
    // ...
  }
}
```

---

## 🧪 测试验证

### 1. API连接测试

```bash
# 启动后端服务
cd llm && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 测试健康检查
curl -X GET "http://localhost:8000/health"

# 测试聊天API
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user", "message": "你好", "conversation_id": null}'
```

**测试结果**：
```json
{
  "conversation_id": "test_user",
  "reply": "你好！我是你的心理陪伴助手，很高兴见到你。今天感觉怎么样？",
  "emotion_detected": {
    "emotion_tag": "neutral",
    "emotion_intensity": 5
  }
}
```

### 2. 小程序集成测试

**测试文件**：`tests/testLLMIntegration.js`

**测试覆盖**：
- ✅ 健康检查
- ✅ 基本对话
- ✅ 情绪检测
- ✅ 备用方案
- ✅ 错误处理

**在小程序开发者工具中测试**：
1. 打开小程序项目
2. 在控制台运行：`require('./tests/testLLMIntegration.js').testLLMIntegration()`
3. 查看测试结果

---

## 🔄 使用流程

### 1. 用户发送消息流程

```
用户输入 → ChatInterface.onSend() → llmApi.sendChatMessage() 
→ 后端LLM处理 → 返回AI回复 → 更新消息列表 → UI刷新
```

### 2. 错误处理流程

```
API调用失败 → 显示错误提示 → 尝试模拟回复 → 
如果模拟也失败 → 显示"回复失败，请重试"
```

---

## 🚀 部署说明

### 1. 开发环境

1. **启动后端服务**：
   ```bash
   cd llm
   pip install -r requirements.txt
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **配置小程序**：
   - 确保 `config/api.js` 中的 `LLM_BASE_URL` 指向正确地址
   - 在微信开发者工具中打开项目

3. **测试连接**：
   - 在小程序中发送消息
   - 查看控制台日志确认API调用

### 2. 生产环境

1. **修改配置**：
   ```javascript
   // config/api.js
   const production = {
     LLM_BASE_URL: 'https://your-domain.com',  // 修改为生产服务器地址
     DEBUG: false
   };
   ```

2. **部署后端**：
   - 将LLM服务部署到云服务器
   - 配置HTTPS和域名
   - 确保API密钥安全

---

## ⚡ 性能优化

### 1. 请求优化
- ✅ 请求超时设置（30秒）
- ✅ 错误重试机制
- ✅ 备用方案（模拟回复）

### 2. UI优化
- ✅ 加载状态指示
- ✅ 防抖输入处理
- ✅ 消息动画效果
- ✅ 自动滚动到底部

### 3. 缓存策略
- 🔄 对话历史缓存（计划中）
- 🔄 用户偏好缓存（计划中）

---

## 🐛 常见问题

### 1. API连接失败

**问题**：显示"网络连接失败"

**解决方案**：
1. 检查后端服务是否启动：`curl http://localhost:8000/health`
2. 确认小程序配置中的API地址正确
3. 检查网络权限和域名白名单

### 2. 响应格式错误

**问题**：API返回格式不匹配

**解决方案**：
1. 查看后端API文档：`http://localhost:8000/docs`
2. 检查请求格式是否符合 `ChatRequest` 模型
3. 查看控制台日志确认具体错误

### 3. 情绪检测不准确

**问题**：情绪标签检测结果不理想

**解决方案**：
1. 检查后端情绪分析配置
2. 调整情绪检测阈值
3. 优化提示词（prompts.py）

---

## 📈 后续优化方向

### 1. 功能增强
- [ ] 对话历史持久化
- [ ] 多轮对话上下文
- [ ] 情绪趋势分析
- [ ] 个性化推荐

### 2. 性能优化
- [ ] 流式响应支持
- [ ] 请求缓存机制
- [ ] 离线模式支持

### 3. 用户体验
- [ ] 语音输入支持
- [ ] 表情符号建议
- [ ] 主题切换功能

---

## 📝 更新日志

### v1.0.0 (2025-11-01)
- ✅ 完成LLM API集成
- ✅ 更新UI匹配设计稿
- ✅ 实现情绪检测功能
- ✅ 添加错误处理和备用方案
- ✅ 完成集成测试

---

## 👥 开发团队

- **AI Assistant**：LLM集成开发
- **UI设计**：基于 Yeyu_ui_design
- **后端服务**：FastAPI + SiliconFlow

---

## 📚 参考资料

- [SiliconFlow API文档](https://docs.siliconflow.cn/)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/)
- [FastAPI文档](https://fastapi.tiangolo.com/)
- [DeepSeek模型文档](https://platform.deepseek.com/docs)

---

**集成状态**：✅ 已完成  
**最后更新**：2025年11月1日  
**版本**：v1.0.0
