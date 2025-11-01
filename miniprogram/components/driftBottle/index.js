// components/driftBottle/index.js
Component({
  properties: {
    // 移除了 onClick 属性，使用事件机制代替
  },

  data: {
    // 动画相关
    floatAnimation: null,
    waveAnimation: null,
    paperAnimation: null,
    particleAnimations: [],
    // 定时器ID存储
    bottleTimerId: null,
    waveTimerId: null,
    paperTimerId: null
  },

  lifetimes: {
    attached() {
      this.createAnimations();
      // 延迟绘制波浪线，确保Canvas已渲染
      setTimeout(() => {
        this.drawWaves();
      }, 100);
    },
    detached() {
      // 清理动画定时器（已禁用瓶子和信纸动画，但保留清理代码以防万一）
      if (this.data.bottleTimerId) {
        clearTimeout(this.data.bottleTimerId);
        this.data.bottleTimerId = null;
      }
      if (this.data.waveTimerId) {
        clearTimeout(this.data.waveTimerId);
        this.data.waveTimerId = null;
      }
      if (this.data.paperTimerId) {
        clearTimeout(this.data.paperTimerId);
        this.data.paperTimerId = null;
      }
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

      // 信纸动画
      const paperAnimation = wx.createAnimation({
        duration: 4000,
        timingFunction: 'ease-in-out',
      });

      this.setData({
        floatAnimation,
        waveAnimation,
        paperAnimation
      });

      // 启动动画循环（只保留波浪线动画，瓶子和信纸不移动）
      // this.animateBottle(); // 已禁用瓶子动画
      // this.animateWave(); // 波浪线动画已通过CSS实现，不需要JS动画
      // this.animatePaper(); // 已禁用信纸动画
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
      this.data.bottleTimerId = setTimeout(() => {
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
      this.data.waveTimerId = setTimeout(() => {
        this.animateWave();
      }, 7000);
    },

    animatePaper() {
      const animation = wx.createAnimation({
        duration: 4000,
        timingFunction: 'ease-in-out',
      });

      // 执行信纸旋转动画 (从-4度到-2度)
      // 注意：由于使用 margin-left 实现居中，transform 只需要处理旋转
      animation.rotate(-2).step();
      animation.rotate(-4).step();

      this.setData({
        paperAnimation: animation.export()
      });

      // 循环动画
      this.data.paperTimerId = setTimeout(() => {
        this.animatePaper();
      }, 8000);
    },

    onBottleClick() {
      // 触发点击事件
      this.triggerEvent('click');
    },

    drawWaves() {
      // Canvas容器尺寸：640rpx × 192rpx
      // 在微信小程序中，Canvas使用物理像素，需要根据设备计算
      // 获取窗口信息
      const windowInfo = wx.getWindowInfo();
      // 设计稿宽度（rpx基准），通常是750rpx
      const designWidth = 750;
      // 计算rpx到px的转换比例
      const rpxRatio = windowInfo.windowWidth / designWidth;
      // Canvas实际像素尺寸
      const canvasWidthPx = 640 * rpxRatio;
      const canvasHeightPx = 192 * rpxRatio;
      
      // 绘制第一条波浪线 (对应 SVG: M0,48 Q40,20 80,48 T160,48 T240,48 T320,48)
      const ctx1 = wx.createCanvasContext('waveCanvas1', this);
      
      // 使用viewBox坐标系 (0-320, 0-96)，需要缩放到实际Canvas尺寸
      const scaleX = canvasWidthPx / 320;
      const scaleY = canvasHeightPx / 96;
      
      ctx1.save();
      ctx1.scale(scaleX, scaleY);
      
      // 第一条波浪线 - #E89B6D, strokeWidth 12, opacity 0.3
      ctx1.beginPath();
      ctx1.moveTo(0, 48);
      // 绘制连续的二次贝塞尔曲线形成波浪
      ctx1.quadraticCurveTo(40, 20, 80, 48);
      ctx1.quadraticCurveTo(120, 20, 160, 48);
      ctx1.quadraticCurveTo(200, 20, 240, 48);
      ctx1.quadraticCurveTo(280, 20, 320, 48);
      ctx1.setStrokeStyle('#E89B6D');
      ctx1.setLineWidth(12);
      ctx1.setLineCap('round');
      ctx1.setGlobalAlpha(0.3);
      ctx1.stroke();
      ctx1.restore();
      ctx1.draw(false);

      // 绘制第二条波浪线 (对应 SVG: M0,64 Q40,36 80,64 T160,64 T240,64 T320,64)
      const ctx2 = wx.createCanvasContext('waveCanvas2', this);
      
      ctx2.save();
      ctx2.scale(scaleX, scaleY);
      
      // 第二条波浪线 - #F8E6D0, strokeWidth 10, opacity 0.25
      ctx2.beginPath();
      ctx2.moveTo(0, 64);
      ctx2.quadraticCurveTo(40, 36, 80, 64);
      ctx2.quadraticCurveTo(120, 36, 160, 64);
      ctx2.quadraticCurveTo(200, 36, 240, 64);
      ctx2.quadraticCurveTo(280, 36, 320, 64);
      ctx2.setStrokeStyle('#F8E6D0');
      ctx2.setLineWidth(10);
      ctx2.setLineCap('round');
      ctx2.setGlobalAlpha(0.25);
      ctx2.stroke();
      ctx2.restore();
      ctx2.draw(false);
    }
  }
});
