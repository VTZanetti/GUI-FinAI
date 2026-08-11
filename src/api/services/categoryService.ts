import type { Category, CategoryPayload } from '@/types'
import { ENDPOINTS } from '../endpoints'
import { apiClient } from '../client'
import { withRetry, RETRY_GET_DEFAULT } from '../retry'
import { normalizeCategory } from '../mappers'
import { IS_DEMO_MODE } from '../mocks'
import { demoClient } from '../mocks/demoClient'

export const categoryService = {
  async list(search?: string): Promise<Category[]> {
    if (IS_DEMO_MODE) return demoClient.listCategories()
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
    if (IS_DEMO_MODE) return demoClient.createCategory(payload)
    const { data } = await apiClient.post<Record<string, unknown>>(ENDPOINTS.categories, payload)
    return normalizeCategory(data)
  },

  async update(id: string, payload: CategoryPayload): Promise<Category> {
    if (IS_DEMO_MODE) return demoClient.createCategory(payload)
    const { data } = await apiClient.put<Record<string, unknown>>(`${ENDPOINTS.categories}/${id}`, payload)
    return normalizeCategory(data)
  },

  async remove(id: string): Promise<void> {
    if (IS_DEMO_MODE) return Promise.resolve()
    await apiClient.delete(`${ENDPOINTS.categories}/${id}`)
  }
}
