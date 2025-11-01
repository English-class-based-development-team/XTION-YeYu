# RAG 架构与 API 使用指南

## 一、RAG 架构概述

### 1.1 架构组成

该 LLM 后端服务采用 **RAG (Retrieval-Augmented Generation)** 架构，主要包含以下核心组件：

```
┌─────────────────────────────────────────────────────────┐
│                    FastAPI 应用层                        │
│  (main.py - 路由和请求处理)                              │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐      ┌─────────▼──────────┐
│  LLM 服务层   │      │   RAG 服务层       │
│               │      │                    │
│ - 对话管理    │      │ - 向量检索         │
│ - 情绪分析    │      │ - 共鸣推荐         │
│ - 文本生成    │      │ - 长期记忆         │
└───────┬────────┐      └─────────┬──────────┘
        │         │               │
        │         └───────┬───────┘
        │                 │
┌───────▼─────────────────▼──────────────┐
│          数据存储层                      │
│                                         │
│  ┌──────────────┐  ┌────────────────┐ │
│  │  SQLite      │  │   FAISS       │ │
│  │  关系数据库   │  │  向量索引      │ │
│  │              │  │                │ │
│  │ - posts 表   │  │ - global.index │ │
│  │ - 用户表     │  │ - user_*.index │ │
│  └──────────────┘  └────────────────┘ │
└───────────────────────────────────────┘
        │
┌───────▼────────┐
│   外部服务     │
│               │
│ SiliconFlow   │
│ - LLM API     │
│ - Embedding   │
└───────────────┘
```

### 1.2 数据流

#### 发帖流程：
```
用户发帖 → FastAPI → PostCRUD (SQLite存储) 
                      ↓
                 RAGService → VectorStore (FAISS索引)
                      ↓
                  EmbeddingService (向量化)
                      ↓
               存储到全局索引和用户私有索引
```

#### 共鸣检索流程：
```
用户查询 → RAGService → VectorStore (FAISS检索)
                        ↓
                   返回相似帖子列表
                        ↓
                  PostCRUD (从SQLite获取详情)
                        ↓
                   返回完整帖子信息
```

### 1.3 向量化策略

**向量组成**：情感标签 + 情绪强度 + 文本内容

```python
# 向量化过程
1. 将情感标签转换为数值向量 (one-hot 或 embedding)
2. 将情绪强度归一化 (1-10 → 0-1)
3. 将文本内容通过 Embedding 模型向量化
4. 组合以上向量形成最终查询向量
```

**相似度计算**：
- 使用 **FAISS IndexFlatIP** (内积)
- 配合 **L2 归一化** 实现余弦相似度
- 相似度范围：0-1（越高越相似）

### 1.4 存储结构

#### SQLite 数据库：
```
data/posts.db
├── posts (全局帖子表)
│   ├── id (主键)
│   ├── user_id
│   ├── username
│   ├── timestamp
│   ├── emotion_tag
│   ├── emotion_intensity
│   └── content
│
└── posts_user_{user_id} (用户私有表)
    └── (同全局表结构)
```

#### FAISS 向量索引：
```
data/faiss_indexes/
├── global.index          # 全局向量索引
├── global.meta.json     # 全局元数据（向量ID → 帖子ID映射）
├── user_rag_user_001.index    # 用户私有索引
├── user_rag_user_001.meta.json
└── ...
```

---

## 二、API 调用方式

### 2.1 基础配置

**服务地址**：`http://localhost:8000`

**Content-Type**：`application/json`

**请求格式**：JSON

### 2.2 核心接口调用示例

#### 1. 健康检查

```javascript
// GET 请求
fetch('http://localhost:8000/health')
  .then(res => res.json())
  .then(data => {
    console.log(data);
    // {
    //   "status": "healthy",
    //   "timestamp": "2025-10-31T12:00:00",
    //   "version": "1.0.0"
    // }
  });
```

#### 2. 对话接口 (`/chat`)

**功能**：与 LLM 进行情绪倾诉和交流，自动管理对话历史

```javascript
// POST 请求
fetch('http://localhost:8000/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: 'user_001',
    message: '今天心情不太好',
    conversation_id: 'user_001'  // 可选，默认使用 user_id
  })
})
  .then(res => res.json())
  .then(data => {
    console.log(data);
    // {
    //   "conversation_id": "user_001",
    //   "reply": "听起来你今天遇到了一些不开心的事情，想和我聊聊吗？",
    //   "emotion_detected": {
    //     "emotion_tag": "sad",
    //     "emotion_intensity": 6
    //   }
    // }
  });
```

**特性**：
- ✅ 自动管理对话历史（使用 `user_id` 作为标识）
- ✅ 自动保留最近 10 轮对话（20 条消息）
- ✅ 无需手动传递历史，系统自动关联

