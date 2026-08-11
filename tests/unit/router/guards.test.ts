import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { resolveRouteGuard } from '@/router/guard'
import { useAuthStore } from '@/stores/auth'

vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: false }))
vi.mock('@/api/mocks/demoClient', async () => {
  const actual = await vi.importActual<typeof import('@/api/mocks/demoClient')>('@/api/mocks/demoClient')
  return actual
})

function makeRoute(meta: Record<string, boolean>, name = 'x', fullPath = '/x') {
  return {
    name,
    fullPath,
    path: fullPath,
    meta,
    query: {},
    params: {},
    hash: '',
    matched: []
  } as unknown as Parameters<typeof resolveRouteGuard>[0]
}

describe('resolveRouteGuard (função pura)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('requiresAuth sem token → redirect login', () => {
    const auth = useAuthStore()
    const result = resolveRouteGuard(makeRoute({ requiresAuth: true }, 'dashboard', '/dashboard'), auth)
    expect(result).toEqual({ name: 'login', query: { redirect: '/dashboard' } })
  })

  it('requiresAuth com token → undefined (acessa)', () => {
    const auth = useAuthStore()
    auth.setSession('t', 'r', { userId: 'u', email: 'a', firstName: 'x', role: 'User' })
    expect(resolveRouteGuard(makeRoute({ requiresAuth: true }), auth)).toBeUndefined()
  })

  it('requiresAdmin sem role Admin → /dashboard com denied', () => {
    const auth = useAuthStore()
    auth.setSession('t', 'r', { userId: 'u', email: 'a', firstName: 'x', role: 'User' })
    const result = resolveRouteGuard(makeRoute({ requiresAuth: true, requiresAdmin: true }), auth)
    expect(result).toEqual({ name: 'dashboard', query: { denied: '1' } })
  })

  it('requiresAdmin com role Admin → undefined', () => {
    const auth = useAuthStore()
    auth.setSession('t', 'r', { userId: 'u', email: 'a', firstName: 'x', role: 'Admin' })
    expect(resolveRouteGuard(makeRoute({ requiresAuth: true, requiresAdmin: true }), auth)).toBeUndefined()
  })

  it('login com sessão ativa → /dashboard', () => {
    const auth = useAuthStore()
    auth.setSession('t', 'r', { userId: 'u', email: 'a', firstName: 'x', role: 'User' })
    const result = resolveRouteGuard(makeRoute({}, 'login'), auth)
    expect(result).toEqual({ name: 'dashboard' })
  })

  it('login sem sessão → undefined', () => {
    const auth = useAuthStore()
    expect(resolveRouteGuard(makeRoute({}, 'login'), auth)).toBeUndefined()
  })
})
