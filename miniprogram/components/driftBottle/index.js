// components/driftBottle/index.js
Component({
  properties: {
    onClick: {
      type: Function,
      value: null
    }
  },

  data: {
    // 动画相关
    floatAnimation: null,
    waveAnimation: null,
    particleAnimations: []
  },

  lifetimes: {
    attached() {
      this.createAnimations();
    },
    detached() {
      // 清理动画
    }
  },

  methods: {
    createAnimations() {
      // 瓶子漂浮动画
      const floatAnimation = wx.createAnimation({
        duration: 5000,
        timingFunction: 'ease-in-out',
      });
      
      // 波纹动画
      const waveAnimation = wx.createAnimation({
        duration: 3500,
        timingFunction: 'ease-in-out',
      });

      this.setData({
        floatAnimation,
        waveAnimation
      });

      // 启动动画循环
      this.animateBottle();
      this.animateWave();
    },

    animateBottle() {
      const animation = wx.createAnimation({
        duration: 5000,
        timingFunction: 'ease-in-out',
      });

      // 执行漂浮动画
      animation.translateY(-24).rotate(1.5).step();
      animation.translateY(0).rotate(-1.5).step();

      this.setData({
        floatAnimation: animation.export()
      });

      // 循环动画
      setTimeout(() => {
        this.animateBottle();
      }, 10000);
    },

    animateWave() {
      const animation = wx.createAnimation({
        duration: 3500,
        timingFunction: 'ease-in-out',
      });

      // 执行波纹动画
      animation.scaleX(1.15).opacity(0.6).step();
      animation.scaleX(1).opacity(0.4).step();

      this.setData({
        waveAnimation: animation.export()
      });

      // 循环动画
      setTimeout(() => {
        this.animateWave();
      }, 7000);
    },

    onBottleClick() {
      // 触发点击事件
      this.triggerEvent('click');
    }
  }
});
