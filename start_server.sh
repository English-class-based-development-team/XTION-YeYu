#!/bin/bash
# 启动后端服务脚本

# 激活 conda 环境并启动服务
source $(conda info --base)/etc/profile.d/conda.sh
conda activate floating_bowls

# 切换到 llm 目录
cd "$(dirname "$0")/llm"

# 启动服务
echo "正在启动后端服务..."
echo "服务地址: http://localhost:8000"
echo "API 文档: http://localhost:8000/docs"
echo "按 Ctrl+C 停止服务"
echo ""

uvicorn main:app --host 0.0.0.0 --port 8000 --reload

