import type { Category, CategoryPayload } from '@/types'
import { ENDPOINTS } from '../endpoints'
import { apiClient } from '../client'
import { withRetry, RETRY_GET_DEFAULT } from '../retry'
import { normalizeCategory } from '../mappers'

export const categoryService = {
  async list(search?: string): Promise<Category[]> {
    const data = await withRetry(
      () =>
        apiClient.get<Record<string, unknown>[]>(ENDPOINTS.categories, {
          params: search ? { search } : {}
        }),
      RETRY_GET_DEFAULT
    )
    return (data.data ?? []).map(normalizeCategory)
  },

  async create(payload: CategoryPayload): Promise<Category> {
    const { data } = await apiClient.post<Record<string, unknown>>(ENDPOINTS.categories, payload)
    return normalizeCategory(data)
  },

  async update(id: string, payload: CategoryPayload): Promise<Category> {
    const { data } = await apiClient.put<Record<string, unknown>>(`${ENDPOINTS.categories}/${id}`, payload)
    return normalizeCategory(data)
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`${ENDPOINTS.categories}/${id}`)
  }
}