#### 3. 情绪分析接口 (`/analyze_emotion`)

```javascript
// POST 请求
fetch('http://localhost:8000/analyze_emotion', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: '今天考试考得很好，特别开心！'
    // 或使用 conversation_id: 'user_001'
  })
})
  .then(res => res.json())
  .then(data => {
    console.log(data);
    // {
    //   "emotion_tag": "happy",
    //   "emotion_intensity": 8,
    //   "analysis": "文本表达了积极的情绪"
    // }
  });
```

#### 4. 生成总结 (`/generate_summary`)

```javascript
// 从对话生成
fetch('http://localhost:8000/generate_summary', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    conversation_id: 'user_001',
    user_id: 'user_001'
  })
})
  .then(res => res.json())
  .then(data => {
    console.log(data);
    // {
    //   "summary": "今天工作出现问题，心情低落，感到疲惫",
    //   "emotion_tag": "sad",
    //   "emotion_intensity": 7
    // }
  });
```

#### 5. 发布帖子 (`/publish_post`)

**功能**：发布情绪帖子到全局和用户私有数据库，并生成跟进消息

```javascript
fetch('http://localhost:8000/publish_post', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: 'user_001',
    username: '测试用户',
    content: '今天终于完成了一个大项目，感觉特别有成就感！',
    emotion_tag: 'happy',      // 可选，不提供则自动分析
    emotion_intensity: 8,      // 可选，不提供则自动分析
    conversation_id: null      // 可选，用于记录来源
  })
})
  .then(res => res.json())
  .then(data => {
    console.log(data);
    // {
    //   "post_id": 123,
    //   "global_vector_id": 456,
    //   "user_vector_id": 789,
    //   "post_info": {
    //     "user_id": "user_001",
    //     "username": "测试用户",
    //     "timestamp": "2025-10-31T12:00:00",
    //     "emotion_tag": "happy",
    //     "emotion_intensity": 8,
    //     "content": "今天终于完成了一个大项目，感觉特别有成就感！"
    //   },
    //   "follow_up_message": "你把喜悦传播出去啦！独乐乐不如众乐乐！"
    // }
  });
```

#### 6. 共鸣推荐 (`/resonance_posts`)

**功能**：基于情绪和内容推荐相似的帖子（RAG 检索）

**方式一：基于帖子 ID**

```javascript
fetch('http://localhost:8000/resonance_posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: 'user_001',
    post_id: 123,
    k: 5,
    exclude_self: true
  })
})
  .then(res => res.json())
  .then(data => {
    console.log(data);
    // {
    //   "posts": [
    //     {
    //       "user_id": "user_002",
    //       "username": "其他用户",
    //       "timestamp": "2025-10-30T12:00:00",
    //       "emotion_tag": "happy",
    //       "emotion_intensity": 8,
    //       "content": "今天也很开心！",
    //       "similarity": 0.95
    //     }
    //   ],
    //   "total": 1
    // }
  });
```

**方式二：直接查询**

```javascript
fetch('http://localhost:8000/resonance_posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: 'user_001',
    emotion_tag: 'happy',
    emotion_intensity: 7,
    content: '今天心情很好',
    k: 5,
    exclude_self: true
  })
})
  .then(res => res.json())
  .then(data => {
    console.log(data.posts);
  });
```

#### 7. 问候语生成 (`/greeting`)

```javascript
fetch('http://localhost:8000/greeting', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: 'user_001',
    username: '测试用户',
    max_greetings: 3
  })
})
  .then(res => res.json())
  .then(data => {
    console.log(data);
    // {
    //   "greetings": [
    //     "你昨天说你要考试了，有点紧张。今天考得怎么样呀？"
    //   ],
    //   "context_posts": [...]
    // }
  });
```

#### 8. 跟进消息 (`/follow_up`)

```javascript
fetch('http://localhost:8000/follow_up', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: 'user_001',
    post_id: 123,
    had_conversation: true
  })
})
  .then(res => res.json())
  .then(data => {
    console.log(data);
    // {
    //   "follow_up_message": "你现在感觉好些了吗？没关系，我一直都在的。",
    //   "post_info": {...}
    // }
  });
```

### 2.3 微信小程序调用示例

```javascript
// miniprogram/services/api.js
const API_BASE = 'http://localhost:8000'; // 或您的服务器地址

// 对话接口
export function chat(userId, message) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}/chat`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        user_id: userId,
        message: message
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.detail || '请求失败'));
        }
      },
      fail: reject
    });
  });
}

