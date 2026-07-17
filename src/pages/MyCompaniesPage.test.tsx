import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/renderApp'
import { makeAuthResponse, makeCities } from '../test/fixtures'
import * as authApi from '../api/auth'
import { getCities } from '../api/business'
import { createSalon, listMyCompanies } from '../api/businessOnboarding'

vi.mock('../api/auth', { spy: true })
vi.mock('../api/business', () => ({
  getCities: vi.fn(),
  getCategories: vi.fn(),
  searchSalons: vi.fn(),
  getSalon: vi.fn(),
}))
vi.mock('../api/businessOnboarding', () => ({
  listMyCompanies: vi.fn(),
  listAdminCompanies: vi.fn(),
  createCompany: vi.fn(),
  createSalon: vi.fn(),
}))

const REFRESH_TOKEN_KEY = 'rezerv.refreshToken'

describe('MyCompaniesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    vi.mocked(getCities).mockResolvedValue(makeCities())
  })

  it('показва фирми с етикетирани полета и обекти', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-token')
    vi.mocked(authApi.refresh).mockResolvedValue(
      makeAuthResponse({
        user: {
          ...makeAuthResponse().user,
          companyId: 10,
          companyIds: [10],
          roles: ['BUSINESS_OWNER', 'CLIENT'],
        },
      }),
    )
    vi.mocked(listMyCompanies).mockResolvedValue([
      {
        id: 10,
        eik: '131529327',
        name: 'Тест ООД',
        legalName: 'Test OOD',
        email: 'office@test.bg',
        phone: '+359888',
        ownerUserId: 1,
        status: 'PENDING_APPROVAL',
        createdAt: '2026-07-17T00:00:00Z',
        salons: [
          {
            id: 1,
            companyId: 10,
            name: 'Обект Център',
            description: null,
            city: { id: 1, name: 'София', slug: 'sofia' },
            address: 'ул. Витоша 1',
            lat: null,
            lng: null,
            email: 'o@test.bg',
            phone: '+359888',
            status: 'ACTIVE',
          },
        ],
      },
    ])

    renderApp('/business/companies')

    expect(await screen.findByRole('heading', { name: 'Моите фирми' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Тест ООД')).toBeInTheDocument()
    })
    expect(screen.getByText('ЕИК')).toBeInTheDocument()
    expect(screen.getByText('131529327')).toBeInTheDocument()
    expect(screen.getByText('Имейл')).toBeInTheDocument()
    expect(screen.getByText('office@test.bg')).toBeInTheDocument()
    expect(screen.getByText('Регистрирана')).toBeInTheDocument()
    expect(screen.getByText('Обект Център')).toBeInTheDocument()
    expect(screen.getByText(/Чака одобрение/)).toBeInTheDocument()
  })

  it('добавя обект през формата', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-token')
    vi.mocked(authApi.refresh).mockResolvedValue(
      makeAuthResponse({
        user: {
          ...makeAuthResponse().user,
          companyId: 10,
          companyIds: [10],
          roles: ['BUSINESS_OWNER', 'CLIENT'],
        },
      }),
    )
    vi.mocked(listMyCompanies).mockResolvedValue([
      {
        id: 10,
        eik: '131529327',
        name: 'Тест ООД',
        legalName: 'Test OOD',
        email: 'office@test.bg',
        phone: '+359888',
        ownerUserId: 1,
        status: 'APPROVED',
        createdAt: '2026-07-17T00:00:00Z',
        salons: [],
      },
    ])
    vi.mocked(createSalon).mockResolvedValue({
      id: 2,
      companyId: 10,
      name: 'Нов салон',
      description: 'Описание',
      city: { id: 1, name: 'София', slug: 'sofia' },
      address: 'ул. Тест 1',
      lat: null,
      lng: null,
      email: 'salon@test.bg',
      phone: '+359999',
      status: 'ACTIVE',
    })

    renderApp('/business/companies')
    await screen.findByText('Тест ООД')

    await user.click(screen.getByRole('button', { name: '+ Добави обект' }))
    expect(screen.getByLabelText('Име на обекта')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Име на обекта'), 'Нов салон')
    await user.type(screen.getByLabelText('Имейл'), 'salon@test.bg')
    await user.type(screen.getByLabelText('Телефон'), '+359999')
    await user.selectOptions(screen.getByLabelText('Град'), '1')
    await user.type(screen.getByLabelText('Адрес'), 'ул. Тест 1')
    await user.type(screen.getByLabelText('Описание'), 'Описание')
    await user.click(screen.getByRole('button', { name: 'Запази обект' }))

    await waitFor(() => {
      expect(createSalon).toHaveBeenCalledWith(
        expect.any(String),
        10,
        expect.objectContaining({
          name: 'Нов салон',
          email: 'salon@test.bg',
          phone: '+359999',
          cityId: 1,
          address: 'ул. Тест 1',
          description: 'Описание',
        }),
      )
    })
  })
})
