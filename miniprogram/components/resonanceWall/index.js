// components/resonanceWall/index.js
Component({
  properties: {
    // 控制显示/隐藏
    show: {
      type: Boolean,
      value: false
    },
    // 用户标签
    userTag: {
      type: String,
      value: '我的心情'
    },
    // 用户内容
    userContent: {
      type: String,
      value: ''
    }
  },

  data: {
    // 共鸣数据列表
    resonances: [],
    // 左列数据
    leftColumn: [],
    // 右列数据
    rightColumn: [],
    // 动画状态
    animationStates: {
      userBubble: '',
      title: '',
      scrollList: '',
      closeHint: ''
    }
  },

  lifetimes: {
    attached() {
      this.generateResonanceData();
    }
  },

  observers: {
    'show': function(show) {
      if (show) {
        this.startAnimations();
      }
    }
  },

  methods: {
    /**
     * 生成共鸣数据
     */
    generateResonanceData() {
      const resonances = [
        { tag: "寻找平静", content: "今天感觉心里很乱，希望能找到一个安静的角落，让自己的思绪沉淀下来。", timeAgo: "2小时前" },
        { tag: "需要倾诉", content: "有些话憋在心里太久了，真想找个人好好聊聊，把这些情绪都说出来。", timeAgo: "5小时前" },
        { tag: "渴望理解", content: "总觉得没人能真正理解我的感受，这种孤独感让我很难受。", timeAgo: "1天前" },
        { tag: "寻求支持", content: "最近压力好大，需要一些鼓励和支持，让我知道我不是一个人在战斗。", timeAgo: "3小时前" },
        { tag: "情绪低落", content: "不知道为什么，就是感觉很累，什么都不想做，只想静静待着。", timeAgo: "6小时前" },
        { tag: "焦虑不安", content: "对未来感到很迷茫，不知道自己在做什么，该往哪里去。", timeAgo: "2天前" },
        { tag: "需要陪伴", content: "有时候真的很需要有人在身边，哪怕什么都不说，只是陪着也好。", timeAgo: "4小时前" },
        { tag: "寻找方向", content: "感觉自己像迷失在森林里，找不到出路，希望有人能给我一些指引。", timeAgo: "1天前" },
        { tag: "情感困惑", content: "心里有很多矛盾的感受，不知道该如何处理这些复杂的情绪。", timeAgo: "7小时前" },
        { tag: "渴望成长", content: "虽然现在很难，但我相信这些经历会让我变得更强大。", timeAgo: "3天前" },
        { tag: "自我怀疑", content: "总是在怀疑自己，觉得自己不够好，不够优秀。", timeAgo: "5小时前" },
        { tag: "寻求安慰", content: "今天真的很难过，需要一些温暖的话语来治愈我的心。", timeAgo: "8小时前" },
        { tag: "孤独感", content: "周围有很多人，但还是感觉很孤单，好像没人真正懂我。", timeAgo: "2天前" },
        { tag: "希望改变", content: "不想再这样下去了，想要做出一些改变，让生活变得更好。", timeAgo: "4天前" },
        { tag: "情绪释放", content: "今天终于把压抑已久的情绪都释放出来了，感觉轻松了很多。", timeAgo: "6小时前" },
        { tag: "寻找力量", content: "虽然很累，但我还是要继续前进，为了更好的自己。", timeAgo: "1天前" }
      ];

      const resonancesWithId = resonances.map((item, index) => ({
        ...item,
        id: `resonance-${index}`
      }));

      // 分成两列
      const leftColumn = resonancesWithId.filter((_, i) => i % 2 === 0);
      const rightColumn = resonancesWithId.filter((_, i) => i % 2 === 1);

      this.setData({
        resonances: resonancesWithId,
        leftColumn,
        rightColumn
      });
    },

    /**
     * 开始动画序列
     */
    startAnimations() {
      // 用户帖子上升消失动画 (1.2s)
      this.createUserBubbleAnimation();
      
      // 标题入场动画 (延迟 1.2s)
      setTimeout(() => {
        this.createTitleAnimation();
      }, 1200);

      // 滚动列表动画 (延迟 1.5s)
      setTimeout(() => {
        this.createScrollListAnimation();
      }, 1500);

      // 底部提示动画 (延迟 2s)
      setTimeout(() => {
        this.createCloseHintAnimation();
      }, 2000);
    },

    /**
     * 创建用户帖子上升动画
     */
    createUserBubbleAnimation() {
      const animation = wx.createAnimation({
        duration: 1200,
        timingFunction: 'ease-in'
      });

      animation.opacity(0).scale(0.5).translateY(-1000).step();
      
      this.setData({
        'animationStates.userBubble': animation.export()
      });
    },

    /**
     * 创建标题动画
     */
    createTitleAnimation() {
      const animation = wx.createAnimation({
        duration: 600,
        timingFunction: 'ease-out'
      });

      animation.opacity(1).translateY(0).step();
      
      this.setData({
        'animationStates.title': animation.export()
      });
    },

    /**
     * 创建滚动列表动画
     */
    createScrollListAnimation() {
      const scrollDistance = this.data.resonances.length * 320; // 每个卡片约160rpx高度 × 2
      const duration = this.data.resonances.length * 2000; // 每个共鸣2秒

      const animation = wx.createAnimation({
        duration: duration,
        timingFunction: 'linear'
      });

      animation.translateY(-scrollDistance).step();
      
      this.setData({
        'animationStates.scrollList': animation.export()
      });
    },

    /**
     * 创建底部提示动画
     */
    createCloseHintAnimation() {
      const animation = wx.createAnimation({
        duration: 600,
        timingFunction: 'ease-out'
      });

      animation.opacity(1).step();
      
      this.setData({
        'animationStates.closeHint': animation.export()
      });
    },

    /**
     * 点击背景关闭
     */
    onBackdropClick() {
      this.triggerEvent('complete');
    },

    /**
     * 阻止事件冒泡
     */
    preventClose(e) {
      // 阻止事件冒泡，防止点击内容区域时关闭
      // 使用 catchtap 已经会阻止冒泡，这里只需检查事件对象是否存在
      if (e && e.stopPropagation) {
        e.stopPropagation();
      }
    }
  }
});
