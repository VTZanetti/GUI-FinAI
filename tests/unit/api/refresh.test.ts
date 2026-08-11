import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handle401, refreshAccessToken, isAuthEndpoint, resolveAuthUser, clearRefreshPromise } from '@/api/refresh'
import { authService } from '@/api/services/authService'
import type { AuthUser } from '@/types'

vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: false }))

function makeStore() {
  const state = {
    accessToken: 'old',
    refreshToken: 'refresh-1',
    user: null as AuthUser | null
  }
  return {
    get state() {
      return state
    },
    get refreshToken() {
      return state.refreshToken
    },
    setSession: (accessToken: string, refreshToken: string, user: AuthUser) => {
      state.accessToken = accessToken
      state.refreshToken = refreshToken
      state.user = user
    },
    clearSession: () => {
      state.accessToken = ''
      state.refreshToken = ''
      state.user = null
    }
  }
}

describe('api/refresh — lógica do interceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearRefreshPromise()
  })

  it('resolveAuthUser decodifica ou faz fallback', () => {
    // Token vazio → decodeUser retorna {} → fallback do resolveAuthUser
    const user = resolveAuthUser('', { email: 'a@b.com' })
    expect(user.email).toBe('a@b.com')
    expect(user.role).toBe('User')
  })

  it('isAuthEndpoint identifica /auth/ e /health', () => {
    expect(isAuthEndpoint('/auth/login')).toBe(true)
    expect(isAuthEndpoint('/health')).toBe(true)
    expect(isAuthEndpoint('/transactions')).toBe(false)
  })

  it('401 dispara refresh 1x e retenta a request', async () => {
    const store = makeStore()
    const refreshSpy = vi.spyOn(authService, 'refresh').mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      accessToken: 'new-token',
      expiresIn: 900,
      refreshToken: 'new-refresh'
    })
    const retryFn = vi.fn().mockResolvedValue({ data: 'ok' })

    const error = { response: { status: 401 }, config: { url: '/transactions' } }
    const result = await handle401(error, {
      apiClient: retryFn,
      getStore: () => store,
      onSessionExpired: vi.fn()
    })

    expect(refreshSpy).toHaveBeenCalledWith('refresh-1')
    expect(store.state.accessToken).toBe('new-token')
    expect(retryFn).toHaveBeenCalledWith(expect.objectContaining({ url: '/transactions' }))
    expect(result).toEqual({ data: 'ok' })
  })

  it('401 em endpoint auth não dispara refresh', async () => {
    const refreshSpy = vi.spyOn(authService, 'refresh')
    const error = { response: { status: 401 }, config: { url: '/auth/login' } }
    await expect(
      handle401(error, { apiClient: vi.fn(), getStore: () => makeStore() })
    ).rejects.toBe(error)
    expect(refreshSpy).not.toHaveBeenCalled()
  })

  it('request já retentada não refaz refresh', async () => {
    const refreshSpy = vi.spyOn(authService, 'refresh')
    const error = { response: { status: 401 }, config: { url: '/x', _retried: true } }
    await expect(
      handle401(error, { apiClient: vi.fn(), getStore: () => makeStore() })
    ).rejects.toBe(error)
    expect(refreshSpy).not.toHaveBeenCalled()
  })

  it('falha no refresh limpa sessão e chama onSessionExpired', async () => {
    const store = makeStore()
    vi.spyOn(authService, 'refresh').mockRejectedValue({ response: { status: 401 } })
    const onExpired = vi.fn()
    const error = { response: { status: 401 }, config: { url: '/transactions' } }
    await expect(
      handle401(error, { apiClient: vi.fn(), getStore: () => store, onSessionExpired: onExpired })
    ).rejects.toBeTruthy()
    expect(store.state.accessToken).toBe('')
    expect(onExpired).toHaveBeenCalled()
  })

  it('refreshes concorrentes compartilham a mesma promise (fila)', async () => {
    const store = makeStore()
    const refreshSpy = vi.spyOn(authService, 'refresh').mockResolvedValue({
      userId: 'u1',
      email: 'a@b.com',
      accessToken: 'new-token',
      expiresIn: 900,
      refreshToken: 'new-refresh'
    })
    const p1 = refreshAccessToken(() => store)
    const p2 = refreshAccessToken(() => store)
    const [t1, t2] = await Promise.all([p1, p2])
    expect(t1).toBe('new-token')
    expect(t2).toBe('new-token')
    expect(refreshSpy).toHaveBeenCalledTimes(1)
  })
})
