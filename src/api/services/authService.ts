import type { AuthResponse, LoginPayload, RegisterPayload } from '@/types'
import { ENDPOINTS } from '../endpoints'
import { apiClient } from '../client'

/** Autenticação — sem retry (não idempotente) e sem interceptor de refresh (rotas /auth/*). */
export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(ENDPOINTS.auth.login, payload)
    return data
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(ENDPOINTS.auth.register, payload)
    return data
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(ENDPOINTS.auth.refresh, { refreshToken })
    return data
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post(ENDPOINTS.auth.logout, { refreshToken })
  }
}
