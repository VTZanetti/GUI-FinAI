export type AnomalyMethod = 'zscore' | 'iqr'

export interface Anomaly {
  transactionId: string
  description: string
  amount: number
  date: string
  category: string | null
  anomaly: boolean
  score: number
  reason: string
}

export interface AnomalyListResponse {
  method: AnomalyMethod | string
  items: Anomaly[]
}

export interface AnomalyCheckResponse {
  anomaly: boolean
  score: number
  reason: string
  suggestedAction: string
  method: AnomalyMethod | string
}

export interface AnomalyCheckPayload {
  description: string
  amount: number
  categoryId?: string | null
}

export interface AnomalyFilters {
  from?: string
  to?: string
  method?: AnomalyMethod
  accountId?: string
}
