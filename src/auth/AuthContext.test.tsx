import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/renderApp'
import { makeAuthResponse } from '../test/fixtures'
import * as authApi from '../api/auth'
import { postAuth, setUnauthorizedHandler } from '../api/http'

vi.mock('../api/auth', { spy: true })

const REFRESH_TOKEN_KEY = 'rezerv.refreshToken'

describe('AuthContext — session persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    setUnauthorizedHandler(null)
  })

  it('възстановява сесията след reload чрез refresh token-а', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'stored-refresh-token')
    vi.mocked(authApi.refresh).mockResolvedValue(
      makeAuthResponse({ refreshToken: 'rotated-token' }),
    )

    renderApp('/')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Изход' })).toBeInTheDocument()
    })
    expect(authApi.refresh).toHaveBeenCalledWith({ refreshToken: 'stored-refresh-token' })
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBe('rotated-token')
  })

  it('при невалиден refresh token остава излогнат и чисти storage-а', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'expired-token')
    vi.mocked(authApi.refresh).mockRejectedValue(new Error('401'))

    renderApp('/')

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Вход' })).toBeInTheDocument()
    })
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull()
  })

  it('Изход чисти сесията и navbar-ът показва Вход/Регистрация', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'stored-refresh-token')
    vi.mocked(authApi.refresh).mockResolvedValue(makeAuthResponse())

    renderApp('/')
    await screen.findByRole('button', { name: 'Изход' })

    await userEvent.click(screen.getByRole('button', { name: 'Изход' }))

    expect(screen.getByRole('button', { name: 'Вход' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Регистрация' })).toBeInTheDocument()
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull()
  })

  it('401 от protected API (gateway) прави logout', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'stored-refresh-token')
    vi.mocked(authApi.refresh).mockResolvedValue(makeAuthResponse())

    renderApp('/')
    await screen.findByRole('button', { name: 'Изход' })

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            status: 401,
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired token',
            correlationId: 'c',
            timestamp: '2026-07-16T00:00:00Z',
          }),
          { status: 401, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    )

    await expect(postAuth('/business/companies', {}, 'expired-jwt')).rejects.toThrow(
      'Invalid or expired token',
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Вход' })).toBeInTheDocument()
    })
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull()
  })
})
