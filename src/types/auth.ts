/** Resposta de autenticação (login/register/refresh). */
export interface AuthResponse {
  userId: string
  email: string
  accessToken: string
  expiresIn: number
  refreshToken: string
}

/** Payload de registro. */
export interface RegisterPayload {
  email: string
  password: string
  firstName: string
  lastName: string
}

/** Payload de login. */
export interface LoginPayload {
  email: string
  password: string
}

/** Usuário decodificado do JWT (para UX — autorização real é do backend). */
export interface AuthUser {
  userId: string
  email: string
  firstName: string
  role: string
}
