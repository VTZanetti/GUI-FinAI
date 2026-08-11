import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'
import { authService } from './services/authService'
import { IS_DEMO_MODE } from './mocks'
import type { AuthUser } from '@/types'
import { decodeUser } from '@/utils/jwt'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
})

// ── Refresh serializado (fila) — evita corrida do refresh rotativo ──
let refreshPromise: Promise<string> | null = null

function resolveAuthUser(accessToken: string, fallback?: Partial<AuthUser>): AuthUser {
  try {
    return decodeUser(accessToken)
  } catch {
    return {
      userId: fallback?.userId ?? '',
      email: fallback?.email ?? '',
      firstName: fallback?.firstName ?? '',
      role: fallback?.role ?? 'User'
    }
  }
}

async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const store = useAuthStore()
      const res = await authService.refresh(store.refreshToken ?? '')
      const user = resolveAuthUser(res.accessToken, { userId: res.userId, email: res.email })
      store.setSession(res.accessToken, res.refreshToken, user)
      return res.accessToken
    })().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false
  return url.includes('/auth/') || url.includes('/health')
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

    const { response, config } = error
    const url = config?.url ?? ''

    // Não tenta refresh em endpoints de auth, health ou requests já retentadas
    if (response?.status !== 401 || isAuthEndpoint(url) || (config as { _retried?: boolean } | undefined)?._retried) {
      return Promise.reject(error)
    }

    const retriedConfig = config as { _retried?: boolean }
    retriedConfig._retried = true

    try {
      const token = await refreshAccessToken()
      if (config) {
        config.headers.Authorization = `Bearer ${token}`
        return apiClient(config)
      }
      return Promise.reject(error)
    } catch (refreshError) {
      const store = useAuthStore()
      store.clearSession()
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login?expired=1'
      }
      return Promise.reject(refreshError)
    }
  }
)

/** Dispara logout limpo em qualquer contexto (interceptor falhou). */
export function handleSessionExpired(): void {
  const store = useAuthStore()
  store.clearSession()
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login?expired=1'
  }
}
