// src/api/config.js

// 根据环境设置API基础URL
const API_BASE_URL = import.meta.env.MODE === 'development'
  ? 'http://localhost:3000/api'
  : '/api'  // 生产环境使用相对路径

export default {
  baseURL: API_BASE_URL,
  timeout: 10000
}
