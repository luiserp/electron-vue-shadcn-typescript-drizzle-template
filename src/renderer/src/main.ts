import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { useTheme } from '@renderer/composables/useTheme'

useTheme()

createApp(App).mount('#app')

