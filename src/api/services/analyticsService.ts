import type { BehaviorInsight, MonthlyTrend, SpendingSummary, SpendingSummaryParams } from '@/types'
import { ENDPOINTS } from '../endpoints'
import { apiClient } from '../client'
import { withRetry, RETRY_GET_DEFAULT } from '../retry'
import { normalizeBehaviorInsights, normalizeMonthlyTrend, normalizeSpendingSummary } from '../mappers'
import { IS_DEMO_MODE } from '../mocks'
import { demoClient } from '../mocks/demoClient'

export const analyticsService = {
  async spendingSummary(params: SpendingSummaryParams): Promise<SpendingSummary> {
    if (IS_DEMO_MODE) return demoClient.spendingSummary(params)
    const data = await withRetry(
      () => apiClient.get<Record<string, unknown>>(ENDPOINTS.analytics.spendingSummary, { params }),
      RETRY_GET_DEFAULT
    )
    return normalizeSpendingSummary(data.data)
  },

  async behavior(months = 3): Promise<BehaviorInsight[]> {
    if (IS_DEMO_MODE) return (await demoClient.behavior()).insights
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
    if (IS_DEMO_MODE) return demoClient.monthlyTrend()
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
