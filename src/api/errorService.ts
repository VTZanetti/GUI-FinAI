import { ApiError } from './error'
import { parseProblemDetails } from '@/utils/problemDetails'

/**
 * Converte qualquer erro em ApiError com mensagem amigável (pt-BR).
 * Usado nos composables/views — nunca expõe detalhes internos.
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error
  const parsed = parseProblemDetails(error)
  const axiosLike = error as { response?: { status?: number }; code?: string }
  let code: ApiError['code'] = 'UNKNOWN'
  if (axiosLike?.code === 'ECONNABORTED' || parsed.message.includes('demorou')) code = 'TIMEOUT'
  else if (axiosLike?.code === 'ERR_NETWORK' || axiosLike?.code === 'ECONNREFUSED') code = 'NETWORK'
  else if (axiosLike?.response?.status !== undefined) code = 'HTTP'
  return new ApiError({
    code,
    status: axiosLike?.response?.status,
    message: parsed.message,
    fieldErrors: parsed.fieldErrors
  })
}
