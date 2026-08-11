import { describe, it, expect } from 'vitest'
import { toApiError } from '@/api/errorService'
import { ApiError, isApiError } from '@/api/error'

describe('api/error', () => {
  it('cria ApiError com código e status', () => {
    const err = new ApiError({ code: 'HTTP', message: 'Erro', status: 400 })
    expect(err.code).toBe('HTTP')
    expect(err.status).toBe(400)
    expect(isApiError(err)).toBe(true)
  })

  it('isApiError retorna false para erro comum', () => {
    expect(isApiError(new Error('x'))).toBe(false)
  })

  it('expoõe helpers isNetwork/isTimeout', () => {
    const network = new ApiError({ code: 'NETWORK', message: 'x' })
    expect(network.isNetwork).toBe(true)
    const timeout = new ApiError({ code: 'TIMEOUT', message: 'x' })
    expect(timeout.isTimeout).toBe(true)
  })
})

describe('api/errorService.toApiError', () => {
  it('preserva ApiError já tipado', () => {
    const original = new ApiError({ code: 'HTTP', message: 'x', status: 409 })
    expect(toApiError(original)).toBe(original)
  })

  it('converte erro HTTP em ApiError com status', () => {
    const err = toApiError({ response: { status: 403, data: { title: 'Forbidden', status: 403 } } })
    expect(err).toBeInstanceOf(ApiError)
    expect(err.code).toBe('HTTP')
    expect(err.status).toBe(403)
    expect(err.message).toBe('Você não tem permissão para esta ação.')
  })

  it('converte erro de rede em ApiError NETWORK', () => {
    const err = toApiError({ code: 'ERR_NETWORK', message: 'Network Error' })
    expect(err.code).toBe('NETWORK')
    expect(err.message).toContain('Não foi possível conectar')
  })

  it('converte timeout em ApiError TIMEOUT', () => {
    const err = toApiError({ code: 'ECONNABORTED', message: 'timeout' })
    expect(err.code).toBe('TIMEOUT')
  })

  it('extrai fieldErrors do ProblemDetails', () => {
    const err = toApiError({
      response: { status: 400, data: { errors: { amount: ['inválido'] } } }
    })
    expect(err.fieldErrors.amount).toEqual(['inválido'])
  })
})
