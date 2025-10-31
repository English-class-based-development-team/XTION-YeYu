# Figma/React 设计转微信小程序规范

本文档规范如何将 `Yeyu_ui_design` 中的 Figma/React 设计转换为微信小程序代码，确保设计一致性。

---

## ⚠️ 核心原则：必须与设计完全一致

**重要：在开始转换之前，必须首先阅读并理解 `Yeyu_ui_design` 目录下的所有 React 组件代码。**

### 强制要求

1. **必须参考源代码**：转换前必须仔细阅读 `Yeyu_ui_design/components/` 目录下的对应 React 组件源代码，理解其：
   - 精确的颜色值（包括透明度和渐变）
   - 精确的圆角值、间距值、字体大小
   - 完整的动画效果和时序
   - 完整的交互逻辑和状态管理
   - 完整的布局结构和层级关系

2. **禁止自行设计**：**严禁**根据文档描述自行设计样式，**必须**严格按照 `Yeyu_ui_design` 中的实际代码实现进行转换。

3. **像素级还原**：所有视觉元素必须与设计稿达到像素级一致，包括：
   - 颜色值必须完全一致（不得使用近似色）
   - 圆角值必须完全一致（不得四舍五入）
   - 间距值必须完全一致（精确转换 px → rpx）
   - 字体大小必须完全一致（精确转换）
   - 阴影效果必须完全一致（包括模糊半径、偏移量、颜色）

4. **动画效果必须一致**：
   - 动画时长必须与设计一致
   - 动画缓动函数必须与设计一致
   - 动画延迟时间必须与设计一致
   - 动画属性变化必须与设计一致

5. **交互行为必须一致**：
   - 点击反馈效果必须一致
   - 输入框行为必须一致
   - 模态框显示/隐藏动画必须一致
   - 滚动行为必须一致

6. **验证方法**：
   - 转换完成后，必须对比小程序实现与 React 设计版本
   - 使用真机测试，确保视觉效果完全一致
   - 如有任何不一致，必须立即修正

---

## 📐 设计系统概览

**⚠️ 注意：以下颜色和样式定义来自 `Yeyu_ui_design` 源代码，转换时必须严格按照这些值，不得自行修改或使用近似值。**

### 主色调定义（必须严格按照这些值）

**必须参考 `Yeyu_ui_design/components/` 中的实际代码，以下值仅供参考：**

- **主色渐变**：`from-[#E89B6D] to-[#F3B89A]` → `linear-gradient(to right, #E89B6D, #F3B89A)` ⚠️ **必须使用精确值**
- **标签渐变**：`from-[#ff9966] to-[#ff8855]` → `linear-gradient(to right, #ff9966, #ff8855)` ⚠️ **必须使用精确值**
- **标签浅色渐变**：`from-[#ff9966]/20 to-[#ff8855]/20` → `linear-gradient(to right, rgba(255,153,102,0.2), rgba(255,136,85,0.2))` ⚠️ **必须使用精确值**
- **背景色**：`#fef8f3`（浅米色）⚠️ **必须使用精确值**
- **背景渐变**：`from-[#fef8f3] to-[#f5e6dc]` → `linear-gradient(to bottom, #fef8f3, #f5e6dc)` ⚠️ **必须使用精确值**
- **文字主色**：`#2a1a4d`（深紫色）⚠️ **必须使用精确值**
- **文字浅色**：`#2a1a4d/60` → `rgba(42,26,77,0.6)` ⚠️ **必须使用精确值**
- **文字占位符**：`#2a1a4d/40` → `rgba(42,26,77,0.4)` ⚠️ **必须使用精确值**

### 圆角规范
- **超大圆角**：`rounded-[32px]` → `border-radius: 32rpx`
- **大圆角**：`rounded-[24px]` → `border-radius: 24rpx`
- **中等圆角**：`rounded-[20px]` → `border-radius: 20rpx`
- **小圆角**：`rounded-[18px]` → `border-radius: 18rpx`
- **圆形**：`rounded-full` → `border-radius: 50%`

### 阴影规范
- **大阴影**：`shadow-2xl` → `box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25)`
- **中等阴影**：`shadow-lg` → `box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)`
- **小阴影**：`shadow-sm` → `box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05)`
- **阴影颜色**：根据设计调整，通常使用 `rgba(0,0,0,0.1)` 到 `rgba(0,0,0,0.25)`

---

## 🎨 颜色转换规则

