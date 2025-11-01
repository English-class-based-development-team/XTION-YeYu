# 情绪记录与共鸣社区 LLM API 文档

## 概述

本文档详细说明了情绪记录与共鸣社区 LLM 后端服务的所有 API 接口。

**基础 URL**: `http://localhost:8000`

**技术栈**:
- FastAPI + Uvicorn
- SQLite + FAISS
- SiliconFlow API (LLM 和 Embedding)
- LangChain

---

## 配置文件位置

### 核心配置
- **API 配置**: `llm/config.py` - API 密钥、模型配置、服务器配置
- **配置模板**: `llm/config.example.py` - 配置文件模板

### 可配置模块
- **情感标签配置**: `llm/emotion_config.py` - 情感标签定义、中英文映射
- **提示词配置**: `llm/prompts.py` - 所有 LLM 提示词模板

---

## API 端点列表

### 1. 健康检查

#### 1.1 根路径
```http
GET /
```

**响应示例**:
```json
{
  "status": "running",
  "timestamp": "2025-10-31T12:00:00",
  "version": "1.0.0"
}
```

#### 1.2 健康检查
```http
GET /health
```

**响应示例**:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-31T12:00:00",
  "version": "1.0.0"
}
```

---

### 2. 对话接口

```http
POST /chat
```

**功能**: 用户与 LLM 进行情绪倾诉和交流

**✨ 特性**:
- ✅ **自动支持历史对话**: 系统自动管理和传递对话历史
- ✅ **上下文记忆**: LLM 可以记住之前的对话内容
- ✅ **无需手动传递**: 使用 `user_id` 自动关联历史
- 📝 **历史保留**: 默认保留最近 10 轮对话（20 条消息）

**请求体**:
```json
{
  "user_id": "user_001",
  "message": "今天心情不太好",
  "conversation_id": "user_001"  // 可选，不提供则使用 user_id
}
```

**请求参数说明**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id | string | 是 | 用户唯一标识（用于关联对话历史） |
| message | string | 是 | 用户消息内容 |
| conversation_id | string | 否 | 对话 ID，默认使用 user_id |

**响应示例**:
```json
{
  "conversation_id": "user_001",
  "reply": "听起来你今天遇到了一些不开心的事情，想和我聊聊吗？",
  "emotion_detected": {
    "emotion_tag": "sad",
    "emotion_intensity": 6
  }
}
```

**响应参数说明**:
| 参数 | 类型 | 说明 |
|------|------|------|
| conversation_id | string | 对话 ID |
| reply | string | AI 回复内容 |
| emotion_detected | object \| null | 检测到的情绪信息（可选） |

**错误响应**:
```json
{
  "detail": "对话失败: 错误详情"
}
```

---

### 3. 情绪分析接口

```http
POST /analyze_emotion
```

**功能**: 分析文本或对话的情绪信息

**请求体**:
```json
{
  "text": "今天考试考得很好，特别开心！",
  "conversation_id": null  // 可选，用于分析整个对话
}
```

**请求参数说明**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| text | string | 否 | 待分析的文本（与 conversation_id 二选一） |
| conversation_id | string | 否 | 对话 ID，分析整个对话（与 text 二选一） |

**响应示例**:
```json
{
  "emotion_tag": "happy",
  "emotion_intensity": 8,
  "analysis": "文本表达了积极的情绪"
}
```

**响应参数说明**:
| 参数 | 类型 | 说明 |
|------|------|------|
| emotion_tag | string | 情感标签（happy/sad/angry/fear/neutral 等） |
| emotion_intensity | integer | 情绪强度（1-10） |
| analysis | string \| null | 分析说明（可选） |

**支持的情感标签**:
可在 `llm/emotion_config.py` 中查看和修改完整列表。

---

### 4. 总结生成接口

```http
POST /generate_summary
```

**功能**: 从对话或文本生成帖子总结

**请求体（从对话生成）**:
```json
{
  "conversation_id": "user_001",
  "user_id": "user_001"
}
```

**请求体（从文本生成）**:
```json
{
  "text": "今天真是糟糕的一天。早上起晚了，赶公交差点迟到...",
  "user_id": "user_001"
}
```

**请求参数说明**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| conversation_id | string | 否 | 对话 ID（与 text 二选一） |
| text | string | 否 | 直接文本（与 conversation_id 二选一） |
| user_id | string | 是 | 用户 ID |

**响应示例**:
```json
{
  "summary": "今天工作出现问题，心情低落，感到疲惫",
  "emotion_tag": "sad",
  "emotion_intensity": 7
}
```

**响应参数说明**:
| 参数 | 类型 | 说明 |
|------|------|------|
| summary | string | 总结内容 |
| emotion_tag | string | 情感标签 |
| emotion_intensity | integer | 情绪强度（1-10） |

---

### 5. 发帖接口

```http
POST /publish_post
```

**功能**: 发布情绪帖子到全局和用户私有数据库，并生成跟进消息

**请求体**:
```json
{
  "user_id": "user_001",
  "username": "测试用户",
  "content": "今天终于完成了一个大项目，感觉特别有成就感！",
  "emotion_tag": "happy",  // 可选，不提供则自动分析
  "emotion_intensity": 8,  // 可选，不提供则自动分析
  "conversation_id": null  // 可选，用于记录来源
}
```

**请求参数说明**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id | string | 是 | 用户 ID |
| username | string | 是 | 用户名 |
| content | string | 是 | 帖子内容 |
| emotion_tag | string | 否 | 情感标签（不提供则自动分析） |
| emotion_intensity | integer | 否 | 情绪强度 1-10（不提供则自动分析） |
| conversation_id | string | 否 | 对话 ID（用于记录来源） |

**响应示例**:
```json
{
  "post_id": 123,
  "global_vector_id": 456,
  "user_vector_id": 789,
  "post_info": {
    "user_id": "user_001",
    "username": "测试用户",
    "timestamp": "2025-10-31T12:00:00",
    "emotion_tag": "happy",
    "emotion_intensity": 8,
    "content": "今天终于完成了一个大项目，感觉特别有成就感！"
  },
  "follow_up_message": "你把喜悦传播出去啦！独乐乐不如众乐乐！"
}
```

**响应参数说明**:
| 参数 | 类型 | 说明 |
|------|------|------|
| post_id | integer | 帖子 ID（数据库 ID） |
| global_vector_id | integer | 全局向量 ID |
| user_vector_id | integer | 用户私有向量 ID |
| post_info | object | 帖子完整信息（六字段） |
| follow_up_message | string | 发帖后的跟进消息 |

**数据存储**:
- 全局数据库: `data/posts.db` (posts 表)
- 用户私有表: `data/posts.db` (posts_user_{user_id} 表)
- 全局向量索引: `data/faiss_indexes/global.index`
- 用户向量索引: `data/faiss_indexes/user_{user_id}.index`

---

### 6. 共鸣推荐接口

```http
POST /resonance_posts
```

**功能**: 基于情绪和内容推荐相似的帖子

**请求体（基于帖子 ID）**:
```json
{
  "user_id": "user_001",
  "post_id": 123,
  "k": 5,
  "exclude_self": true
}
```

**请求体（直接查询）**:
```json
{
  "user_id": "user_001",
  "emotion_tag": "happy",
  "emotion_intensity": 7,
  "content": "今天心情很好",
  "k": 5,
  "exclude_self": true
}
```

**请求参数说明**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id | string | 是 | 用户 ID |
| post_id | integer | 否 | 帖子 ID（与直接查询参数二选一） |
| emotion_tag | string | 否 | 情感标签（直接查询时使用） |
| emotion_intensity | integer | 否 | 情绪强度（直接查询时使用） |
| content | string | 否 | 内容（直接查询时使用） |
| k | integer | 否 | 返回结果数量（默认 5，范围 1-20） |
| exclude_self | boolean | 否 | 是否排除用户自己的帖子（默认 true） |

**响应示例**:
```json
{
  "posts": [
    {
      "user_id": "user_002",
      "username": "其他用户",
      "timestamp": "2025-10-30T12:00:00",
      "emotion_tag": "happy",
      "emotion_intensity": 8,
      "content": "今天也很开心！",
      "similarity": 0.95
    }
  ],
  "total": 1
}
```

**响应参数说明**:
| 参数 | 类型 | 说明 |
|------|------|------|
| posts | array | 推荐的共鸣帖子列表 |
| total | integer | 推荐数量 |
| similarity | float | 相似度分数（0-1，越高越相似） |

**检索算法**:
- 使用 FAISS IndexFlatIP（内积）+ L2 归一化实现余弦相似度
- 向量化：情感标签 + 强度 + 内容的组合向量

---

### 7. 问候语接口

```http
POST /greeting
```

**功能**: 基于用户历史生成个性化问候

**请求体**:
```json
{
  "user_id": "user_001",
  "username": "测试用户",
  "max_greetings": 3
}
```

**请求参数说明**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id | string | 是 | 用户 ID |
| username | string | 否 | 用户名（默认"朋友"） |
| max_greetings | integer | 否 | 最多生成的问候数量（默认 3，范围 1-10） |

**响应示例**:
```json
{
  "greetings": [
    "你昨天说你要考试了，有点紧张。今天考得怎么样呀？"
  ],
  "context_posts": [
    {
      "user_id": "user_001",
      "username": "测试用户",
      "timestamp": "2025-10-30T12:00:00",
      "emotion_tag": "anxious",
      "emotion_intensity": 7,
      "content": "明天要考试了，有点紧张"
    }
  ]
}
```

**响应参数说明**:
| 参数 | 类型 | 说明 |
|------|------|------|
| greetings | array | 问候语列表 |
| context_posts | array | 参考的历史帖子（六字段） |

**生成逻辑**:
1. 从用户私有数据库获取最近的帖子
2. 基于历史情绪和内容生成个性化问候
3. 如无历史记录，返回通用问候

---

### 8. 跟进消息接口

```http
POST /follow_up
```

**功能**: 发帖后生成跟进消息

**请求体**:
```json
{
  "user_id": "user_001",
  "post_id": 123,
  "had_conversation": true
}
```

**请求参数说明**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id | string | 是 | 用户 ID |
| post_id | integer | 是 | 帖子 ID |
| had_conversation | boolean | 是 | 发帖前是否有过对话 |

**响应示例**:
```json
{
  "follow_up_message": "你现在感觉好些了吗？没关系，我一直都在的。",
  "post_info": {
    "user_id": "user_001",
    "username": "测试用户",
    "timestamp": "2025-10-31T12:00:00",
    "emotion_tag": "sad",
    "emotion_intensity": 6,
    "content": "今天心情不太好"
  }
}
```

**响应参数说明**:
| 参数 | 类型 | 说明 |
|------|------|------|
| follow_up_message | string | 跟进消息 |
| post_info | object | 帖子信息（六字段） |

**跟进消息类型**:
- **交流后发帖**: "你现在感觉好些了吗？没关系，我一直都在的。"
- **直接发帖（负面）**: "发生什么了？想聊一聊吗？你好像..."
- **直接发帖（正面）**: "将喜悦传播出去，快乐加倍！"

---

## 数据结构

### 六字段帖子结构
所有帖子（Post）严格遵循以下六字段结构：

```python
{
  "user_id": str,          # 用户 ID（唯一）
  "username": str,         # 用户名（可重复）
  "timestamp": str,        # 发帖时间（ISO 8601 格式）
  "emotion_tag": str,      # 情感标签
  "emotion_intensity": int, # 情绪强度（1-10）
  "content": str           # 帖子内容
}
```

---

## 错误处理

所有错误响应遵循以下格式：

```json
{
  "detail": "错误描述信息"
}
```

**常见错误状态码**:
- `400 Bad Request`: 请求参数错误
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

---

## 配置说明

### 1. API 密钥配置 (`llm/config.py`)

```python
# SiliconFlow API 配置
SILICONFLOW_API_KEY = "your-api-key-here"
SILICONFLOW_CHAT_URL = "https://api.siliconflow.cn/v1/chat/completions"
SILICONFLOW_EMBEDDING_URL = "https://api.siliconflow.cn/v1/embeddings"

