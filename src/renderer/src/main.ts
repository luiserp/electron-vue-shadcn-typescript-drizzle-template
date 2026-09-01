import './assets/main.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { useTheme } from '@renderer/composables/useTheme'
import router from '@renderer/router'
import log from 'electron-log/renderer'

useTheme()
log.info('Renderer started')

createApp(App).use(createPinia()).use(router).mount('#app')
