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
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 0
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
    const { message } = e.detail;
    
    // 添加用户消息
    const newMessages = [...this.data.chatMessages, {
      role: 'user',
      content: message
    }];

    this.setData({
      chatMessages: newMessages
    });

    // 打开 FullscreenChat
    this.setData({
      showFullscreenChat: true
    });

    // 模拟 AI 回复
    setTimeout(() => {
      const aiMessage = {
        role: 'ai',
        content: 'I understand. Let me help you with that. How are you feeling about this situation?'
      };
      
      this.setData({
        chatMessages: [...this.data.chatMessages, aiMessage]
      });
    }, 1500);
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