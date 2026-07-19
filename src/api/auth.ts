import { post, postAuth } from './http'

/** Договор с rezerv-cas през gateway-а (/api/auth/**). */

export interface UserResponse {
  id: number
  email: string
  phone: string | null
  firstName: string
  lastName: string
  /** Активна фирма (JWT companyId). */
  companyId: number | null
  /** Всички фирми на user-а (membership). */
  companyIds: number[]
  status: string
  roles: string[]
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresInSeconds: number
  user: UserResponse
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
}

export function login(request: LoginRequest): Promise<AuthResponse> {
  return post<AuthResponse>('/auth/login', request)
}

export function register(request: RegisterRequest): Promise<AuthResponse> {
  return post<AuthResponse>('/auth/register', request)
}

/** Rotation: старият refresh token се инвалидира, връща се нов + нов access token. */
export function refresh(request: { refreshToken: string }): Promise<AuthResponse> {
  return post<AuthResponse>('/auth/refresh', request)
}

/** Сменя активната фирма → нов JWT с companyId. */
export function switchCompany(accessToken: string, companyId: number): Promise<AuthResponse> {
  return postAuth<AuthResponse>('/auth/switch-company', { companyId }, accessToken)
}
