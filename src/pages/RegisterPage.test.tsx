import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test/renderWithProviders'
import { RegisterPage } from './RegisterPage'
import { ApiError } from '../api/http'
import * as authApi from '../api/auth'
import type { AuthResponse } from '../api/auth'

vi.mock('../api/auth', { spy: true })

const authResponse: AuthResponse = {
  accessToken: 'jwt-token',
  refreshToken: 'refresh-uuid',
  expiresInSeconds: 900,
  user: {
    id: 2,
    email: 'maria@example.bg',
    phone: null,
    firstName: 'Мария',
    lastName: 'Петрова',
    companyId: null,
    status: 'ACTIVE',
    roles: ['CLIENT'],
    createdAt: '2026-07-14T10:00:00Z',
  },
}

async function fillForm() {
  await userEvent.type(screen.getByLabelText('Име'), 'Мария')
  await userEvent.type(screen.getByLabelText('Фамилия'), 'Петрова')
  await userEvent.type(screen.getByLabelText('Email'), 'maria@example.bg')
  await userEvent.type(screen.getByLabelText('Парола'), 'secret123')
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('показва валидационни грешки при празна форма', async () => {
    renderWithProviders(<RegisterPage />, { path: '/register' })

    await userEvent.click(screen.getByRole('button', { name: 'Регистрирай се' }))

    expect(await screen.findByText('Името е задължително')).toBeInTheDocument()
    expect(screen.getByText('Фамилията е задължителна')).toBeInTheDocument()
    expect(screen.getByText('Невалиден email адрес')).toBeInTheDocument()
    expect(screen.getByText('Паролата трябва да е поне 8 символа')).toBeInTheDocument()
    expect(authApi.register).not.toHaveBeenCalled()
  })

  it('при успешна регистрация редиректва към /status; празен телефон не се праща', async () => {
    vi.mocked(authApi.register).mockResolvedValue(authResponse)
    renderWithProviders(<RegisterPage />, { path: '/register' })

    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Регистрирай се' }))

    await waitFor(() => {
      expect(
        screen.getByText('Логнат си като Мария Петрова (maria@example.bg)'),
      ).toBeInTheDocument()
    })
    expect(authApi.register).toHaveBeenCalledWith({
      email: 'maria@example.bg',
      password: 'secret123',
      firstName: 'Мария',
      lastName: 'Петрова',
      phone: undefined,
    })
  })

  it('показва грешката при зает email (409)', async () => {
    vi.mocked(authApi.register).mockRejectedValue(
      new ApiError({
        status: 409,
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Потребител с този email вече съществува',
        correlationId: 'x',
        timestamp: '2026-07-14T10:00:00Z',
      }),
    )
    renderWithProviders(<RegisterPage />, { path: '/register' })

    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Регистрирай се' }))

    expect(
      await screen.findByText('Потребител с този email вече съществува'),
    ).toBeInTheDocument()
  })
})
