import type { ProblemDetails } from '@/types/api'

export interface ProblemParseResult {
  message: string
  fieldErrors: Record<string, string[]>
  status?: number
  title?: string
}

/** Mapa de status → mensagem amigável em pt-BR (docs/03-api-integration.md §15). */
const STATUS_MESSAGES: Record<number, string> = {
  400: 'Verifique os dados informados.',
  401: 'Sessão expirada. Entre novamente.',
  403: 'Você não tem permissão para esta ação.',
  404: 'Registro não encontrado.',
  409: 'Conflito: este registro possui vínculos (ex.: conta com transações).',
  422: 'Regra de negócio não atendida.',
  429: 'Muitas requisições. Aguarde um momento.',
  500: 'Erro interno do servidor. Tente novamente.',
  502: 'Serviço de IA indisponível no momento. Tente novamente.',
  503: 'Serviço indisponível no momento. Tente novamente.'
}

/**
 * Extrai o corpo ProblemDetails de um erro do Axios (qualquer formato).
 * Retorna null se não for possível identificar.
 */
export function extractProblemDetails(error: unknown): ProblemDetails | null {
  const err = error as { response?: { data?: unknown } }
  const data = err?.response?.data
  if (!data || typeof data !== 'object') return null
  const pd = data as ProblemDetails
  if (
    typeof pd.title === 'string' ||
    typeof pd.detail === 'string' ||
    typeof pd.status === 'number' ||
    (pd.errors !== undefined && typeof pd.errors === 'object' && pd.errors !== null)
  ) {
    return pd
  }
  return null
}

/**
 * Converte um erro (ProblemDetails RFC 7807, Axios, network, timeout)
 * em { message, fieldErrors } amigáveis em pt-BR.
 */
export function parseProblemDetails(error: unknown): ProblemParseResult {
  const pd = extractProblemDetails(error)
  if (pd) {
    const status = typeof pd.status === 'number' ? pd.status : undefined
    const statusMessage = status ? STATUS_MESSAGES[status] : undefined
    // Prefere detail (mensagem real do backend); senão mensagem amigável por status;
    // usa title apenas como último recurso (ex.: "Validation error" não é amigável).
    let message = pd.detail || statusMessage || ''
    if (!message && pd.title && pd.title !== statusMessage) message = pd.title
    if (!message) message = 'Ocorreu um erro inesperado.'
    const fieldErrors: Record<string, string[]> = {}
    if (pd.errors) {
      for (const [field, msgs] of Object.entries(pd.errors)) {
        if (Array.isArray(msgs)) fieldErrors[field] = msgs.map(String)
        else if (typeof msgs === 'string') fieldErrors[field] = [msgs]
      }
    }
    return { message, fieldErrors, status, title: pd.title }
  }

  const axiosLike = error as {
    code?: string
    message?: string
    response?: { status?: number; data?: { message?: string } }
  }

  if (axiosLike?.code === 'ECONNABORTED' || axiosLike?.message?.includes('timeout')) {
    return {
      message: 'O servidor demorou para responder. Tente novamente.',
      fieldErrors: {}
    }
  }
  if (
    axiosLike?.code === 'ERR_NETWORK' ||
    axiosLike?.message === 'Network Error' ||
    axiosLike?.code === 'ECONNREFUSED'
  ) {
    return {
      message: 'Não foi possível conectar ao servidor. Verifique se a API está no ar.',
      fieldErrors: {}
    }
  }
  if (typeof axiosLike?.message === 'string' && axiosLike.message) {
    return { message: axiosLike.message, fieldErrors: {} }
  }
  return { message: 'Ocorreu um erro inesperado.', fieldErrors: {} }
}
