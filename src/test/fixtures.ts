import type { AuthResponse } from '../api/auth'

export function makeAuthResponse(overrides: Partial<AuthResponse> = {}): AuthResponse {
  return {
    accessToken: 'jwt-token',
    refreshToken: 'refresh-uuid',
    expiresInSeconds: 900,
    user: {
      id: 1,
      email: 'ivan@example.bg',
      phone: null,
      firstName: 'Иван',
      lastName: 'Иванов',
      companyId: null,
      status: 'ACTIVE',
      roles: ['CLIENT'],
      createdAt: '2026-07-14T10:00:00Z',
    },
    ...overrides,
  }
}