// 发布帖子
export function publishPost(userId, username, content, emotionTag = null, emotionIntensity = null) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}/publish_post`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        user_id: userId,
        username: username,
        content: content,
        emotion_tag: emotionTag,
        emotion_intensity: emotionIntensity
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.detail || '请求失败'));
        }
      },
      fail: reject
    });
  });
}

// 获取共鸣推荐
export function getResonancePosts(userId, emotionTag, emotionIntensity, content, k = 5) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}/resonance_posts`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        user_id: userId,
        emotion_tag: emotionTag,
        emotion_intensity: emotionIntensity,
        content: content,
        k: k,
        exclude_self: true
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.detail || '请求失败'));
        }
      },
      fail: reject
    });
  });
}

// 获取问候语
export function getGreeting(userId, username = '朋友') {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}/greeting`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      data: {
        user_id: userId,
        username: username,
        max_greetings: 3
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.detail || '请求失败'));
        }
      },
      fail: reject
    });
  });
}
```

### 2.4 错误处理

所有接口统一返回错误格式：

```javascript
{
  "detail": "错误描述信息"
}
```

**常见状态码**：
- `200 OK`: 请求成功
- `400 Bad Request`: 请求参数错误
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

**错误处理示例**：

```javascript
fetch('http://localhost:8000/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: 'user_001',
    message: '测试'
  })
})
  .then(res => {
    if (!res.ok) {
      return res.json().then(err => Promise.reject(err));
    }
    return res.json();
  })
  .then(data => {
    // 处理成功响应
    console.log(data.reply);
  })
  .catch(error => {
    // 处理错误
    console.error('请求失败:', error.detail || error.message);
  });
```

---

## 三、API 配置方式

### 3.1 配置文件位置

**配置文件**：`llm/config.py`（需要手动创建）  
**配置模板**：`llm/config.example.py`

### 3.2 配置步骤

#### 步骤 1: 复制配置模板

```bash
cd llm
cp config.example.py config.py
```

#### 步骤 2: 编辑配置文件

编辑 `llm/config.py`，填入您的配置信息：

```python
# SiliconFlow API 配置
SILICONFLOW_API_KEY = "your_api_key_here"  # 替换为您的真实 API 密钥
SILICONFLOW_CHAT_URL = "https://api.siliconflow.cn/v1/chat/completions"
SILICONFLOW_EMBEDDING_URL = "https://api.siliconflow.cn/v1/embeddings"

# 模型配置
CHAT_MODEL = "deepseek-ai/DeepSeek-V3.2-Exp"  # 对话模型
EMBEDDING_MODEL = "Qwen/Qwen3-Embedding-8B"     # 向量化模型

# 数据库配置
DATABASE_PATH = "data/posts.db"                # SQLite 数据库路径
VECTOR_DB_PATH = "data/faiss_indexes"          # FAISS 索引目录

# 服务器配置
HOST = "0.0.0.0"   # 监听地址（0.0.0.0 表示监听所有网络接口）
PORT = 8000        # 监听端口
```

### 3.3 配置项说明

#### 3.3.1 SiliconFlow API 配置

| 配置项 | 说明 | 示例值 |
|--------|------|--------|
| `SILICONFLOW_API_KEY` | **必填**：SiliconFlow API 密钥 | `"sk-xxxxxxxxxxxx"` |
| `SILICONFLOW_CHAT_URL` | LLM 对话 API 端点 | `"https://api.siliconflow.cn/v1/chat/completions"` |
| `SILICONFLOW_EMBEDDING_URL` | 向量化 API 端点 | `"https://api.siliconflow.cn/v1/embeddings"` |

