import type { AuthUser } from '@/types'

/** Decodifica o payload do JWT (apenas para UX — sem validação de assinatura). */
export function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split('.')[1] ?? ''
    const normalized = base64.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    return JSON.parse(atob(padded)) as Record<string, unknown>
  } catch {
    return {}
  }
}

/** Extrai o usuário legível do payload do JWT (claims .NET compatíveis). */
export function decodeUser(token: string): AuthUser {
  const payload = decodeJwtPayload(token)
  const roleClaim =
    payload.role ??
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
    'User'
  const email = (payload.email ?? payload.sub ?? '') as string
  const firstName =
    (payload.firstName as string) ??
    (payload.given_name as string) ??
    email.split('@')[0] ??
    ''
  return {
    userId: String(payload.sub ?? payload.nameidentifier ?? ''),
    email,
    firstName,
    role: String(roleClaim)
  }
}

/** Gera um token JWT fictício com payload customizado (demo mode/testes). */
export function createFakeToken(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return `${header}.${body}.fake-signature`
}
