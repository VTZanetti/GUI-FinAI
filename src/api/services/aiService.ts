import type { AdvisorPayload, AdvisorResponse, ClassificationPayload, ClassificationResult } from '@/types'
import { ENDPOINTS } from '../endpoints'
import { apiClient } from '../client'
import { withRetry, RETRY_AI } from '../retry'
import { normalizeClassification } from '../mappers'

export const aiService = {
  /** Pré-classificação de transação (POST /ai/classify). */
  async classify(payload: ClassificationPayload): Promise<ClassificationResult> {
    const data = await withRetry(
      () => apiClient.post<Record<string, unknown>>(ENDPOINTS.ai.classify, payload),
      RETRY_AI
    )
    return normalizeClassification(data.data)
  },

  /** Assistente financeiro — timeout longo (90s). */
  async financialAdvisor(payload: AdvisorPayload): Promise<AdvisorResponse> {
    const data = await withRetry(
      () =>
        apiClient.post<Record<string, unknown>>(ENDPOINTS.ai.financialAdvisor, payload, {
          timeout: 90000
        }),
      RETRY_AI
    )
    const raw = data.data
    return {
      answer: String(raw.answer ?? ''),
      context: raw.context && typeof raw.context === 'object' ? (raw.context as AdvisorResponse['context']) : null,
      sources: Array.isArray(raw.sources) ? raw.sources.map(String) : []
    }
  }
}
