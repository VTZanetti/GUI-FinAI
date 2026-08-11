import type { OpenFinanceConnection, OpenFinanceConnectionPayload, OpenFinanceStatus } from '@/types'
import { ENDPOINTS } from '../endpoints'
import { apiClient } from '../client'
import { normalizeConnection, normalizeOpenFinanceStatus } from '../mappers'

export const openFinanceService = {
  /** Sync manual — longo (sem retry automático; polling no status). */
  async sync(): Promise<{ status: string }> {
    const { data } = await apiClient.post<{ status: string }>(ENDPOINTS.openFinance.sync, undefined, {
      timeout: 90000
    })
    return data
  },

  async status(): Promise<OpenFinanceStatus> {
    const { data } = await apiClient.get<Record<string, unknown>>(ENDPOINTS.openFinance.status, {
      timeout: 30000
    })
    return normalizeOpenFinanceStatus(data)
  },

  async connectToken(): Promise<{ accessToken: string }> {
    const { data } = await apiClient.post<{ accessToken: string }>(ENDPOINTS.openFinance.connectToken, undefined, {
      timeout: 30000
    })
    return data
  },

  async listConnections(): Promise<OpenFinanceConnection[]> {
    const { data } = await apiClient.get<Record<string, unknown>[]>(ENDPOINTS.openFinance.connections, {
      timeout: 30000
    })
    return (data ?? []).map(normalizeConnection)
  },

  async linkConnection(payload: OpenFinanceConnectionPayload): Promise<OpenFinanceConnection> {
    const { data } = await apiClient.post<Record<string, unknown>>(ENDPOINTS.openFinance.connections, payload)
    return normalizeConnection(data)
  }
}