**⚠️ 强制要求：所有颜色值必须从 `Yeyu_ui_design` 源代码中提取，不得自行定义或使用近似值。**

### Tailwind CSS → WXSS 颜色转换

**必须参考源代码中的实际颜色值，以下仅作示例：**

| Tailwind 类名 | 颜色值 | WXSS 转换 |
|--------------|--------|----------|
| `bg-[#fef8f3]` | `#fef8f3` | `background-color: #fef8f3;` |
| `text-[#2a1a4d]` | `#2a1a4d` | `color: #2a1a4d;` |
| `text-[#2a1a4d]/60` | `rgba(42,26,77,0.6)` | `color: rgba(42,26,77,0.6);` |
| `text-[#2a1a4d]/40` | `rgba(42,26,77,0.4)` | `color: rgba(42,26,77,0.4);` |
| `bg-white` | `#ffffff` | `background-color: #ffffff;` |
| `bg-black/20` | `rgba(0,0,0,0.2)` | `background-color: rgba(0,0,0,0.2);` |

### 渐变转换规则

**React/Tailwind 渐变**：
```jsx
className="bg-gradient-to-r from-[#E89B6D] to-[#F3B89A]"
```

**WXSS 渐变**：
```css
background: linear-gradient(to right, #E89B6D, #F3B89A);
```

**方向对应关系**：
- `bg-gradient-to-r` → `linear-gradient(to right, ...)`
- `bg-gradient-to-b` → `linear-gradient(to bottom, ...)`
- `bg-gradient-to-br` → `linear-gradient(to bottom right, ...)`

---

## 📏 单位转换规则

**⚠️ 强制要求：所有数值必须从 `Yeyu_ui_design` 源代码中提取，并严格按照转换规则转换为 rpx。**

### px → rpx 转换

**标准转换**：设计稿宽度通常为 375px（iPhone）或 750px（设计稿1:2），微信小程序使用 rpx（响应式像素）。

**转换公式**：
- 设计稿 375px：`1px = 2rpx` ⚠️ **必须严格遵守此转换比例**
- 设计稿 750px：`1px = 1rpx` ⚠️ **必须严格遵守此转换比例**

**⚠️ 重要：必须从源代码中提取精确的 px 值，然后转换为 rpx，不得四舍五入或使用近似值。**

**示例**（仅作参考，实际值必须从源代码中提取）：
- `rounded-[32px]` → `border-radius: 64rpx;`（假设设计稿为 375px，32px × 2 = 64rpx）
- `w-14 h-14`（56px） → `width: 112rpx; height: 112rpx;`（56px × 2 = 112rpx）
- `text-4xl`（36px） → `font-size: 72rpx;`（36px × 2 = 72rpx）

**注意**：如果设计稿是 750px（1:1），则直接使用相同数值的 rpx。**必须确认设计稿的实际尺寸后再进行转换。**

---

## 🎭 样式转换规则

### 1. 背景和渐变

**React/Tailwind**：
```jsx
<div className="bg-gradient-to-r from-[#E89B6D] to-[#F3B89A]">
```

**WXSS**：
```css
.container {
  background: linear-gradient(to right, #E89B6D, #F3B89A);
}
```

### 2. 圆角

**React/Tailwind**：
```jsx
<div className="rounded-[32px]">
```

**WXSS**：
```css
.card {
  border-radius: 32rpx;
}
```

### 3. 阴影

**React/Tailwind**：
```jsx
<div className="shadow-lg">
```

**WXSS**：
```css
.card {
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
}
```

### 4. 透明度

**React/Tailwind**：
```jsx
<div className="bg-black/20">
```

**WXSS**：
```css
.overlay {
  background-color: rgba(0,0,0,0.2);
}
```

### 5. 文字颜色和透明度

**React/Tailwind**：
```jsx
<p className="text-[#2a1a4d]/60">
```

**WXSS**：
```css
.text-secondary {
  color: rgba(42,26,77,0.6);
}
```

---

## 🎬 动画转换规则

**⚠️ 强制要求：所有动画参数（时长、缓动函数、延迟时间、属性变化）必须从 `Yeyu_ui_design` 源代码中提取，不得自行定义。**

### React Motion → 小程序 Animation API

**必须参考源代码中的实际动画参数，以下仅作示例：**
```jsx
<motion.div
  initial={{ opacity: 0, y: 50, scale: 0.8 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
```

