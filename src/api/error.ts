/** Categorias de erro da camada de API. */
export type ApiErrorCode = 'NETWORK' | 'TIMEOUT' | 'HTTP' | 'UNKNOWN'

/** Erro tipado da camada de API com mensagem amigável já resolvida. */
export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status?: number
  readonly fieldErrors: Record<string, string[]>

  constructor(options: {
    code: ApiErrorCode
    message: string
    status?: number
    fieldErrors?: Record<string, string[]>
  }) {
    super(options.message)
    this.name = 'ApiError'
    this.code = options.code
    this.status = options.status
    this.fieldErrors = options.fieldErrors ?? {}
  }

  get isNetwork(): boolean {
    return this.code === 'NETWORK'
  }

  get isTimeout(): boolean {
    return this.code === 'TIMEOUT'
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
