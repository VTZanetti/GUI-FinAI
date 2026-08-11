import { describe, it, expect } from 'vitest'
import { parseProblemDetails, extractProblemDetails } from '@/utils/problemDetails'

describe('parseProblemDetails', () => {
  it('parseia erro 400 com errors por campo', () => {
    const error = {
      response: {
        status: 400,
        data: {
          type: 'https://httpstatuses.com/400',
          title: 'Validation error',
          status: 400,
          detail: '',
          errors: { amount: ['Amount must be greater than 0'] }
        }
      }
    }
    const result = parseProblemDetails(error)
    expect(result.status).toBe(400)
    expect(result.fieldErrors.amount).toEqual(['Amount must be greater than 0'])
    expect(result.message).toBe('Verifique os dados informados.')
  })

  it('usa detail quando presente (422)', () => {
    const error = {
      response: {
        status: 422,
        data: { title: 'Business rule', detail: 'Limite inválido', status: 422 }
      }
    }
    const result = parseProblemDetails(error)
    expect(result.message).toBe('Limite inválido')
  })

  it('mapeia 401 para mensagem amigável', () => {
    const error = { response: { status: 401, data: { title: 'Unauthorized', status: 401 } } }
    expect(parseProblemDetails(error).message).toBe('Sessão expirada. Entre novamente.')
  })

  it('mapeia 409 para mensagem de conflito', () => {
    const error = { response: { status: 409, data: { status: 409 } } }
    expect(parseProblemDetails(error).message).toContain('vínculos')
  })

  it('mapeia 429', () => {
    const error = { response: { status: 429, data: { status: 429 } } }
    expect(parseProblemDetails(error).message).toContain('Muitas requisições')
  })

  it('mapeia 503 como indisponível', () => {
    const error = { response: { status: 503, data: { status: 503 } } }
    expect(parseProblemDetails(error).message).toContain('indisponível')
  })

  it('detecta timeout (ECONNABORTED)', () => {
    const error = { code: 'ECONNABORTED', message: 'timeout of 15000ms exceeded' }
    const result = parseProblemDetails(error)
    expect(result.message).toContain('demorou para responder')
  })

  it('detecta erro de rede', () => {
    const error = { code: 'ERR_NETWORK', message: 'Network Error' }
    const result = parseProblemDetails(error)
    expect(result.message).toContain('Não foi possível conectar ao servidor')
  })

  it('retorna mensagem genérica para erro desconhecido', () => {
    expect(parseProblemDetails({}).message).toBe('Ocorreu um erro inesperado.')
  })
})

describe('extractProblemDetails', () => {
  it('retorna null quando não há response', () => {
    expect(extractProblemDetails({ message: 'x' })).toBeNull()
  })

  it('retorna o ProblemDetails quando presente', () => {
    const data = { title: 'T', status: 400 }
    expect(extractProblemDetails({ response: { data } })).toEqual(data)
  })

  it('retorna null quando data não é objeto', () => {
    expect(extractProblemDetails({ response: { data: 'string' } })).toBeNull()
  })
})
