/**
 * 日期格式化工具
 * 提供相对时间格式化、时间段问候语、陪伴天数计算等功能
 */

/**
 * 获取时间段问候语
 * @returns {String} 问候语（凌晨、早上、中午、下午、晚上、深夜）
 */
function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "凌晨";
  if (hour < 12) return "早上";
  if (hour < 14) return "中午";
  if (hour < 18) return "下午";
  if (hour < 22) return "晚上";
  return "深夜";
}

/**
 * 计算陪伴天数
 * @param {String|Date} joinDate - 加入日期（ISO 字符串或 Date 对象）
 * @returns {Number} 陪伴天数（最少 1 天）
 */
function getCompanionDays(joinDate) {
  if (!joinDate) return 1;
  
  const start = typeof joinDate === 'string' 
    ? new Date(joinDate) 
    : joinDate;
  const now = new Date();
  
  // 计算天数差
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  // 最少返回 1 天
  return Math.max(1, diff + 1);
}

/**
 * 格式化相对时间（2天前、1周前等）
 * @param {String|Date} date - 日期（ISO 字符串或 Date 对象）
 * @returns {String} 相对时间字符串
 */
function formatRelativeTime(date) {
  if (!date) return "";
  
  const targetDate = typeof date === 'string' 
    ? new Date(date) 
    : date;
  const now = new Date();
  
  // 计算时间差（毫秒）
  const diff = now.getTime() - targetDate.getTime();
  
  // 计算各种时间单位
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  // 根据时间差返回相应的格式
  if (seconds < 60) {
    return "刚刚";
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else if (weeks < 4) {
    return `${weeks}周前`;
  } else if (months < 12) {
    return `${months}个月前`;
  } else {
    return `${years}年前`;
  }
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param {String|Date} date - 日期
 * @returns {String} 格式化后的日期字符串
 */
function formatDate(date) {
  if (!date) return "";
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 格式化日期时间为完整格式
 * @param {String|Date} date - 日期时间
 * @returns {String} 格式化后的日期时间字符串
 */
function formatDateTime(date) {
  if (!date) return "";
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

module.exports = {
  getTimeGreeting,
  getCompanionDays,
  formatRelativeTime,
  formatDate,
  formatDateTime
};

