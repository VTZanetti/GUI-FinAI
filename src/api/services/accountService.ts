import type { Account, AccountPayload, AccountUpdatePayload, PagedResponse } from '@/types'
import { ENDPOINTS } from '../endpoints'
import { apiClient } from '../client'
import { withRetry, RETRY_GET_DEFAULT } from '../retry'
import { normalizeAccount } from '../mappers'

// (RETRY_GET_DEFAULT usado via withRetry com opções padrão implícitas)

export const accountService = {
  async list(page = 1, pageSize = 50): Promise<PagedResponse<Account>> {
    const data = await withRetry(() =>
      apiClient.get<PagedResponse<Record<string, unknown>>>(ENDPOINTS.accounts, {
        params: { page, pageSize }
      }),
      RETRY_GET_DEFAULT
    )
    return {
      items: (data.data.items ?? []).map(normalizeAccount),
      page: data.data.page ?? 1,
      pageSize: data.data.pageSize ?? pageSize,
      totalItems: data.data.totalItems ?? 0,
      totalPages: data.data.totalPages ?? 0
    }
  },

  async create(payload: AccountPayload): Promise<Account> {
    const { data } = await apiClient.post<Record<string, unknown>>(ENDPOINTS.accounts, payload)
    return normalizeAccount(data)
  },

  async update(id: string, payload: AccountUpdatePayload): Promise<Account> {
    const { data } = await apiClient.put<Record<string, unknown>>(`${ENDPOINTS.accounts}/${id}`, payload)
    return normalizeAccount(data)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.accounts}/${id}`)
  }
}
