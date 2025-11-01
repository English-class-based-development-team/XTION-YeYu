// pages/index/index.js
const anonymousId = require('../../utils/anonymousId.js');
const api = require('../../services/api.js');
const llmApi = require('../../services/llmApi.js');

Page({
  data: {
    // 模态框状态
    showCreateMessageCard: false,
    showFullscreenChat: false,
    showResonanceWall: false,
    showSearchModal: false,
    showSearchResults: false,
    
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

    // 搜索相关
    searchQuery: '',
    searchResults: [],

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
    
    // 获取用户 ID（统一格式：添加 user_ 前缀，与个人中心保持一致）
    let userId = anonymousId.getAnonymousId();
    if (!userId.startsWith('user_')) {
      userId = `user_${userId}`;
    }
    const userInfo = anonymousId.getUserInfo();
    const username = userInfo ? userInfo.username : '朋友';
    
    this.setData({
      userId: userId,
      username: username
    });
    
    // 加载历史对话记录（让用户默认显示为老用户，带有历史数据）
    this.loadChatHistory(userId);
    
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
   * ProactiveCare 消息气泡点击
   * 打开聊天界面，将气泡内容作为第一条AI消息
   */
  onProactiveCareMessageClick(e) {
    const { message } = e.detail;
    
    console.log('ProactiveCare 消息被点击:', message);
    
    // 隐藏 ProactiveCare
    this.setData({
      showProactiveCare: false
    });

    // 创建 AI 消息（将关怀消息作为第一条AI消息）
    const aiMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: message,
      isUser: false,
      text: message
    };

    // 更新聊天消息列表
    this.setData({
      chatMessages: [aiMessage]
    });

    // 打开全屏聊天
    this.setData({
      showFullscreenChat: true
    });
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
    this.setData({
      showSearchModal: true
    });
  },

  /**
   * 关闭搜索模态框
   */
  onSearchModalClose() {
    this.setData({
      showSearchModal: false
    });
  },

  /**
   * 执行搜索
   */
  async onSearch(e) {
    const { query } = e.detail;
    
    if (!query || !query.trim()) {
      return;
    }

    // 显示加载状态
    wx.showLoading({
      title: '搜索中...',
      mask: true
    });

    try {
      // 调用搜索 API
      const response = await api.searchPosts(query.trim(), 20, 0);
      
      wx.hideLoading();

      if (response && response.posts) {
        // 处理搜索结果，转换时间格式
        const results = response.posts.map(post => ({
          id: post.id || post._id,
          tag: post.emotion_tag || post.tag || '未知情绪',
          content: post.content || '',
          timeAgo: this.formatTimeAgo(post.created_at),
          anonymousId: post.anonymous_id || ''
        }));

        // 更新搜索结果并显示
        this.setData({
          searchQuery: query,
          searchResults: results,
          showSearchModal: false,
          showSearchResults: true
        });
      } else {
        // 没有结果
        this.setData({
          searchQuery: query,
          searchResults: [],
          showSearchModal: false,
          showSearchResults: true
        });
      }
    } catch (error) {
      wx.hideLoading();
      console.error('搜索失败:', error);
      
      // 显示错误提示
      wx.showToast({
        title: error.message || '搜索失败，请稍后重试',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 关闭搜索结果
   */
  onSearchResultsClose() {
    this.setData({
      showSearchResults: false,
      searchQuery: '',
      searchResults: []
    });
  },

  /**
   * 格式化时间为相对时间
   */
  formatTimeAgo(dateString) {
    if (!dateString) return '未知时间';
    
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMinutes < 1) {
      return '刚刚';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      // 超过7天显示具体日期
      const month = past.getMonth() + 1;
      const day = past.getDate();
      return `${month}月${day}日`;
    }
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
  },

  /**
   * 加载用户历史对话记录
   * 让用户默认显示为老用户，带有历史数据
   * @param {String} userId - 用户ID
   */
  async loadChatHistory(userId) {
    try {
      console.log('加载历史对话记录，userId:', userId);
      
      // 调用 API 获取历史对话
      const result = await llmApi.getChatHistory(userId, 50);
      
      if (result && result.success && result.messages && result.messages.length > 0) {
        // 转换消息格式，确保与小程序期望的格式一致
        const formattedMessages = result.messages.map(msg => {
          // 统一格式：role 可能为 'ai', 'assistant', 'user'
          let role = msg.role;
          if (role === 'assistant') {
            role = 'ai';
          }
          
          return {
            role: role,
            content: msg.content || msg.text || '',
            timestamp: msg.timestamp
          };
        });
        
        console.log('历史对话记录加载成功，消息数量:', formattedMessages.length);
        
        // 更新聊天消息列表（用历史记录替换默认的欢迎消息）
        this.setData({
          chatMessages: formattedMessages
        });
        
        // 如果历史记录中有用户消息，则显示聊天预览
        if (formattedMessages.some(m => m.role === 'user')) {
          // 延迟一下确保界面更新
          setTimeout(() => {
            // 不强制显示 ProactiveCare，因为有历史对话时应该显示聊天预览
            // 但也不阻止 ProactiveCare 的显示逻辑
          }, 100);
        }
      } else {
        console.log('没有历史对话记录，使用默认欢迎消息');
        // 如果没有历史记录，保持默认的欢迎消息（已在 data 中初始化）
      }
    } catch (error) {
      console.warn('加载历史对话记录失败，使用默认欢迎消息:', error);
      // 加载失败时，保持默认的欢迎消息（已在 data 中初始化）
      // 不显示错误提示，避免影响用户体验
    }
  }
});