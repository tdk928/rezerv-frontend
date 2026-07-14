import { post } from './http'

/** Договор с rezerv-cas през gateway-а (/api/auth/**). */

export interface UserResponse {
  id: number
  email: string
  phone: string | null
  firstName: string
  lastName: string
  companyId: number | null
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
  phone?: string
}

export function login(request: LoginRequest): Promise<AuthResponse> {
  return post<AuthResponse>('/auth/login', request)
}

export function register(request: RegisterRequest): Promise<AuthResponse> {
  return post<AuthResponse>('/auth/register', request)
}
