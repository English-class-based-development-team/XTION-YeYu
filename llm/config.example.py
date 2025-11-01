"""
API 配置文件模板
请复制此文件为 config.py 并填入真实的 API 密钥
"""

# SiliconFlow API 配置
SILICONFLOW_API_KEY = "your_api_key_here"
SILICONFLOW_CHAT_URL = "https://api.siliconflow.cn/v1/chat/completions"
SILICONFLOW_EMBEDDING_URL = "https://api.siliconflow.cn/v1/embeddings"

# 模型配置
CHAT_MODEL = "deepseek-ai/DeepSeek-V3.2-Exp"
EMBEDDING_MODEL = "Qwen/Qwen3-Embedding-8B"

# 数据库配置
DATABASE_PATH = "data/posts.db"
VECTOR_DB_PATH = "data/faiss_indexes"

# 服务器配置
HOST = "0.0.0.0"
PORT = 8000

