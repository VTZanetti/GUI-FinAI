import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/api/services/authService'
import { toApiError } from '@/api/errorService'

const authResponse = {
  userId: 'u1',
  email: 'ana@test.com',
  accessToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1MSIsImVtYWlsIjoiYW5hQHRlc3QuY29tIiwicm9sZSI6IkFkbWluIiwiZmlyc3ROYW1lIjoiQW5hIn0.signature',
  expiresIn: 900,
  refreshToken: 'r1'
}

// Demo mode OFF
vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: false }))
vi.mock('@/api/mocks/demoClient', () => ({
  demoClient: {
    login: vi.fn(),
    register: vi.fn(),
    refresh: vi.fn()
  }
}))

describe('stores/auth — ações completas', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('login chama authService.login e aplica sessão', async () => {
    vi.spyOn(authService, 'login').mockResolvedValue(authResponse)
    const store = useAuthStore()
    const res = await store.login({ email: 'ana@test.com', password: 'Senha@123' })
    expect(res.accessToken).toBeTruthy()
    expect(store.isAuthenticated).toBe(true)
    expect(store.user?.role).toBe('Admin')
    expect(store.user?.email).toBe('ana@test.com')
  })

  it('register chama authService.register', async () => {
    vi.spyOn(authService, 'register').mockResolvedValue(authResponse)
    const store = useAuthStore()
    await store.register({
      email: 'ana@test.com',
      password: 'Senha@123',
      firstName: 'Ana',
      lastName: 'Silva'
    })
    expect(authService.register).toHaveBeenCalledWith({
      email: 'ana@test.com',
      password: 'Senha@123',
      firstName: 'Ana',
      lastName: 'Silva'
    })
    expect(store.isAuthenticated).toBe(true)
  })

  it('refresh rotaciona tokens', async () => {
    vi.spyOn(authService, 'refresh').mockResolvedValue({ ...authResponse, refreshToken: 'r2' })
    const store = useAuthStore()
    store.setSession('old', 'old-refresh', {
      userId: 'u1',
      email: 'ana@test.com',
      firstName: 'Ana',
      role: 'User'
    })
    await store.refresh()
    expect(store.refreshToken).toBe('r2')
    expect(store.accessToken).not.toBe('old')
  })

  it('refresh falho limpa sessão e lança ApiError', async () => {
    vi.spyOn(authService, 'refresh').mockRejectedValue({ response: { status: 401, data: {} } })
    const store = useAuthStore()
    store.setSession('t', 'r', { userId: 'u', email: 'a', firstName: 'x', role: 'User' })
    await expect(store.refresh()).rejects.toBeInstanceOf(Error)
    expect(store.isAuthenticated).toBe(false)
  })

  it('logout chama authService.logout e limpa sessão', async () => {
    const logoutSpy = vi.spyOn(authService, 'logout').mockResolvedValue()
    const store = useAuthStore()
    store.setSession('t', 'r', { userId: 'u', email: 'a', firstName: 'x', role: 'User' })
    await store.logout()
    expect(logoutSpy).toHaveBeenCalledWith('r')
    expect(store.isAuthenticated).toBe(false)
  })

  it('logout com falha na revogação não quebra', async () => {
    vi.spyOn(authService, 'logout').mockRejectedValue(new Error('offline'))
    const store = useAuthStore()
    store.setSession('t', 'r', { userId: 'u', email: 'a', firstName: 'x', role: 'User' })
    await expect(store.logout()).resolves.toBeUndefined()
    expect(store.isAuthenticated).toBe(false)
  })

  it('login falho lança ApiError com mensagem amigável', async () => {
    vi.spyOn(authService, 'login').mockRejectedValue({
      response: { status: 401, data: { title: 'Unauthorized', status: 401 } }
    })
    const store = useAuthStore()
    const err = await store.login({ email: 'a', password: 'b' }).catch((e) => e)
    expect(toApiError(err).message).toBe('Sessão expirada. Entre novamente.')
    expect(store.isAuthenticated).toBe(false)
  })

  it('applyAuthResponse decodifica claims .NET', () => {
    const store = useAuthStore()
    store.applyAuthResponse(authResponse)
    expect(store.user?.firstName).toBe('Ana')
    expect(store.user?.role).toBe('Admin')
  })
})
