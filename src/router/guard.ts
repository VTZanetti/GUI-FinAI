import type { RouteLocationNormalizedGeneric } from 'vue-router'
import type { useAuthStore } from '@/stores/auth'

type AuthLike = ReturnType<typeof useAuthStore>

/**
 * Guard de navegação como função pura (testável):
 * - requiresAuth sem token → /login?redirect=
 * - requiresAdmin sem role Admin → /dashboard?denied=1
 * - login/register com sessão → /dashboard
 */
export function resolveRouteGuard(to: RouteLocationNormalizedGeneric, auth: AuthLike) {
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'dashboard', query: { denied: '1' } }
  }
  if ((to.name === 'login' || to.name === 'register') && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
  return undefined
}