# 模型配置
CHAT_MODEL = "Pro/deepseek-ai/DeepSeek-V3.2-Exp"
EMBEDDING_MODEL = "Qwen/Qwen3-Embedding-8B"

# 数据库配置
DATABASE_PATH = "data/posts.db"
VECTOR_DB_PATH = "data/faiss_indexes"

# 服务器配置
HOST = "0.0.0.0"
PORT = 8000
```

### 2. 情感标签配置 (`llm/emotion_config.py`)

支持的情感标签：
- `happy` (开心)
- `sad` (难过)
- `angry` (生气)
- `fear` (害怕)
- `surprised` (惊讶)
- `disgusted` (厌恶)
- `anxious` (焦虑)
- `excited` (兴奋)
- `grateful` (感恩)
- `lonely` (孤独)
- `confused` (困惑)
- `calm` (平静)
- `neutral` (中性)

可在此文件中添加、修改或删除情感标签。

### 3. 提示词配置 (`llm/prompts.py`)

包含所有 LLM 提示词模板：
- `SYSTEM_PROMPT_EMOTION_COMPANION`: 情绪伙伴系统提示词
- `get_emotion_analysis_prompt()`: 情绪分析提示词
- `SUMMARY_FROM_CONVERSATION_PROMPT`: 对话总结提示词
- `get_summary_from_text_prompt()`: 文本总结提示词
- `get_greeting_prompt()`: 问候语生成提示词
- `FOLLOW_UP_*`: 跟进消息模板

---

## 启动服务

### 开发环境

```bash
cd llm
uvicorn main:app --reload
```

### 生产环境

```bash
cd llm
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 访问 API 文档

