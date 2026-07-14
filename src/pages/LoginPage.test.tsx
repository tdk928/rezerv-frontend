import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test/renderWithProviders'
import { LoginPage } from './LoginPage'
import { ApiError } from '../api/http'
import * as authApi from '../api/auth'
import type { AuthResponse } from '../api/auth'

vi.mock('../api/auth', { spy: true })

const authResponse: AuthResponse = {
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
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('показва валидационни грешки при празна форма', async () => {
    renderWithProviders(<LoginPage />, { path: '/login' })

    await userEvent.click(screen.getByRole('button', { name: 'Влез' }))

    expect(await screen.findByText('Невалиден email адрес')).toBeInTheDocument()
    expect(screen.getByText('Паролата е задължителна')).toBeInTheDocument()
    expect(authApi.login).not.toHaveBeenCalled()
  })

  it('при успешен login редиректва към /status и показва потребителя', async () => {
    vi.mocked(authApi.login).mockResolvedValue(authResponse)
    renderWithProviders(<LoginPage />, { path: '/login' })

    await userEvent.type(screen.getByLabelText('Email'), 'ivan@example.bg')
    await userEvent.type(screen.getByLabelText('Парола'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: 'Влез' }))

    await waitFor(() => {
      expect(
        screen.getByText('Логнат си като Иван Иванов (ivan@example.bg)'),
      ).toBeInTheDocument()
    })
    expect(authApi.login).toHaveBeenCalledWith(
      { email: 'ivan@example.bg', password: 'secret123' },
      expect.anything(),
    )
  })

  it('показва съобщението за грешка от бекенда при 401', async () => {
    vi.mocked(authApi.login).mockRejectedValue(
      new ApiError({
        status: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Грешен email или парола',
        correlationId: 'x',
        timestamp: '2026-07-14T10:00:00Z',
      }),
    )
    renderWithProviders(<LoginPage />, { path: '/login' })

    await userEvent.type(screen.getByLabelText('Email'), 'ivan@example.bg')
    await userEvent.type(screen.getByLabelText('Парола'), 'greshna-parola')
    await userEvent.click(screen.getByRole('button', { name: 'Влез' }))

    expect(await screen.findByText('Грешен email или парола')).toBeInTheDocument()
  })
})
