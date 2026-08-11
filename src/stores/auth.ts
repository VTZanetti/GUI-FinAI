import { defineStore } from 'pinia'
import type { AuthResponse, AuthUser, LoginPayload, RegisterPayload } from '@/types'
import { authService } from '@/api/services/authService'
import { IS_DEMO_MODE } from '@/api/mocks'
import { demoClient } from '@/api/mocks/demoClient'
import { decodeUser } from '@/utils/jwt'
import { toApiError } from '@/api/errorService'

function resolveAuthUser(accessToken: string, email?: string): AuthUser {
  try {
    return decodeUser(accessToken)
  } catch {
    return { userId: '', email: email ?? '', firstName: '', role: 'User' }
  }
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    accessToken: null,
    refreshToken: null,
    user: null
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.accessToken),
    isAdmin: (state) => state.user?.role === 'Admin'
  },

  actions: {
    setSession(accessToken: string, refreshToken: string, user: AuthUser) {
      this.accessToken = accessToken
      this.refreshToken = refreshToken
      this.user = user
    },

    applyAuthResponse(res: AuthResponse) {
      const user = resolveAuthUser(res.accessToken, res.email)
      this.setSession(res.accessToken, res.refreshToken, user)
    },

    clearSession() {
      this.accessToken = null
      this.refreshToken = null
      this.user = null
    },

    async login(payload: LoginPayload) {
      if (IS_DEMO_MODE) {
        const res = await demoClient.login()
        this.applyAuthResponse(res)
        return res
      }
      try {
        const res = await authService.login(payload)
        this.applyAuthResponse(res)
        return res
      } catch (error) {
        throw toApiError(error)
      }
    },

    async register(payload: RegisterPayload) {
      if (IS_DEMO_MODE) {
        const res = await demoClient.register()
        this.applyAuthResponse(res)
        return res
      }
      try {
        const res = await authService.register(payload)
        this.applyAuthResponse(res)
        return res
      } catch (error) {
        throw toApiError(error)
      }
    },

    /** Logout: revoga o refresh no backend (fire-and-forget) + limpa memória. */
    async logout() {
      const refreshToken = this.refreshToken
      this.clearSession()
      if (!IS_DEMO_MODE && refreshToken) {
        try {
          await authService.logout(refreshToken)
        } catch {
          // fire-and-forget — sessão local já limpa
        }
      }
    },

    /** Refresh manual (usado em contextos fora do interceptor). */
    async refresh() {
      if (IS_DEMO_MODE) {
        const res = await demoClient.refresh()
        this.applyAuthResponse(res)
        return res
      }
      if (!this.refreshToken) throw toApiError(new Error('Sem refresh token'))
      try {
        const res = await authService.refresh(this.refreshToken)
        this.applyAuthResponse(res)
        return res
      } catch (error) {
        this.clearSession()
        throw toApiError(error)
      }
    }
  }
})