启动服务后，访问以下地址查看交互式 API 文档：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 测试

运行集成测试：

```bash
cd llm
python test_stage5.py
```

---

## 技术细节

### RAG 向量检索
- **向量化模型**: Qwen/Qwen3-Embedding-8B
- **向量存储**: FAISS IndexFlatIP
- **相似度度量**: 余弦相似度（L2 归一化后的内积）
- **检索字段**: 情感标签 + 情绪强度 + 内容

### 对话管理
- **对话标识**: 使用 `user_id` 作为对话标识
- **历史保留**: 保留最近 10 轮对话历史（可在 `llm_service.py` 的 `ConversationManager` 中配置 `max_history` 参数）
- **存储方式**: 对话历史存储在内存中（服务重启后会丢失）
- **自动传递**: 每次对话自动加载并传递历史给 LLM
- **上下文感知**: LLM 可以基于历史对话提供更准确的回复

### 数据持久化
- **SQLite**: 存储帖子元数据
- **FAISS**: 存储向量索引
- **JSON**: 存储向量元数据

---

## 注意事项

1. **API 密钥**: 必须在 `llm/config.py` 中配置有效的 SiliconFlow API 密钥
2. **数据目录**: 首次运行时会自动创建 `data/` 目录
3. **向量维度**: 默认为 768 维（由 Embedding 模型决定）
4. **并发限制**: 建议根据 API 限额设置合理的并发数
5. **数据备份**: 定期备份 `data/` 目录（包含数据库和向量索引）
6. **对话历史**: 
   - 存储在内存中，服务重启后会丢失
   - 如需持久化，建议扩展 `ConversationManager` 使用数据库存储
   - 默认保留最近 10 轮对话，可通过修改 `max_history` 参数调整

---

## 版本历史

- **v1.0.0** (2025-10-31): 初始版本
  - 实现基础对话功能
  - 实现情绪分析
  - 实现发帖和共鸣推荐
  - 实现长期记忆和问候语
  - 基于 FAISS 的向量检索

---

## 联系方式

如有问题或建议，请查看项目 README 或提交 Issue。

