// pages/index/index.js
const anonymousId = require('../../utils/anonymousId.js');

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
    statusBarHeight: 0,
    
    // ProactiveCare 相关
    showProactiveCare: true,
    userId: '',
    username: '',
    // 定时器 ID
    careTimerId: null,
    idleTimerId: null
  },

  onLoad() {
    // 获取窗口信息
    const windowInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight || 0
    });
    
    // 获取用户 ID
    const userId = anonymousId.getAnonymousId();
    const userInfo = anonymousId.getUserInfo();
    const username = userInfo ? userInfo.username : '朋友';
    
    this.setData({
      userId: userId,
      username: username
    });
    
    // 延迟加载关怀消息，确保组件已渲染
    setTimeout(() => {
      this.loadProactiveCare();
    }, 500);
  },

  onShow() {
    // 页面显示时启动闲置计时器（如果有用户消息）
    if (this.data.chatMessages.some(m => m.role === 'user')) {
      this.startIdleTimer();
    }
    
    // 页面显示时，如果 ProactiveCare 应该显示，检查是否需要刷新
    // 不强制刷新，使用缓存机制（如果60秒内加载过则不刷新）
    if (this.data.showProactiveCare) {
      // 延迟一下，确保页面完全显示
      setTimeout(() => {
        this.loadProactiveCare(false); // 不强制刷新，使用缓存
      }, 500);
    }
  },

  onUnload() {
    // 清理定时器
    this.clearTimers();
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
    
    // 隐藏 ProactiveCare
    this.setData({
      showProactiveCare: false
    });
    
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
    
    // 清理之前的定时器
    this.clearTimers();
    
    // 如果 ProactiveCare 还没有显示（说明不是通过发布帖子关闭的）
    // 则5秒后显示 ProactiveCare
    if (!this.data.showProactiveCare) {
      const careTimerId = setTimeout(() => {
        this.setData({
          showProactiveCare: true
        });
        // 刷新关怀消息（确保获取最新数据）
        this.loadProactiveCare();
        // 启动闲置计时器
        this.startIdleTimer();
      }, 5000);
      
      this.setData({
        careTimerId: careTimerId
      });
    } else {
      // 如果已经显示了，确保刷新消息
      this.loadProactiveCare();
      // 启动闲置计时器
      this.startIdleTimer();
    }
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
   * 帖子发布成功后的处理
   * 立即显示并刷新 ProactiveCare 以显示新的个性化关怀消息
   */
  onPostPublished(e) {
    const { postId, summary, emotionTag } = e.detail;
    console.log('帖子发布成功:', { postId, summary, emotionTag });
    
    // 清理之前的定时器（如果有5秒延迟显示的逻辑）
    this.clearTimers();
    
    // 立即显示 ProactiveCare
    this.setData({
      showProactiveCare: true
    });
    
    // 延迟一下确保数据库已更新，然后强制刷新关怀消息
    // 使用稍长的延迟，确保后端已完全保存数据
    // 使用 forceRefresh = true 跳过缓存
    setTimeout(() => {
      console.log('刷新 ProactiveCare 消息（强制刷新，跳过缓存）...');
      this.loadProactiveCare(true); // 强制刷新
    }, 2000); // 增加到2秒，确保数据库完全保存
  },

  /**
   * Profile 按钮点击
   */
  onProfileClick() {
    wx.navigateTo({
      url: '/pages/profile/index'
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
  },

  // 防抖定时器
  loadProactiveCareTimer: null,

  /**
   * 加载主动关怀消息（防抖版本）
   * 刷新 ProactiveCare 组件，重新从数据库检索并调用 API 生成关怀消息
   */
  loadProactiveCare(forceRefresh = false) {
    // 清除之前的定时器（防抖）
    if (this.loadProactiveCareTimer) {
      clearTimeout(this.loadProactiveCareTimer);
    }

    // 确保 ProactiveCare 显示
    if (!this.data.showProactiveCare) {
      this.setData({
        showProactiveCare: true
      });
    }
    
    // 防抖：500ms 内多次调用只执行最后一次
    this.loadProactiveCareTimer = setTimeout(() => {
      const proactiveCareComponent = this.selectComponent('#proactiveCare');
      if (proactiveCareComponent) {
        console.log('触发 ProactiveCare 刷新，重新检索数据库...', {
          forceRefresh: forceRefresh
        });
        // 强制刷新时传递参数
        proactiveCareComponent.loadMessages(forceRefresh);
      } else {
        console.warn('ProactiveCare 组件未找到，延迟重试...');
        // 如果组件还没渲染，延迟重试
        setTimeout(() => {
          const component = this.selectComponent('#proactiveCare');
          if (component) {
            component.loadMessages(forceRefresh);
          }
        }, 500);
      }
    }, 500);
  },

  /**
   * 启动闲置计时器（主屏幕闲置30秒后显示 ProactiveCare）
   */
  startIdleTimer() {
    // 清理之前的定时器
    if (this.data.idleTimerId) {
      clearTimeout(this.data.idleTimerId);
    }
    
    // 检查是否在主屏幕（没有打开任何模态框）
    const isOnMainScreen = !this.data.showCreateMessageCard && 
                          !this.data.showFullscreenChat && 
                          !this.data.showResonanceWall;
    
    if (isOnMainScreen && this.data.chatMessages.some(m => m.role === 'user')) {
      // 如果主屏幕且有用户消息，启动闲置计时器
      const idleTimerId = setTimeout(() => {
        this.setData({
          showProactiveCare: true
        });
      }, 30000); // 30秒
      
      this.setData({
        idleTimerId: idleTimerId
      });
    }
  },

  /**
   * 清理所有定时器
   */
  clearTimers() {
    if (this.data.careTimerId) {
      clearTimeout(this.data.careTimerId);
      this.setData({
        careTimerId: null
      });
    }
    if (this.data.idleTimerId) {
      clearTimeout(this.data.idleTimerId);
      this.setData({
        idleTimerId: null
      });
    }
    // 清理防抖定时器
    if (this.loadProactiveCareTimer) {
      clearTimeout(this.loadProactiveCareTimer);
      this.loadProactiveCareTimer = null;
    }
  }
});