**小程序转换**：
```javascript
// 在 JS 中创建动画
const animation = wx.createAnimation({
  duration: 300,
  timingFunction: 'ease-out',
  transformOrigin: '50% 50%'
});

animation.opacity(1).translateY(0).scale(1).step();

this.setData({
  animationData: animation.export()
});
```

```xml
<!-- WXML -->
<view class="card" animation="{{animationData}}">
```

```css
/* WXSS */
.card {
  opacity: 0;
  transform: translateY(50rpx) scale(0.8);
}
```

### 常用动画模式

1. **入场动画（Fade In + Slide Up）**：
   - `opacity: 0 → 1`
   - `translateY: 50rpx → 0`
   - `duration: 300ms`

2. **缩放动画（Scale）**：
   - `scale: 0.8 → 1`
   - `duration: 300ms`

3. **位移动画（Translate）**：
   - `translateY: -100vh`（向上消失）
   - `duration: 1200ms`

### 动画性能优化

- 使用 `transform` 和 `opacity` 属性（GPU 加速）
- 避免使用 `width`、`height`、`margin` 等触发重排的属性
- 使用 `will-change` 提示浏览器优化（小程序不支持，但动画会自动优化）

---

## 📐 布局转换规则

### Flexbox 布局

**React/Tailwind**：
```jsx
<div className="flex items-center justify-between">
```

**WXSS**：
```css
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
```

### 常用布局模式

1. **居中布局**：
```jsx
className="flex items-center justify-center"
```
```css
display: flex;
align-items: center;
justify-content: center;
```

2. **双列布局**：
```jsx
className="flex gap-4"
```
```css
display: flex;
gap: 32rpx; /* gap-4 = 16px = 32rpx */
```

3. **垂直布局**：
```jsx
className="flex flex-col space-y-4"
```
```css
display: flex;
flex-direction: column;
/* space-y-4 需要在子元素上设置 margin-bottom */
```

---

## 🧩 组件结构转换规则

**⚠️ 强制要求：转换任何组件前，必须先阅读 `Yeyu_ui_design/components/` 目录下对应的 React 组件源代码，理解其完整结构、样式和交互逻辑。**

### CreateMessageCard 组件转换

**⚠️ 必须参考 `Yeyu_ui_design/components/CreateMessageCard.tsx` 的完整源代码，以下仅作结构示例：**

**React 结构**（实际代码请查看源代码文件）：
```jsx
<motion.div className="fixed inset-0 z-[60]">
  <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
  <motion.div className="relative z-10 flex flex-col items-center max-w-md w-full">
    {/* 标签气泡 */}
    <div className="mb-3 px-5 py-2.5 bg-gradient-to-r from-[#ff9966] to-[#ff8855] rounded-[18px]">
      {tag}
    </div>
    {/* 内容卡片 */}
    <div className="w-full bg-white rounded-[32px] p-8 shadow-2xl">
      {content}
    </div>
    {/* 发布按钮 */}
    <button className="mt-5 px-8 py-4 bg-gradient-to-r from-[#E89B6D] to-[#F3B89A] rounded-[24px]">
      发送到漂流瓶
    </button>
  </motion.div>
</motion.div>
```

**小程序转换**：

**WXML**：
```xml
<view class="modal-container" wx:if="{{showModal}}">
  <!-- 背景遮罩 -->
  <view class="modal-backdrop" bindtap="onClose"></view>
  
  <!-- 卡片容器 -->
  <view class="modal-content">
    <!-- 标签气泡 -->
    <view class="tag-bubble">
      <text wx:if="{{!isEditingTag}}">{{tag}}</text>
      <input wx:else value="{{tag}}" bindblur="onTagBlur" maxlength="10"/>
    </view>
    
    <!-- 内容卡片 -->
    <view class="content-card" bindtap="onContentClick">
      <text wx:if="{{!isEditingContent}}" class="{{content === placeholder ? 'placeholder' : ''}}">{{content}}</text>
      <textarea wx:else value="{{content}}" bindblur="onContentBlur" maxlength="300"/>
    </view>
    
    <!-- 发布按钮 -->
    <button class="submit-btn" disabled="{{!canSubmit}}" bindtap="onSubmit">
      发送到漂流瓶
    </button>
  </view>
</view>
```

