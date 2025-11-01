// components/createMessageCard/index.js
const emotionTagMapper = require('../../utils/emotionTagMapper');
const validator = require('../../utils/validator');
const { EMOTION_TAGS, EMOTION_TAGS_CN } = require('../../constants/index');
const apiService = require('../../services/api');
const anonymousId = require('../../utils/anonymousId');

Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    userId: {
      type: String,
      value: ''
    },
    username: {
      type: String,
      value: ''
    }
  },

  data: {
    // 情绪标签
    tag: '我的心情',
    tagEN: '', // 存储英文标签
    isEditingTag: false,
    isTagSelectorExpanded: false, // 标签选择器是否展开
    
    // 情绪标签选择器
    emotionTags: EMOTION_TAGS,
    emotionTagsCN: EMOTION_TAGS_CN,
    emotionTagsArray: EMOTION_TAGS.map(tag => EMOTION_TAGS_CN[tag]),
    selectedTagIndex: -1,
    
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
     * 点击标签气泡，展开/收起选择器
     */
    onTagBubbleClick() {
      this.setData({
        isTagSelectorExpanded: !this.data.isTagSelectorExpanded
      });
    },

    /**
     * 选择某个情绪标签
     */
    onSelectTag(e) {
      const index = e.currentTarget.dataset.index;
      const tagEN = this.data.emotionTags[index];
      const tagCN = this.data.emotionTagsCN[tagEN];
      
      console.log('选择情绪标签:', { index, tagEN, tagCN });
      
      // 更新情绪值
      const { valence, arousal } = emotionTagMapper.mapTagToEmotion(tagCN);
      
      this.setData({
        tag: tagCN,
        tagEN: tagEN,
        selectedTagIndex: index,
        valence,
        arousal,
        isTagSelectorExpanded: false // 选择后收起
      });
      
      this.validateCanSubmit();
    },

    /**
     * 点击标签选择器外部区域，收起选择器
     */
    onTagSelectorBackdropClick() {
      if (this.data.isTagSelectorExpanded) {
        this.setData({
          isTagSelectorExpanded: false
        });
      }
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
    onSubmit() {
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
        const { tag, content, valence, arousal, tagEN } = this.data;

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

        // 获取用户信息
        const { userId, username } = this.properties;
        const currentUserId = userId || anonymousId.getAnonymousId();
        const currentUsername = username || anonymousId.getUserInfo().username || '朋友';

        // 显示加载提示
        wx.showLoading({
          title: '正在保存...',
          mask: true
        });

        const self = this;
        const emotionTag = tagEN || 'calm'; // 使用英文标签，默认为 calm
        const emotionIntensity = Math.round((Math.abs(valence - 5) + Math.abs(arousal - 5)) / 2); // 根据 valence 和 arousal 计算强度

        // 将内容直接发布为帖子保存到数据库
        const postData = {
          user_id: currentUserId,
          username: currentUsername,
          content: content.trim(),
          emotion_tag: emotionTag,
          emotion_intensity: emotionIntensity
        };

        console.log('发送到漂流瓶，保存帖子:', postData);

        apiService.publishPost(postData)
          .then((publishResult) => {
            wx.hideLoading();

            if (publishResult && publishResult.post_id) {
              // 发布成功
              wx.showToast({
                title: '已保存为历史记录',
                icon: 'success',
                duration: 2000
              });

              // 触发 postpublished 事件，通知父组件刷新 ProactiveCare
              self.triggerEvent('postpublished', {
                postId: publishResult.post_id,
                summary: content.trim(),
                emotionTag: emotionTag
              });

              // 触发发送事件（用于显示共鸣墙）
              self.triggerEvent('send', {
                tag: emotionTag,
                valence,
                arousal,
                content: content.trim()
              });

              // 重置表单
              setTimeout(() => {
                self.resetForm();
              }, 300);
            } else {
              throw new Error('保存失败');
            }
          })
          .catch((error) => {
            console.error('发送到漂流瓶失败:', error);
            wx.hideLoading();
            wx.showToast({
              title: error.message || '操作失败，请重试',
              icon: 'none',
              duration: 3000
            });
          })
          .finally(() => {
            // 重置提交状态
            self.setData({
              isSubmitting: false
            });
          });

      } catch (error) {
        console.error('提交失败：', error);
        
        wx.showToast({
          title: '提交失败，请重试',
          icon: 'none',
          duration: 2000
        });
        
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
        tagEN: '',
        selectedTagIndex: -1,
        content: '',
        contentLength: 0,
        valence: 5,
        arousal: 5,
        isEditingTag: false,
        isEditingContent: false,
        isTagSelectorExpanded: false,
        canSubmit: false
      });
    }
  }
});
