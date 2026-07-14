import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/renderApp'
import { makeAuthResponse } from '../test/fixtures'
import * as authApi from '../api/auth'

vi.mock('../api/auth', { spy: true })

const REFRESH_TOKEN_KEY = 'rezerv.refreshToken'

describe('AuthContext — session persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  afterEach(() => {
    // Връща Date.now (vi.spyOn) към оригинала.
    vi.restoreAllMocks()
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
    // Rotation: новият token е записан за следващия reload.
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

  it('sliding session: клик след throttle прозореца рефрешва token-а (+15 мин)', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'stored-refresh-token')
    vi.mocked(authApi.refresh).mockResolvedValue(
      makeAuthResponse({ refreshToken: 'rotated-token' }),
    )

    renderApp('/')
    await screen.findByRole('button', { name: 'Изход' })
    expect(authApi.refresh).toHaveBeenCalledTimes(1)

    // Клик веднага след login-а НЕ рефрешва (throttle 60 сек).
    await userEvent.click(screen.getByText('Запази час за минути'))
    expect(authApi.refresh).toHaveBeenCalledTimes(1)

    // Клик 2 минути по-късно рефрешва с текущия (ротиран) token.
    const realNow = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(realNow + 2 * 60_000)
    await userEvent.click(screen.getByText('Запази час за минути'))

    await waitFor(() => {
      expect(authApi.refresh).toHaveBeenCalledTimes(2)
    })
    expect(authApi.refresh).toHaveBeenLastCalledWith({ refreshToken: 'rotated-token' })
  })
})
