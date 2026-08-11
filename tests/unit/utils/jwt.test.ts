import { describe, it, expect } from 'vitest'
import { decodeJwtPayload, decodeUser, createFakeToken } from '@/utils/jwt'

describe('utils/jwt', () => {
  it('decodifica payload de token real (HS256)', () => {
    const token = createFakeToken({ sub: 'u1', email: 'a@b.com', role: 'Admin', firstName: 'Ana' })
    const payload = decodeJwtPayload(token)
    expect(payload.email).toBe('a@b.com')
    expect(payload.role).toBe('Admin')
  })

  it('decodeUser extrai claims .NET (URI role)', () => {
    const token = createFakeToken({
      sub: 'u1',
      email: 'a@b.com',
      'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'Admin'
    })
    const user = decodeUser(token)
    expect(user.role).toBe('Admin')
    expect(user.email).toBe('a@b.com')
  })

  it('decodeUser faz fallback para role User', () => {
    const token = createFakeToken({ sub: 'u1', email: 'a@b.com' })
    const user = decodeUser(token)
    expect(user.role).toBe('User')
  })

  it('decodeJwtPayload retorna {} para token inválido', () => {
    expect(decodeJwtPayload('invalid')).toEqual({})
  })

  it('firstName usa given_name quando presente', () => {
    const token = createFakeToken({ sub: 'u1', email: 'a@b.com', given_name: 'Ana', role: 'User' })
    const user = decodeUser(token)
    expect(user.firstName).toBe('Ana')
  })
})
