import type { AnomalyCheckPayload, AnomalyCheckResponse, AnomalyFilters, AnomalyListResponse } from '@/types'
import { ENDPOINTS } from '../endpoints'
import { apiClient } from '../client'
import { withRetry, RETRY_GET_DEFAULT } from '../retry'
import { normalizeAnomalies } from '../mappers'

export const anomalyService = {
  async list(filters: AnomalyFilters = {}): Promise<AnomalyListResponse> {
    const params: Record<string, string> = {}
    if (filters.from) params.from = filters.from
    if (filters.to) params.to = filters.to
    if (filters.method) params.method = filters.method
    if (filters.accountId) params.accountId = filters.accountId
    const data = await withRetry(
      () => apiClient.get<Record<string, unknown>>(ENDPOINTS.anomalies, { params }),
      RETRY_GET_DEFAULT
    )
    return normalizeAnomalies(data.data)
  },

  async check(payload: AnomalyCheckPayload): Promise<AnomalyCheckResponse> {
    const { data } = await apiClient.post<Record<string, unknown>>(ENDPOINTS.anomaliesCheck, payload)
    return {
      anomaly: Boolean(data.anomaly),
      score: typeof data.score === 'number' ? data.score : 0,
      reason: String(data.reason ?? ''),
      suggestedAction: String(data.suggestedAction ?? ''),
      method: String(data.method ?? 'zscore')
    }
  }
}
