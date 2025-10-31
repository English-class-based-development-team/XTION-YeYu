// pages/publish/index.js
const emotionTagMapper = require('../../utils/emotionTagMapper.js');
const validator = require('../../utils/validator.js');
const { TEXT_LIMIT } = require('../../constants/index.js');
const mockApi = require('../../services/mockApi.js');
const { handleError } = require('../../utils/errorHandler.js');

Page({
  data: {
    // 情绪标签相关
    tag: '我的心情',
    isEditingTag: false,
    // 情绪值
    valence: 5,
    arousal: 5,
    // 防抖定时器
    tagInputDebounceTimer: null,
    // 文本输入相关
    content: '点击编辑你想分享的内容...',
    isEditingContent: false,
    contentLength: 0,
    // 发布相关
    canSubmit: false,
    isSubmitting: false,
  },

  onLoad() {
    // 初始化默认情绪值
    this.updateEmotionValues();
    // 初始化提交验证状态
    this.validateCanSubmit();
  },

  onShow() {},

  onReady() {},

  onHide() {},

  onUnload() {
    // 清理定时器
    if (this.data.tagInputDebounceTimer) {
      clearTimeout(this.data.tagInputDebounceTimer);
    }
  },

  /**
   * 点击标签，进入编辑模式
   */
  onTagClick() {
    this.setData({
      isEditingTag: true,
    });
  },

  /**
   * 标签输入事件（带防抖）
   */
  onTagInput(e) {
    const value = e.detail.value;
    
    // 限制最大长度为10字符
    const trimmedValue = value.slice(0, 10);
    
    // 清除之前的定时器
    if (this.data.tagInputDebounceTimer) {
      clearTimeout(this.data.tagInputDebounceTimer);
    }
    
    // 立即更新显示的文本（用户体验）
    this.setData({
      tag: trimmedValue,
    });
    
    // 防抖：延迟更新情绪值（300ms）
    const timer = setTimeout(() => {
      this.updateEmotionValues();
      this.setData({
        tagInputDebounceTimer: null,
      });
    }, 300);
    
    this.setData({
      tagInputDebounceTimer: timer,
    });
  },

  /**
   * 标签失焦，退出编辑模式
   */
  onTagBlur() {
    this.setData({
      isEditingTag: false,
    });
    // 确保最终更新情绪值
    this.updateEmotionValues();
    // 更新提交验证状态
    this.validateCanSubmit();
  },

  /**
   * 标签输入完成（按下回车）
   */
  onTagConfirm(e) {
    this.setData({
      isEditingTag: false,
    });
    this.updateEmotionValues();
  },

  /**
   * 根据标签文本更新情绪值
   */
  updateEmotionValues() {
    const { valence, arousal } = emotionTagMapper.mapTagToEmotion(this.data.tag);
    
    // 验证情绪值
    if (emotionTagMapper.validateEmotionValues(valence, arousal)) {
      this.setData({
        valence,
        arousal,
      });
    } else {
      console.warn('情绪值超出范围，使用默认值');
      this.setData({
        valence: 5,
        arousal: 5,
      });
    }
  },

  /**
   * 点击文本卡片，进入编辑模式
   */
  onContentClick() {
    // 如果当前是占位符文本，先清空
    if (this.data.content === '点击编辑你想分享的内容...') {
      this.setData({
        content: '',
        contentLength: 0,
        isEditingContent: true,
      });
    } else {
      this.setData({
        isEditingContent: true,
      });
    }
  },

  /**
   * 文本输入事件（实时更新内容和字数）
   */
  onContentInput(e) {
    const value = e.detail.value;
    
    // 限制最大长度为300字符
    const trimmedValue = value.slice(0, TEXT_LIMIT.MAX_CONTENT_LENGTH);
    
    // 计算字数
    const length = trimmedValue.length;
    
    // 合并更新，避免频繁调用 setData
    this.setData({
      content: trimmedValue,
      contentLength: length,
    });
    
    // 更新提交验证状态
    this.validateCanSubmit();
    
    // 实时验证（可选，用于后续显示验证提示）
    // 注意：这里不阻塞输入，只是记录验证结果
    const validation = validator.validateContent(trimmedValue);
    if (!validation.valid && length > 0) {
      // 可以在这里显示提示，但不阻止输入
      // 因为 maxlength 已经限制了长度
    }
  },

  /**
   * 文本失焦，退出编辑模式
   */
  onContentBlur() {
    // 如果内容为空，恢复占位符
    const trimmedContent = this.data.content.trim();
    if (trimmedContent.length === 0) {
      this.setData({
        content: '点击编辑你想分享的内容...',
        contentLength: 0,
        isEditingContent: false,
      });
    } else {
      this.setData({
        isEditingContent: false,
      });
    }
    // 更新提交验证状态
    this.validateCanSubmit();
  },

  /**
   * 文本聚焦事件（选中所有文本）
   */
  onContentFocus() {
    // 微信小程序 textarea 不支持直接选中文本，但可以通过设置 value 实现类似效果
    // 如果当前是占位符文本，清空以便用户输入
    if (this.data.content === '点击编辑你想分享的内容...') {
      this.setData({
        content: '',
        contentLength: 0,
      });
    }
  },

  /**
   * 判断内容是否为占位符文本
   */
  isContentPlaceholder() {
    return this.data.content === '点击编辑你想分享的内容...' || this.data.content.trim().length === 0;
  },

  /**
   * 验证是否可以提交
   * 禁用条件：标签为空 或 内容为空 或 内容是占位符
   */
  validateCanSubmit() {
    const { tag, content } = this.data;
    
    // 按照 CreateMessageCard 的逻辑：
    // disabled={!tag.trim() || !content.trim() || content === "点击编辑你想分享的内容..."}
    const canSubmit = (
      tag.trim().length > 0 &&
      content.trim().length > 0 &&
      content !== '点击编辑你想分享的内容...'
    );
    
    this.setData({
      canSubmit,
    });
    
    return canSubmit;
  },

  /**
   * 发布按钮点击事件
   */
  async onSubmit() {
    try {
      // 防止重复提交
      if (this.data.isSubmitting) {
        return;
      }

      // 验证是否可以提交
      if (!this.validateCanSubmit()) {
        wx.showToast({
          title: '请完成内容填写',
          icon: 'none',
          duration: 2000,
        });
        return;
      }

      // 收集数据
      const { tag, content, valence, arousal } = this.data;

      // 验证数据
      const contentValidation = validator.validateContent(content);
      if (!contentValidation.valid) {
        wx.showToast({
          title: contentValidation.error,
          icon: 'none',
          duration: 2000,
        });
        return;
      }

      const tagValidation = validator.validateTag(tag);
      if (!tagValidation.valid) {
        wx.showToast({
          title: tagValidation.error,
          icon: 'none',
          duration: 2000,
        });
        return;
      }

      // 设置提交状态
      this.setData({
        isSubmitting: true,
      });

      // 调用 Mock API 发布帖子
      const postData = {
        tag: tag.trim(),
        valence,
        arousal,
        content: content.trim(),
      };

      console.log('发布数据：', postData);

      const response = await mockApi.publishPost(postData);

      // 处理发布结果
      if (response.success) {
        // 发布成功
        wx.showToast({
          title: '发布成功！',
          icon: 'success',
          duration: 2000,
        });

        // 发布成功后清空输入
        this.resetForm();

        // TODO: 阶段四实现 - 触发共鸣流展示
        // this.triggerResonanceWall(tag, content);
        
      } else {
        // 发布失败
        throw new Error(response.message || '发布失败');
      }
    } catch (error) {
      // 错误处理
      console.error('发布失败：', error);
      
      const formattedError = handleError(error, {
        operation: 'publishPost',
        showToast: true,
      });

      wx.showToast({
        title: formattedError.message || '发布失败，请重试',
        icon: 'none',
        duration: 2000,
      });
    } finally {
      // 重置提交状态
      this.setData({
        isSubmitting: false,
      });
    }
  },

  /**
   * 重置表单（发布成功后）
   */
  resetForm() {
    this.setData({
      tag: '我的心情',
      content: '点击编辑你想分享的内容...',
      contentLength: 0,
      valence: 5,
      arousal: 5,
      isEditingTag: false,
      isEditingContent: false,
      canSubmit: false,
    });
  },

  /**
   * 触发共鸣流展示（TODO: 阶段四实现）
   */
  triggerResonanceWall(tag, content) {
    // 这将在阶段四实现
    // 跳转到共鸣流页面，并传递用户发布的内容
    console.log('TODO: 触发共鸣流展示', { tag, content });
  },
});

