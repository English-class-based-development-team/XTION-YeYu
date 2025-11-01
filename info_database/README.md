# 个人信息数据库模块

> 为微信小程序"情绪记录与共鸣社区"提供用户资料、共鸣浏览记录、保存对话和情绪统计功能

## 📋 目录

- [功能概述](#功能概述)
- [数据结构](#数据结构)
- [API 接口](#api-接口)
- [安装与使用](#安装与使用)
- [定时任务](#定时任务)
- [测试](#测试)

---

## 功能概述

### 核心功能

1. **用户资料管理**
   - 存储用户基本信息（昵称、头像、问候语）
   - 支持微信用户 ID 绑定
   - 记录用户加入日期和陪伴天数

2. **共鸣浏览记录**
   - 记录用户查看过的共鸣帖子
   - 自动维护最多 25 条记录（FIFO）
   - 完整保存帖子的六字段数据

3. **保存的对话**
   - 用户手动保存重要对话
   - 自动生成对话预览
   - 支持对话标题和完整消息记录

4. **情绪统计**
   - 计算最近 7 天的情绪分布
   - 生成情绪曲线数据（堆叠面积图）
   - 每天零点自动更新（定时任务）
   - 基于用户私有数据库统计

---

## 数据结构

### 1. 用户资料 (UserProfile)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 数据库主键 |
| user_id | String | 系统用户 ID（唯一） |
| wechat_user_id | String | 微信用户 ID（可选） |
| avatar | String | 头像（emoji 或 URL） |
| nickname | String | 昵称 |
| greeting | String | 个性化问候语 |
| join_date | DateTime | 加入日期 |
| created_at | DateTime | 创建时间 |
| updated_at | DateTime | 更新时间 |

### 2. 共鸣浏览记录 (ResonanceHistory)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 数据库主键 |
| user_id | String | 用户 ID |
| post_id | Integer | 帖子 ID |
| viewed_at | DateTime | 查看时间 |
| post_data | Text | 帖子数据（JSON，六字段） |

**注意**：每个用户最多保留 25 条记录，自动删除最旧的记录。

### 3. 保存的对话 (SavedConversation)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 数据库主键 |
| user_id | String | 用户 ID |
| conversation_id | String | 对话唯一标识 |
| title | String | 对话标题 |
| preview | Text | 对话预览 |
| messages | Text | 对话消息（JSON 数组） |
| saved_at | DateTime | 保存时间 |

### 4. 情绪统计 (EmotionStatistics)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 数据库主键 |
| user_id | String | 用户 ID |
| date | String | 统计日期 (YYYY-MM-DD) |
| emotion_data | Text | 情绪数据（JSON，7天数据） |
| updated_at | DateTime | 更新时间 |

**情绪数据格式示例**：
```json
{
  "success": true,
  "user_id": "user_001",
  "days": 7,
  "week_data": [
    {"date": "周一", "快乐": 20, "悲伤": 5, "焦虑": 15, "愤怒": 0, "平静": 30, "兴奋": 10, "疲惫": 12, "困惑": 8, "感恩": 10, "孤独": 5, "希望": 15, "恐惧": 3},
    {"date": "周二", "快乐": 30, "悲伤": 3, "焦虑": 10, "愤怒": 2, "平静": 25, "兴奋": 15, "疲惫": 8, "困惑": 5, "感恩": 15, "孤独": 2, "希望": 20, "恐惧": 0},
    ...
    {"date": "今天", "快乐": 26, "悲伤": 4, "焦虑": 14, "愤怒": 1, "平静": 32, "兴奋": 12, "疲惫": 10, "困惑": 6, "感恩": 20, "孤独": 3, "希望": 18, "恐惧": 2}
  ],
  "total_posts": 21
}
```

**支持的情绪标签**（共12种）：
- `happy` (快乐)
- `sad` (悲伤)
- `anxious` (焦虑)
- `angry` (愤怒)
- `calm` (平静)
- `excited` (兴奋)
- `tired` (疲惫)
- `confused` (困惑)
- `grateful` (感恩)
- `lonely` (孤独)
- `hopeful` (希望)
- `fearful` (恐惧)

---

## API 接口

所有接口的基础路径：`/profile`

### 1. 用户资料

#### 获取用户资料
```http
GET /profile/{user_id}
```

**响应示例**：
```json
{
  "id": 1,
  "user_id": "user_001",
  "wechat_user_id": "wx_12345",
  "avatar": "😊",
  "nickname": "测试用户",
  "greeting": "继续保持热爱",
  "join_date": "2025-01-01T00:00:00",
  "created_at": "2025-01-01T00:00:00",
  "updated_at": "2025-01-01T00:00:00"
}
```

#### 更新用户资料
```http
PUT /profile/{user_id}
Content-Type: application/json

{
  "avatar": "🌟",
  "nickname": "新昵称",
  "greeting": "新的问候语"
}
```

### 2. 漂流瓶列表

#### 获取我的漂流瓶
```http
GET /profile/{user_id}/bottles?limit=50&offset=0
```

**响应示例**：
```json
{
  "bottles": [
    {
      "id": 1,
      "user_id": "user_001",
      "username": "测试用户",
      "timestamp": "2025-01-01T12:00:00",
      "emotion_tag": "happy",
      "emotion_intensity": 8,
      "content": "今天心情很好！"
    }
  ],
  "total": 10
}
```

### 3. 共鸣浏览记录

#### 获取共鸣记录
```http
GET /profile/{user_id}/resonances?limit=25
```

**响应示例**：
```json
{
  "resonances": [
    {
      "id": 1,
      "user_id": "user_001",
      "post_id": 123,
      "viewed_at": "2025-01-01T12:00:00",
      "post_data": {
        "user_id": "user_002",
        "username": "其他用户",
        "emotion_tag": "calm",
        "content": "找到了内心的平静..."
      }
    }
  ],
  "total": 15
}
```

#### 添加共鸣记录
```http
POST /profile/{user_id}/resonances
Content-Type: application/json

{
  "post_id": 123,
  "post_data": {
    "user_id": "user_002",
    "username": "其他用户",
    "timestamp": "2025-01-01T12:00:00",
    "emotion_tag": "calm",
    "emotion_intensity": 7,
    "content": "找到了内心的平静..."
  }
}
```

### 4. 保存的对话

#### 获取保存的对话
```http
GET /profile/{user_id}/conversations?limit=50&offset=0
```

#### 保存对话
```http
POST /profile/{user_id}/conversations
Content-Type: application/json

{
  "conversation_id": "conv_001",
  "title": "关于焦虑的对话",
  "messages": [
    {"role": "user", "content": "我感觉很焦虑"},
    {"role": "assistant", "content": "能说说是什么让你焦虑吗？"}
  ],
  "preview": "我感觉很焦虑 能说说是什么让你焦虑吗？"
}
```

#### 删除保存的对话
```http
DELETE /profile/{user_id}/conversations/{conversation_id}
```

### 5. 情绪统计

#### 获取情绪统计
```http
GET /profile/{user_id}/emotion-stats?force_update=false
```

**参数**：
- `force_update`: 是否强制重新计算（默认 false，从缓存读取）

**响应示例**（为简化展示，仅显示部分情绪）：
```json
{
  "success": true,
  "user_id": "user_001",
  "start_date": "2025-01-01",
  "end_date": "2025-01-07",
  "days": 7,
  "week_data": [
    {"date": "周一", "快乐": 20, "悲伤": 5, "焦虑": 15, "平静": 30, "感恩": 10, "...": "其他情绪"},
    {"date": "周二", "快乐": 30, "悲伤": 3, "焦虑": 10, "平静": 25, "感恩": 15, "...": "其他情绪"},
    {"date": "周三", "快乐": 25, "悲伤": 8, "焦虑": 25, "平静": 20, "感恩": 8, "...": "其他情绪"},
    {"date": "周四", "快乐": 15, "悲伤": 6, "焦虑": 18, "平静": 35, "感恩": 12, "...": "其他情绪"},
    {"date": "周五", "快乐": 28, "悲伤": 4, "焦虑": 12, "平静": 28, "感恩": 18, "...": "其他情绪"},
    {"date": "周六", "快乐": 22, "悲伤": 2, "焦虑": 8, "平静": 40, "感恩": 15, "...": "其他情绪"},
    {"date": "今天", "快乐": 26, "悲伤": 4, "焦虑": 14, "平静": 32, "感恩": 20, "...": "其他情绪"}
  ],
  "total_posts": 21
}
```

**注意**：实际响应包含所有12种情绪标签的数据。

### 6. 统计概览

#### 获取个人中心统计
```http
GET /profile/{user_id}/stats
```

**响应示例**：
```json
{
  "bottles_count": 45,
  "resonances_count": 23,
  "conversations_count": 8,
  "companion_days": 30
}
```

---

## 安装与使用

### 1. 安装依赖

```bash
pip install -r llm/requirements.txt
```

主要依赖：
- `fastapi`: Web 框架
- `sqlalchemy`: ORM
- `apscheduler`: 定时任务
- `pydantic`: 数据验证

### 2. 启动服务

```bash
cd llm
python main.py
```

服务将在 `http://localhost:8000` 启动。

### 3. 查看 API 文档

启动服务后访问：
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 4. 数据库位置

默认数据库文件：`data/info_database.db`

---

## 定时任务

### 情绪统计自动更新

- **触发时间**：每天 00:00（零点）
- **任务内容**：遍历所有用户，更新情绪统计缓存
- **数据来源**：用户私有数据库（`user_private_table`）
- **统计范围**：最近 7 天

### 手动触发更新

```python
from info_database.scheduler import get_scheduler

scheduler = get_scheduler()
result = scheduler.run_now()  # 立即执行一次更新
print(result)
```

### 查看调度器状态

```python
from info_database.scheduler import get_scheduler

scheduler = get_scheduler()
status = scheduler.get_status()
print(f"运行状态: {status['is_running']}")
print(f"任务列表: {status['jobs']}")
```

---

## 测试

### 运行综合测试

```bash
cd info_database
python test_info_database.py
```

### 测试内容

1. ✓ 用户资料 CRUD
2. ✓ 共鸣浏览记录（25 条限制）
3. ✓ 保存的对话
4. ✓ 情绪统计
5. ✓ 数据库信息

### 测试 API 端点

```bash
# 获取用户资料
curl http://localhost:8000/profile/test_user_001

# 更新用户资料
curl -X PUT http://localhost:8000/profile/test_user_001 \
  -H "Content-Type: application/json" \
  -d '{"nickname":"新昵称","avatar":"🌟"}'

# 获取情绪统计
curl http://localhost:8000/profile/test_user_001/emotion-stats

# 获取统计概览
curl http://localhost:8000/profile/test_user_001/stats
```

---

## 文件结构

```
info_database/
├── __init__.py                         # 模块初始化
├── info_models.py                      # 数据模型定义
├── info_database.py                    # 数据库管理器
├── info_crud.py                        # CRUD 操作
├── info_schemas.py                     # API Schemas
├── emotion_statistics_service.py       # 情绪统计服务
├── scheduler.py                        # 定时任务调度器
├── info_api.py                         # API 路由
├── test_info_database.py              # 综合测试
└── README.md                           # 本文档
```

---

## 技术要点

1. **25 条限制实现**：使用 FIFO 队列，添加新记录时自动删除最旧的记录
2. **情绪统计缓存**：每天零点计算一次，API 优先从缓存读取
3. **微信用户绑定**：支持通过 `wechat_user_id` 关联微信用户
4. **前后端同步**：前端使用 localStorage 缓存，后端为主数据源

---

## 注意事项

1. **共鸣记录限制**：每个用户最多保留 25 条，超过会自动删除最旧的
2. **情绪统计更新**：默认每天零点自动更新，可以通过 API 强制刷新
3. **数据来源**：情绪统计基于用户私有数据库（`user_private_table`）
4. **时区设置**：定时任务使用服务器本地时间

---

## 常见问题

### Q: 如何修改定时任务的执行时间？

A: 修改 `scheduler.py` 中的 `CronTrigger` 参数：

```python
self.scheduler.add_job(
    self.update_all_emotion_stats,
    trigger=CronTrigger(hour=2, minute=30),  # 改为凌晨 2:30
    ...
)
```

### Q: 如何增加共鸣记录的保留数量？

A: 修改 `info_crud.py` 中的 `MAX_HISTORY_COUNT` 常量：

```python
class ResonanceHistoryCRUD:
    MAX_HISTORY_COUNT = 50  # 从 25 改为 50
```

### Q: 如何自定义情绪统计的天数？

A: 调用 API 时不支持自定义，但可以修改 `emotion_statistics_service.py`：

```python
def calculate_user_emotion_stats(user_id: str, days: int = 14):  # 从 7 改为 14
    ...
```

---

