// components/createMessageCard/index.js
const emotionTagMapper = require('../../utils/emotionTagMapper');
const validator = require('../../utils/validator');

Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  data: {
    // 情绪标签
    tag: '我的心情',
    isEditingTag: false,
    
    // 情绪值
    valence: 5,
    arousal: 5,
    
    // 文本内容
    content: '',
    contentPlaceholder: '点击编辑你想分享的内容...',
    isEditingContent: false,
    contentLength: 0,
    
    // 提交状态
    canSubmit: false,
    isSubmitting: false,

    // 动画
    animationClass: ''
  },

  observers: {
    'show': function(show) {
      if (show) {
        // 入场动画
        this.setData({
          animationClass: 'show'
        });
      } else {
        // 退场动画
        this.setData({
          animationClass: ''
        });
      }
    }
  },

  methods: {
    /**
     * 点击背景关闭模态框
     */
    onBackdropClick() {
      this.closeModal();
    },

    /**
     * 阻止事件冒泡（点击卡片不关闭）
     */
    preventClose() {
      // Do nothing
    },

    /**
     * 关闭模态框
     */
    closeModal() {
      this.triggerEvent('close');
    },

    /**
     * 点击标签进入编辑模式
     */
    onTagClick() {
      this.setData({
        isEditingTag: true
      });
    },

    /**
     * 标签输入
     */
    onTagInput(e) {
      const tag = e.detail.value;
      
      // 更新情绪值
      const { valence, arousal } = emotionTagMapper.mapTagToEmotion(tag);
      
      this.setData({
        tag,
        valence,
        arousal
      });
      
      this.validateCanSubmit();
    },

    /**
     * 标签失焦
     */
    onTagBlur() {
      this.setData({
        isEditingTag: false
      });
    },

    /**
     * 标签输入确认（Enter键）
     */
    onTagConfirm(e) {
      const tag = e.detail.value;
      
      // 更新情绪值
      const { valence, arousal } = emotionTagMapper.mapTagToEmotion(tag);
      
      this.setData({
        tag,
        valence,
        arousal,
        isEditingTag: false
      });
      
      this.validateCanSubmit();
    },

    /**
     * 点击内容卡片进入编辑模式
     */
    onContentClick() {
      // 如果是占位符，清空内容
      if (this.data.content === '' || this.data.content === this.data.contentPlaceholder) {
        this.setData({
          content: '',
          isEditingContent: true
        });
      } else {
        this.setData({
          isEditingContent: true
        });
      }
    },

    /**
     * 内容输入
     */
    onContentInput(e) {
      const content = e.detail.value;
      
      this.setData({
        content,
        contentLength: content.length
      });
      
      this.validateCanSubmit();
    },

    /**
     * 内容失焦
     */
    onContentBlur() {
      this.setData({
        isEditingContent: false
      });
    },

    /**
     * 内容聚焦
     */
    onContentFocus() {
      // 自动清空占位符
      if (this.data.content === this.data.contentPlaceholder) {
        this.setData({
          content: ''
        });
      }
    },

    /**
     * 验证是否可以提交
     */
    validateCanSubmit() {
      const { tag, content, contentPlaceholder } = this.data;
      
      // 按照 CreateMessageCard 的逻辑：
      // disabled={!tag.trim() || !content.trim() || content === "点击编辑你想分享的内容..."}
      const canSubmit = (
        tag.trim().length > 0 &&
        content.trim().length > 0 &&
        content !== contentPlaceholder
      );
      
      this.setData({
        canSubmit
      });
    },

    /**
     * 提交表单
     */
    async onSubmit() {
      try {
        // 防止重复提交
        if (this.data.isSubmitting) {
          return;
        }

        // 验证是否可以提交
        if (!this.data.canSubmit) {
          wx.showToast({
            title: '请完成内容填写',
            icon: 'none',
            duration: 2000
          });
          return;
        }

        // 收集数据
        const { tag, content, valence, arousal } = this.data;

        // 验证数据
        const contentValidation = validator.validateContent(content);
        if (!contentValidation.valid) {
          wx.showToast({
            title: contentValidation.message,
            icon: 'none',
            duration: 2000
          });
          return;
        }

        const tagValidation = validator.validateTag(tag);
        if (!tagValidation.valid) {
          wx.showToast({
            title: tagValidation.message,
            icon: 'none',
            duration: 2000
          });
          return;
        }

        // 设置提交状态
        this.setData({
          isSubmitting: true
        });

        // 触发发送事件
        this.triggerEvent('send', {
          tag: tag.trim(),
          valence,
          arousal,
          content: content.trim()
        });

        // 重置表单
        setTimeout(() => {
          this.resetForm();
        }, 300);

      } catch (error) {
        console.error('提交失败：', error);
        
        wx.showToast({
          title: '提交失败，请重试',
          icon: 'none',
          duration: 2000
        });
      } finally {
        // 重置提交状态
        this.setData({
          isSubmitting: false
        });
      }
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.setData({
        tag: '我的心情',
        content: '',
        contentLength: 0,
        valence: 5,
        arousal: 5,
        isEditingTag: false,
        isEditingContent: false,
        canSubmit: false
      });
    }
  }
});
