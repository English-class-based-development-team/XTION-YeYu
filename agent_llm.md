# 情绪记录与共鸣社区 - LLM 后端开发计划

## 项目概述
为微信小程序开发 LLM 后端服务，提供情绪共情、发帖总结、相似内容推荐、长期记忆等功能。

---

## 技术栈
- **LLM**: deepseek / 其他
- **向量数据库**: Chroma
- **框架**: LangChain
- **后端框架**: FastAPI
- **相似度度量**: 余弦相似度

---

## 数据结构规范

### 发帖数据结构（六字段）
```python
{
    "user_id": str,           # 用户唯一标识
    "username": str,          # 用户名（可重复）
    "post_time": datetime,    # 发帖时间（精确到秒）
    "emotion_tag": str,       # 情感标签（如：焦虑、喜悦、悲伤等）
    "emotion_intensity": int, # 情绪强度（1-10）
    "post_content": str       # 帖子文字内容
}
```

---

## 开发任务分解

### 阶段 1：项目基础架构

#### 任务 1.1：项目结构初始化
- [ ] 创建 `llm/` 目录结构
  - `llm/config/` - 配置文件
  - `llm/models/` - 数据模型
  - `llm/services/` - 业务逻辑服务
  - `llm/api/` - API 接口
  - `llm/database/` - 数据库操作
  - `llm/utils/` - 工具函数
  - `llm/prompts/` - 提示词模板
  - `llm/tests/` - 测试文件

#### 任务 1.2：配置文件设置
- [ ] 创建 `config.py`（LLM API 密钥、向量数据库路径等）
- [ ] 创建 `requirements.txt`（依赖包列表）
- [ ] 创建 `.env.example`（环境变量示例）

#### 测试任务 1：
- [ ] 验证项目结构完整性
- [ ] 测试配置文件加载是否正常

---

### 阶段 2：数据模型与数据库模块

#### 任务 2.1：数据模型定义
- [ ] 创建 `models/post.py` - 发帖数据模型（Pydantic）
- [ ] 创建 `models/conversation.py` - 对话历史模型
- [ ] 创建 `models/memory.py` - 长期记忆模型

#### 任务 2.2：Chroma 向量数据库封装
- [ ] 创建 `database/chroma_db.py`
  - 初始化 Chroma 客户端
  - 实现全局大数据库操作类 `GlobalPostDB`
  - 实现用户私有小数据库操作类 `UserPrivateDB`
  - 添加文档（向量化：情感标签 + 情绪强度 + 帖子内容）
  - 相似度检索（余弦相似度）
  - 返回完整六字段结构

#### 任务 2.3：数据库工具函数
- [ ] 创建 `database/db_manager.py`
  - 用户数据库初始化
  - 发帖数据存储（同时写入大库和私有库）
  - 数据查询与管理

#### 测试任务 2：
- [ ] 测试发帖数据模型验证
- [ ] 测试 Chroma 向量数据库连接
- [ ] 测试向量存储与检索功能
- [ ] 测试相似度计算准确性
- [ ] 测试私有库和全局库隔离性

---

### 阶段 3：LLM 对话核心服务

#### 任务 3.1：LLM 客户端封装
- [ ] 创建 `services/llm_client.py`
  - 初始化 LLM API 客户端
  - 通用对话接口
  - 流式输出支持（可选）
  - 错误处理与重试机制

#### 任务 3.2：共情对话服务
- [ ] 创建 `services/empathy_chat.py`
  - 共情式对话生成
  - 对话历史管理
  - 情绪识别与回应策略
  - 根据情绪强度调整语气

#### 任务 3.3：提示词模板设计
- [ ] 创建 `prompts/empathy_prompts.py`
  - 共情对话系统提示词
  - 积极情绪回应模板
  - 消极情绪回应模板
  - 开放式引导问题模板

#### 测试任务 3：
- [ ] 测试 LLM API 连接与响应
- [ ] 测试共情对话质量（多种情绪场景）
- [ ] 测试对话历史上下文管理
- [ ] 测试不同情绪强度的回应差异

---

### 阶段 4：情感分析模块

