// pages/profile/index.js
const apiService = require('../../services/api.js');
const { getAnonymousId } = require('../../utils/anonymousId.js');
const dateUtils = require('../../utils/dateUtils.js');
const emotionTagCN = require('../../utils/emotionTagCN.js');

Page({
  data: {
    // 用户ID
    userId: '',
    
    // 加载状态
    isLoading: false,
    loadingText: '加载中...',
    
    // 用户资料
    profile: {
      avatar: '',
      nickname: '用户',
      greeting: '继续保持热爱',
      joinDate: null,
      companionDays: 1
    },
    
    // 编辑状态
    isEditingProfile: false,
    editingProfile: {
      avatar: '',
      nickname: '',
      greeting: ''
    },
    
    // 头像列表
    avatarList: ['😊', '🌟', '🌸', '🎨', '📚', '🎵', '☕', '🌈'],
    
    // 时间段问候语
    timeGreeting: '你好',
    
    // 统计数据
    stats: {
      bottlesCount: 0,
      resonancesCount: 0,
      conversationsCount: 0,
      companionDays: 1
    },
    
    // 情绪统计数据
    emotionStats: {
      week_data: [],
      total_posts: 0
    },
    
    // 我的内容
    bottles: [],
    resonances: [],
    conversations: [],
    
    // 设置列表
    settingsList: [
      { icon: '🔔', label: '通知提醒' },
      { icon: '🔒', label: '隐私设置' },
      { icon: '🎨', label: '外观主题' },
      { icon: '❓', label: '帮助与反馈' },
      { icon: 'ℹ️', label: '关于应用' }
    ],
    
    // 图表图例
    chartLegend: [
      { emotion: '平静', color: '#98D8C8' },
      { emotion: '快乐', color: '#FFD89C' },
      { emotion: '焦虑', color: '#FFB09C' },
      { emotion: '感恩', color: '#E89B6D' }
    ],
    
    // 刷新状态
    isRefreshing: false
  },

  onLoad(options) {
    // 获取用户ID
    try {
      const anonymousId = getAnonymousId();
      // 确保用户ID格式正确（后端API期望的格式）
      const userId = anonymousId.startsWith('user_') ? anonymousId : `user_${anonymousId}`;
      this.setData({ userId });
      
      // 获取时间段问候语
      const timeGreeting = dateUtils.getTimeGreeting();
      this.setData({ timeGreeting });
      
      // 加载数据
      this.loadProfileData();
    } catch (e) {
      console.error('获取用户ID失败:', e);
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none'
      });
    }
  },

  onShow() {
    // 页面显示时刷新数据（如果已加载过）
    if (this.data.userId) {
      this.loadProfileData(false);
    }
  },

  /**
   * 加载个人中心数据
   * @param {Boolean} showLoading - 是否显示加载提示
   */
  async loadProfileData(showLoading = true) {
    if (showLoading) {
      this.setData({ isLoading: true, loadingText: '加载中...' });
    }
    
    try {
      const userId = this.data.userId;
      
      // 并行加载所有数据
      const [
        profileResult,
        statsResult,
        emotionStatsResult,
        bottlesResult,
        resonancesResult,
        conversationsResult
      ] = await Promise.allSettled([
        apiService.getUserProfile(userId),
        apiService.getProfileStats(userId),
        apiService.getEmotionStats(userId),
        apiService.getUserBottles(userId, 50, 0),
        apiService.getUserResonances(userId, 25),
        apiService.getSavedConversations(userId, 50, 0)
      ]);
      
      // 处理用户资料
      if (profileResult.status === 'fulfilled') {
        const profileData = profileResult.value;
        const companionDays = dateUtils.getCompanionDays(profileData.join_date);
        
        this.setData({
          profile: {
            avatar: profileData.avatar || '👤',
            nickname: profileData.nickname || '用户',
            greeting: profileData.greeting || '继续保持热爱',
            joinDate: profileData.join_date,
            companionDays: companionDays
          },
          editingProfile: {
            avatar: profileData.avatar || '👤',
            nickname: profileData.nickname || '用户',
            greeting: profileData.greeting || '继续保持热爱'
          }
        });
      } else {
        // 404 错误表示用户资料不存在，使用默认值（新用户）
        if (profileResult.reason?.statusCode === 404) {
          console.log('用户资料不存在，使用默认值（新用户）');
          // 保持默认的 profile 数据
        } else {
          console.error('获取用户资料失败:', profileResult.reason);
        }
      }
      
      // 处理统计数据
      if (statsResult.status === 'fulfilled') {
        const statsData = statsResult.value;
        this.setData({
          stats: {
            bottlesCount: statsData.bottles_count || 0,
            resonancesCount: statsData.resonances_count || 0,
            conversationsCount: statsData.conversations_count || 0,
            companionDays: statsData.companion_days || 1
          }
        });
      } else {
        // 404 错误表示统计数据不存在，使用默认值
        if (statsResult.reason?.statusCode !== 404) {
          console.error('获取统计数据失败:', statsResult.reason);
        }
      }
      
      // 处理情绪统计数据
      if (emotionStatsResult.status === 'fulfilled') {
        const emotionData = emotionStatsResult.value;
        if (emotionData && emotionData.week_data) {
          this.setData({
            emotionStats: {
              week_data: emotionData.week_data || [],
              total_posts: emotionData.total_posts || 0
            }
          }, () => {
            // 数据更新后绘制图表
            this.drawEmotionChart();
          });
        }
      } else {
        // 404 错误表示情绪统计不存在，使用默认值
        if (emotionStatsResult.reason?.statusCode !== 404) {
          console.error('获取情绪统计失败:', emotionStatsResult.reason);
        }
      }
      
      // 处理我的漂流瓶
      if (bottlesResult.status === 'fulfilled') {
        const bottlesData = bottlesResult.value;
        if (bottlesData && bottlesData.bottles) {
          // 格式化日期和情绪标签
          const formattedBottles = bottlesData.bottles.map(bottle => ({
            ...bottle,
            emotion_tag: emotionTagCN.getEmotionTagCN(bottle.emotion_tag),
            relativeTime: dateUtils.formatRelativeTime(bottle.timestamp)
          }));
          this.setData({ bottles: formattedBottles });
        }
      } else {
        // 404 错误表示漂流瓶列表不存在，使用默认值
        if (bottlesResult.reason?.statusCode !== 404) {
          console.error('获取漂流瓶列表失败:', bottlesResult.reason);
        }
      }
      
      // 处理共鸣记录
      if (resonancesResult.status === 'fulfilled') {
        const resonancesData = resonancesResult.value;
        if (resonancesData && resonancesData.resonances) {
          // 格式化日期和情绪标签
          const formattedResonances = resonancesData.resonances.map(resonance => {
            const postData = typeof resonance.post_data === 'string' 
              ? JSON.parse(resonance.post_data) 
              : resonance.post_data;
            return {
              id: resonance.id,
              tag: emotionTagCN.getEmotionTagCN(postData.emotion_tag || '未知'),
              content: postData.content || '',
              relativeTime: dateUtils.formatRelativeTime(resonance.viewed_at)
            };
          });
          this.setData({ resonances: formattedResonances });
        }
      } else {
        // 404 错误表示共鸣记录不存在，使用默认值
        if (resonancesResult.reason?.statusCode !== 404) {
          console.error('获取共鸣记录失败:', resonancesResult.reason);
        }
      }
      
      // 处理保存的对话
      if (conversationsResult.status === 'fulfilled') {
        const conversationsData = conversationsResult.value;
        if (conversationsData && conversationsData.conversations) {
          // 格式化日期
          const formattedConversations = conversationsData.conversations.map(conv => ({
            id: conv.id,
            title: conv.title || '未命名对话',
            preview: conv.preview || '',
            relativeTime: dateUtils.formatRelativeTime(conv.saved_at)
          }));
          this.setData({ conversations: formattedConversations });
        }
      } else {
        // 404 错误表示保存的对话不存在，使用默认值
        if (conversationsResult.reason?.statusCode !== 404) {
          console.error('获取保存的对话失败:', conversationsResult.reason);
        }
      }
      
    } catch (error) {
      console.error('加载个人中心数据失败:', error);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  /**
   * 开始编辑资料
   */
  onEditProfile() {
    this.setData({
      isEditingProfile: true,
      editingProfile: {
        avatar: this.data.profile.avatar,
        nickname: this.data.profile.nickname,
        greeting: this.data.profile.greeting
      }
    });
  },

  /**
   * 取消编辑
   */
  onCancelEdit() {
    this.setData({
      isEditingProfile: false,
      editingProfile: {
        avatar: this.data.profile.avatar,
        nickname: this.data.profile.nickname,
        greeting: this.data.profile.greeting
      }
    });
  },

  /**
   * 保存资料
   */
  async onSaveProfile() {
    const { editingProfile, userId } = this.data;
    
    // 验证昵称
    if (!editingProfile.nickname || editingProfile.nickname.trim() === '') {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ isLoading: true, loadingText: '保存中...' });
    
    try {
      const result = await apiService.updateUserProfile(userId, {
        avatar: editingProfile.avatar,
        nickname: editingProfile.nickname.trim(),
        greeting: editingProfile.greeting ? editingProfile.greeting.trim() : null
      });
      
      // 更新本地数据
      this.setData({
        profile: {
          ...this.data.profile,
          avatar: result.avatar || editingProfile.avatar,
          nickname: result.nickname || editingProfile.nickname,
          greeting: result.greeting || editingProfile.greeting,
          joinDate: result.join_date || this.data.profile.joinDate
        },
        isEditingProfile: false
      });
      
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('保存资料失败:', error);
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ isLoading: false });
    }
  },

  /**
   * 输入昵称
   */
  onNicknameInput(e) {
    this.setData({
      'editingProfile.nickname': e.detail.value
    });
  },

  /**
   * 输入问候语
   */
  onGreetingInput(e) {
    this.setData({
      'editingProfile.greeting': e.detail.value
    });
  },

  /**
   * 切换头像
   */
  onAvatarChange() {
    const { avatarList, editingProfile } = this.data;
    const currentIndex = avatarList.indexOf(editingProfile.avatar);
    const nextIndex = (currentIndex + 1) % avatarList.length;
    
    this.setData({
      'editingProfile.avatar': avatarList[nextIndex]
    });
  },

  /**
   * 关闭页面
   */
  onClose() {
    wx.navigateBack();
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadProfileData(false).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 设置项点击
   */
  onSettingTap(e) {
    const index = e.currentTarget.dataset.index;
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  /**
   * 绘制情绪曲线图表
   */
  drawEmotionChart() {
    const { emotionStats, chartLegend } = this.data;
    const weekData = emotionStats.week_data || [];
    
    if (weekData.length === 0) {
      return;
    }

    // 获取 Canvas 上下文
    const query = wx.createSelectorQuery();
    query.select('#emotionChart').fields({ node: true, size: true }).exec((res) => {
      if (!res || !res[0]) {
        console.warn('无法获取 Canvas 节点');
        return;
      }

      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getSystemInfoSync().pixelRatio;
      canvas.width = res[0].width * dpr;
      canvas.height = res[0].height * dpr;
      ctx.scale(dpr, dpr);

      const width = res[0].width;
      const height = res[0].height;
      const padding = { top: 20, right: 20, bottom: 40, left: 50 };
      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      // 清空画布
      ctx.clearRect(0, 0, width, height);

      // 获取所有情绪类型（排除 date）
      const emotions = ['平静', '快乐', '焦虑', '感恩'];
      const emotionColors = {
        '平静': '#98D8C8',
        '快乐': '#FFD89C',
        '焦虑': '#FFB09C',
        '感恩': '#E89B6D'
      };

      // 计算最大值
      let maxValue = 0;
      weekData.forEach(day => {
        let dayTotal = 0;
        emotions.forEach(emotion => {
          dayTotal += (day[emotion] || 0);
        });
        if (dayTotal > maxValue) {
          maxValue = dayTotal;
        }
      });
      maxValue = Math.ceil(maxValue * 1.2); // 留出20%的余量

      // 绘制网格线
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 1;
      const gridLines = 5;
      for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (chartHeight / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.setLineDash([6, 3]);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // 绘制X轴标签
      ctx.fillStyle = 'rgba(42, 26, 77, 0.8)';
      ctx.font = '22rpx sans-serif';
      ctx.textAlign = 'center';
      weekData.forEach((day, index) => {
        const x = padding.left + (chartWidth / (weekData.length - 1)) * index;
        ctx.fillText(day.date, x, height - padding.bottom + 30);
      });

      // 绘制堆叠面积图
      const pointX = (index) => padding.left + (chartWidth / (weekData.length - 1)) * index;
      const pointY = (value) => padding.top + chartHeight - (value / maxValue) * chartHeight;

      // 从下到上绘制每个情绪层
      emotions.reverse().forEach((emotion, emotionIndex) => {
        ctx.fillStyle = emotionColors[emotion] || '#E89B6D';
        ctx.strokeStyle = emotionColors[emotion] || '#E89B6D';
        ctx.lineWidth = 2;

        ctx.beginPath();
        
        // 计算累积值
        const getCumulativeValue = (dayIndex, currentEmotion) => {
          let sum = 0;
          emotions.slice(emotions.indexOf(currentEmotion)).forEach(e => {
            sum += (weekData[dayIndex][e] || 0);
          });
          return sum;
        };

        // 起点（左下）
        const firstValue = getCumulativeValue(0, emotion);
        ctx.moveTo(pointX(0), pointY(firstValue));

        // 顶部曲线
        weekData.forEach((day, index) => {
          const value = getCumulativeValue(index, emotion);
          ctx.lineTo(pointX(index), pointY(value));
        });

        // 终点（右下）
        const lastValue = getCumulativeValue(weekData.length - 1, emotion);
        ctx.lineTo(pointX(weekData.length - 1), pointY(lastValue));

        // 底部基线
        const baseValue = emotionIndex === emotions.length - 1 
          ? 0 
          : getCumulativeValue(weekData.length - 1, emotions[emotionIndex + 1]);
        ctx.lineTo(pointX(weekData.length - 1), pointY(baseValue));

        // 连接回起点
        const firstBaseValue = emotionIndex === emotions.length - 1 
          ? 0 
          : getCumulativeValue(0, emotions[emotionIndex + 1]);
        for (let i = weekData.length - 1; i >= 0; i--) {
          const baseVal = emotionIndex === emotions.length - 1 
            ? 0 
            : getCumulativeValue(i, emotions[emotionIndex + 1]);
          ctx.lineTo(pointX(i), pointY(baseVal));
        }

        ctx.closePath();
        
        // 填充渐变
        const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
        gradient.addColorStop(0, emotionColors[emotion] + '99');
        gradient.addColorStop(1, emotionColors[emotion] + '1A');
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // 绘制边框
        ctx.strokeStyle = emotionColors[emotion];
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pointX(0), pointY(firstValue));
        weekData.forEach((day, index) => {
          const value = getCumulativeValue(index, emotion);
          ctx.lineTo(pointX(index), pointY(value));
        });
        ctx.stroke();
      });

      // 恢复顺序
      emotions.reverse();
    });
  },

  /**
   * 页面准备完成，绘制图表
   */
  onReady() {
    // 延迟绘制图表，确保 Canvas 已渲染
    setTimeout(() => {
      this.drawEmotionChart();
    }, 500);
  }
});
