// components/searchResultsWall/index.js
Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    searchQuery: {
      type: String,
      value: ''
    },
    results: {
      type: Array,
      value: []
    }
  },

  data: {
    leftColumn: [],
    rightColumn: [],
    selectedResonance: null,
    showDetail: false,
    animation: null
  },

  observers: {
    'results': function(newResults) {
      this.splitColumns(newResults);
    },
    'show': function(newVal) {
      if (newVal) {
        this.showWall();
      } else {
        this.hideWall();
      }
    }
  },

  lifetimes: {
    attached() {
      // 组件初始化
    }
  },

  methods: {
    /**
     * 显示墙体动画
     */
    showWall() {
      const animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease-out'
      });
      animation.opacity(1).step();

      this.setData({
        animation: animation.export()
      });
    },

    /**
     * 隐藏墙体动画
     */
    hideWall() {
      const animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease-in'
      });
      animation.opacity(0).step();

      this.setData({
        animation: animation.export()
      });

      setTimeout(() => {
        this.triggerEvent('close');
      }, 300);
    },

    /**
     * 将结果分成两列
     */
    splitColumns(results) {
      const leftColumn = [];
      const rightColumn = [];

      results.forEach((item, index) => {
        // 为每个卡片创建入场动画
        const cardAnimation = wx.createAnimation({
          duration: 400,
          timingFunction: 'ease-out',
          delay: index * 50 // 错开延迟
        });
        cardAnimation.opacity(1).translateY(0).step();

        const itemWithAnimation = {
          ...item,
          animation: cardAnimation.export(),
          // 初始状态样式类
          animationClass: ''
        };

        if (index % 2 === 0) {
          leftColumn.push(itemWithAnimation);
        } else {
          rightColumn.push(itemWithAnimation);
        }
      });

      this.setData({
        leftColumn,
        rightColumn
      });

      // 触发卡片入场动画
      setTimeout(() => {
        this.animateCards();
      }, 100);
    },

    /**
     * 触发卡片入场动画
     */
    animateCards() {
      const leftColumn = this.data.leftColumn.map((item, index) => {
        const animation = wx.createAnimation({
          duration: 400,
          timingFunction: 'ease-out',
          delay: index * 50
        });
        animation.opacity(1).translateY(0).step();
        return {
          ...item,
          animation: animation.export(),
          animationClass: 'card-show'
        };
      });

      const rightColumn = this.data.rightColumn.map((item, index) => {
        const animation = wx.createAnimation({
          duration: 400,
          timingFunction: 'ease-out',
          delay: index * 50 + 25 // 右列稍微延迟一点
        });
        animation.opacity(1).translateY(0).step();
        return {
          ...item,
          animation: animation.export(),
          animationClass: 'card-show'
        };
      });

      this.setData({
        leftColumn,
        rightColumn
      });
    },

    /**
     * 点击返回按钮
     */
    onBackTap() {
      this.hideWall();
    },

    /**
     * 点击卡片
     */
    onCardTap(e) {
      const { item } = e.currentTarget.dataset;
      this.setData({
        selectedResonance: item,
        showDetail: true
      });
    },

    /**
     * 关闭详情
     */
    onDetailClose() {
      this.setData({
        showDetail: false,
        selectedResonance: null
      });
    }
  }
});

