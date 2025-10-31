// app.js
const { CACHE } = require('./constants/index.js');

App({
  onLaunch: function () {
    this.globalData = {
      // env 参数说明：
      //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
      //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
      //   如不填则使用默认环境（第一个创建的环境）
      env: "",
      // 用户信息（匿名）
      userInfo: null,
      // 登录状态
      isLoggedIn: false,
      // 当前用户情绪值
      currentEmotion: {
        valence: null,
        arousal: null,
      },
      // 数据缓存
      cache: {},
    };

    // 初始化用户信息（从缓存加载）
    this.loadUserInfo();

    // 初始化云开发
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: this.globalData.env,
        traceUser: true,
      });
    }
  },

  /**
   * 加载用户信息（从本地存储）
   */
  loadUserInfo: function () {
    try {
      const userInfo = wx.getStorageSync(CACHE.USER_INFO_KEY);
      if (userInfo) {
        this.globalData.userInfo = userInfo;
        this.globalData.isLoggedIn = true;
      }
    } catch (e) {
      console.error('加载用户信息失败:', e);
    }
  },

  /**
   * 设置用户信息
   * @param {Object} userInfo - 用户信息对象 {anonymousId, username}
   */
  setUserInfo: function (userInfo) {
    this.globalData.userInfo = userInfo;
    this.globalData.isLoggedIn = true;
    try {
      wx.setStorageSync(CACHE.USER_INFO_KEY, userInfo);
    } catch (e) {
      console.error('保存用户信息失败:', e);
    }
  },

  /**
   * 获取用户信息
   * @returns {Object|null} 用户信息对象
   */
  getUserInfo: function () {
    return this.globalData.userInfo;
  },

  /**
   * 设置登录状态
   * @param {Boolean} status - 登录状态
   */
  setLoginStatus: function (status) {
    this.globalData.isLoggedIn = status;
  },

  /**
   * 获取登录状态
   * @returns {Boolean} 是否已登录
   */
  getLoginStatus: function () {
    return this.globalData.isLoggedIn;
  },

  /**
   * 设置当前情绪值
   * @param {Number} valence - 价度值 (0-10)
   * @param {Number} arousal - 唤醒度值 (0-10)
   */
  setCurrentEmotion: function (valence, arousal) {
    this.globalData.currentEmotion = {
      valence: valence,
      arousal: arousal,
    };
  },

  /**
   * 获取当前情绪值
   * @returns {Object} 情绪值对象 {valence, arousal}
   */
  getCurrentEmotion: function () {
    return this.globalData.currentEmotion;
  },

  /**
   * 设置缓存数据
   * @param {String} key - 缓存键
   * @param {Any} value - 缓存值
   * @param {Number} expireTime - 过期时间（毫秒），可选
   */
  setCache: function (key, value, expireTime) {
    const cacheItem = {
      value: value,
      expireTime: expireTime ? Date.now() + expireTime : null,
    };
    this.globalData.cache[key] = cacheItem;
    try {
      wx.setStorageSync(`cache_${key}`, cacheItem);
    } catch (e) {
      console.error('保存缓存失败:', e);
    }
  },

  /**
   * 获取缓存数据
   * @param {String} key - 缓存键
   * @returns {Any|null} 缓存值，如果不存在或已过期返回null
   */
  getCache: function (key) {
    // 先从内存缓存获取
    if (this.globalData.cache[key]) {
      const cacheItem = this.globalData.cache[key];
      if (!cacheItem.expireTime || cacheItem.expireTime > Date.now()) {
        return cacheItem.value;
      } else {
        // 已过期，删除缓存
        delete this.globalData.cache[key];
        try {
          wx.removeStorageSync(`cache_${key}`);
        } catch (e) {
          console.error('删除缓存失败:', e);
        }
        return null;
      }
    }

    // 从本地存储获取
    try {
      const cacheItem = wx.getStorageSync(`cache_${key}`);
      if (cacheItem) {
        if (!cacheItem.expireTime || cacheItem.expireTime > Date.now()) {
          // 同步到内存缓存
          this.globalData.cache[key] = cacheItem;
          return cacheItem.value;
        } else {
          // 已过期，删除缓存
          try {
            wx.removeStorageSync(`cache_${key}`);
          } catch (e) {
            console.error('删除过期缓存失败:', e);
          }
          return null;
        }
      }
    } catch (e) {
      console.error('获取缓存失败:', e);
    }

    return null;
  },

  /**
   * 清除缓存
   * @param {String} key - 缓存键，如果不传则清除所有缓存
   */
  clearCache: function (key) {
    if (key) {
      delete this.globalData.cache[key];
      try {
        wx.removeStorageSync(`cache_${key}`);
      } catch (e) {
        console.error('清除缓存失败:', e);
      }
    } else {
      // 清除所有缓存
      this.globalData.cache = {};
      // 注意：这里不删除用户信息缓存
      try {
        const storageInfo = wx.getStorageInfoSync();
        const cacheKeys = storageInfo.keys.filter(
          (k) => k.startsWith('cache_')
        );
        cacheKeys.forEach((k) => {
          try {
            wx.removeStorageSync(k);
          } catch (e) {
            console.error('清除缓存失败:', e);
          }
        });
      } catch (e) {
        console.error('获取存储信息失败:', e);
      }
    }
  },
});
