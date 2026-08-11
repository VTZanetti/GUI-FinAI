import type { AuthUser } from '@/types'
import { decodeUser } from '@/utils/jwt'

/** Converte tokens de sessão em AuthUser (tolerante a payload ausente). */
export function userFromSession(accessToken: string, email?: string): AuthUser {
  try {
    return decodeUser(accessToken)
  } catch {
    return { userId: '', email: email ?? '', firstName: '', role: 'User' }
  }
}
