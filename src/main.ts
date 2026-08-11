import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

const app = createApp(App)

// Error handler global — nenhum erro de renderização derruba a SPA (ADRG-014)
app.config.errorHandler = (err) => {
  if (import.meta.env.DEV) {
    console.error('[GUI-FinAI] erro global (sem dados sensíveis):', err instanceof Error ? err.message : err)
  }
}

app.use(createPinia())
app.use(router)
app.mount('#app')
