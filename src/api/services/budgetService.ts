import type { Budget, BudgetFilters, BudgetPayload } from '@/types'
import { ENDPOINTS } from '../endpoints'
import { apiClient } from '../client'
import { withRetry, RETRY_GET_DEFAULT } from '../retry'
import { normalizeBudget } from '../mappers'

export const budgetService = {
  async list(filters: BudgetFilters = {}): Promise<Budget[]> {
    const data = await withRetry(
      () =>
        apiClient.get<Record<string, unknown>[]>(ENDPOINTS.budgets, {
          params: filters.month && filters.year ? { month: filters.month, year: filters.year } : {}
        }),
      RETRY_GET_DEFAULT
    )
    return (data.data ?? []).map(normalizeBudget)
  },

  async create(payload: BudgetPayload): Promise<Budget> {
    const { data } = await apiClient.post<Record<string, unknown>>(ENDPOINTS.budgets, payload)
    return normalizeBudget(data)
  },

  async update(id: string, payload: { limitAmount: number }): Promise<Budget> {
    const { data } = await apiClient.put<Record<string, unknown>>(`${ENDPOINTS.budgets}/${id}`, payload)
    return normalizeBudget(data)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.budgets}/${id}`)
  }
}
