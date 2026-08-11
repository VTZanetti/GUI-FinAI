export type DocumentStatus = 'processing' | 'ready' | 'failed'

export interface FinAIDocument {
  id: string
  fileName: string
  contentType: string
  status: DocumentStatus
  uploadedAt: string
  failureReason?: string | null
}

export interface DocumentUploadResponse {
  id: string
  fileName: string
  contentType: string
  status: DocumentStatus
  uploadedAt: string
}
