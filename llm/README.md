# 情绪记录与共鸣社区 LLM 后端

基于 FastAPI 的情绪记录与共鸣社区 LLM 后端服务，提供对话、情绪分析、RAG 向量检索和长期记忆功能。

## 技术栈

- **FastAPI**: 现代化 Python Web 框架
- **SQLite**: 轻量级关系数据库
- **FAISS**: 高效向量检索库（Facebook AI Similarity Search）
- **LangChain**: RAG 框架
- **SiliconFlow API**: LLM 和 Embedding 服务

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 配置 API 密钥

复制配置模板并填入真实的 API 密钥：

```bash
cp config.example.py config.py
```

编辑 `config.py`，填入您的 SiliconFlow API 密钥。

### 3. 启动服务

```bash
python main.py
```

或使用 uvicorn：

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. 访问 API 文档

启动后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 项目结构

```
llm/
├── config.py              # API 密钥配置（不提交到 Git）
├── config.example.py      # 配置模板
├── emotion_config.py      # 情感标签配置（可修改）
├── prompts.py             # 提示词配置（可修改）
├── main.py                # FastAPI 应用入口
├── requirements.txt       # Python 依赖
├── models.py              # 数据模型定义
├── database.py            # 数据库连接和初始化
├── crud.py                # 数据库 CRUD 操作
├── llm_service.py         # LLM 对话服务
├── emotion_analyzer.py    # 情绪分析服务
├── post_summarizer.py     # 帖子总结服务
├── vector_store.py        # FAISS 向量存储管理
├── embedding_service.py   # 向量化服务
├── rag_service.py         # RAG 检索服务
├── schemas.py             # API 数据模型
└── data/                  # 数据存储目录
    ├── posts.db           # SQLite 数据库
    └── faiss_indexes/     # FAISS 向量索引
        ├── global.index       # 全局向量索引
        ├── global.meta.json   # 全局元数据
        └── user_*/            # 用户私有索引
```

## API 接口

### 核心接口

| 方法 | 路径 | 功能 |
|------|------|------|
| GET | `/` | 服务状态检查 |
| GET | `/health` | 健康检查 |
| POST | `/chat` | 对话接口 |
| POST | `/analyze_emotion` | 情绪分析 |
| POST | `/generate_summary` | 生成总结草稿 |
| POST | `/publish_post` | 发布帖子 |
| GET | `/resonance_posts` | 获取共鸣推荐 |
| GET | `/greeting` | 获取问候语 |
| POST | `/follow_up` | 发帖后跟进 |

## 数据结构

### 发帖数据（六字段）

1. `user_id` (str): 用户 ID（唯一）
2. `username` (str): 用户名（可重复）
3. `timestamp` (datetime): 发帖时间（精确到秒）
4. `emotion_tag` (str): 情感标签
5. `emotion_intensity` (int): 情绪强度（1-10）
6. `content` (str): 帖子文字内容

### 支持的情感标签

情感标签定义在 `emotion_config.py` 中，可根据需求修改：

- 快乐 (happy)
- 悲伤 (sad)
- 焦虑 (anxious)
- 愤怒 (angry)
- 平静 (calm)
- 兴奋 (excited)
- 疲惫 (tired)
- 困惑 (confused)
- 感恩 (grateful)
- 孤独 (lonely)
- 希望 (hopeful)
- 恐惧 (fearful)

**修改情感标签：** 编辑 `emotion_config.py` 文件即可

## 可配置模块

本项目将可配置内容独立到专门的文件中，方便后期调整：

### 1. 情感标签配置 (`emotion_config.py`)
- 情感标签列表和中英文映射
- 情感验证和转换函数
- 修改后运行 `test_stage2.py` 测试

### 2. 提示词配置 (`prompts.py`)
- LLM 系统提示词（定义情绪伙伴角色）
- 情绪分析提示词
- 总结和问候提示词
- 跟进消息模板
- 修改后运行 `test_stage3.py` 测试

### 3. API 配置 (`config.py`)
- SiliconFlow API 密钥和端点
- 模型名称
- 数据库路径

## 开发与测试

每个功能模块都配备了独立的测试脚本：

- `test_database.py` - 数据库测试
- `test_llm.py` - LLM 服务测试
- `test_rag.py` - RAG 检索测试
- `test_api.py` - API 集成测试

运行测试：

```bash
python test_database.py
python test_llm.py
python test_rag.py
python test_api.py
```

## 注意事项

1. **API 密钥安全**: `config.py` 已添加到 `.gitignore`，请勿提交到版本控制
2. **数据持久化**: SQLite 和 FAISS 索引存储在 `data/` 目录
3. **CORS 配置**: 生产环境需限制允许的域名
4. **错误处理**: 所有 API 接口都包含完善的错误处理机制
5. **FAISS 索引**: 定期备份 FAISS 索引文件，支持增量更新

## 更新日志

### v1.0.0 (2025-10-31)
- 初始版本
- 实现基础项目结构
- 配置 FastAPI 应用入口

