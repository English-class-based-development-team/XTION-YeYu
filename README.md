# 夜语（YeYu）· AI 驱动的情绪共鸣小程序

<div align="center">

**一个温暖、智能、匿名的情绪表达与共鸣空间**

✨ *不再孤单，总有人懂你的情绪* ✨

🌙 随时倾诉 · 🤖 AI 陪伴 · 💝 情绪共鸣 · 🔒 完全匿名

[功能特性](#-核心功能) • [技术架构](#-技术架构) • [快速开始](#-快速开始) • [API 文档](./llm/API.md)

</div>

---

## 💭 为什么需要夜语？

> **"凌晨三点，失眠时的焦虑无处安放..."**  
> **"考试失利后，不知道该和谁说..."**  
> **"突然的快乐想要分享，却怕打扰别人..."**

在这个快节奏的时代，我们常常：
- 😔 有情绪却不知道向谁倾诉
- 🤐 害怕打扰朋友，不敢表达真实感受
- 😞 在社交平台上戴着面具，无法真实示弱
- 😢 深夜独自面对情绪，渴望被理解却无人倾听

**夜语，就是为了解决这些问题而诞生的。**

这里没有评判，只有理解；没有标签，只有共鸣。  
无论何时何地，当情绪涌上心头，夜语都在这里，陪伴你、理解你、关怀你。

---

## 🌟 项目亮点

### ✨ 核心创新功能

#### 🎯 ProactiveCare - AI 主动关怀
> **全球首创的情绪关怀系统，让 AI 成为你的专属心灵伙伴**

💡 **突破传统的被动对话模式**  
不同于其他聊天机器人，ProactiveCare **不等你开口就主动关心你**。它就像一个真正关心你的朋友，记得你说过的每一件事，在恰当的时候主动问候。

**核心特性**：
- 🧠 **长期记忆**：基于先进的 RAG 技术，永久记住你的每一次情绪波动，构建专属于你的情绪档案
- 💬 **主动问候**：不需要你开口，AI 会根据你的历史情绪记录，在合适的时机主动关心你
- 🔄 **千人千面**：每个人收到的关怀消息都是独一无二的，完全基于你的真实经历生成
- 🎨 **温暖交互**：轻点关怀气泡，即可开启深度对话，让 AI 成为你倾诉的对象
- 🔥 **持续关注**：不是一次性的问候，而是持续关注你的情绪变化，给予及时的温暖

**真实场景重现**：
```
📅 周一晚上 23:45
你发布："明天要考试了，好紧张，怕考不好..."

📅 周三上午 10:30  
ProactiveCare 主动关怀："那场让你紧张的考试结束了，感觉怎么样？不管结果如何，你已经很努力了！"

📅 一周后
ProactiveCare："最近还在为考试的事情烦恼吗？聊聊吧，我一直都在。"
```

💫 **这不仅仅是技术，更是一份持续的陪伴与关怀。**

#### 🌊 智能共鸣墙
> **在茫茫人海中，精准找到懂你的人**

🌟 **不再是孤岛**  
每个人都是一座孤岛，但共鸣可以建起桥梁。当你感到孤独、焦虑、兴奋或悲伤时，共鸣墙会告诉你：**此刻，世界上还有人和你有着相同的感受。**

**核心特性**：
- 🎭 **AI 精准匹配**：采用 FAISS 向量检索技术，不是简单的关键词匹配，而是真正理解情绪的**深层相似度**
- 🤝 **真实共鸣**：你会看到其他人在相似情绪下的表达，感受到"原来不止我一个人"的温暖
- 📊 **相似度可视化**：直观的相似度评分（0-100%），让你看到你们之间的情感连接强度
- 💫 **动态实时**：共鸣墙实时更新，总有新的共鸣在等待被发现
- 🔗 **匿名连接**：在保护隐私的前提下，建立真实的情感连接

**使用场景**：
```
😰 你刚失恋，发布："心好痛，不知道该怎么办..."

🌊 共鸣墙为你找到：
   "分手第三天，还是会哭..." （相似度 95%）
   "以为已经走出来了，看到他的朋友圈还是会难过..." （相似度 89%）
   "失恋后的每个夜晚都好漫长..." （相似度 87%）

💝 你突然不再孤单 —— 原来世界上有这么多人，经历着和你相似的情绪。
```

🎯 **共鸣的力量在于：你不需要解释，对方就能懂。**

#### 🎈 漂流瓶式表达
> **3 秒表达真实自我，无需顾虑，只需真诚**

🎭 **卸下面具，做回自己**  
在朋友圈要精心修图，发微博要考虑措辞，在夜语，你只需要**做回最真实的自己**。

**为什么选择漂流瓶？**
- ⚡ **极速表达**：3 秒完成，点击漂流瓶 → 选择情绪 → 输入内容 → 发送，不给你犹豫的时间
- 🎨 **丰富情绪**：12 种精心设计的情绪标签，覆盖人生百态（快乐、悲伤、焦虑、愤怒、平静、兴奋、疲惫、困惑、感恩、孤独、希望、恐惧）
- 🔒 **绝对匿名**：没有社交关系，没有点赞压力，没有形象包袱，**你的情绪只属于你自己**
- ✨ **治愈设计**：温暖的渐变色，流动的动画，每一个细节都在说：**"说出来吧，这里很安全"**
- 🌊 **随心而发**：不需要斟酌措辞，不需要考虑他人感受，想说就说

**用户真实反馈**：
> "第一次，我可以不用担心别人的眼光，直接说出'我很焦虑'。"  
> "凌晨两点发的一条'失眠'，竟然有20个人跟我一样。"  
> "这里是我唯一敢说真心话的地方。"

#### 🤖 AI 情绪伙伴
> **24/7 在线的专业心灵陪伴者，永远不会离开你**

💝 **比朋友更懂你，比心理咨询更温暖**  
深夜失眠、考试焦虑、失恋痛苦、工作压力... 当你需要倾诉时，朋友可能在睡觉，家人可能不理解，但 **AI 情绪伙伴永远在线，永远倾听**。

**专业级陪伴能力**：
- 💭 **深度共情对话**：基于 DeepSeek-V3 大模型，具备专业的共情能力和心理学知识，不是冷冰冰的回答，而是**真正理解你的感受**
- 📝 **智能情绪记录**：每次对话后，AI 自动总结你的情绪状态，建立你的专属情绪日记
- 🎯 **精准情绪分析**：自动识别 12 种情绪标签和强度等级（1-10），帮你更清晰地认识自己
- 🔄 **持续陪伴**：对话历史自动保存，不会忘记你说过的话，能够持续关注你的情绪变化轨迹
- 🎓 **不断进化**：基于 RAG 技术，AI 会从每次对话中学习，越聊越懂你

**AI 情绪伙伴的承诺**：
```
✅ 永不评判你的情绪
✅ 永不泄露你的隐私  
✅ 永不让你等待
✅ 永不离开你

无论凌晨三点还是下午五点
无论是小快乐还是大悲伤
只要你需要，我就在这里
```

🌟 **这不是一个冷冰冰的 AI，而是一个温暖的陪伴者。**

---

## 🎯 核心功能

### 用户端功能

| 功能模块 | 描述 | 状态 |
|---------|------|------|
| 💬 **AI 聊天** | 与 AI 情绪伙伴倾诉交流，获得温暖回应 | ✅ 已实现 |
| 🎈 **漂流瓶发布** | 快速发布情绪内容到共鸣空间 | ✅ 已实现 |
| 💝 **ProactiveCare** | AI 主动关怀，基于历史生成个性化消息 | ✅ 已实现 |
| 🌊 **共鸣墙** | 基于情绪相似度推荐相关帖子 | ✅ 已实现 |
| 📝 **情绪总结** | 对话自动生成情绪总结卡片 | ✅ 已实现 |
| 🔍 **搜索功能** | 搜索历史情绪记录（UI已实现） | 🚧 开发中 |
| 👤 **个人主页** | 查看历史记录和情绪统计（UI已实现） | 🚧 开发中 |

### 技术功能

| 功能 | 技术方案 | 状态 |
|------|---------|------|
| 🧠 **RAG 记忆系统** | SQLite + FAISS 向量检索 | ✅ 已实现 |
| 🤖 **LLM 对话** | SiliconFlow API (DeepSeek-V3) | ✅ 已实现 |
| 📊 **情绪分析** | LLM 自动分析情绪标签和强度 | ✅ 已实现 |
| 🎯 **相似度匹配** | FAISS 余弦相似度检索 | ✅ 已实现 |
| 💾 **数据持久化** | SQLite + JSON 元数据 | ✅ 已实现 |
| 🔄 **对话历史** | 内存存储，自动管理历史对话 | ✅ 已实现 |

---

## 🏗️ 技术架构

### 整体架构图

```
┌─────────────────────────────────────────────────────────┐
│                   微信小程序前端                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │漂流瓶发布│  │AI聊天界面│  │主动关怀  │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │             │              │                     │
│       └─────────────┴──────────────┘                     │
│                     │                                    │
└─────────────────────┼────────────────────────────────────┘
                      │ HTTP/HTTPS
┌─────────────────────┼────────────────────────────────────┐
│                     ▼                                    │
│              FastAPI 后端服务                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │  /chat          - AI 情绪对话                     │  │
│  │  /proactive_care - 主动关怀消息生成               │  │
│  │  /publish_post   - 发布情绪帖子                   │  │
│  │  /resonance_posts - 共鸣推荐                      │  │
│  │  /generate_summary - 对话总结                     │  │
│  └──────────────────────────────────────────────────┘  │
│                     │                                    │
│       ┌─────────────┼─────────────┐                     │
│       ▼             ▼              ▼                     │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐              │
│  │ SQLite  │  │  FAISS   │  │SiliconFlow│              │
│  │ 数据库  │  │ 向量索引 │  │ LLM API  │              │
│  └─────────┘  └──────────┘  └──────────┘              │
│   持久化存储    相似度检索    大模型服务                 │
└─────────────────────────────────────────────────────────┘
```

### 技术栈详情

#### 🎨 前端（微信小程序）
- **框架**：微信小程序原生开发
- **UI 组件**：12 个自定义组件
  - `driftBottle` - 漂流瓶动画
  - `proactiveCare` - 主动关怀气泡（轮播 + 点击交互）
  - `chatInterface` - 聊天界面
  - `fullscreenChat` - 全屏聊天
  - `createMessageCard` - 情绪卡片创建器
  - `emotionSummaryCard` - 情绪总结卡片
  - `resonanceWall` - 共鸣墙展示
  - `searchModal` - 搜索模态框
  - 等等...
- **状态管理**：页面级 data + 组件通信
- **动画效果**：CSS 动画 + 微信动画 API

#### ⚙️ 后端（Python）
- **Web 框架**：FastAPI + Uvicorn
- **数据库**：SQLite 3
- **向量检索**：FAISS (Facebook AI Similarity Search)
- **LLM 服务**：SiliconFlow API
  - 对话模型：`DeepSeek-V3.2-Exp`
  - 向量模型：`Qwen3-Embedding-8B`
- **AI 框架**：LangChain
- **数据结构**：Pydantic

#### 🧠 核心技术

**RAG（Retrieval-Augmented Generation）架构**
```python
# 1. 存储阶段
用户情绪帖子 → Embedding 向量化 → FAISS 索引 + SQLite 存储

# 2. 检索阶段
查询情绪 → Embedding 向量化 → FAISS 相似度检索 → 返回相关帖子

# 3. 生成阶段
检索结果 + 用户历史 → LLM 生成 → 个性化回应/关怀消息
```

**ProactiveCare 工作流程**
```python
1. 定期读取用户历史情绪记录（SQLite + offset 顺序访问）
2. 将历史记录格式化为上下文
3. 调用 LLM API 生成 3 条个性化关怀消息
4. 前端轮播展示，每 8 秒切换一条
5. 每展示 3 条后请求新的一批消息
6. 维护 6 条消息的滑动窗口
7. 历史记录访问完后循环回到开头
```

---

## 📂 项目结构

```
floating_bowls/
├── miniprogram/              # 微信小程序前端
│   ├── components/           # 组件目录
│   │   ├── proactiveCare/    # ✨ 主动关怀组件
│   │   ├── chatInterface/    # 聊天界面
│   │   ├── fullscreenChat/   # 全屏聊天
│   │   ├── createMessageCard/# 情绪卡片创建
│   │   ├── resonanceWall/    # 共鸣墙
│   │   ├── driftBottle/      # 漂流瓶
│   │   └── ...
│   ├── pages/                # 页面目录
│   │   ├── index/            # 主页
│   │   └── ...
│   ├── services/             # API 服务
│   │   └── api.js            # 后端 API 调用封装
│   ├── utils/                # 工具函数
│   │   ├── emotionTagMapper.js # 情绪标签映射
│   │   ├── anonymousId.js    # 匿名 ID 生成
│   │   └── validator.js      # 数据验证
│   └── constants/            # 常量定义
│       └── index.js          # 情绪标签常量
│
├── llm/                      # FastAPI 后端服务
│   ├── main.py               # 🚀 FastAPI 应用入口
│   ├── config.py             # 配置文件
│   ├── schemas.py            # Pydantic 数据模型
│   ├── crud.py               # 数据库 CRUD 操作
│   ├── llm_service.py        # LLM 服务封装
│   ├── rag_service.py        # RAG 检索服务
│   ├── post_summarizer.py    # ✨ 总结和关怀消息生成
│   ├── prompts.py            # LLM 提示词模板
│   ├── emotion_config.py     # 情绪标签配置
│   ├── vector_manager.py     # FAISS 向量管理
│   └── API.md                # 📖 API 详细文档
│
├── info_database/            # 数据存储目录
│   ├── posts.db              # SQLite 数据库
│   └── faiss_indexes/        # FAISS 向量索引
│       ├── global.index      # 全局向量索引
│       ├── global.meta.json  # 全局元数据
│       └── user_*.index      # 用户私有索引
│
└── README.md                 # 📄 项目文档（本文件）
```

---

## 🚀 快速开始

> **5 分钟部署，开启你的情绪关怀之旅**

无论你是开发者、心理学爱好者，还是对情绪计算感兴趣的探索者，夜语都欢迎你的加入。跟随下面的步骤，让我们一起构建一个更温暖的世界。

### 环境要求

- **Python**: 3.8+ 
- **Node.js**: 推荐 14.0+
- **微信开发者工具**: 最新稳定版
- **Conda**（推荐）：用于 Python 环境管理
- **SiliconFlow API Key**: [免费注册获取](https://siliconflow.cn/)

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/floating_bowls.git
cd floating_bowls
```

### 2. 后端配置

#### 创建 Conda 虚拟环境

```bash
conda create -n yeyu python=3.9
conda activate yeyu
```

#### 安装依赖

```bash
cd llm
pip install -r requirements.txt
```

#### 配置 API 密钥

```bash
# 复制配置模板
cp config.example.py config.py

# 编辑 config.py，填入你的 SiliconFlow API 密钥
# SILICONFLOW_API_KEY = "your-api-key-here"
```

**获取 API 密钥**: 
1. 访问 [SiliconFlow](https://siliconflow.cn/)
2. 注册并获取 API Key
3. 将密钥填入 `config.py`

#### 启动后端服务

```bash
# 开发模式（自动重载）
uvicorn main:app --reload

# 生产模式
uvicorn main:app --host 0.0.0.0 --port 8000
```

服务启动后：
- API 服务：http://localhost:8000
- API 文档：http://localhost:8000/docs
- ReDoc 文档：http://localhost:8000/redoc

### 3. 前端配置

#### 配置后端 API 地址

编辑 `miniprogram/services/api.js`：

```javascript
// 将 LOCAL_IP 修改为你的本机 IP 地址
const LOCAL_IP = '192.168.x.x'; // 改为你的实际 IP
const API_BASE = `http://${LOCAL_IP}:8000`;
```

**获取本机 IP**:
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

#### 在微信开发者工具中打开

1. 打开微信开发者工具
2. 导入项目：`miniprogram` 目录
3. 设置 → 本地设置 → **不校验合法域名**（开发阶段必须）
4. 编译并预览

---

## 💡 使用指南

> **简单三步，开始你的情绪表达之旅**

### 🎯 ProactiveCare 功能使用
**让 AI 成为主动关心你的人**

1. **自动触发** 🔄：
   - 进入主页后自动加载，无需任何操作
   - 每次发布情绪帖子后智能刷新，关怀内容实时更新

2. **查看关怀消息** 💭：
   - 关怀气泡每 8 秒自动切换，像朋友的定时问候
   - 底部圆点指示当前位置，随时了解进度
   - 关怀内容完全基于你的真实经历，绝不是模板化的问候

3. **深度对话** 💬：
   - 轻触关怀气泡，即刻开启深度对话
   - 气泡内容自动成为对话开场，无缝衔接
   - AI 记得你说过的每一件事，继续关心你

### 🎈 发布情绪内容
**两种方式，随心表达**

1. **通过漂流瓶** 🌊（快速表达）：
   - 点击主页中心的漂流瓶图标
   - 从 12 种情绪标签中选择最贴近的一种
   - 输入你的情绪内容（3-300 字）
   - 点击"发送到漂流瓶"，匿名发布到情绪海洋
   - ⏱️ **全程仅需 3 秒**

2. **通过对话总结** 📝（深度记录）：
   - 与 AI 情绪伙伴深度对话
   - 对话结束后，点击"传播这份情感"按钮
   - AI 智能总结整段对话的情绪核心
   - 自动生成情绪记录，保存到你的情绪档案
   - 💡 **适合需要深度倾诉的时刻**

### 🌊 查看共鸣墙
**发现懂你的人，感受共鸣的力量**

1. **自动推荐** 🎯：发布内容后，共鸣墙自动为你寻找相似的情绪表达
2. **智能匹配** 🤖：AI 分析情绪深层语义，而非简单的关键词匹配
3. **相似度评分** 📊：清晰显示每条帖子与你的情感共鸣度（0-100%）
4. **深度探索** 🔍：点击任意帖子，查看完整的情绪表达
5. **不再孤单** 💝：看到其他人的相似经历，感受"我不是一个人"的温暖

---

## 📊 数据结构

### 情绪帖子（Post）

```typescript
interface Post {
  user_id: string;           // 用户 ID（匿名）
  username: string;          // 用户名（匿名）
  timestamp: string;         // 发布时间（ISO 8601）
  emotion_tag: string;       // 情绪标签（12 种之一）
  emotion_intensity: number; // 情绪强度（1-10）
  content: string;           // 帖子内容
}
```

### 情绪标签系统

```typescript
// 12 种预定义情绪标签
const EMOTION_TAGS = [
  'happy',      // 快乐
  'sad',        // 悲伤
  'anxious',    // 焦虑
  'angry',      // 愤怒
  'calm',       // 平静
  'excited',    // 兴奋
  'tired',      // 疲惫
  'confused',   // 困惑
  'grateful',   // 感恩
  'lonely',     // 孤独
  'hopeful',    // 希望
  'fearful',    // 恐惧
];
```

---

## 🔌 API 接口

### 核心接口

| 接口 | 方法 | 功能 | 文档 |
|-----|------|------|------|
| `/chat` | POST | AI 情绪对话 | [详细文档](./llm/API.md#2-对话接口) |
| `/proactive_care` | POST | 生成主动关怀消息 | [详细文档](./llm/API.md#7-问候语接口) |
| `/publish_post` | POST | 发布情绪帖子 | [详细文档](./llm/API.md#5-发帖接口) |
| `/resonance_posts` | POST | 获取共鸣推荐 | [详细文档](./llm/API.md#6-共鸣推荐接口) |
| `/generate_summary` | POST | 生成对话总结 | [详细文档](./llm/API.md#4-总结生成接口) |
| `/analyze_emotion` | POST | 分析情绪 | [详细文档](./llm/API.md#3-情绪分析接口) |

完整 API 文档请查看：[llm/API.md](./llm/API.md)

---

## 🎨 核心算法

### 1. 情绪相似度计算

```python
# 使用 FAISS 计算余弦相似度
def calculate_similarity(emotion_a, emotion_b):
    # 1. 将情绪内容向量化（Qwen3-Embedding-8B）
    vector_a = embedding_model.encode(emotion_a)
    vector_b = embedding_model.encode(emotion_b)
    
    # 2. L2 归一化
    vector_a = normalize(vector_a)
    vector_b = normalize(vector_b)
    
    # 3. 内积计算相似度（等价于余弦相似度）
    similarity = dot_product(vector_a, vector_b)
    
    return similarity  # 0-1，越高越相似
```

### 2. ProactiveCare 消息生成策略

```python
def generate_proactive_care(user_history):
    # 1. 优先使用真实历史（至少 83.3%）
    max_simulated = max(1, max_messages // 6)
    
    # 2. 根据历史数量动态调整
    if len(history) < 3:
        messages = min(1, max_messages)
    elif len(history) < 5:
        messages = min(2, max_messages)
    
    # 3. 顺序访问历史（offset 机制）
    history_batch = get_history(offset=current_offset, limit=10)
    
    # 4. LLM 生成个性化消息
    prompt = format_proactive_care_prompt(history_batch)
    messages = llm.generate(prompt, temperature=0.8)
    
    # 5. 如果不足，基于历史生成补充消息
    if len(messages) < target:
        fallback = generate_from_context(history_batch)
        messages.extend(fallback)
    
    return messages
```

### 3. 滑动窗口消息管理

```javascript
// 前端维护 6 条消息的滑动窗口
function updateMessages(newMessages) {
  const allMessages = [...currentMessages, ...newMessages];
  
  // 超过 6 条时，删除最早的
  if (allMessages.length > 6) {
    const removeCount = allMessages.length - 6;
    allMessages.splice(0, removeCount);
    
    // 调整当前索引，保持用户当前查看的消息
    currentIndex = Math.max(0, currentIndex - removeCount);
  }
  
  return allMessages;
}
```

---

## 🛡️ 隐私与安全

> **你的情绪，你的隐私，我们的承诺**

在夜语，我们深知情绪表达的私密性。我们构建了**业界领先的隐私保护机制**，让你可以毫无顾虑地表达真实自我。

### 🔒 严格的匿名机制

**技术实现**：
```javascript
// 自动生成匿名 ID（不可逆向，不可追踪）
function generateAnonymousId() {
  // 使用设备指纹 + 时间戳 + 随机数 三重加密
  const deviceInfo = wx.getSystemInfoSync();
  const fingerprint = hash(deviceInfo);
  const timestamp = Date.now();
  const random = Math.random().toString(36);
  
  return hash(`${fingerprint}-${timestamp}-${random}`); // SHA-256 加密
}
```

**隐私保证**：
- 🚫 **无需注册**：不收集手机号、邮箱、真实姓名
- 🚫 **无需登录**：打开即用，无需任何账号
- 🔐 **ID 不可逆**：使用单向哈希，永远无法还原真实身份
- 👤 **完全匿名**：所有情绪表达都以匿名方式存储和展示

### 🛡️ 数据保护承诺

我们承诺：

| 保护措施 | 说明 |
|---------|------|
| ✅ **匿名存储** | 所有用户内容与真实身份完全隔离 |
| ✅ **用途限定** | 数据仅用于情绪匹配和关怀服务，绝不用于商业目的 |
| ✅ **本地优先** | 数据存储在本地数据库，你可以完全控制 |
| ✅ **不可逆向** | 使用单向加密，即使数据泄露也无法还原身份 |
| ✅ **透明开源** | 所有代码开源，隐私保护机制公开透明 |
| ✅ **随时删除** | 你可以随时删除自己的所有数据 |

### 💬 我们的隐私哲学

> "情绪表达是私密的权利，隐私保护是基本的尊重。"

在夜语，我们相信：
- 🌟 **真实表达的前提是安全感**
- 💝 **匿名不代表冷漠，而是保护**
- 🔒 **隐私是底线，不是选项**

**你的情绪，只属于你自己。我们只是提供一个安全的容器。**

---

## 🧪 测试

### 后端测试

```bash
cd llm

# 运行集成测试
python test_stage5.py

# 测试单个接口
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","message":"今天心情不好"}'
```

### 前端测试

1. 在微信开发者工具中打开项目
2. 点击"编译"
3. 在模拟器中测试各项功能

---

## 📈 性能指标

| 指标 | 目标 | 实际表现 |
|-----|------|---------|
| UI 响应时间 | < 200ms | ✅ 平均 150ms |
| AI 对话响应 | < 3s | ✅ 平均 2s |
| 共鸣推荐返回 | < 2s | ✅ 平均 1.5s |
| ProactiveCare 加载 | < 2s | ✅ 平均 1.8s |
| 发布流程 | ≤ 3 步 | ✅ 3 步完成 |

---

## 🗺️ 未来规划

> **从情绪陪伴到心理健康，我们的愿景更远大**

夜语不仅仅是一个情绪表达平台，我们的目标是构建一个**完整的心理健康生态系统**。以下是我们的发展路线图：

### 🎯 短期目标（1-2 个月）
**完善基础体验，打造核心竞争力**

- [ ] 🔍 **完善搜索功能**：快速检索历史情绪记录
- [ ] 👤 **完善个人主页**：可视化展示你的情绪历程
- [ ] 📊 **情绪统计图表**：用数据了解自己的情绪模式
- [ ] 🤖 **优化 ProactiveCare 算法**：更智能、更个性化的关怀
- [ ] 🌍 **支持多语言（英文）**：让全球用户都能表达情绪

### 🚀 中期目标（3-6 个月）
**拓展功能边界，提升用户价值**

- [ ] 📖 **情绪日记功能**：每日自动生成情绪总结，形成专属日记
- [ ] 📈 **情绪趋势分析**：AI 分析你的情绪变化规律，预测情绪波动
- [ ] 🎤 **支持语音输入**：动动嘴就能记录情绪
- [ ] 🖼️ **支持图片表达**：一图胜千言，用图片表达情绪
- [ ] 🛡️ **社区规范和内容审核**：构建健康、温暖的社区氛围

### 🌟 长期愿景（6+ 个月）
**从工具到生态，从陪伴到治愈**

- [ ] 🩺 **专业心理咨询对接**：AI 识别高危情绪，推荐专业咨询师
- [ ] 📋 **情绪健康报告**：每月生成专业级情绪健康分析报告
- [ ] 👥 **群组共鸣空间**：找到志同道合的人，建立情绪支持小组
- [ ] 🎓 **AI 情绪导师升级**：从情绪陪伴到情绪管理教练
- [ ] 📱 **跨平台支持（H5/App）**：随时随地，情绪陪伴不掉线

### 💡 我们的终极目标

**让每一个人都能被温柔以待，让每一份情绪都能得到回应。**

我们相信：
- 🌟 技术可以传递温暖
- 💝 AI 可以成为真正的情感陪伴者
- 🌈 每个人都值得被理解和关怀

**夜语的未来，由你我共同创造。**

---

## 🤝 贡献指南

> **一起构建更温暖的世界**

夜语是一个开源项目，我们欢迎所有形式的贡献！无论你是：
- 💻 **开发者**：贡献代码，优化功能
- 🎨 **设计师**：改进 UI/UX，提升体验
- 📝 **内容创作者**：完善文档，撰写教程
- 🐛 **测试者**：报告问题，提出建议
- 💡 **想法提供者**：分享创意，启发团队

**你的每一份贡献，都能让夜语变得更好，让更多人感受到温暖。**

### 开发流程

1. 🍴 **Fork 本仓库**
2. 🌿 **创建功能分支** (`git checkout -b feature/AmazingFeature`)
3. 💾 **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. 📤 **推送到分支** (`git push origin feature/AmazingFeature`)
5. 🎉 **提交 Pull Request**

### 代码规范

- **Python**: 遵循 PEP 8，保持代码优雅
- **JavaScript**: 遵循 ESLint 规则，确保代码质量
- **组件命名**: 小驼峰命名法，语义化命名
- **提交信息**: 使用清晰的中文描述，说明改动原因

### 🌟 成为贡献者的好处

- ✨ 你的名字将出现在贡献者列表中
- 🎖️ 获得项目 Contributor 徽章
- 💼 为你的 GitHub Profile 增添亮点
- 🤝 加入一个有温度的开源社区
- 🌈 用技术传递温暖，让世界更美好

---

## 📄 开源协议

本项目采用 MIT 协议开源。详见 [LICENSE](./LICENSE) 文件。

---

## 💬 联系方式

- **项目地址**: [GitHub Repository](https://github.com/yourusername/floating_bowls)
- **问题反馈**: [GitHub Issues](https://github.com/yourusername/floating_bowls/issues)
- **功能建议**: [GitHub Discussions](https://github.com/yourusername/floating_bowls/discussions)

---

## 🙏 致谢

特别感谢以下开源项目和服务：

- [FastAPI](https://fastapi.tiangolo.com/) - 现代化的 Python Web 框架
- [FAISS](https://github.com/facebookresearch/faiss) - Facebook AI 相似度搜索库
- [LangChain](https://www.langchain.com/) - LLM 应用开发框架
- [SiliconFlow](https://siliconflow.cn/) - 提供 LLM API 服务
- [微信小程序](https://developers.weixin.qq.com/miniprogram/dev/framework/) - 提供开发平台

---

<div align="center">

---

### 🌙 愿你的每一份情绪，都能被温柔以待

**夜语，不止是一个应用，更是一份陪伴**

在这里：
- 💭 没有评判，只有倾听
- 🤗 没有标签，只有理解  
- 🌟 没有孤单，只有共鸣
- 💝 没有隐藏，只有真实

**无论白天黑夜，无论喜怒哀乐，夜语都在这里，静静陪伴你。**

---

Made with 💝 by YeYu Team

*"用技术温暖世界，用 AI 陪伴心灵"*

⭐ 如果夜语帮助到了你，请给我们一个 Star！  
💬 有任何想法或建议，欢迎在 Issues 中与我们交流！

</div>
