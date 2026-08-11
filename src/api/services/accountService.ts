import type { Account, AccountPayload, AccountUpdatePayload, PagedResponse } from '@/types'
import { ENDPOINTS } from '../endpoints'
import { apiClient } from '../client'
import { withRetry, RETRY_GET_DEFAULT } from '../retry'
import { normalizeAccount } from '../mappers'
import { IS_DEMO_MODE } from '../mocks'
import { demoClient } from '../mocks/demoClient'

export const accountService = {
  async list(page = 1, pageSize = 50): Promise<PagedResponse<Account>> {
    if (IS_DEMO_MODE) return demoClient.listAccounts()
    const data = await withRetry(
      () =>
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
    if (IS_DEMO_MODE) return demoClient.createAccount(payload)
    const { data } = await apiClient.post<Record<string, unknown>>(ENDPOINTS.accounts, payload)
    return normalizeAccount(data)
  },

  async update(id: string, payload: AccountUpdatePayload): Promise<Account> {
    if (IS_DEMO_MODE) return demoClient.updateAccount(id, payload)
    const { data } = await apiClient.put<Record<string, unknown>>(`${ENDPOINTS.accounts}/${id}`, payload)
    return normalizeAccount(data)
  },

  async remove(id: string): Promise<void> {
    if (IS_DEMO_MODE) return demoClient.deleteAccount(id)
    await apiClient.delete(`${ENDPOINTS.accounts}/${id}`)
  }
}
