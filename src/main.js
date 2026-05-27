// src/main.js

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { UnicomAPI } from './api/unicom'

const app = createApp(App)

// 创建API实例并全局注册
const unicomAPI = new UnicomAPI('/api')
app.config.globalProperties.$unicom = unicomAPI

// 或者使用Vue3的inject/provide
app.provide('unicomAPI', unicomAPI)

app.use(router)
app.mount('#app')
