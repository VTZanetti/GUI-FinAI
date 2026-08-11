import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocka o axios ANTES do import do service
vi.mock('axios', () => {
  const mockInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } }
  }
  return {
    default: {
      create: vi.fn(() => mockInstance)
    }
  }
})

vi.mock('@/api/mocks', () => ({ IS_DEMO_MODE: false }))

import { authService } from '@/api/services/authService'
import axios from 'axios'

const mockClient = (axios.create as ReturnType<typeof vi.fn>).mock.results[0].value

describe('authService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('login envia credenciais e retorna dados', async () => {
    const authRes = { userId: 'u', email: 'a', accessToken: 't', expiresIn: 900, refreshToken: 'r' }
    mockClient.post.mockResolvedValue({ data: authRes })
    const res = await authService.login({ email: 'a', password: 'p' })
    expect(res).toEqual(authRes)
    expect(mockClient.post).toHaveBeenCalledWith('/auth/login', { email: 'a', password: 'p' })
  })

  it('register envia payload', async () => {
    mockClient.post.mockResolvedValue({ data: {} })
    await authService.register({ email: 'a', password: 'p', firstName: 'A', lastName: 'B' })
    expect(mockClient.post).toHaveBeenCalledWith('/auth/register', {
      email: 'a',
      password: 'p',
      firstName: 'A',
      lastName: 'B'
    })
  })

  it('refresh envia refreshToken', async () => {
    mockClient.post.mockResolvedValue({ data: {} })
    await authService.refresh('rt')
    expect(mockClient.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'rt' })
  })

  it('logout envia refreshToken', async () => {
    mockClient.post.mockResolvedValue({ data: undefined })
    await authService.logout('rt')
    expect(mockClient.post).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'rt' })
  })
})
