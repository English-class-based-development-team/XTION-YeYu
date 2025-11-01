// components/emotionSummaryCard/index.js
Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  data: {
    tag: "寻求理解与支持",
    content: "通过我们的对话，我感受到你正在面对一些挑战和困惑。你渴望被理解，希望找到内心的平静。记住，每一步成长都值得被看见，你的感受都是真实且重要的。"
  },

  methods: {
    onClose() {
      this.setData({
        show: false
      });
      this.triggerEvent('close');
    },

    onShare() {
      this.triggerEvent('share');
      this.triggerEvent('startresonance', {
        tag: this.data.tag,
        content: this.data.content
      });
    },

    preventClose(e) {
      // 阻止事件冒泡
      e.stopPropagation();
    }
  }
});
