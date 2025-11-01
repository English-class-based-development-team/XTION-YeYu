// pages/index/index.js
Page({
  data: {
    // 模态框状态
    showCreateMessageCard: false,
    showFullscreenChat: false,
    showResonanceWall: false,
    
    // ChatInterface 消息
    chatMessages: [
      {
        role: 'ai',
        content: 'Hi! I\'m your personal psychology agent. How can I help you today?'
      }
    ],
    
    // 用户数据（用于发布）
    userEmotion: {
      tag: '我的心情',
      valence: 5,
      arousal: 5,
      content: ''
    },

    // 系统状态栏高度
    statusBarHeight: 0
  },

  onLoad() {
    // 获取窗口信息
    const windowInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight || 0
    });
  },

  /**
   * 点击漂流瓶，打开 CreateMessageCard 模态框
   */
  onDriftBottleClick() {
    console.log('DriftBottle clicked');
    this.setData({
      showCreateMessageCard: true
    });
  },

  /**
   * 关闭 CreateMessageCard 模态框
   */
  onCloseCreateMessageCard() {
    this.setData({
      showCreateMessageCard: false
    });
  },

  /**
   * CreateMessageCard 发送消息
   */
  onCreateMessageSend(e) {
    const { tag, content, valence, arousal } = e.detail;
    
    console.log('Create message send:', { tag, content, valence, arousal });

    // 保存用户情绪数据
    this.setData({
      userEmotion: {
        tag,
        valence,
        arousal,
        content
      },
      showCreateMessageCard: false
    });

    // TODO: 调用 publishPost API
    // 然后打开 ResonanceWall
    setTimeout(() => {
      this.setData({
        showResonanceWall: true
      });
    }, 300);
  },

  /**
   * 关闭 ResonanceWall
   */
  onCloseResonanceWall() {
    this.setData({
      showResonanceWall: false
    });
  },

  /**
   * ChatInterface 发送消息
   */
  onChatSend(e) {
    const { message, userMessage } = e.detail;
    
    console.log('用户发送消息:', message);
    
    // 添加用户消息到消息列表
    const newMessages = [...this.data.chatMessages, userMessage];

    this.setData({
      chatMessages: newMessages
    });

    // 打开 FullscreenChat
    this.setData({
      showFullscreenChat: true
    });
  },

  /**
   * ChatInterface 消息更新（包含 AI 回复）
   */
  onChatMessageUpdate(e) {
    const { messages, newMessage } = e.detail;
    
    console.log('消息更新:', newMessage);
    
    this.setData({
      chatMessages: messages
    });
  },

  /**
   * 打开 FullscreenChat（从消息预览点击）
   */
  onOpenFullscreenChat() {
    console.log('打开全屏聊天');
    this.setData({
      showFullscreenChat: true
    });
  },

  /**
   * 关闭 FullscreenChat
   */
  onCloseFullscreenChat() {
    this.setData({
      showFullscreenChat: false
    });
  },

  /**
   * FullscreenChat 消息更新
   */
  onChatMessagesUpdate(e) {
    const { messages } = e.detail;
    this.setData({
      chatMessages: messages
    });
  },

  /**
   * FullscreenChat 开始共鸣流（从"传播你的共鸣"或"传播这份情感"触发）
   */
  onStartResonance(e) {
    const { tag, content } = e.detail;
    
    console.log('Start resonance from conversation:', { tag, content });

    // 保存用户情绪数据
    // 如果只有tag和content，使用默认的情绪值
    this.setData({
      userEmotion: {
        tag: tag || '我的心情',
        valence: 5, // 默认中性价度
        arousal: 5, // 默认中性唤醒度
        content: content || ''
      },
      showFullscreenChat: false // 关闭全屏聊天
    });

    // 延迟打开 ResonanceWall（与CreateMessageCard逻辑保持一致）
    setTimeout(() => {
      this.setData({
        showResonanceWall: true
      });
    }, 300);
  },

  /**
   * Profile 按钮点击
   */
  onProfileClick() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * Search 按钮点击
   */
  onSearchClick() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none',
      duration: 2000
    });
  }
});