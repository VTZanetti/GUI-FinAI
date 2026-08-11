import type { DocumentUploadResponse, FinAIDocument } from '@/types'
import { ENDPOINTS } from '../endpoints'
import { apiClient } from '../client'
import { withRetry, RETRY_GET_DEFAULT } from '../retry'
import { normalizeDocument } from '../mappers'
import { IS_DEMO_MODE } from '../mocks'
import { demoClient } from '../mocks/demoClient'

export const documentService = {
  async list(): Promise<FinAIDocument[]> {
    if (IS_DEMO_MODE) return demoClient.listDocuments()
    const data = await withRetry(() => apiClient.get<Record<string, unknown>[]>(ENDPOINTS.documents), RETRY_GET_DEFAULT)
    return (data.data ?? []).map(normalizeDocument)
  },

  /** Upload multipart — sem retry (re-upload manual). Timeout 120s. */
  async upload(file: File): Promise<DocumentUploadResponse> {
    if (IS_DEMO_MODE) return demoClient.uploadDocument()
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post<Record<string, unknown>>(ENDPOINTS.documents, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000
    })
    return {
      id: String(data.id ?? ''),
      fileName: String(data.fileName ?? file.name),
      contentType: String(data.contentType ?? file.type),
      status: (String(data.status ?? 'processing') as FinAIDocument['status']) ?? 'processing',
      uploadedAt: String(data.uploadedAt ?? new Date().toISOString())
    }
  },

  async remove(id: string): Promise<void> {
    if (IS_DEMO_MODE) return demoClient.deleteDocument(id)
    await apiClient.delete(`${ENDPOINTS.documents}/${id}`)
  }
}
