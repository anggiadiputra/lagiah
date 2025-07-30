import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)

// Initialize Pinia
const pinia = createPinia()
app.use(pinia)

// Initialize auth store
const authStore = useAuthStore(pinia)
authStore.initialize()

// Initialize router
app.use(router)

app.mount('#app')
