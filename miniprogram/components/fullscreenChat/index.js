// components/fullscreenChat/index.js
const llmApi = require('../../services/llmApi.js');
const { getAnonymousId } = require('../../utils/anonymousId.js');

Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    initialMessages: {
      type: Array,
      value: []
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

    onEmotionCardShare() {
      const tag = "寻求理解与支持";
      const content = "通过我们的对话，我感受到你正在面对一些挑战和困惑。你渴望被理解，希望找到内心的平静。记住，每一步成长都值得被看见，你的感受都是真实且重要的。";
      
      this.setData({
        showEmotionCard: false,
        show: false
      });
      
      this.triggerEvent('startresonance', {
        tag: tag,
        content: content
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