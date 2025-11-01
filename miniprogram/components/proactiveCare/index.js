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
    animationClass: '',
    intervalId: null,
    isLoading: false, // 是否正在加载
    displayedCount: 0, // 已展示的消息数量（用于每3条后请求新消息）
    messagesPerBatch: 3, // 每批请求的消息数量
    historyOffset: 0, // 历史记录读取偏移量，用于顺序访问所有历史
    historyBatchSize: 10, // 每次从数据库读取的历史记录数量
    maxMessages: 6 // 界面最多显示的消息数量（滑动窗口）
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
     * 每次请求 3 条新消息，追加到现有消息列表中
     * 确保串行请求（不并发）
     */
    loadMessages(forceRefresh = false) {
      const { userId, username } = this.properties;
      
      // 检查是否有 userId
      if (!userId) {
        console.warn('ProactiveCare: userId 未提供，使用默认消息');
        this.setDefaultMessages();
        return;
      }

      // 防止重复请求：如果正在加载中，必须等待上一次请求完成
      if (this.data.isLoading) {
        console.log('ProactiveCare: 正在加载中，等待上一次请求完成');
        return;
      }

      // 设置加载状态（串行保证）
      this.setData({
        isLoading: true
      });

      console.log('ProactiveCare: 开始加载关怀消息（每批3条），检索数据库...', {
        userId: userId,
        username: username || '朋友',
        currentMessagesCount: this.data.messages.length,
        displayedCount: this.data.displayedCount,
        historyOffset: this.data.historyOffset
      });

      // 每次请求 3 条消息，并传递当前的 offset
      apiService.getProactiveCareMessages(
        userId, 
        username || '朋友', 
        this.data.messagesPerBatch,
        this.data.historyOffset
      )
        .then((response) => {
          // 更新加载状态
          this.setData({
            isLoading: false
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

            // 检查是否到达数据库末尾（返回的历史记录很少或为空）
            const hasMoreHistory = response.context_posts && response.context_posts.length >= 3;
            
            // 如果是强制刷新或首次加载，重置消息列表和偏移量
            if (forceRefresh || this.data.messages.length === 0) {
              this.setData({
                messages: response.messages,
                currentIndex: 0,
                currentMessage: response.messages[0],
                displayedCount: 0,
                historyOffset: this.data.historyBatchSize // 首次加载后，offset 递增
              });
              this.startCarousel();
            } else {
              // 追加新消息到列表末尾，并递增 offset
              let newMessages = [...this.data.messages, ...response.messages];
              let newOffset;
              
              // 判断是否到达数据库末尾
              if (!hasMoreHistory) {
                // 已到达末尾，重置 offset 循环回到开头
                newOffset = 0;
                console.log('ProactiveCare: 🔄 已到达历史记录末尾，重置 offset 循环回到开头');
              } else {
                // 还有更多历史记录，继续递增 offset
                newOffset = this.data.historyOffset + this.data.historyBatchSize;
              }
              
              const oldCurrentIndex = this.data.currentIndex;
              
              // 保持最多 maxMessages 条消息（滑动窗口机制）
              // 如果超过最大数量，删除最早的消息
              const removedCount = Math.max(0, newMessages.length - this.data.maxMessages);
              if (removedCount > 0) {
                newMessages = newMessages.slice(removedCount); // 删除最早的消息
                console.log(`ProactiveCare: 删除最早的 ${removedCount} 条消息，保持最多 ${this.data.maxMessages} 条`);
              }
              
              // 调整 currentIndex，保持当前显示的消息位置不变
              let newCurrentIndex = oldCurrentIndex;
              if (removedCount > 0) {
                // 计算调整后的索引：当前索引 - 删除的数量
                // 但确保不小于 0，也不超出新的消息列表范围
                newCurrentIndex = Math.max(0, Math.min(oldCurrentIndex - removedCount, newMessages.length - 1));
                
                console.log(`ProactiveCare: 调整 currentIndex: ${oldCurrentIndex} → ${newCurrentIndex}`);
                console.log(`ProactiveCare: 当前显示消息保持不变，轮播将继续访问剩余 ${newMessages.length - newCurrentIndex - 1} 条消息`);
              }
              
              console.log('ProactiveCare: 追加新消息', {
                addedMessages: response.messages.length,
                removedMessages: removedCount,
                totalMessages: newMessages.length,
                currentIndex: newCurrentIndex,
                newOffset: newOffset,
                hasMoreHistory: hasMoreHistory,
                isLooping: newOffset === 0
              });
              
              // 只更新消息列表和索引，不强制更新 currentMessage
              // 让轮播自然进行，确保所有剩余消息都能被看到
              this.setData({
                messages: newMessages,
                currentIndex: newCurrentIndex,
                historyOffset: newOffset // 递增或重置 offset
              });
              
              // 注意：不更新 currentMessage，保持当前显示的消息不变
              // 轮播会在下次定时器触发时自然切换到下一条
            }
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
          
          console.error('ProactiveCare: 加载消息失败', error);
          console.log('ProactiveCare: 使用默认消息作为降级方案');
          
          // 如果是首次加载失败，使用默认消息
          if (this.data.messages.length === 0) {
            this.setDefaultMessages();
          }
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
      
      this.setData({
        messages: defaultMessages,
        currentIndex: 0,
        currentMessage: defaultMessages[0],
        displayedCount: 0,
        historyOffset: 0 // 重置 offset
      });
      this.startCarousel();
    },

    /**
     * 开始轮播
     * 每轮播 3 条消息后，自动请求新的关怀消息
     */
    startCarousel() {
      this.stopCarousel(); // 先清除之前的定时器
      
      const intervalId = setInterval(() => {
        const { messages, currentIndex, displayedCount, messagesPerBatch } = this.data;
        if (messages.length === 0) return;
        
        // 淡出动画
        this.setData({
          animationClass: 'fade-out'
        });
        
        // 延迟切换消息
        setTimeout(() => {
          const nextIndex = (currentIndex + 1) % messages.length;
          const newDisplayedCount = displayedCount + 1;
          
          this.setData({
            currentIndex: nextIndex,
            currentMessage: messages[nextIndex],
            animationClass: '', // 重置动画类，触发淡入
            displayedCount: newDisplayedCount
          });
          
          // 每展示 3 条消息后，请求新的关怀消息
          if (newDisplayedCount % messagesPerBatch === 0) {
            console.log(`ProactiveCare: 已展示 ${newDisplayedCount} 条消息，请求新的关怀消息...`);
            
            // 检查是否需要提前加载（如果当前剩余消息少于 3 条）
            const remainingMessages = messages.length - nextIndex - 1;
            if (remainingMessages < messagesPerBatch) {
              console.log(`ProactiveCare: 剩余消息不足 ${messagesPerBatch} 条，提前加载新消息`);
              this.loadMessages(false); // 不强制刷新，追加新消息
            }
          }
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

