# 后端服务启动说明

## 环境配置

本项目使用 conda 虚拟环境 `floating_bowls` 运行后端服务。

## 快速启动

### 方法一：使用启动脚本（推荐）

```bash
./start_server.sh
```

### 方法二：手动启动

```bash
# 1. 激活 conda 环境
conda activate floating_bowls

# 2. 进入 llm 目录
cd llm

# 3. 启动服务
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 服务地址

- **API 服务**: http://localhost:8000
- **API 文档 (Swagger)**: http://localhost:8000/docs
- **API 文档 (ReDoc)**: http://localhost:8000/redoc
- **健康检查**: http://localhost:8000/health

## 数据存储

所有 RAG 数据存储在 `info_database/` 目录：
- SQLite 数据库: `info_database/posts.db`
- FAISS 向量索引: `info_database/faiss_indexes/`

## 停止服务

在运行服务的终端中按 `Ctrl+C` 停止服务。

## 检查服务状态

```bash
# 检查服务是否运行
curl http://localhost:8000/health

# 查看进程
ps aux | grep "uvicorn main:app"
```

## 查看日志

服务日志会实时显示在终端中。如果使用后台运行，日志文件位于：
- `/tmp/floating_bowls_server.log`

## 故障排查

1. **端口被占用**: 确保 8000 端口未被占用
2. **依赖缺失**: 重新安装依赖 `pip install -r llm/requirements.txt`
3. **环境未激活**: 确保已激活 conda 环境 `conda activate floating_bowls`

