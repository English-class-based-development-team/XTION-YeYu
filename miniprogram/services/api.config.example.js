/**
 * API 配置示例文件
 * 
 * 由于微信小程序无法直接访问 localhost，需要配置实际 IP 地址
 * 
 * 使用方法：
 * 1. 复制此文件为 api.config.js（如果存在）
 * 2. 将 API_BASE 改为你的本机 IP 地址
 * 3. 或者在 api.js 中直接修改 API_BASE
 */

// 示例配置
const API_CONFIG = {
  // 开发环境：使用本机局域网 IP
  // 获取方法：
  //   macOS/Linux: ifconfig | grep "inet " | grep -v 127.0.0.1
  //   Windows: ipconfig
  //   IP 地址通常是 192.168.x.x 或 10.x.x.x 格式
  DEVELOPMENT_BASE: 'http://192.168.1.100:8000', // 替换为你的本机 IP
  
  // 生产环境：使用实际服务器地址
  PRODUCTION_BASE: 'https://your-api-server.com'
};

module.exports = API_CONFIG;

