export interface RetryOptions {
  /** Número total de tentativas (1 = sem retry). */
  attempts?: number
  /** Delay inicial em ms (exponencial: delay * 3^(tentativa-1)). */
  delay?: number
  /** Status HTTP que merecem retry (default: 5xx + 429). */
  onlyStatuses?: number[]
  /** Retry em erros de rede/timeout (default true). */
  retryNetwork?: boolean
  /** Callback opcional a cada tentativa. */
  onRetry?: (attempt: number, error: unknown) => void
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRetryableHttp(status: number | undefined, onlyStatuses: number[]): boolean {
  if (status === undefined) return false
  return onlyStatuses.includes(status)
}

/**
 * Executa uma função async com retry + backoff exponencial.
 * Política por grupo em docs/07-resiliencia-portainer.md §3.
 * - Idempotentes (GET): attempts 3, delay 500, onlyStatuses [429, 500, 502, 503, 504]
 * - AI: attempts 2, delay 2000
 * - POST/PUT/DELETE: chamar sem opções (sem retry).
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const attempts = Math.max(1, options.attempts ?? 1)
  const delay = options.delay ?? 500
  const onlyStatuses = options.onlyStatuses ?? [429, 500, 502, 503, 504]
  const retryNetwork = options.retryNetwork ?? true

  let lastError: unknown
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt >= attempts) break

      const status = (error as { response?: { status?: number } })?.response?.status
      const isNetwork =
        (error as { code?: string })?.code === 'ERR_NETWORK' ||
        (error as { code?: string })?.code === 'ECONNREFUSED' ||
        (error as { code?: string })?.code === 'ECONNABORTED'

      const shouldRetry =
        (retryNetwork && isNetwork) || isRetryableHttp(status, onlyStatuses)

      if (!shouldRetry) break

      options.onRetry?.(attempt, error)
      await sleep(delay * 3 ** (attempt - 1))
    }
  }
  throw lastError
}

/** Opções padrão para GETs de CRUD/analytics (retry 2x — 3 tentativas). */
export const RETRY_GET_DEFAULT: RetryOptions = {
  attempts: 3,
  delay: 500,
  onlyStatuses: [429, 500, 502, 503, 504]
}

/** Opções padrão para IA (retry 1x — 2 tentativas). */
export const RETRY_AI: RetryOptions = {
  attempts: 2,
  delay: 2000,
  onlyStatuses: [429, 500, 502, 503, 504]
}
