// components/resonanceDetail/index.js
Component({
  properties: {
    // 控制显示/隐藏
    show: {
      type: Boolean,
      value: false
    },
    // 标签
    tag: {
      type: String,
      value: ''
    },
    // 内容
    content: {
      type: String,
      value: ''
    },
    // 时间
    timeAgo: {
      type: String,
      value: ''
    }
  },

  data: {
    // 共情数量
    empathyCount: 0,
    // 是否已共情
    hasEmpathized: false,
    // 评论输入
    commentInput: '',
    // 评论列表
    comments: [],
    // 动画状态
    animationStates: {
      tag: '',
      content: '',
      empathy: '',
      comments: ''
    }
  },

  lifetimes: {
    attached() {
      this.initData();
    }
  },

  observers: {
    'show': function(show) {
      console.log('resonanceDetail show 状态变化:', show);
      console.log('接收到的数据:', this.properties);
      if (show) {
        this.initData();
        this.startAnimations();
      }
    }
  },

  methods: {
    /**
     * 初始化数据
     */
    initData() {
      // 生成随机共情数（10-60之间）
      const empathyCount = Math.floor(Math.random() * 50) + 10;
      
      // 生成模拟评论数据
      const comments = [
        { id: "1", author: "匿名用户A", content: "我也有同样的感受，你不是一个人。", timeAgo: "1小时前" },
        { id: "2", author: "匿名用户B", content: "抱抱你，一切都会好起来的。", timeAgo: "2小时前" },
        { id: "3", author: "匿名用户C", content: "感同身受，有时候真的需要被理解。", timeAgo: "3小时前" },
        { id: "4", author: "匿名用户D", content: "加油！时间会治愈一切的。", timeAgo: "5小时前" },
        { id: "5", author: "匿名用户E", content: "看到这个感觉很温暖，我们都在一起努力。", timeAgo: "6小时前" },
      ];

      this.setData({
        empathyCount,
        hasEmpathized: false,
        commentInput: '',
        comments
      });
    },

    /**
     * 开始动画序列
     */
    startAnimations() {
      // 标签动画 (延迟 0.1s, 持续时间 0.4s)
      setTimeout(() => {
        this.createTagAnimation();
      }, 100);

      // 内容动画 (延迟 0.2s, 持续时间 0.4s)
      setTimeout(() => {
        this.createContentAnimation();
      }, 200);

      // 共情按钮动画 (延迟 0.3s, 持续时间 0.4s)
      setTimeout(() => {
        this.createEmpathyAnimation();
      }, 300);

      // 评论区域动画 (延迟 0.4s, 持续时间 0.4s)
      setTimeout(() => {
        this.createCommentsAnimation();
      }, 400);
    },

    /**
     * 创建标签动画
     */
    createTagAnimation() {
      const animation = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease-out'
      });

      animation.opacity(1).translateY(0).scale(1).step();
      
      this.setData({
        'animationStates.tag': animation.export()
      });
    },

    /**
     * 创建内容动画
     */
    createContentAnimation() {
      const animation = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease-out'
      });

      animation.opacity(1).translateY(0).scale(1).step();
      
      this.setData({
        'animationStates.content': animation.export()
      });
    },

    /**
     * 创建共情按钮动画
     */
    createEmpathyAnimation() {
      const animation = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease-out'
      });

      animation.opacity(1).translateY(0).scale(1).step();
      
      this.setData({
        'animationStates.empathy': animation.export()
      });
    },

    /**
     * 创建评论区域动画
     */
    createCommentsAnimation() {
      const animation = wx.createAnimation({
        duration: 400,
        timingFunction: 'ease-out'
      });

      animation.opacity(1).translateY(0).scale(1).step();
      
      this.setData({
        'animationStates.comments': animation.export()
      });
    },

    /**
     * 处理共情点击
     */
    handleEmpathy() {
      if (!this.data.hasEmpathized) {
        this.setData({
          empathyCount: this.data.empathyCount + 1,
          hasEmpathized: true
        });
      }
    },

    /**
     * 评论输入
     */
    onCommentInput(e) {
      this.setData({
        commentInput: e.detail.value
      });
    },

    /**
     * 发送评论
     */
    handleSendComment() {
      const commentInput = this.data.commentInput.trim();
      if (!commentInput) return;

      const newComment = {
        id: Date.now().toString(),
        author: "我",
        content: commentInput,
        timeAgo: "刚刚"
      };

      this.setData({
        comments: [newComment, ...this.data.comments],
        commentInput: ''
      });
    },

    /**
     * 关闭详情页
     */
    onClose() {
      this.triggerEvent('close');
    }
  }
});

