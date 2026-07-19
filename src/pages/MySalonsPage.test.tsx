import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/renderApp'
import { makeAuthResponse, makeCategories } from '../test/fixtures'
import * as authApi from '../api/auth'
import { getCategories } from '../api/business'
import { createSalonService, listMyCompanies, removeSalonService } from '../api/businessOnboarding'

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
  createSalonService: vi.fn(),
  removeSalonService: vi.fn(),
}))

const REFRESH_TOKEN_KEY = 'rezerv.refreshToken'

describe('MySalonsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    vi.mocked(getCategories).mockResolvedValue(makeCategories())
  })

  it('показва само обекти от одобрени фирми', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-token')
    vi.mocked(authApi.refresh).mockResolvedValue(
      makeAuthResponse({
        user: {
          ...makeAuthResponse().user,
          companyId: 10,
          companyIds: [10, 11],
          roles: ['BUSINESS_OWNER', 'CLIENT'],
        },
      }),
    )
    vi.mocked(listMyCompanies).mockResolvedValue([
      {
        id: 10,
        eik: '131529327',
        name: 'Одобрена ООД',
        legalName: 'Approved OOD',
        email: 'ok@test.bg',
        phone: '+359888',
        ownerUserId: 1,
        status: 'APPROVED',
        createdAt: '2026-07-17T00:00:00Z',
        salons: [
          {
            id: 1,
            companyId: 10,
            name: 'Салон Център',
            description: 'До центъра',
            city: { id: 1, name: 'София', slug: 'sofia' },
            address: 'ул. Витоша 1',
            lat: null,
            lng: null,
            email: 'salon@test.bg',
            phone: '+359111',
            status: 'ACTIVE',
            services: [
              {
                id: 9,
                salonId: 1,
                categoryId: 1,
                categoryName: 'Масаж',
                name: 'Релакс масаж',
                durationMin: 60,
                price: 50,
                active: true,
              },
            ],
          },
        ],
      },
      {
        id: 11,
        eik: '200000002',
        name: 'Чакаща ООД',
        legalName: 'Pending',
        email: 'p@test.bg',
        phone: '+359777',
        ownerUserId: 1,
        status: 'PENDING_APPROVAL',
        createdAt: '2026-07-18T00:00:00Z',
        salons: [
          {
            id: 2,
            companyId: 11,
            name: 'Скрит обект',
            description: null,
            city: { id: 1, name: 'София', slug: 'sofia' },
            address: 'ул. Скрита 1',
            lat: null,
            lng: null,
            email: 'hidden@test.bg',
            phone: '+359222',
            status: 'INACTIVE',
            services: [],
          },
        ],
      },
    ])

    renderApp('/business/salons')

    expect(await screen.findByRole('heading', { name: 'Моите обекти' })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Салон Център')).toBeInTheDocument()
    })
    expect(screen.getByText('Одобрена ООД')).toBeInTheDocument()
    expect(screen.getByText('ул. Витоша 1')).toBeInTheDocument()
    expect(screen.queryByText('Скрит обект')).not.toBeInTheDocument()
    expect(screen.getByText(/Активен/)).toBeInTheDocument()
    expect(screen.getByText('Релакс масаж')).toBeInTheDocument()
    expect(screen.getByText(/60 мин/)).toBeInTheDocument()
  })

  it('добавя услуга към обект', async () => {
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
        name: 'Одобрена ООД',
        legalName: 'Approved OOD',
        email: 'ok@test.bg',
        phone: '+359888',
        ownerUserId: 1,
        status: 'APPROVED',
        createdAt: '2026-07-17T00:00:00Z',
        salons: [
          {
            id: 1,
            companyId: 10,
            name: 'Салон Център',
            description: null,
            city: { id: 1, name: 'София', slug: 'sofia' },
            address: 'ул. Витоша 1',
            lat: null,
            lng: null,
            email: 'salon@test.bg',
            phone: '+359111',
            status: 'ACTIVE',
            services: [],
          },
        ],
      },
    ])
    vi.mocked(createSalonService).mockResolvedValue({
      id: 20,
      salonId: 1,
      categoryId: 1,
      categoryName: 'Масаж',
      name: 'Класически масаж',
      durationMin: 45,
      price: 40,
      active: true,
    })

    renderApp('/business/salons')
    await screen.findByText('Салон Център')

    await user.click(screen.getByRole('button', { name: '+ Добави услуга' }))
    await user.type(screen.getByLabelText('Име на услугата'), 'Класически масаж')
    await user.selectOptions(screen.getByLabelText('Категория'), '1')
    await user.type(screen.getByLabelText('Времетраене (мин)'), '45')
    await user.type(screen.getByLabelText('Цена (€)'), '40')
    await user.click(screen.getByRole('button', { name: 'Запази услуга' }))

    await waitFor(() => {
      expect(createSalonService).toHaveBeenCalledWith(
        expect.any(String),
        1,
        expect.objectContaining({
          categoryId: 1,
          name: 'Класически масаж',
          durationMin: 45,
          price: 40,
        }),
      )
    })
  })

  it('премахва услуга след потвърждение в popup', async () => {
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
        name: 'Одобрена ООД',
        legalName: 'Approved OOD',
        email: 'ok@test.bg',
        phone: '+359888',
        ownerUserId: 1,
        status: 'APPROVED',
        createdAt: '2026-07-17T00:00:00Z',
        salons: [
          {
            id: 1,
            companyId: 10,
            name: 'Салон Център',
            description: null,
            city: { id: 1, name: 'София', slug: 'sofia' },
            address: 'ул. Витоша 1',
            lat: null,
            lng: null,
            email: 'salon@test.bg',
            phone: '+359111',
            status: 'ACTIVE',
            services: [
              {
                id: 9,
                salonId: 1,
                categoryId: 1,
                categoryName: 'Масаж',
                name: 'Релакс масаж',
                durationMin: 60,
                price: 50,
                active: true,
              },
            ],
          },
        ],
      },
    ])
    vi.mocked(removeSalonService).mockResolvedValue(undefined)

    renderApp('/business/salons')
    await screen.findByText('Релакс масаж')

    await user.click(screen.getByRole('button', { name: 'Премахни' }))
    const dialog = await screen.findByRole('alertdialog')
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText(/Сигурни ли сте/)).toBeInTheDocument()

    const confirmButtons = screen.getAllByRole('button', { name: 'Премахни' })
    await user.click(confirmButtons[confirmButtons.length - 1]!)

    await waitFor(() => {
      expect(removeSalonService).toHaveBeenCalledWith(expect.any(String), 1, 9)
    })
  })
})
