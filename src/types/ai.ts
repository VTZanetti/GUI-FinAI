export interface ClassificationResult {
  category: string
  subcategory: string | null
  confidence: number
  source: 'rules' | 'cached' | 'llm' | 'external'
}

export interface ClassificationPayload {
  description: string
  amount: number
}

export interface AdvisorResponse {
  answer: string
  context?: {
    period?: string
    totalIncrease?: number
    topDrivers?: unknown[]
  } | null
  sources: string[]
}

export interface AdvisorPayload {
  question: string
  includeDocuments?: boolean
}
