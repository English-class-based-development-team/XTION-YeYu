// components/fullscreenChat/index.js
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
    }
  }
});