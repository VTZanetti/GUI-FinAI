import type { BehaviorInsight, MonthlyTrend, SpendingSummary, SpendingSummaryParams } from '@/types'
import { ENDPOINTS } from '../endpoints'
import { apiClient } from '../client'
import { withRetry, RETRY_GET_DEFAULT } from '../retry'
import { normalizeBehaviorInsights, normalizeMonthlyTrend, normalizeSpendingSummary } from '../mappers'

export const analyticsService = {
  async spendingSummary(params: SpendingSummaryParams): Promise<SpendingSummary> {
    const data = await withRetry(
      () => apiClient.get<Record<string, unknown>>(ENDPOINTS.analytics.spendingSummary, { params }),
      RETRY_GET_DEFAULT
    )
    return normalizeSpendingSummary(data.data)
  },

  async behavior(months = 3): Promise<BehaviorInsight[]> {
    const data = await withRetry(
      () =>
        apiClient.get<Record<string, unknown>>(ENDPOINTS.analytics.behavior, {
          params: { months }
        }),
      RETRY_GET_DEFAULT
    )
    return normalizeBehaviorInsights(data.data)
  },

  async monthlyTrend(months = 12): Promise<MonthlyTrend> {
    const data = await withRetry(
      () =>
        apiClient.get<Record<string, unknown>>(ENDPOINTS.analytics.monthlyTrend, {
          params: { months }
        }),
      RETRY_GET_DEFAULT
    )
    return normalizeMonthlyTrend(data.data)
  }
}
