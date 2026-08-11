/** Envelope de paginação usado pelo backend (transactions, accounts, audit-logs). */
export interface PagedResponse<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

/** ProblemDetails (RFC 7807) — formato de erro do backend. */
export interface ProblemDetails {
  type?: string
  title?: string
  status?: number
  detail?: string
  errors?: Record<string, string[]>
  [key: string]: unknown
}
