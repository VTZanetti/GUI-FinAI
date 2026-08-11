import { describe, it, expect, vi } from 'vitest'
import { withRetry, RETRY_GET_DEFAULT } from '@/api/retry'

const networkError = () => {
  const e = new Error('Network Error') as Error & { code: string }
  e.code = 'ERR_NETWORK'
  return e
}

const httpError = (status: number) => {
  const e = new Error(`HTTP ${status}`) as Error & { response: { status: number } }
  e.response = { status }
  return e
}

describe('withRetry', () => {
  it('retorna o resultado na primeira tentativa', async () => {
    const fn = vi.fn().mockResolvedValue('ok')
    const result = await withRetry(fn, { attempts: 3 })
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('não faz retry em erro 4xx', async () => {
    const fn = vi.fn().mockRejectedValue(httpError(400))
    await expect(withRetry(fn, RETRY_GET_DEFAULT)).rejects.toThrow('HTTP 400')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('faz retry em 500 até esgotar tentativas', async () => {
    const fn = vi.fn().mockRejectedValue(httpError(500))
    await expect(withRetry(fn, { attempts: 3, delay: 1 })).rejects.toThrow('HTTP 500')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('faz retry em erro de rede e recupera', async () => {
    const fn = vi.fn().mockRejectedValueOnce(networkError()).mockResolvedValueOnce('ok')
    const result = await withRetry(fn, { attempts: 2, delay: 1 })
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('não faz retry em 403', async () => {
    const fn = vi.fn().mockRejectedValue(httpError(403))
    await expect(withRetry(fn, { attempts: 3, delay: 1 })).rejects.toThrow('HTTP 403')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('não retenta quando attempts = 1', async () => {
    const fn = vi.fn().mockRejectedValue(httpError(500))
    await expect(withRetry(fn, { attempts: 1 })).rejects.toThrow()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('não retenta quando retryNetwork = false', async () => {
    const fn = vi.fn().mockRejectedValue(networkError())
    await expect(withRetry(fn, { attempts: 2, retryNetwork: false })).rejects.toThrow()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('chama onRetry a cada tentativa', async () => {
    const fn = vi.fn().mockRejectedValue(httpError(500))
    const onRetry = vi.fn()
    await expect(withRetry(fn, { attempts: 2, delay: 1, onRetry })).rejects.toThrow()
    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
