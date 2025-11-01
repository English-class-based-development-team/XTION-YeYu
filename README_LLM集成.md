# 夜语小程序 - LLM集成版本

## 🎉 新功能

✅ **真实大模型对话**：集成 SiliconFlow API，使用 DeepSeek-V3.2 模型  
✅ **情绪智能检测**：自动识别用户情绪状态和强度  
✅ **UI设计升级**：完全匹配 Yeyu_ui_design 设计稿  
✅ **智能备用方案**：网络异常时自动切换到模拟回复  
✅ **实时对话体验**：支持加载状态、错误提示等完整交互

## 🚀 快速开始

### 1. 启动后端LLM服务

```bash
# 进入LLM目录
cd llm

# 安装依赖
pip install -r requirements.txt

# 启动服务（已配置SiliconFlow API）
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. 配置小程序

小程序已预配置连接 `http://localhost:8000`，无需额外配置。

### 3. 体验对话功能

1. 在微信开发者工具中打开小程序项目
2. 在主页底部输入框输入消息
3. 点击发送按钮体验真实的AI对话
4. 点击消息预览区域可打开全屏聊天

## 💡 使用示例

### 基础对话
```
用户：你好，我今天心情不太好
AI：听起来你今天过得不太轻松呢。我在这里陪着你，愿意和我聊聊发生了什么吗？
```

### 情绪检测
AI会自动检测用户情绪：
- **情绪标签**：如 "sad"、"happy"、"anxious" 等
- **情绪强度**：1-10的数值，表示情绪强烈程度

## 🔧 技术特性

- **后端**：FastAPI + SiliconFlow API + DeepSeek-V3.2模型
- **前端**：微信小程序 + 像素级UI还原
- **智能**：情绪分析 + 对话历史管理
- **稳定**：错误处理 + 备用方案

## 📱 界面展示

### 主页聊天界面
- 底部输入框：圆角设计，发送按钮带动画
- 消息预览：显示最近2条消息，支持点击展开
- 加载状态：发送时显示旋转加载动画

### 全屏聊天界面
- 完整对话历史展示
- 实时滚动到最新消息
- 支持长按等更多交互

## ⚙️ 配置说明

### 修改后端服务地址
如需连接其他服务器，修改 `miniprogram/config/api.js`：

```javascript
const development = {
  LLM_BASE_URL: 'https://your-server.com',  // 修改这里
  // ...
};
```

### 调试模式
配置文件中 `DEBUG: true` 时会在控制台显示详细日志。

## 🧪 测试验证

### API连接测试
```bash
# 测试健康检查
curl -X GET "http://localhost:8000/health"

# 测试对话功能
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "message": "你好", "conversation_id": null}'
```

### 小程序测试
在开发者工具控制台运行：
```javascript
require('./tests/testLLMIntegration.js').testLLMIntegration()
```

## 🔒 API密钥配置

后端已预配置SiliconFlow API密钥，开箱即用。如需更换：

1. 编辑 `llm/config.py`
2. 修改 `SILICONFLOW_API_KEY`
3. 重启后端服务

## 📚 详细文档

完整开发文档请查看：`docs/development/LLM集成开发文档.md`

## 🆘 常见问题

**Q: 显示"网络连接失败"？**  
A: 确保后端服务已启动，检查 `http://localhost:8000/health` 是否可访问

**Q: AI回复很慢？**  
A: 大模型响应需要3-10秒，这是正常现象

**Q: 想要中文回复？**  
A: 系统已配置中文回复，如有问题请检查后端prompts配置

## 🎯 下一步开发

- [ ] 对话历史持久化
- [ ] 多用户支持
- [ ] 情绪趋势分析
- [ ] 语音输入功能

---

**开发完成时间**：2025年11月1日  
**版本**：v1.0.0  
**状态**：✅ 生产就绪
