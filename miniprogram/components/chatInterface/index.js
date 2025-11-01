// components/chatInterface/index.js
Component({
  properties: {
    messages: {
      type: Array,
      value: []
    }
  },

  data: {
    input: ''
  },

  computed: {
    // 只显示最后 2 条消息
    displayMessages() {
      const messages = this.data.messages || [];
      return messages.slice(-2);
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
      if (!input) return;

      // 清空输入框
      this.setData({
        input: ''
      });

      // 触发发送事件
      this.triggerEvent('send', {
        message: input
      });
    },

    /**
     * Enter 键发送
     */
    onConfirm() {
      this.onSend();
    },

    /**
     * 点击消息区域（可选：打开全屏聊天）
     */
    onMessagesClick() {
      // 预留：可以用来打开 FullscreenChat
      // this.triggerEvent('openfullscreen');
    }
  }
});