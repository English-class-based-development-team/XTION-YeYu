# 情绪标签配置说明

## 📌 统一配置来源

所有情绪标签配置统一来自：`llm/emotion_config.py`

```python
from llm.emotion_config import EMOTION_TAGS_CN
```

## 🏷️ 支持的情绪标签（共12种）

| 英文标签 | 中文标签 | 说明 |
|---------|---------|------|
| `happy` | 快乐 | 积极愉悦的情绪 |
| `sad` | 悲伤 | 失落、难过的情绪 |
| `anxious` | 焦虑 | 担忧、不安的情绪 |
| `angry` | 愤怒 | 生气、不满的情绪 |
| `calm` | 平静 | 平和、放松的情绪 |
| `excited` | 兴奋 | 激动、期待的情绪 |
| `tired` | 疲惫 | 疲劳、倦怠的情绪 |
| `confused` | 困惑 | 迷茫、不确定的情绪 |
| `grateful` | 感恩 | 感激、感谢的情绪 |
| `lonely` | 孤独 | 孤单、寂寞的情绪 |
| `hopeful` | 希望 | 乐观、充满希望的情绪 |
| `fearful` | 恐惧 | 害怕、担心的情绪 |

## 📊 在情绪统计中的应用

### 1. 数据结构

每天的情绪统计包含所有12种情绪的数值：

```json
{
  "date": "今天",
  "快乐": 26,
  "悲伤": 4,
  "焦虑": 14,
  "愤怒": 1,
  "平静": 32,
  "兴奋": 12,
  "疲惫": 10,
  "困惑": 6,
  "感恩": 20,
  "孤独": 3,
  "希望": 18,
  "恐惧": 2
}
```

### 2. 计算逻辑

- **数据来源**：用户私有数据库中的帖子
- **时间范围**：最近7天
- **统计方式**：按日期累加各情绪的强度值
- **默认值**：没有帖子的日期，所有情绪值为 0

### 3. 前端展示建议

#### 堆叠面积图
适合展示所有12种情绪的时间趋势：

```tsx
import { AreaChart, Area } from 'recharts';

const emotionColors = {
  快乐: '#FFD89C',
  悲伤: '#9B9B9B',
  焦虑: '#FFB09C',
  愤怒: '#FF6B6B',
  平静: '#98D8C8',
  兴奋: '#FFE66D',
  疲惫: '#B4A7D6',
  困惑: '#C5AFA4',
  感恩: '#E89B6D',
  孤独: '#A0D8F1',
  希望: '#B4E7CE',
  恐惧: '#D4A5A5'
};

<AreaChart data={stats.week_data}>
  {Object.entries(emotionColors).map(([emotion, color]) => (
    <Area
      key={emotion}
      type="monotone"
      dataKey={emotion}
      stackId="1"
      stroke={color}
      fill={`url(#color${emotion})`}
    />
  ))}
</AreaChart>
```

#### 饼图
展示情绪分布比例：

```tsx
// 计算7天总和
const emotionTotals = {};
stats.week_data.forEach(day => {
  Object.keys(day).forEach(key => {
    if (key !== 'date') {
      emotionTotals[key] = (emotionTotals[key] || 0) + day[key];
    }
  });
});

// 过滤掉值为0的情绪
const pieData = Object.entries(emotionTotals)
  .filter(([_, value]) => value > 0)
  .map(([name, value]) => ({ name, value }));
```

## 🔄 数据流程

```
用户发帖
  ↓
[帖子数据] (包含 emotion_tag)
  ↓
用户私有数据库
  ↓
定时任务 (每天00:00)
  ↓
emotion_statistics_service.py
  ↓
读取 EMOTION_TAGS_CN 配置
  ↓
计算7天情绪统计
  ↓
存储到 emotion_statistics 表
  ↓
API 响应 (包含所有12种情绪数据)
```

## 🔧 配置管理

### 添加新情绪标签

1. 在 `llm/emotion_config.py` 中添加新标签：

```python
EMOTION_TAGS = [
    # ...现有标签
    'inspired',  # 新增
]

EMOTION_TAGS_CN = {
    # ...现有映射
    'inspired': '受启发',  # 新增
}
```

2. 无需修改 `info_database` 模块代码，会自动识别新标签

3. 前端需要相应更新颜色配置

### 修改标签名称

仅修改 `llm/emotion_config.py` 中的映射关系即可：

```python
EMOTION_TAGS_CN = {
    'happy': '开心',  # 从"快乐"改为"开心"
    # ...
}
```

## ⚠️ 注意事项

1. **不要在其他文件中硬编码情绪标签**
   - ❌ 错误：`emotions = ['快乐', '悲伤', '焦虑']`
   - ✅ 正确：`from llm.emotion_config import EMOTION_TAGS_CN`

2. **保持英文标签不变**
   - 数据库中存储的是英文标签（如 `happy`）
   - 仅在展示时转换为中文

3. **情绪统计包含所有标签**
   - 即使某个情绪值为0，也会在数据中出现
   - 前端可以选择性过滤显示

4. **兼容性**
   - 如果导入失败，会使用默认的12种情绪标签
   - 确保生产环境能正确导入配置

## 📝 版本历史

- **v1.0.0** (2025-01-01): 统一使用 emotion_config.py 配置
  - 支持12种情绪标签
  - 自动初始化所有情绪为0
  - 导入失败时提供默认配置

---

**配置文件**: `llm/emotion_config.py`  
**使用模块**: `info_database/emotion_statistics_service.py`