**获取 API 密钥**：
1. 访问 [SiliconFlow](https://siliconflow.cn/)
2. 注册账号并登录
3. 在控制台获取 API 密钥

#### 3.3.2 模型配置

| 配置项 | 说明 | 推荐值 |
|--------|------|--------|
| `CHAT_MODEL` | 对话模型名称 | `"deepseek-ai/DeepSeek-V3.2-Exp"` |
| `EMBEDDING_MODEL` | 向量化模型名称 | `"Qwen/Qwen3-Embedding-8B"` |

**支持的模型**：
- 对话模型：可在 SiliconFlow 控制台查看可用模型
- Embedding 模型：建议使用 `Qwen/Qwen3-Embedding-8B`（768 维）

#### 3.3.3 数据库配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `DATABASE_PATH` | SQLite 数据库文件路径 | `"data/posts.db"` |
| `VECTOR_DB_PATH` | FAISS 索引目录路径 | `"data/faiss_indexes"` |

**注意事项**：
- 路径相对于 `llm/` 目录
- 首次运行会自动创建 `data/` 目录
- 数据库和索引文件需要定期备份

#### 3.3.4 服务器配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `HOST` | 监听地址 | `"0.0.0.0"`（所有网络接口） |
| `PORT` | 监听端口 | `8000` |

**配置建议**：
- **开发环境**：使用 `localhost` 或 `127.0.0.1`
- **生产环境**：使用 `0.0.0.0` 以监听所有接口，配合防火墙限制访问

### 3.4 环境变量配置（可选）

支持通过环境变量覆盖配置文件：

```bash
# 设置环境变量
export SILICONFLOW_API_KEY="your_api_key_here"
export CHAT_MODEL="deepseek-ai/DeepSeek-V3.2-Exp"
export PORT=8000

# 运行服务
python main.py
```

### 3.5 其他可配置模块

#### 3.5.1 情感标签配置 (`emotion_config.py`)

可修改：
- 情感标签列表（`EMOTION_TAGS`）
- 中英文映射（`EMOTION_TAGS_CN`）

```python
# 添加新标签
EMOTION_TAGS = [
    'happy', 'sad', 'anxious', ...
    'new_emotion'  # 新增标签
]

EMOTION_TAGS_CN = {
    'happy': '快乐',
    ...
    'new_emotion': '新情绪'  # 新增映射
}
```

#### 3.5.2 提示词配置 (`prompts.py`)

可修改 LLM 的系统提示词和行为：

```python
# 修改情绪伙伴角色
SYSTEM_PROMPT_EMOTION_COMPANION = """
你是一个专业的情绪伙伴...
[自定义提示词]
"""
```

### 3.6 启动服务

#### 方式一：直接运行

```bash
cd llm
python main.py
```

#### 方式二：使用 uvicorn

```bash
cd llm

# 开发环境（支持热重载）
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 生产环境
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### 验证服务

访问以下地址验证服务是否正常：

- 健康检查：http://localhost:8000/health
- API 文档：http://localhost:8000/docs
- ReDoc 文档：http://localhost:8000/redoc

### 3.7 配置安全检查清单

- [ ] `config.py` 已添加到 `.gitignore`（不应提交到版本控制）
- [ ] API 密钥使用强密码，定期更换
- [ ] 生产环境限制 CORS 允许的域名
- [ ] 数据库和索引文件定期备份
- [ ] 生产环境使用 HTTPS
- [ ] 配置防火墙规则限制访问

---

## 四、快速开始示例

### 完整调用流程示例

```javascript
// 1. 健康检查
await fetch('http://localhost:8000/health');

// 2. 开始对话
const chatResponse = await fetch('http://localhost:8000/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'user_001',
    message: '今天心情不太好'
  })
}).then(r => r.json());

console.log('AI 回复:', chatResponse.reply);

// 3. 生成总结
const summaryResponse = await fetch('http://localhost:8000/generate_summary', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    conversation_id: 'user_001',
    user_id: 'user_001'
  })
}).then(r => r.json());

console.log('总结:', summaryResponse.summary);

// 4. 发布帖子
const publishResponse = await fetch('http://localhost:8000/publish_post', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'user_001',
    username: '测试用户',
    content: '今天终于完成了一个大项目！',
    emotion_tag: summaryResponse.emotion_tag,
    emotion_intensity: summaryResponse.emotion_intensity
  })
}).then(r => r.json());

console.log('发帖成功，跟进消息:', publishResponse.follow_up_message);

// 5. 获取共鸣推荐
const resonanceResponse = await fetch('http://localhost:8000/resonance_posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: 'user_001',
    post_id: publishResponse.post_id,
    k: 5,
    exclude_self: true
  })
}).then(r => r.json());

console.log('找到', resonanceResponse.total, '个共鸣');
console.log('共鸣列表:', resonanceResponse.posts);
```

---

## 五、常见问题

### Q1: 如何获取 SiliconFlow API 密钥？
A: 访问 https://siliconflow.cn/，注册账号后在控制台获取。

### Q2: 如何修改向量维度？
A: 向量维度由 Embedding 模型决定，`Qwen/Qwen3-Embedding-8B` 为 768 维。更换模型需重新构建索引。

### Q3: 对话历史如何管理？
A: 使用 `user_id` 自动关联对话历史，系统保留最近 10 轮对话（20 条消息）。

### Q4: 如何备份数据？
A: 备份 `data/posts.db` 和 `data/faiss_indexes/` 目录即可。

### Q5: 支持哪些情感标签？
A: 查看 `emotion_config.py` 文件，默认支持 12 种情感标签，可自定义添加。

---

## 六、参考文档

- **API 完整文档**：`llm/API.md`
- **项目 README**：`llm/README.md`
- **FastAPI 文档**：http://localhost:8000/docs
- **SiliconFlow 文档**：https://siliconflow.cn/docs

