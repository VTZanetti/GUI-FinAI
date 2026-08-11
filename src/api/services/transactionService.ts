import type { PagedResponse, Transaction, TransactionFilters, TransactionPayload } from '@/types'
import { ENDPOINTS } from '../endpoints'
import { apiClient } from '../client'
import { withRetry, RETRY_GET_DEFAULT } from '../retry'
import { normalizeTransaction } from '../mappers'

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
    const { data } = await apiClient.post<Record<string, unknown>>(ENDPOINTS.transactions, payload)
    return normalizeTransaction(data)
  },

  async update(id: string, payload: TransactionPayload): Promise<Transaction> {
    const { data } = await apiClient.put<Record<string, unknown>>(
      `${ENDPOINTS.transactions}/${id}`,
      payload
    )
    return normalizeTransaction(data)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.transactions}/${id}`)
  }
}
