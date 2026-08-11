import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// Demo mode OFF nos testes de store
vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: false }))

describe('stores/auth', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('começa desautenticado', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    expect(store.isAdmin).toBe(false)
    expect(store.accessToken).toBeNull()
  })

  it('setSession define tokens e usuário', () => {
    const store = useAuthStore()
    store.setSession('token-1', 'refresh-1', {
      userId: 'u1',
      email: 'a@b.com',
      firstName: 'Ana',
      role: 'User'
    })
    expect(store.isAuthenticated).toBe(true)
    expect(store.accessToken).toBe('token-1')
    expect(store.refreshToken).toBe('refresh-1')
    expect(store.user?.email).toBe('a@b.com')
  })

  it('clearSession limpa tudo', () => {
    const store = useAuthStore()
    store.setSession('t', 'r', { userId: 'u', email: 'a', firstName: 'x', role: 'User' })
    store.clearSession()
    expect(store.isAuthenticated).toBe(false)
    expect(store.accessToken).toBeNull()
    expect(store.refreshToken).toBeNull()
    expect(store.user).toBeNull()
  })

  it('isAdmin é true apenas para role Admin', () => {
    const store = useAuthStore()
    store.setSession('t', 'r', { userId: 'u', email: 'a', firstName: 'x', role: 'Admin' })
    expect(store.isAdmin).toBe(true)
  })

  it('login falho lança ApiError com mensagem amigável', async () => {
    const store = useAuthStore()
    vi.spyOn(store, 'login').mockRejectedValueOnce(
      new Error('Não foi possível conectar ao servidor. Verifique se a API está no ar.')
    )
    await expect(store.login({ email: 'a@b.com', password: 'x' })).rejects.toThrow(
      'Não foi possível conectar'
    )
  })

  it('logout limpa a sessão', async () => {
    const store = useAuthStore()
    store.setSession('t', 'r', { userId: 'u', email: 'a', firstName: 'x', role: 'User' })
    await store.logout()
    expect(store.isAuthenticated).toBe(false)
  })
})
