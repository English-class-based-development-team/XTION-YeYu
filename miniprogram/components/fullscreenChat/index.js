// components/fullscreenChat/index.js
const llmApi = require('../../services/llmApi.js');
const apiService = require('../../services/api.js');
const { getAnonymousId } = require('../../utils/anonymousId.js');
const anonymousId = require('../../utils/anonymousId.js');

Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    initialMessages: {
      type: Array,
      value: []
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
    input: '',
    showEmotionCard: false,
    scrollTop: 0,
    scrollToView: '',
    isLoading: false,
    userId: null // 缓存用户ID
  },

  lifetimes: {
    attached() {
      // 组件加载时获取用户ID
      try {
        const anonymousId = getAnonymousId();
        this.setData({
          userId: `user_${anonymousId}`
        });
      } catch (e) {
        console.warn('获取用户ID失败:', e);
      }
    }
  },

  observers: {
    'initialMessages': function(initialMessages) {
      if (initialMessages && initialMessages.length > 0) {
        this.setData({
          messages: initialMessages
        });
        // 延迟检查是否需要调用API
        setTimeout(() => {
          this.fetchAIResponseIfNeeded();
        }, 200);
      }
    },
    'show': function(show) {
      if (show) {
        // 打开时重置消息列表
        if (this.properties.initialMessages && this.properties.initialMessages.length > 0) {
          this.setData({
            messages: this.properties.initialMessages,
            input: '',
            showEmotionCard: false
          });
        } else {
          // 初始消息
          this.setData({
            messages: [{
              id: '1',
              text: "Hi! I'm your personal psychology agent. How can I help you today?",
              isUser: false
            }],
            input: '',
            showEmotionCard: false
          });
        }
        // 延迟滚动到底部
        setTimeout(() => {
          this.scrollToBottom();
        }, 100);
        // 延迟检查是否需要调用API
        setTimeout(() => {
          this.fetchAIResponseIfNeeded();
        }, 200);
      }
    }
  },

  lifetimes: {
    attached() {
      // 初始化消息
      if (this.properties.initialMessages && this.properties.initialMessages.length > 0) {
        this.setData({
          messages: this.properties.initialMessages
        });
      } else {
        this.setData({
          messages: [{
            id: '1',
            text: "Hi! I'm your personal psychology agent. How can I help you today?",
            isUser: false
          }]
        });
      }
    }
  },

  methods: {
    /**
     * 检查是否需要调用API获取AI回复
     * 如果最后一条消息是用户消息且没有对应的AI回复，则调用API
     */
    async fetchAIResponseIfNeeded() {
      const messages = this.data.messages || [];
      if (messages.length === 0) return;
      
      // 获取最后一条消息
      const lastMessage = messages[messages.length - 1];
      
      // 检查最后一条消息是否是用户消息
      const isUserMessage = lastMessage.role === 'user' || lastMessage.isUser === true;
      
      if (!isUserMessage) return;
      
      // 检查是否正在加载（避免重复调用）
      if (this.data.isLoading) return;
      
      // 检查是否已经有AI回复（避免重复调用）
      // 如果下一条消息是AI回复，则不需要调用
      // 这里我们只检查当前消息列表，因为消息是顺序添加的
      
      console.log('检测到用户消息，开始调用API获取回复...');
      
      // 设置加载状态
      this.setData({
        isLoading: true
      });
      
      try {
        // 转换消息格式为 API 格式
        const apiMessages = messages.map(msg => ({
          role: msg.role || (msg.isUser ? 'user' : 'assistant'),
          content: msg.content || msg.text
        }));

        // 调用 LLM API，传递用户ID以确保对话历史关联
        const response = await llmApi.sendChatMessage(apiMessages, this.data.userId);
        
        if (response.success && response.data.response) {
          // 创建 AI 回复消息
          const aiMessage = {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            content: response.data.response,
            isUser: false,
            text: response.data.response // 兼容旧格式
          };

          const updatedMessages = [...messages, aiMessage];
          
          this.setData({
            messages: updatedMessages
          });

          // 触发消息更新事件
          this.triggerEvent('messagesupdate', {
            messages: updatedMessages
          });

          // 滚动到底部
          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
        } else {
          throw new Error('API 返回格式错误');
        }
      } catch (error) {
        console.error('LLM API 调用失败:', error);
        
        // 显示错误提示
        wx.showToast({
          title: '回复失败，请重试',
          icon: 'none',
          duration: 2000
        });

        // 使用模拟回复作为备用方案
        try {
          const lastUserMessage = messages[messages.length - 1];
          const userInput = lastUserMessage.content || lastUserMessage.text;
          const mockResponse = await llmApi.getMockReply(userInput);
          if (mockResponse.success) {
            const aiMessage = {
              id: (Date.now() + 1).toString(),
              role: 'ai', 
              content: mockResponse.data.response,
              isUser: false,
              text: mockResponse.data.response // 兼容旧格式
            };

            const updatedMessages = [...messages, aiMessage];
            
            this.setData({
              messages: updatedMessages
            });

            // 触发消息更新事件
            this.triggerEvent('messagesupdate', {
              messages: updatedMessages
            });

            setTimeout(() => {
              this.scrollToBottom();
            }, 100);
          }
        } catch (mockError) {
          console.error('模拟回复也失败了:', mockError);
        }
      } finally {
        // 重置加载状态
        this.setData({
          isLoading: false
        });
      }
    },

    scrollToBottom() {
      // 使用 scroll-into-view 滚动到底部
      this.setData({
        scrollToView: 'scroll-end'
      });
      // 重置 scrollToView，以便下次可以再次触发
      setTimeout(() => {
        this.setData({
          scrollToView: ''
        });
      }, 100);
    },

    onInput(e) {
      this.setData({
        input: e.detail.value
      });
    },

    async onSend() {
      const input = this.data.input.trim();
      if (!input || this.data.isLoading) return;

      // 创建用户消息
      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: input,
        isUser: true,
        text: input // 兼容旧格式
      };

      const messages = [...this.data.messages, userMessage];
      
      // 清空输入框，添加用户消息，设置加载状态
      this.setData({
        messages: messages,
        input: '',
        isLoading: true
      });

      // 滚动到底部
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);

      // 触发消息更新事件，通知父组件
      this.triggerEvent('messagesupdate', {
        messages: messages
      });

      try {
        // 转换消息格式为 API 格式
        const apiMessages = messages.map(msg => ({
          role: msg.role || (msg.isUser ? 'user' : 'assistant'),
          content: msg.content || msg.text
        }));

        // 调用 LLM API，传递用户ID以确保对话历史关联
        const response = await llmApi.sendChatMessage(apiMessages, this.data.userId);
        
        if (response.success && response.data.response) {
          // 创建 AI 回复消息
          const aiMessage = {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            content: response.data.response,
            isUser: false,
            text: response.data.response // 兼容旧格式
          };

          const updatedMessages = [...messages, aiMessage];
          
          this.setData({
            messages: updatedMessages
          });

          // 触发消息更新事件
          this.triggerEvent('messagesupdate', {
            messages: updatedMessages
          });

          // 滚动到底部
          setTimeout(() => {
            this.scrollToBottom();
          }, 100);
        } else {
          throw new Error('API 返回格式错误');
        }
      } catch (error) {
        console.error('LLM API 调用失败:', error);
        
        // 显示错误提示
        wx.showToast({
          title: '回复失败，请重试',
          icon: 'none',
          duration: 2000
        });

        // 使用模拟回复作为备用方案
        try {
          const mockResponse = await llmApi.getMockReply(input);
          if (mockResponse.success) {
            const aiMessage = {
              id: (Date.now() + 1).toString(),
              role: 'ai', 
              content: mockResponse.data.response,
              isUser: false,
              text: mockResponse.data.response // 兼容旧格式
            };

            const updatedMessages = [...messages, aiMessage];
            
            this.setData({
              messages: updatedMessages
            });

            // 触发消息更新事件
            this.triggerEvent('messagesupdate', {
              messages: updatedMessages
            });

            setTimeout(() => {
              this.scrollToBottom();
            }, 100);
          }
        } catch (mockError) {
          console.error('模拟回复也失败了:', mockError);
        }
      } finally {
        // 重置加载状态
        this.setData({
          isLoading: false
        });
      }
    },

    onConfirm(e) {
      // Enter 键发送
      this.onSend();
    },

    onClose() {
      this.setData({
        show: false
      });
      this.triggerEvent('close');
    },

    onSharePromptClick() {
      this.setData({
        showEmotionCard: true
      });
    },

    onEmotionCardClose() {
      this.setData({
        showEmotionCard: false
      });
    },

    /**
     * 将对话消息转换为文本格式（用于生成总结）
     */
    formatConversationAsText() {
      const messages = this.data.messages || [];
      const conversationLines = messages.map(msg => {
        const role = msg.isUser ? '我' : '伙伴';
        return `${role}: ${msg.text}`;
      });
      return conversationLines.join('\n');
    },

    /**
     * 传播共鸣按钮点击事件
     * 1. 从对话生成总结
     * 2. 将总结发布为帖子保存到数据库
     */
    onEmotionCardShare() {
      const { userId, username } = this.properties;
      // 确保用户ID格式与个人中心一致（添加 user_ 前缀）
      let currentUserId = userId || anonymousId.getAnonymousId();
      if (!currentUserId.startsWith('user_')) {
        currentUserId = `user_${currentUserId}`;
      }
      const currentUsername = username || anonymousId.getUserInfo().username || '朋友';
      
      // 获取对话消息
      const messages = this.data.messages || [];
      if (messages.length === 0) {
        wx.showToast({
          title: '没有对话内容',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      // 显示加载提示
      wx.showLoading({
        title: '正在生成总结...',
        mask: true
      });

      // 步骤 1: 将对话转换为文本并生成总结
      const conversationText = this.formatConversationAsText();
      
      console.log('生成对话总结，文本长度:', conversationText.length);
      
      const self = this;
      let savedSummary = null;
      let savedEmotionTag = null;

      apiService.generateSummary(
        currentUserId,
        null, // 不使用 conversation_id
        conversationText // 直接使用文本
      )
      .then((summaryResult) => {
        if (!summaryResult || !summaryResult.summary) {
          throw new Error('生成总结失败');
        }

        const { summary, emotion_tag, emotion_intensity } = summaryResult;
        
        // 保存这些值供后续使用
        savedSummary = summary;
        savedEmotionTag = emotion_tag;
        
        console.log('总结生成成功:', {
          summary: summary.substring(0, 50) + '...',
          emotion_tag,
          emotion_intensity
        });

        wx.hideLoading();
        wx.showLoading({
          title: '正在保存...',
          mask: true
        });

        // 步骤 2: 将总结发布为帖子保存到数据库
        const postData = {
          user_id: currentUserId,
          username: currentUsername,
          content: summary,
          emotion_tag: emotion_tag, // 使用生成的 emotion_tag
          emotion_intensity: emotion_intensity, // 使用生成的 emotion_intensity
          conversation_id: currentUserId // 记录对话来源
        };

        console.log('发布帖子:', postData);

        return apiService.publishPost(postData);
      })
      .then((publishResult) => {
        wx.hideLoading();

        if (publishResult && publishResult.post_id) {
          // 发布成功
          wx.showToast({
            title: '已保存为历史记录',
            icon: 'success',
            duration: 2000
          });

          // 关闭卡片和聊天界面
          self.setData({
        showEmotionCard: false,
        show: false
      });
      
          // 触发事件，通知父组件刷新 ProactiveCare
          self.triggerEvent('postpublished', {
            postId: publishResult.post_id,
            summary: savedSummary,
            emotionTag: savedEmotionTag
          });

          // 触发共鸣墙事件（如果需要）
          self.triggerEvent('startresonance', {
            tag: savedEmotionTag,
            content: savedSummary
          });
        } else {
          throw new Error('保存失败');
        }
      })
      .catch((error) => {
        console.error('传播共鸣失败:', error);
        wx.hideLoading();
        wx.showToast({
          title: error.message || '操作失败，请重试',
          icon: 'none',
          duration: 3000
        });
      });
    },

    preventClose(e) {
      // 阻止事件冒泡
      e.stopPropagation();
    },

    preventDefault(e) {
      // 阻止滚动穿透：阻止默认行为和事件冒泡
      // 用于 catchtouchmove 事件绑定
    }
  }
});