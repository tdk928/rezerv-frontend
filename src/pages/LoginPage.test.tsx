import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/renderApp'
import { makeAuthResponse } from '../test/fixtures'
import { ApiError } from '../api/http'
import * as authApi from '../api/auth'

vi.mock('../api/auth', { spy: true })

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it('показва валидационни грешки при празна форма', async () => {
    renderApp('/login')

    await userEvent.click(screen.getByRole('button', { name: 'Влез' }))

    expect(await screen.findByText('Невалиден email адрес')).toBeInTheDocument()
    expect(screen.getByText('Паролата е задължителна')).toBeInTheDocument()
    expect(authApi.login).not.toHaveBeenCalled()
  })

  it('при успешен login редиректва към / и navbar-ът показва Изход', async () => {
    vi.mocked(authApi.login).mockResolvedValue(makeAuthResponse())
    renderApp('/login')

    await userEvent.type(screen.getByLabelText('Email'), 'ivan@example.bg')
    await userEvent.type(screen.getByLabelText('Парола'), 'secret123')
    await userEvent.click(screen.getByRole('button', { name: 'Влез' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Изход' })).toBeInTheDocument()
    })
    expect(screen.getByAltText('REZERV — резервирай своя час')).toBeInTheDocument()
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
    renderApp('/login')

    await userEvent.type(screen.getByLabelText('Email'), 'ivan@example.bg')
    await userEvent.type(screen.getByLabelText('Парола'), 'greshna-parola')
    await userEvent.click(screen.getByRole('button', { name: 'Влез' }))

    expect(await screen.findByText('Грешен email или парола')).toBeInTheDocument()
  })
})
