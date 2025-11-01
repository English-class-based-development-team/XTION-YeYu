// components/chatInterface/index.js
const { getAnonymousId } = require('../../utils/anonymousId.js');

Component({
  properties: {
    messages: {
      type: Array,
      value: []
    },
    showMessages: {
      type: Boolean,
      value: true
    }
  },

  data: {
    input: '',
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

  computed: {
    // 只显示最后 2 条消息
    displayMessages() {
      const messages = this.data.messages || [];
      return messages.slice(-2);
    },
    
    // 检查是否有用户消息
    hasUserMessages() {
      const messages = this.data.messages || [];
      return messages.some(msg => msg.role === 'user');
    }
  },

  methods: {
    /**
     * 输入框输入
     */
    onInput(e) {
      this.setData({
        input: e.detail.value
      });
    },

    /**
     * 发送消息
     */
    onSend() {
      const input = this.data.input.trim();
      if (!input || this.data.isLoading) return;

      // 创建用户消息
      const userMessage = {
        role: 'user',
        content: input,
        text: input, // 兼容fullscreenChat的显示格式
        id: Date.now().toString(),
        isUser: true // 兼容fullscreenChat的格式
      };

      // 清空输入框
      this.setData({
        input: ''
      });

      // 立即触发发送事件，传递用户消息（跳转到FullscreenChat）
      this.triggerEvent('send', {
        message: input,
        userMessage: userMessage
      });
    },

    /**
     * Enter 键发送
     */
    onConfirm() {
      this.onSend();
    },

    /**
     * 点击消息区域（打开全屏聊天）
     */
    onMessagesClick() {
      if (this.data.messages.length > 0) {
        this.triggerEvent('openfullscreen');
      }
    }
  }
});