**WXSS**：
```css
.modal-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background-color: rgba(0,0,0,0.2);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 600rpx;
  width: 100%;
  padding: 0 40rpx;
}

.tag-bubble {
  margin-bottom: 24rpx;
  padding: 20rpx 40rpx;
  background: linear-gradient(to right, #ff9966, #ff8855);
  border-radius: 36rpx;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}

.content-card {
  width: 100%;
  background-color: #ffffff;
  border-radius: 64rpx;
  padding: 64rpx;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  min-height: 360rpx;
}

.submit-btn {
  margin-top: 40rpx;
  padding: 32rpx 64rpx;
  background: linear-gradient(to right, #E89B6D, #F3B89A);
  border-radius: 48rpx;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;
}

.submit-btn[disabled] {
  opacity: 0.5;
}
```

### ResonanceWall 组件转换

**⚠️ 必须参考 `Yeyu_ui_design/components/ResonanceWall.tsx` 的完整源代码，以下仅作结构示例：**

**React 结构**（实际代码请查看源代码文件）：
```jsx
<motion.div className="fixed inset-0 bg-gradient-to-b from-[#fef8f3] to-[#f5e6dc]">
  {/* 双列列表 */}
  <div className="flex gap-4 px-4">
    <div className="flex-1 space-y-4">
      {leftColumn.map(item => (
        <div className="bg-white rounded-[24px] p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="px-3 py-1.5 bg-gradient-to-r from-[#ff9966]/20 to-[#ff8855]/20 rounded-full">
              {item.tag}
            </span>
            <div className="flex items-center gap-1">
              <Clock />
              <span>{item.timeAgo}</span>
            </div>
          </div>
          <p>{item.content}</p>
        </div>
      ))}
    </div>
    {/* 右列类似 */}
  </div>
</motion.div>
```

**小程序转换**：

**WXML**：
```xml
<view class="resonance-wall">
  <!-- 标题 -->
  <view class="title-section">
    <text class="title">找到了 {{resonanceCount}} 个共鸣</text>
    <text class="subtitle">你的感受被看见了</text>
  </view>
  
  <!-- 双列列表 -->
  <scroll-view class="resonance-list" scroll-y>
    <view class="list-container">
      <!-- 左列 -->
      <view class="column left-column">
        <view wx:for="{{leftColumn}}" wx:key="id" class="resonance-card" animation="{{item.animation}}">
          <view class="card-header">
            <view class="tag-bubble">{{item.tag}}</view>
            <view class="time-info">
              <image class="clock-icon" src="/images/icons/clock.png"/>
              <text>{{item.timeAgo}}</text>
            </view>
          </view>
          <text class="card-content">{{item.content}}</text>
        </view>
      </view>
      
      <!-- 右列 -->
      <view class="column right-column">
        <view wx:for="{{rightColumn}}" wx:key="id" class="resonance-card" animation="{{item.animation}}">
          <!-- 同上 -->
        </view>
      </view>
    </view>
  </scroll-view>
</view>
```

**WXSS**：
```css
.resonance-wall {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, #fef8f3, #f5e6dc);
}

.list-container {
  display: flex;
  gap: 32rpx;
  padding: 0 32rpx;
}

.column {
  flex: 1;
}

.right-column {
  padding-top: 96rpx; /* pt-12 */
}

.resonance-card {
  background-color: #ffffff;
  border-radius: 48rpx;
  padding: 40rpx;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
  margin-bottom: 32rpx;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.tag-bubble {
  padding: 12rpx 24rpx;
  background: linear-gradient(to right, rgba(255,153,102,0.2), rgba(255,136,85,0.2));
  border-radius: 999rpx;
  color: #E89B6D;
  font-size: 24rpx;
  font-weight: 600;
}

.time-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: rgba(42,26,77,0.4);
  font-size: 24rpx;
}

.card-content {
  color: #2a1a4d;
  font-size: 28rpx;
  line-height: 1.6;
}
```

---

## 🎯 交互转换规则

### 点击事件

**React**：
```jsx
<button onClick={handleClick}>
```

**小程序**：
```xml
<button bindtap="handleClick">
```

### 输入事件

**React**：
```jsx
<input onChange={(e) => setValue(e.target.value)} />
```

**小程序**：
```xml
<input value="{{value}}" bindinput="onInput" />
```

```javascript
onInput(e) {
  this.setData({
    value: e.detail.value
  });
}
```

### 模态框显示/隐藏

**React**：
```jsx
const [showModal, setShowModal] = useState(false);
```

**小程序**：
```javascript
data: {
  showModal: false
},
showModal() {
  this.setData({ showModal: true });
},
hideModal() {
  this.setData({ showModal: false });
}
```

---

## ✅ 转换检查清单

