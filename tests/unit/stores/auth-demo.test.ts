import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// Demo mode ON — o store usa o demoClient REAL (já funciona sem backend)
vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: true }))
vi.mock('@/api/mocks/demoClient', async () => {
  const actual = await vi.importActual<typeof import('@/api/mocks/demoClient')>('@/api/mocks/demoClient')
  return actual
})

describe('stores/auth — demo mode', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('login usa demoClient', async () => {
    const store = useAuthStore()
    const res = await store.login({ email: 'a', password: 'b' })
    expect(res.userId).toBe('demo-user')
    expect(store.isAuthenticated).toBe(true)
    expect(store.user?.email).toBe('demo@finai.local')
  })

  it('register usa demoClient', async () => {
    const store = useAuthStore()
    await store.register({ email: 'a', password: 'b', firstName: 'A', lastName: 'B' })
    expect(store.isAuthenticated).toBe(true)
  })

  it('refresh usa demoClient', async () => {
    const store = useAuthStore()
    await store.refresh()
    expect(store.refreshToken).toBe('demo-refresh-token-rotated')
    expect(store.isAuthenticated).toBe(true)
  })

  it('logout em demo mode não chama authService', async () => {
    const store = useAuthStore()
    await store.login({ email: 'a', password: 'b' })
    await store.logout()
    expect(store.isAuthenticated).toBe(false)
  })
})
