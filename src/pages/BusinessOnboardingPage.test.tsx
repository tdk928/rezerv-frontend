import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/renderApp'
import { makeAuthResponse } from '../test/fixtures'
import * as authApi from '../api/auth'
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
    expect(screen.getByLabelText('Email за контакт')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Продължи' })).toBeInTheDocument()
  })

  it('след успешна фирма отива на условия и подпис', async () => {
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
      email: 'office@test.bg',
      phone: '+359888000000',
      ownerUserId: 1,
      status: 'PENDING_APPROVAL',
      createdAt: '2026-07-15T00:00:00Z',
    })

    renderApp('/business/onboarding')
    await screen.findByLabelText('ЕИК')

    await userEvent.type(screen.getByLabelText('ЕИК'), '131529327')
    await userEvent.type(screen.getByLabelText('Име на фирмата'), 'Тест ООД')
    await userEvent.type(screen.getByLabelText('Юридическо име'), 'Test OOD')
    await userEvent.type(screen.getByLabelText('Email за контакт'), 'office@test.bg')
    await userEvent.type(screen.getByLabelText('Телефон за контакт'), '+359888000000')
    await userEvent.click(screen.getByRole('button', { name: 'Продължи' }))

    await waitFor(() => {
      expect(createCompany).toHaveBeenCalled()
    })
    expect(await screen.findByRole('heading', { name: 'Общи условия и подпис' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Име на обекта')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Подпиши и завърши' }))
    expect(await screen.findByText('Готово!')).toBeInTheDocument()
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
