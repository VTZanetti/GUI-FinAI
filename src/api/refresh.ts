import type { AuthUser } from '@/types'
import { decodeUser } from '@/utils/jwt'
import { authService } from './services/authService'

/** Converte tokens em AuthUser com fallback seguro (payload ausente/indecodável). */
export function resolveAuthUser(accessToken: string, fallback?: Partial<AuthUser>): AuthUser {
  try {
    const user = decodeUser(accessToken)
    if (user.email || user.userId) return user
  } catch {
    // token indecodável — usa fallback
  }
  return {
    userId: fallback?.userId ?? '',
    email: fallback?.email ?? '',
    firstName: fallback?.firstName ?? '',
    role: fallback?.role ?? 'User'
  }
}

/** Fila de refresh serializada — 1 única promise compartilhada (refresh rotativo). */
let refreshPromise: Promise<string> | null = null

export function clearRefreshPromise(): void {
  refreshPromise = null
}

/**
 * Executa o refresh uma única vez para chamadas concorrentes.
 * Falha → limpa a promise e relança.
 */
export async function refreshAccessToken(getStore: () => {
  refreshToken: string | null
  setSession: (accessToken: string, refreshToken: string, user: AuthUser) => void
}): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const store = getStore()
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

/** Endpoints que nunca disparam refresh (auth + health). */
export function isAuthEndpoint(url: string | undefined): boolean {
  if (!url) return false
  return url.includes('/auth/') || url.includes('/health')
}

/** Trata erro 401: refresh 1x → retry; falha → logout limpo. */
export async function handle401(
  error: unknown,
  deps: {
    apiClient: {
      (config: Record<string, unknown>): Promise<unknown>
    }
    getStore: () => {
      refreshToken: string | null
      setSession: (accessToken: string, refreshToken: string, user: AuthUser) => void
      clearSession: () => void
    }
    onSessionExpired?: () => void
  }
): Promise<unknown> {
  const err = error as {
    response?: { status?: number }
    config?: { url?: string; _retried?: boolean; headers?: Record<string, unknown> }
  }
  const { response, config } = err
  if (response?.status !== 401 || isAuthEndpoint(config?.url) || config?._retried) {
    throw error
  }

  if (config) config._retried = true

  try {
    const token = await refreshAccessToken(deps.getStore)
    if (config) {
      config.headers = { ...(config.headers ?? {}), Authorization: `Bearer ${token}` }
      return deps.apiClient(config)
    }
    throw error
  } catch (refreshError) {
    deps.getStore().clearSession()
    deps.onSessionExpired?.()
    throw refreshError
  }
}
