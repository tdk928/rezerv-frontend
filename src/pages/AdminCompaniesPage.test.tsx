import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/renderApp'
import { makeAuthResponse } from '../test/fixtures'
import * as authApi from '../api/auth'
import { approveCompany, listAdminCompanies } from '../api/businessOnboarding'

vi.mock('../api/auth', { spy: true })
vi.mock('../api/businessOnboarding', () => ({
  listMyCompanies: vi.fn(),
  listAdminCompanies: vi.fn(),
  approveCompany: vi.fn(),
}))

const REFRESH_TOKEN_KEY = 'rezerv.refreshToken'

describe('AdminCompaniesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it('показва таблица с фирми, сортиране и одобрение', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-token')
    vi.mocked(authApi.refresh).mockResolvedValue(
      makeAuthResponse({
        user: {
          ...makeAuthResponse().user,
          roles: ['PLATFORM_ADMIN'],
        },
      }),
    )
    vi.mocked(listAdminCompanies).mockResolvedValue([
      {
        id: 1,
        eik: '100000001',
        name: 'Гламур Груп',
        legalName: 'Гламур',
        email: 'glamour@test.bg',
        phone: '+359888',
        status: 'APPROVED',
        createdAt: '2026-07-14T00:00:00Z',
        updatedAt: '2026-07-14T00:00:00Z',
        owner: {
          id: 1,
          email: 'admin@rezerv.bg',
          firstName: 'Platform',
          lastName: 'Admin',
        },
      },
      {
        id: 2,
        eik: '200000002',
        name: 'Чакаща ООД',
        legalName: 'Chakashta',
        email: 'pending@test.bg',
        phone: '+359777',
        status: 'PENDING_APPROVAL',
        createdAt: '2026-07-17T00:00:00Z',
        updatedAt: '2026-07-17T00:00:00Z',
        owner: {
          id: 5,
          email: 'owner@test.bg',
          firstName: 'Иван',
          lastName: 'Иванов',
        },
      },
    ])
    vi.mocked(approveCompany).mockResolvedValue({
      id: 2,
      eik: '200000002',
      name: 'Чакаща ООД',
      legalName: 'Chakashta',
      email: 'pending@test.bg',
      phone: '+359777',
      status: 'APPROVED',
      createdAt: '2026-07-17T00:00:00Z',
      updatedAt: '2026-07-17T12:00:00Z',
      owner: {
        id: 5,
        email: 'owner@test.bg',
        firstName: 'Иван',
        lastName: 'Иванов',
      },
    })

    renderApp('/admin/companies')

    expect(await screen.findByRole('heading', { name: /Всички фирми/ })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Чакаща ООД')).toBeInTheDocument()
    })
    expect(screen.getByText(/чакат одобрение/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /Фирма/ }))
    expect(screen.getByRole('button', { name: 'Одобри' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Одобри' }))
    await waitFor(() => {
      expect(approveCompany).toHaveBeenCalledWith(expect.any(String), 2)
    })
  })

  it('пренасочва non-admin към началото', async () => {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-token')
    vi.mocked(authApi.refresh).mockResolvedValue(makeAuthResponse())

    renderApp('/admin/companies')

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Всички фирми/ })).not.toBeInTheDocument()
    })
  })
})
