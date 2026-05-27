/**
 * Unicom API 客户端
 * 用于在Vue前端中调用API接口
 * 
 * 使用示例:
 * import { UnicornAPI } from '@/api/unicom'
 * 
 * const api = new UnicomAPI('http://localhost:3000/api')
 * const result = await api.login('13800138000', 'password')
 */

import axios from 'axios'

class UnicomAPI {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL
    this.sessionId = localStorage.getItem('unicom_sessionId') || null
    
    // 创建axios实例
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    // 响应拦截器
    this.client.interceptors.response.use(
      response => {
        const data = response.data
        if (data.code !== 200) {
          throw new Error(data.message || '请求失败')
        }
        return data.data
      },
      error => {
        console.error('API请求错误:', error)
        throw error
      }
    )
  }

  /**
   * 使用手机号和密码登录
   * @param {string} phone 手机号
   * @param {string} password 密码
   * @returns {Promise<Object>} 登录结果，包含sessionId等
   */
  async login(phone, password) {
    try {
      const response = await this.client.post('/login', {
        phone,
        password
      })
      
      if (response.sessionId) {
        this.sessionId = response.sessionId
        localStorage.setItem('unicom_sessionId', response.sessionId)
      }
      
      return response
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  /**
   * 使用ECS Token登录
   * @param {string} ecsToken ECS Token
   * @returns {Promise<Object>} 登录结果
   */
  async loginWithToken(ecsToken) {
    try {
      const response = await this.client.post('/login-with-token', {
        ecsToken
      })
      
      if (response.sessionId) {
        this.sessionId = response.sessionId
        localStorage.setItem('unicom_sessionId', response.sessionId)
      }
      
      return response
    } catch (error) {
      console.error('Token登录失败:', error)
      throw error
    }
  }

  /**
   * 发送验证码
   * @param {string} phone 手机号
   * @returns {Promise<Object>} 发送结果
   */
  async sendCode(phone) {
    try {
      return await this.client.post('/send-code', {
        phone
      })
    } catch (error) {
      console.error('发送验证码失败:', error)
      throw error
    }
  }

  /**
   * 验证腾讯滑块验证码
   * @param {string} ticket 验证票据
   * @param {string} randstr 随机字符串
   * @returns {Promise<Object>} 验证结果
   */
  async verifyCaptcha(ticket, randstr) {
    try {
      return await this.client.post('/verify-captcha', {
        ticket,
        randstr
      })
    } catch (error) {
      console.error('验证码验证失败:', error)
      throw error
    }
  }

  /**
   * 查询已订业务
   * @param {string} phone 手机号
   * @param {string} sessionId 会话ID（可选，默认使用保存的sessionId）
   * @returns {Promise<Object>} 已订业务列表
   */
  async getOrderedServices(phone, sessionId = null) {
    try {
      const id = sessionId || this.sessionId
      if (!id) throw new Error('sessionId未设置，请先登录')
      
      return await this.client.post('/ordered-services', {
        sessionId: id,
        phone
      })
    } catch (error) {
      console.error('查询已订业务失败:', error)
      throw error
    }
  }

  /**
   * 查询流量信息
   * @param {string} phone 手机号
   * @param {string} sessionId 会话ID（可选）
   * @returns {Promise<Object>} 流量信息
   */
  async getFlowInfo(phone, sessionId = null) {
    try {
      const id = sessionId || this.sessionId
      if (!id) throw new Error('sessionId未设置，请先登录')
      
      return await this.client.post('/flow-info', {
        sessionId: id,
        phone
      })
    } catch (error) {
      console.error('查询流量信息失败:', error)
      throw error
    }
  }

  /**
   * 查询5G速率和QCI信息
   * @param {string} phone 手机号
   * @param {string} sessionId 会话ID（可选）
   * @returns {Promise<Object>} 5G信息
   */
  async get5GInfo(phone, sessionId = null) {
    try {
      const id = sessionId || this.sessionId
      if (!id) throw new Error('sessionId未设置，请先登录')
      
      return await this.client.post('/5g-info', {
        sessionId: id,
        phone
      })
    } catch (error) {
      console.error('查询5G信息失败:', error)
      throw error
    }
  }

  /**
   * 综合查询所有信息
   * @param {string} phone 手机号
   * @param {string} sessionId 会话ID（可选）
   * @returns {Promise<Object>} 包含流量、5G、已订业务等所有信息
   */
  async queryAll(phone, sessionId = null) {
    try {
      const id = sessionId || this.sessionId
      if (!id) throw new Error('sessionId未设置，请先登录')
      
      return await this.client.post('/query-all', {
        sessionId: id,
        phone
      })
    } catch (error) {
      console.error('综合查询失败:', error)
      throw error
    }
  }

  /**
   * 健康检查
   * @returns {Promise<Object>} 服务状态
   */
  async health() {
    try {
      return await this.client.get('/health')
    } catch (error) {
      console.error('健康检查失败:', error)
      throw error
    }
  }

  /**
   * 获取API文档
   * @returns {Promise<Object>} API文档
   */
  async getDocs() {
    try {
      return await this.client.get('/docs')
    } catch (error) {
      console.error('获取文档失败:', error)
      throw error
    }
  }

  /**
   * 清除会话
   */
  clearSession() {
    this.sessionId = null
    localStorage.removeItem('unicom_sessionId')
  }

  /**
   * 检查是否已登录
   * @returns {boolean} 是否已登录
   */
  isLoggedIn() {
    return !!this.sessionId
  }

  /**
   * 设置会话ID
   * @param {string} sessionId 会话ID
   */
  setSessionId(sessionId) {
    this.sessionId = sessionId
    localStorage.setItem('unicom_sessionId', sessionId)
  }

  /**
   * 获取会话ID
   * @returns {string} 会话ID
   */
  getSessionId() {
    return this.sessionId
  }
}

// 创建默认实例
const defaultAPI = new UnicomAPI('/api')

export { UnicomAPI, defaultAPI }
