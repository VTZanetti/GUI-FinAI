import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'
import { IS_DEMO_MODE } from './mocks'
import { handle401 } from './refresh'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
})

function redirectToLogin(): void {
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login?expired=1'
  }
}

// ── Request interceptor: injeta Bearer ───────────────────────────────
apiClient.interceptors.request.use((config) => {
  if (IS_DEMO_MODE) return config
  const store = useAuthStore()
  if (store.accessToken) {
    config.headers.Authorization = `Bearer ${store.accessToken}`
  }
  return config
})

// ── Response interceptor: 401 → refresh (1x) → retry → logout ────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (IS_DEMO_MODE) return Promise.reject(error)
    try {
      return await handle401(error, {
        apiClient: (config) => apiClient(config as never),
        getStore: () => useAuthStore(),
        onSessionExpired: redirectToLogin
      })
    } catch (handledError) {
      return Promise.reject(handledError)
    }
  }
)
