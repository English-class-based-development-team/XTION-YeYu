// components/searchModal/index.js
Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  data: {
    query: '',
    animation: null,
    backdropAnimation: null,
    exampleTags: ['孤独', '焦虑', '需要陪伴', '寻找平静']
  },

  lifetimes: {
    attached() {
      // 组件初始化
    }
  },

  observers: {
    'show': function(newVal) {
      if (newVal) {
        this.showModal();
      } else {
        this.hideModal();
      }
    }
  },

  methods: {
    /**
     * 显示模态框动画
     */
    showModal() {
      // 背景遮罩动画
      const backdropAnimation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease-out'
      });
      backdropAnimation.opacity(1).step();

      // 内容盒子动画 - spring效果用ease-out模拟
      const animation = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease-out'
      });
      animation.opacity(1).scale(1).translateY(0).step();

      this.setData({
        backdropAnimation: backdropAnimation.export(),
        animation: animation.export()
      });
    },

    /**
     * 隐藏模态框动画
     */
    hideModal() {
      // 背景遮罩动画
      const backdropAnimation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease-in'
      });
      backdropAnimation.opacity(0).step();

      // 内容盒子动画
      const animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease-in'
      });
      animation.opacity(0).scale(0.9).translateY(-40).step();

      this.setData({
        backdropAnimation: backdropAnimation.export(),
        animation: animation.export()
      });

      // 动画完成后触发关闭事件
      setTimeout(() => {
        this.triggerEvent('close');
      }, 300);
    },

    /**
     * 输入框输入事件
     */
    onInput(e) {
      this.setData({
        query: e.detail.value
      });
    },

    /**
     * 点击背景遮罩关闭
     */
    onBackdropTap() {
      this.hideModal();
    },

    /**
     * 点击内容区域阻止冒泡
     */
    onContentTap(e) {
      // 阻止事件冒泡到背景遮罩
      // 不需要做任何事情，只是阻止冒泡
    },

    /**
     * 点击关闭按钮
     */
    onCloseTap() {
      this.hideModal();
    },

    /**
     * 点击搜索按钮
     */
    onSearchTap() {
      const query = this.data.query.trim();
      if (query) {
        this.triggerEvent('search', { query });
        this.hideModal();
      }
    },

    /**
     * 输入框确认事件（键盘搜索按钮）
     */
    onConfirm(e) {
      const query = e.detail.value.trim();
      if (query) {
        this.triggerEvent('search', { query });
        this.hideModal();
      }
    },

    /**
     * 点击示例标签
     */
    onExampleTap(e) {
      const example = e.currentTarget.dataset.example;
      this.setData({
        query: example
      });
      this.triggerEvent('search', { query: example });
      this.hideModal();
    }
  }
});

