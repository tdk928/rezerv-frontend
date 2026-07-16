import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/renderApp'
import { makeAuthResponse, makeCategories, makeCities } from '../test/fixtures'
import * as authApi from '../api/auth'
import { getCategories, getCities } from '../api/business'
import { createCompany, listMyCompanies } from '../api/businessOnboarding'

vi.mock('../api/auth', { spy: true })
vi.mock('../api/business', () => ({
  getCities: vi.fn(),
  getCategories: vi.fn(),
  searchSalons: vi.fn(),
  getSalon: vi.fn(),
}))
vi.mock('../api/businessOnboarding', () => ({
  createCompany: vi.fn(),
  createSalon: vi.fn(),
  createSalonService: vi.fn(),
  createSalonPhoto: vi.fn(),
  listMyCompanies: vi.fn(),
}))

const REFRESH_TOKEN_KEY = 'rezerv.refreshToken'

describe('BusinessOnboardingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    vi.mocked(getCities).mockResolvedValue(makeCities())
    vi.mocked(getCategories).mockResolvedValue(makeCategories())
    vi.mocked(listMyCompanies).mockResolvedValue([])
  })

  it('пренасочва към login без автентикация', async () => {
    renderApp('/business/onboarding')

    expect(await screen.findByRole('heading', { name: 'Вход' })).toBeInTheDocument()
  })

  it('показва форма за фирма при логнат user', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-token')
    vi.mocked(authApi.refresh).mockResolvedValue(makeAuthResponse())

    renderApp('/business/onboarding')

    expect(await screen.findByLabelText('ЕИК')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Продължи' })).toBeInTheDocument()
  })

  it('след успешна фирма рефрешва сесията и показва стъпка Салон', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-token')
    vi.mocked(authApi.refresh)
      .mockResolvedValueOnce(makeAuthResponse())
      .mockResolvedValueOnce(
        makeAuthResponse({
          user: {
            ...makeAuthResponse().user,
            companyId: 50,
            companyIds: [50],
            roles: ['BUSINESS_OWNER', 'CLIENT'],
          },
        }),
      )
    vi.mocked(createCompany).mockResolvedValue({
      id: 50,
      eik: '131529327',
      name: 'Тест ООД',
      legalName: 'Test OOD',
      ownerUserId: 1,
      status: 'PENDING_APPROVAL',
      createdAt: '2026-07-15T00:00:00Z',
    })

    renderApp('/business/onboarding')
    await screen.findByLabelText('ЕИК')

    await userEvent.type(screen.getByLabelText('ЕИК'), '131529327')
    await userEvent.type(screen.getByLabelText('Име на фирмата'), 'Тест ООД')
    await userEvent.type(screen.getByLabelText('Юридическо име'), 'Test OOD')
    await userEvent.click(screen.getByRole('button', { name: 'Продължи' }))

    await waitFor(() => {
      expect(createCompany).toHaveBeenCalled()
    })
    expect(authApi.refresh).toHaveBeenCalledTimes(2)
    expect(await screen.findByLabelText('Име на салона')).toBeInTheDocument()
  })

  it('позволява нова фирма ако user вече има companyId', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-token')
    vi.mocked(authApi.refresh).mockResolvedValue(
      makeAuthResponse({
        user: {
          ...makeAuthResponse().user,
          companyId: 99,
          companyIds: [99],
          roles: ['BUSINESS_OWNER', 'CLIENT'],
        },
      }),
    )

    renderApp('/business/onboarding')

    expect(await screen.findByLabelText('ЕИК')).toBeInTheDocument()
    expect(screen.queryByText('Вече имате фирма')).not.toBeInTheDocument()
  })
})