#### 任务 4.1：情感分析服务
- [ ] 创建 `services/emotion_analyzer.py`
  - 基于 LLM 的情感分析
  - 提取情感标签（焦虑、喜悦、悲伤、愤怒、平静等）
  - 量化情绪强度（1-10分）
  - 返回结构化结果

#### 任务 4.2：情感标签标准化
- [ ] 创建 `utils/emotion_tags.py`
  - 定义标准情感标签列表
  - 情感标签映射与规范化
  - 情绪强度校准

#### 测试任务 4：
- [ ] 测试多种情绪文本的标签提取准确性
- [ ] 测试情绪强度打分的合理性
- [ ] 测试边界情况（中性情绪、混合情绪）

---

### 阶段 5：发帖相关功能

#### 任务 5.1：发帖总结生成
- [ ] 创建 `services/post_summary.py`
  - 根据对话历史生成发帖总结草稿
  - 保留情绪核心内容
  - 控制字数与格式
  - 提供多个草稿选项（可选）

#### 任务 5.2：发帖后跟进服务
- [ ] 创建 `services/post_followup.py`
  - 判断用户是否先交流后发帖
  - 生成差异化跟进消息
    - 未交流直接发帖：引导式问候
    - 已交流后发帖：安慰/鼓励
  - 根据情感标签调整跟进语气

#### 任务 5.3：跟进消息提示词
- [ ] 创建 `prompts/followup_prompts.py`
  - 消极情绪+未交流
  - 消极情绪+已交流
  - 积极情绪+未交流
  - 积极情绪+已交流

#### 测试任务 5：
- [ ] 测试发帖总结生成质量
- [ ] 测试跟进消息的场景适配性
- [ ] 测试语气温暖度与共情度

---

### 阶段 6：RAG 共鸣推荐

#### 任务 6.1：相似帖子检索服务
- [ ] 创建 `services/rag_recommend.py`
  - 基于新发帖内容检索全局库
  - 使用三字段向量化（情感标签+强度+内容）
  - 余弦相似度排序
  - 返回 Top-K 个相似帖子（完整六字段）
  - 过滤掉用户自己的帖子

#### 任务 6.2：推荐结果优化
- [ ] 相似度阈值设置
- [ ] 时间衰减因子（可选，优先推荐较新帖子）
- [ ] 多样性优化（避免返回过于相似的帖子）

#### 测试任务 6：
- [ ] 测试相似帖子检索准确性
- [ ] 测试推荐结果多样性
- [ ] 测试过滤自己帖子功能
- [ ] 测试不同情绪类型的推荐效果

---

### 阶段 7：长期记忆与主动关怀

#### 任务 7.1：长期记忆服务
- [ ] 创建 `services/memory_service.py`
  - 从用户私有库检索历史记忆
  - 提取关键事件与情绪节点
  - 时间轴管理（昨天、上周、上月）
  - 记忆重要性评分

#### 任务 7.2：主动关怀生成
- [ ] 创建 `services/proactive_care.py`
  - 基于长期记忆生成主动问候
  - 延续性对话建议
  - 根据时间间隔调整关怀方式
  - 生成多条候选问候语

#### 任务 7.3：主动关怀提示词
- [ ] 创建 `prompts/proactive_prompts.py`
  - 延续性问候模板
  - 时间敏感问候（考试、重要事件后）
  - 情绪跟踪问候

#### 测试任务 7：
- [ ] 测试历史记忆检索准确性
- [ ] 测试主动问候的延续性与相关性
- [ ] 测试时间间隔对问候方式的影响
- [ ] 测试多种场景的关怀质量

---

### 阶段 8：API 接口开发

#### 任务 8.1：FastAPI 应用初始化
- [ ] 创建 `api/main.py` - FastAPI 应用入口
- [ ] 配置 CORS 中间件
- [ ] 错误处理中间件
- [ ] 日志记录

#### 任务 8.2：核心 API 端点
- [ ] `POST /chat` - 用户发送消息，获取共情回应
  - 输入：user_id, message, conversation_history
  - 输出：ai_response, emotion_analysis
  
- [ ] `POST /post/summary` - 根据对话生成发帖总结
  - 输入：user_id, conversation_history
  - 输出：summary_draft
  
