// components/fullscreenChat/index.js
const apiService = require('../../services/api.js');
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
    scrollToView: ''
  },

  observers: {
    'initialMessages': function(initialMessages) {
      if (initialMessages && initialMessages.length > 0) {
        this.setData({
          messages: initialMessages
        });
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

    onSend() {
      const input = this.data.input.trim();
      if (!input) return;

      const newMessage = {
        id: Date.now().toString(),
        text: input,
        isUser: true
      };

      const messages = [...this.data.messages, newMessage];
      this.setData({
        messages: messages,
        input: ''
      });

      // 滚动到底部
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);

      // 模拟 AI 回复
      setTimeout(() => {
        const response = {
          id: (Date.now() + 1).toString(),
          text: "I understand. Let me help you with that. How are you feeling about this situation?",
          isUser: false
        };
        this.setData({
          messages: [...messages, response]
        });
        setTimeout(() => {
          this.scrollToBottom();
        }, 100);
      }, 1500);
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
      const currentUserId = userId || anonymousId.getAnonymousId();
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
      // 使用 catchtap 已经会阻止冒泡，这里只需检查事件对象是否存在
      if (e && e.stopPropagation) {
        e.stopPropagation();
      }
    }
  }
});