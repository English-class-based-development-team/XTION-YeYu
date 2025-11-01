// components/proactiveCare/index.js
const apiService = require('../../services/api.js');

Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    userId: {
      type: String,
      value: ''
    },
    username: {
      type: String,
      value: ''
    }
  },

  data: {
    messages: [],
    currentIndex: 0,
    currentMessage: '',
    displayMessage: '', // 显示的消息（去除 [proactive] 标签）
    hasProactiveTag: false, // 当前消息是否有 [proactive] 标签
    animationClass: '',
    intervalId: null,
    isLoading: false, // 是否正在加载
    lastLoadTime: 0, // 上次加载时间
    cacheExpireTime: 60000 // 缓存过期时间（60秒）
  },

  observers: {
    'show': function(show) {
      if (show) {
        // 延迟加载，确保组件已初始化，使用防抖
        this.debouncedLoadMessages();
      } else {
        this.stopCarousel();
      }
    },
    'userId': function(userId) {
      // userId 变化时重新加载消息，使用防抖
      if (userId && this.data.show) {
        this.debouncedLoadMessages();
      }
    }
  },

  lifetimes: {
    attached() {
      if (this.data.show) {
        // 使用防抖加载，避免与 observers 重复调用
        this.debouncedLoadMessages();
      }
    },
    detached() {
      this.stopCarousel();
      // 清理防抖定时器
      if (this.loadMessagesTimer) {
        clearTimeout(this.loadMessagesTimer);
        this.loadMessagesTimer = null;
      }
    }
  },

  // 防抖定时器
  loadMessagesTimer: null,

  methods: {
    /**
     * 防抖加载消息（避免频繁调用）
     */
    debouncedLoadMessages() {
      // 清除之前的定时器
      if (this.loadMessagesTimer) {
        clearTimeout(this.loadMessagesTimer);
      }
      
      // 设置新的定时器，300ms 内多次调用只执行最后一次
      this.loadMessagesTimer = setTimeout(() => {
        this.loadMessages();
      }, 300);
    },

    /**
     * 加载关怀消息列表
     * 从后端 API 检索数据库，如果有历史数据则调用大模型生成个性化关怀
     * 包含防重复调用和缓存机制
     */
    loadMessages(forceRefresh = false) {
      const { userId, username } = this.properties;
      const now = Date.now();
      
      // 检查是否有 userId
      if (!userId) {
        console.warn('ProactiveCare: userId 未提供，使用默认消息');
        this.setDefaultMessages();
        return;
      }

      // 防止重复请求：如果正在加载中，不重复调用
      if (this.data.isLoading && !forceRefresh) {
        console.log('ProactiveCare: 正在加载中，跳过重复请求');
        return;
      }

      // 缓存检查：如果距离上次加载不到 60 秒，且不是强制刷新，则使用缓存
      if (!forceRefresh && 
          this.data.lastLoadTime > 0 && 
          (now - this.data.lastLoadTime) < this.data.cacheExpireTime &&
          this.data.messages && this.data.messages.length > 0) {
        console.log('ProactiveCare: 使用缓存数据，距离上次加载', Math.floor((now - this.data.lastLoadTime) / 1000), '秒');
        return;
      }

      // 设置加载状态
      this.setData({
        isLoading: true
      });

      console.log('ProactiveCare: 开始加载关怀消息，检索数据库...', {
        userId: userId,
        username: username || '朋友',
        forceRefresh: forceRefresh
      });

      // 调用 API（无重试机制，失败立即报错）
      apiService.getProactiveCareMessages(userId, username || '朋友')
        .then((response) => {
          // 更新加载时间和状态
          this.setData({
            isLoading: false,
            lastLoadTime: Date.now()
          });

          console.log('ProactiveCare: API 响应', {
            messagesCount: response?.messages?.length || 0,
            hasContextPosts: response?.context_posts?.length > 0
          });

          if (response && response.messages && response.messages.length > 0) {
            // 检查是否是默认消息还是大模型生成的个性化消息
            const isPersonalized = response.messages.some(msg => 
              !msg.includes('你好呀！很高兴见到你') && 
              !msg.includes('嗨！今天过得怎么样')
            );

            console.log('ProactiveCare: 加载成功', {
              messageCount: response.messages.length,
              isPersonalized: isPersonalized,
              firstMessage: response.messages[0]?.substring(0, 30) + '...'
            });

            // 处理消息标签，分离显示文本和标签标识
            const processedMessages = response.messages.map(msg => {
              if (msg.startsWith('[proactive] ')) {
                return {
                  text: msg.replace('[proactive] ', ''),
                  hasTag: true,
                  original: msg
                };
              }
              return {
                text: msg,
                hasTag: false,
                original: msg
              };
            });

            // 更新消息数据和显示
            const firstMsg = processedMessages[0];
            this.setData({
              messages: processedMessages,
              currentIndex: 0,
              currentMessage: firstMsg.text,
              displayMessage: firstMsg.text,
              hasProactiveTag: firstMsg.hasTag
            });
            this.startCarousel();
          } else {
            console.log('ProactiveCare: 无消息返回，使用默认消息');
            this.setDefaultMessages();
          }
        })
        .catch((error) => {
          // 更新加载状态
          this.setData({
            isLoading: false
          });
          
          // 详细输出错误信息（不再自动降级为默认消息）
          const errorMsg = error?.message || error?.errMsg || String(error);
          console.error('ProactiveCare: API 请求失败，错误信息：', errorMsg);
          console.error('ProactiveCare: 完整错误对象：', error);
          
          // 显示错误提示（可选：如果需要UI提示，可以在这里添加）
          // 例如：wx.showToast({ title: '加载关怀消息失败', icon: 'none' });
          
          // 不再自动使用默认消息，让用户知道请求失败了
          // 如果需要降级，可以取消下面的注释
          // this.setDefaultMessages();
        });
    },

    /**
     * 设置默认消息（当 API 调用失败时使用）
     */
    setDefaultMessages() {
      const defaultMessages = [
        "你好呀！很高兴见到你。有什么想聊的吗？",
        "嗨！今天过得怎么样？",
        "你好呀！有什么想分享的吗？",
        "很高兴见到你！最近有什么新鲜事吗？",
        "你好！我在这里陪你聊天～",
        "嗨！想聊些什么呢？",
        "你好呀！今天心情如何？",
        "很开心见到你！有什么想说的吗？"
      ];
      
      // 默认消息格式化为对象（无标签）
      const formattedMessages = defaultMessages.map(msg => ({
        text: msg,
        hasTag: false,
        original: msg
      }));
      
      this.setData({
        messages: formattedMessages,
        currentIndex: 0,
        currentMessage: defaultMessages[0],
        displayMessage: defaultMessages[0],
        hasProactiveTag: false
      });
      this.startCarousel();
    },

    /**
     * 开始轮播
     */
    startCarousel() {
      this.stopCarousel(); // 先清除之前的定时器
      
      const intervalId = setInterval(() => {
        const { messages, currentIndex } = this.data;
        if (messages.length === 0) return;
        
        // 淡出动画
        this.setData({
          animationClass: 'fade-out'
        });
        
        // 延迟切换消息
        setTimeout(() => {
          const nextIndex = (currentIndex + 1) % messages.length;
          const nextMsg = messages[nextIndex];
          // 处理消息格式（可能是对象或字符串）
          const msgText = typeof nextMsg === 'string' ? nextMsg : nextMsg.text;
          const hasTag = typeof nextMsg === 'object' ? nextMsg.hasTag : msgText.startsWith('[proactive]');
          const displayText = hasTag && typeof nextMsg === 'string' 
            ? msgText.replace('[proactive] ', '') 
            : msgText;
          
          this.setData({
            currentIndex: nextIndex,
            currentMessage: displayText,
            displayMessage: displayText,
            hasProactiveTag: hasTag,
            animationClass: '' // 重置动画类，触发淡入
          });
        }, 400); // 等待淡出动画完成
      }, 8000); // 每8秒切换一次
      
      this.setData({
        intervalId
      });
    },

    /**
     * 停止轮播
     */
    stopCarousel() {
      const { intervalId } = this.data;
      if (intervalId) {
        clearInterval(intervalId);
        this.setData({
          intervalId: null
        });
      }
    }
  }
});