- [ ] `POST /post/publish` - 发布帖子
  - 输入：user_id, username, post_content
  - 输出：post_id, emotion_tag, emotion_intensity, similar_posts
  
- [ ] `GET /post/followup` - 获取发帖后跟进消息
  - 输入：user_id, post_id, has_chatted_before
  - 输出：followup_message
  
- [ ] `GET /care/greeting` - 获取主动关怀问候
  - 输入：user_id
  - 输出：greeting_messages[]
  
- [ ] `GET /posts/recommend` - 获取相似帖子推荐
  - 输入：post_id
  - 输出：similar_posts[]

#### 任务 8.3：API 文档
- [ ] Swagger 自动文档配置
- [ ] 请求/响应示例
- [ ] API 使用说明文档

#### 测试任务 8：
- [ ] 测试所有 API 端点的可用性
- [ ] 测试请求参数验证
- [ ] 测试错误处理
- [ ] 测试并发请求
- [ ] 使用 Postman/curl 进行集成测试

---

### 阶段 9：系统集成与优化

#### 任务 9.1：完整流程集成测试
- [ ] 测试流程 A：先交流后发帖
  1. 用户聊天倾诉
  2. 生成发帖总结
  3. 发布帖子
  4. 获取跟进消息
  5. 获取相似帖子推荐
  
- [ ] 测试流程 B：直接发帖
  1. 直接发布帖子
  2. 获取跟进消息
  3. 获取相似帖子推荐

#### 任务 9.2：性能优化
- [ ] 向量检索性能测试
- [ ] LLM 响应时间优化
- [ ] 缓存策略（对话历史、检索结果）
- [ ] 异步处理优化

#### 任务 9.3：数据安全与隐私
- [ ] 用户数据隔离验证
- [ ] 私有库访问权限控制
- [ ] 敏感信息过滤

#### 测试任务 9：
- [ ] 完整用户场景端到端测试
- [ ] 压力测试（多用户并发）
- [ ] 数据一致性测试
- [ ] 隐私安全测试

---

### 阶段 10：部署准备

#### 任务 10.1：部署文档
- [ ] 创建 `README.md` - 项目说明
- [ ] 创建 `DEPLOY.md` - 部署指南
- [ ] 环境配置说明
- [ ] API 接口文档

#### 任务 10.2：Docker 容器化（可选）
- [ ] 创建 `Dockerfile`
- [ ] 创建 `docker-compose.yml`
- [ ] 容器化测试

#### 任务 10.3：监控与日志
- [ ] 日志系统配置
- [ ] 错误监控
- [ ] 性能监控

---

## 关键技术要点

### 1. 向量化策略
```python
# 仅使用三个字段进行向量化
text_for_embedding = f"情感：{emotion_tag}，强度：{emotion_intensity}，内容：{post_content}"
```

### 2. 共情语气指南
- **积极情绪**：感染式积极反馈、鼓励分享
- **消极情绪**：倾听陪伴、不评判、开放式引导
- **简短温暖**：避免说教、避免过度追问

### 3. RAG 检索参数
- Top-K: 5-10 条
- 相似度阈值: 0.7+
- 排除自己的帖子

### 4. 主动关怀时机
- 用户登录时
- 距离上次重要事件特定时间后（1天、3天、1周）

### 5. 大模型提示词调用参考代码
```
import requests

url = "https://api.siliconflow.cn/v1/chat/completions"

payload = {
    "model": "Pro/deepseek-ai/DeepSeek-V3.2-Exp",
    "messages": [
        {
            "role": "user",
            "content": "What opportunities and challenges will the Chinese large model industry face in 2025?"
        }
    ]
}
headers = {
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

### 6. RAG 嵌入调用参考代码
```
import requests

url = "https://api.siliconflow.cn/v1/embeddings"

payload = {
    "model": "Qwen/Qwen3-Embedding-8B",
    "input": "Silicon flow embedding online: fast, affordable, and high-quality embedding services. come try it out!"
}
headers = {
    "Authorization": "Bearer <token>",
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)

print(response.json())
```

---



---

## 下一步行动
✅ 开始阶段 1：项目基础架构搭建

