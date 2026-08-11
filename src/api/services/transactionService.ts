import type { PagedResponse, Transaction, TransactionFilters, TransactionPayload } from '@/types'
import { ENDPOINTS } from '../endpoints'
import { apiClient } from '../client'
import { withRetry, RETRY_GET_DEFAULT } from '../retry'
import { normalizeTransaction } from '../mappers'
import { IS_DEMO_MODE } from '../mocks'
import { demoClient } from '../mocks/demoClient'

/** Converte filtros em query params (removendo vazios). */
export function toQueryParams(filters: TransactionFilters): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {}
  if (filters.accountId) params.accountId = filters.accountId
  if (filters.categoryId) params.categoryId = filters.categoryId
  if (filters.type) params.type = filters.type
  if (filters.from) params.from = filters.from
  if (filters.to) params.to = filters.to
  if (filters.minAmount !== undefined) params.minAmount = filters.minAmount
  if (filters.maxAmount !== undefined) params.maxAmount = filters.maxAmount
  if (filters.search) params.search = filters.search
  if (filters.isRecurring !== undefined) params.isRecurring = String(filters.isRecurring)
  params.page = filters.page ?? 1
  params.pageSize = filters.pageSize ?? 20
  if (filters.sortBy) params.sortBy = filters.sortBy
  if (filters.sortOrder) params.sortOrder = filters.sortOrder
  return params
}

export const transactionService = {
  async list(filters: TransactionFilters = {}): Promise<PagedResponse<Transaction>> {
    if (IS_DEMO_MODE) return demoClient.listTransactions(filters as unknown as Record<string, unknown>)
    const data = await withRetry(
      () =>
        apiClient.get<PagedResponse<Record<string, unknown>>>(ENDPOINTS.transactions, {
          params: toQueryParams(filters)
        }),
      RETRY_GET_DEFAULT
    )
    return {
      items: (data.data.items ?? []).map(normalizeTransaction),
      page: data.data.page ?? 1,
      pageSize: data.data.pageSize ?? 20,
      totalItems: data.data.totalItems ?? 0,
      totalPages: data.data.totalPages ?? 0
    }
  },

  async create(payload: TransactionPayload): Promise<Transaction> {
    if (IS_DEMO_MODE) return demoClient.createTransaction(payload as unknown as Record<string, unknown>)
    const { data } = await apiClient.post<Record<string, unknown>>(ENDPOINTS.transactions, payload)
    return normalizeTransaction(data)
  },

  async update(id: string, payload: TransactionPayload): Promise<Transaction> {
    if (IS_DEMO_MODE) return demoClient.updateTransaction(id, payload as unknown as Record<string, unknown>)
    const { data } = await apiClient.put<Record<string, unknown>>(
      `${ENDPOINTS.transactions}/${id}`,
      payload
    )
    return normalizeTransaction(data)
  },

  async remove(id: string): Promise<void> {
    if (IS_DEMO_MODE) return demoClient.deleteTransaction(id)
    await apiClient.delete(`${ENDPOINTS.transactions}/${id}`)
  }
}
