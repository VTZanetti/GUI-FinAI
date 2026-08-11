import type { CashFlowForecast } from '@/types'
import { ENDPOINTS } from '../endpoints'
import { apiClient } from '../client'
import { withRetry, RETRY_GET_DEFAULT } from '../retry'
import { normalizeForecast } from '../mappers'

export const forecastService = {
  async cashFlow(months = 6): Promise<CashFlowForecast> {
    const data = await withRetry(
      () => apiClient.get<Record<string, unknown>>(ENDPOINTS.forecast, { params: { months } }),
      RETRY_GET_DEFAULT
    )
    return normalizeForecast(data.data)
  }
}