**⚠️ 在转换设计到小程序代码时，必须逐项检查，确保每一项都达到像素级一致：**

### 必须检查项（每一项都必须通过）

- [ ] **已阅读源代码**：已完整阅读 `Yeyu_ui_design/components/` 目录下对应的 React 组件源代码
- [ ] **颜色完全一致**：所有颜色值（包括透明度）与源代码中的值完全一致，**不得使用近似色**
- [ ] **圆角完全一致**：所有圆角值从源代码中提取并精确转换为 rpx 单位，**不得四舍五入**
- [ ] **渐变完全一致**：渐变方向、颜色、透明度与源代码完全一致
- [ ] **阴影完全一致**：阴影效果（模糊半径、偏移量、颜色、透明度）与源代码完全一致
- [ ] **间距完全一致**：所有 padding、margin 从源代码中提取并精确转换为 rpx，**不得四舍五入**
- [ ] **字体大小完全一致**：字体大小从源代码中提取并精确转换为 rpx，**不得四舍五入**
- [ ] **字体粗细完全一致**：font-weight 值与源代码完全一致
- [ ] **行高完全一致**：line-height 值与源代码完全一致
- [ ] **布局完全一致**：flex 布局、层级关系、z-index 与源代码完全一致
- [ ] **动画参数完全一致**：动画时长、缓动函数、延迟时间、属性变化与源代码完全一致
- [ ] **动画流畅**：动画效果流畅自然（60fps），无卡顿
- [ ] **响应式适配**：在不同屏幕尺寸下正常显示，视觉效果保持一致
- [ ] **交互完全一致**：交互行为、点击反馈、状态变化与源代码完全一致

---

## 📝 注意事项

### ⚠️ 强制注意事项

1. **必须先读源代码**：**严禁**在没有阅读 `Yeyu_ui_design` 源代码的情况下开始转换
2. **禁止自行设计**：**严禁**根据文档描述自行设计样式，**必须**严格按照源代码实现
3. **像素级还原**：所有视觉效果必须达到像素级一致，不得使用近似值或四舍五入
4. **单位转换**：始终使用 rpx 单位，确保在不同设备上正确缩放，转换时不得四舍五入
5. **性能优化**：避免频繁的 setData，合并更新，但**不得**为了性能而牺牲视觉效果
6. **动画性能**：使用 transform 和 opacity，避免触发重排，但**必须**保证动画效果与源代码一致
7. **兼容性**：测试不同微信版本和小程序版本的兼容性，如有兼容性问题，应寻找替代方案而非简化效果
8. **真机测试**：**必须**在真机上测试，模拟器可能无法完全还原效果
9. **对比验证**：转换完成后，**必须**对比小程序实现与 React 设计版本，确保完全一致
10. **及时修正**：发现任何不一致，**必须**立即修正，不得将就

---

## 🔗 参考资源

### 必须参考的源代码

**转换前必须阅读以下源代码文件：**

- `Yeyu_ui_design/App.tsx` - 主应用结构
- `Yeyu_ui_design/components/CreateMessageCard.tsx` - 创建消息卡片组件
- `Yeyu_ui_design/components/ResonanceWall.tsx` - 共鸣墙组件
- `Yeyu_ui_design/components/DriftBottle.tsx` - 漂流瓶组件
- `Yeyu_ui_design/components/ChatInterface.tsx` - 聊天界面组件
- `Yeyu_ui_design/components/FullscreenChat.tsx` - 全屏聊天组件
- `Yeyu_ui_design/styles/globals.css` - 全局样式定义

### 微信小程序官方文档

- [微信小程序样式规范](https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxss.html)
- [小程序动画 API](https://developers.weixin.qq.com/miniprogram/dev/api/ui/animation/wx.createAnimation.html)
- [小程序组件文档](https://developers.weixin.qq.com/miniprogram/dev/component/)

---

## 🚨 最终提醒

**转换微信小程序代码时，必须：**

1. ✅ 先阅读 `Yeyu_ui_design` 源代码，理解完整设计
2. ✅ 严格按照源代码中的样式值进行转换
3. ✅ 确保视觉效果达到像素级一致
4. ✅ 在真机上测试验证
5. ✅ 对比小程序实现与 React 设计版本，确保完全一致

**严禁：**
- ❌ 未阅读源代码就开始转换
- ❌ 自行设计样式
- ❌ 使用近似值或四舍五入
- ❌ 简化视觉效果
- ❌ 在未验证一致性的情况下提交代码

