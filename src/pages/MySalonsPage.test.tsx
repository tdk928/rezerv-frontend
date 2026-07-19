import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderApp } from '../test/renderApp'
import { makeAuthResponse } from '../test/fixtures'
import * as authApi from '../api/auth'
import { listMyCompanies } from '../api/businessOnboarding'

vi.mock('../api/auth', { spy: true })
vi.mock('../api/businessOnboarding', () => ({
  listMyCompanies: vi.fn(),
  listAdminCompanies: vi.fn(),
  createCompany: vi.fn(),
  createSalon: vi.fn(),
}))

const REFRESH_TOKEN_KEY = 'rezerv.refreshToken'

describe('MySalonsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
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
  })
})
