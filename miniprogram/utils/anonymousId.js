/**
 * 匿名ID生成工具
 * 使用不可逆哈希算法生成匿名ID和用户名
 */

const { CACHE } = require('../constants/index.js');

const ANONYMOUS_ID_KEY = 'yeyu_anonymous_id';
const USERNAME_KEY = 'yeyu_username';

/**
 * 简单哈希函数（字符串转数字）
 * @param {String} str - 输入字符串
 * @returns {Number} 哈希值
 */
function simpleHash(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * 生成唯一标识字符串
 * @returns {String} 唯一标识
 */
function generateUniqueId() {
  try {
    const systemInfo = wx.getSystemInfoSync();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    
    // 组合设备信息和时间戳
    const uniqueString = `${systemInfo.brand}_${systemInfo.model}_${systemInfo.system}_${timestamp}_${random}`;
    
    // 使用哈希函数生成数字ID
    const hashValue = simpleHash(uniqueString);
    
    // 转换为16进制字符串，确保长度一致
    return hashValue.toString(16).padStart(16, '0');
  } catch (e) {
    console.error('生成唯一ID失败:', e);
    // 降级方案：使用时间戳和随机数
    const fallback = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    return simpleHash(fallback).toString(16).padStart(16, '0');
  }
}

/**
 * 获取或生成匿名ID（确保同一设备生成相同的ID）
 * @returns {String} 匿名ID
 */
function getAnonymousId() {
  try {
    // 先从本地存储获取
    let anonymousId = wx.getStorageSync(ANONYMOUS_ID_KEY);
    
    if (!anonymousId) {
      // 如果不存在，生成新的ID并保存
      anonymousId = generateUniqueId();
      wx.setStorageSync(ANONYMOUS_ID_KEY, anonymousId);
    }
    
    return anonymousId;
  } catch (e) {
    console.error('获取匿名ID失败:', e);
    // 降级方案：返回基于时间戳的ID
    return generateUniqueId();
  }
}

/**
 * 生成匿名用户名（如"用户1234"）
 * @param {String} anonymousId - 匿名ID，如果不传则自动获取
 * @returns {String} 匿名用户名
 */
function generateUsername(anonymousId) {
  try {
    // 先从本地存储获取
    let username = wx.getStorageSync(USERNAME_KEY);
    
    if (!username) {
      // 如果没有ID，先获取ID
      if (!anonymousId) {
        anonymousId = getAnonymousId();
      }
      
      // 基于ID生成用户名（取ID的后4位数字，如果不足4位则补0）
      const idNumber = parseInt(anonymousId.slice(-8), 16) || 0;
      const userNumber = (idNumber % 10000).toString().padStart(4, '0');
      username = `用户${userNumber}`;
      
      // 保存用户名
      wx.setStorageSync(USERNAME_KEY, username);
    }
    
    return username;
  } catch (e) {
    console.error('生成用户名失败:', e);
    // 降级方案
    const fallbackNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `用户${fallbackNumber}`;
  }
}

/**
 * 获取用户信息（匿名ID和用户名）
 * @returns {Object} 用户信息对象 {anonymousId, username}
 */
function getUserInfo() {
  const anonymousId = getAnonymousId();
  const username = generateUsername(anonymousId);
  
  return {
    anonymousId: anonymousId,
    username: username,
  };
}

/**
 * 重置匿名ID和用户名（用于测试或重置场景）
 */
function resetAnonymousId() {
  try {
    wx.removeStorageSync(ANONYMOUS_ID_KEY);
    wx.removeStorageSync(USERNAME_KEY);
  } catch (e) {
    console.error('重置匿名ID失败:', e);
  }
}

module.exports = {
  getAnonymousId,
  generateUsername,
  getUserInfo,
  resetAnonymousId,
};

