import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as authApi from '../api/auth'
import { createAppointment, getPublicSlots } from '../api/booking'
import { getSalon } from '../api/business'
import { makeAuthResponse } from '../test/fixtures'
import { renderApp } from '../test/renderApp'

vi.mock('../api/auth', { spy: true })
vi.mock('../api/business', () => ({
  getSalon: vi.fn(),
}))
vi.mock('../api/booking', () => ({
  getPublicSlots: vi.fn(),
  createAppointment: vi.fn(),
}))

const REFRESH_TOKEN_KEY = 'rezerv.refreshToken'

function futureSlot(daysFromNow: number) {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  date.setHours(10, 0, 0, 0)
  const isoDate = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
  return { date, isoDate, startsAt: date.toISOString() }
}

function tomorrowSlot() {
  return futureSlot(1)
}

async function selectAvailableDate(user: ReturnType<typeof userEvent.setup>, date: Date) {
  const label = String(date.getDate())
  await waitFor(() => {
    expect(
      screen.getAllByRole('button', { name: label }).some((button) => !button.hasAttribute('disabled')),
    ).toBe(true)
  })
  const availableDate = screen
    .getAllByRole('button', { name: label })
    .find((button) => !button.hasAttribute('disabled'))!
  await user.click(availableDate)
}

describe('BookAppointmentPage staff selection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    sessionStorage.setItem(REFRESH_TOKEN_KEY, 'refresh-token')
    vi.mocked(authApi.refresh).mockResolvedValue(makeAuthResponse())
    vi.mocked(getSalon).mockResolvedValue({
      id: 7,
      name: 'Салон Център',
      description: null,
      city: { id: 1, name: 'София', slug: 'sofia' },
      address: 'ул. Витоша 1',
      lat: null,
      lng: null,
      email: 'salon@example.bg',
      phone: '+359888123456',
      ratingAvg: 5,
      ratingCount: 1,
      photos: [],
      serviceGroups: [
        {
          categoryId: 1,
          categoryName: 'Фризьор',
          categorySlug: 'frizyor',
          services: [{ id: 15, name: 'Подстригване', durationMin: 30, price: 20 }],
        },
      ],
    })
  })

  it('избира автоматично единствения служител и не позволява отмаркиране', async () => {
    const user = userEvent.setup()
    const slot = tomorrowSlot()
    vi.mocked(getPublicSlots).mockResolvedValue([
      {
        date: slot.isoDate,
        slots: [
          {
            startsAt: slot.startsAt,
            endsAt: new Date(slot.date.getTime() + 30 * 60_000).toISOString(),
            staffIds: [11],
            staff: [{ id: 11, displayName: 'Мария Иванова' }],
          },
        ],
      },
    ])
    vi.mocked(createAppointment).mockResolvedValue({
      id: 1,
      salonId: 7,
      staffId: 11,
      serviceId: 15,
      clientUserId: 1,
      startsAt: slot.startsAt,
      endsAt: new Date(slot.date.getTime() + 30 * 60_000).toISOString(),
      status: 'BOOKED',
      priceSnapshot: 20,
      clientNote: null,
      createdAt: new Date().toISOString(),
    })

    renderApp('/salons/7/book?serviceId=15')
    await selectAvailableDate(user, slot.date)
    await user.click(await screen.findByRole('button', { name: '10:00' }))

    const staff = screen.getByRole('radio', { name: 'Мария Иванова' })
    expect(staff).toHaveAttribute('aria-checked', 'true')
    await user.click(staff)
    expect(staff).toHaveAttribute('aria-checked', 'true')

    await user.click(screen.getByRole('button', { name: 'Потвърди резервацията' }))
    await waitFor(() => {
      expect(createAppointment).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ salonId: 7, serviceId: 15, staffId: 11 }),
      )
    })
  })

  it('изисква точно един избор при няколко налични служители', async () => {
    const user = userEvent.setup()
    const slot = tomorrowSlot()
    vi.mocked(getPublicSlots).mockResolvedValue([
      {
        date: slot.isoDate,
        slots: [
          {
            startsAt: slot.startsAt,
            endsAt: new Date(slot.date.getTime() + 30 * 60_000).toISOString(),
            staffIds: [11, 12],
            staff: [
              { id: 11, displayName: 'Мария Иванова' },
              { id: 12, displayName: 'Иван Петров' },
            ],
          },
        ],
      },
    ])

    renderApp('/salons/7/book?serviceId=15')
    await selectAvailableDate(user, slot.date)
    await user.click(await screen.findByRole('button', { name: '10:00' }))

    const submit = screen.getByRole('button', { name: 'Потвърди резервацията' })
    expect(screen.getByText('Изберете точно един служител.')).toBeInTheDocument()
    expect(submit).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: 'Иван Петров' }))
    expect(submit).toBeEnabled()
    expect(screen.getByRole('radio', { name: 'Мария Иванова' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
    expect(screen.getByRole('radio', { name: 'Иван Петров' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('филтрира календара предварително по предпочитан служител', async () => {
    const user = userEvent.setup()
    const mariaSlot = futureSlot(1)
    const ivanSlot = futureSlot(2)
    vi.mocked(getPublicSlots).mockResolvedValue([
      {
        date: mariaSlot.isoDate,
        slots: [
          {
            startsAt: mariaSlot.startsAt,
            endsAt: new Date(mariaSlot.date.getTime() + 30 * 60_000).toISOString(),
            staffIds: [11],
            staff: [{ id: 11, displayName: 'Мария Иванова' }],
          },
        ],
      },
      {
        date: ivanSlot.isoDate,
        slots: [
          {
            startsAt: ivanSlot.startsAt,
            endsAt: new Date(ivanSlot.date.getTime() + 30 * 60_000).toISOString(),
            staffIds: [12],
            staff: [{ id: 12, displayName: 'Иван Петров' }],
          },
        ],
      },
    ])

    renderApp('/salons/7/book?serviceId=15')
    await user.click(
      await screen.findByRole('radio', { name: 'Покажи графика на Иван Петров' }),
    )

    expect(
      screen
        .getAllByRole('button', { name: String(mariaSlot.date.getDate()) })
        .every((button) => button.hasAttribute('disabled')),
    ).toBe(true)

    await selectAvailableDate(user, ivanSlot.date)
    await user.click(await screen.findByRole('button', { name: '10:00' }))
    expect(screen.getByRole('radio', { name: 'Иван Петров' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('запазва избраната дата и сменя часовете при избор на служител', async () => {
    const user = userEvent.setup()
    const mariaSlot = futureSlot(1)
    const ivanStartsAt = new Date(mariaSlot.date)
    ivanStartsAt.setHours(11, 0, 0, 0)
    vi.mocked(getPublicSlots).mockResolvedValue([
      {
        date: mariaSlot.isoDate,
        slots: [
          {
            startsAt: mariaSlot.startsAt,
            endsAt: new Date(mariaSlot.date.getTime() + 30 * 60_000).toISOString(),
            staffIds: [11],
            staff: [{ id: 11, displayName: 'Мария Иванова' }],
          },
          {
            startsAt: ivanStartsAt.toISOString(),
            endsAt: new Date(ivanStartsAt.getTime() + 30 * 60_000).toISOString(),
            staffIds: [12],
            staff: [{ id: 12, displayName: 'Иван Петров' }],
          },
        ],
      },
    ])

    renderApp('/salons/7/book?serviceId=15')
    await selectAvailableDate(user, mariaSlot.date)
    expect(await screen.findByRole('button', { name: '10:00' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '11:00' })).toBeInTheDocument()

    await user.click(
      screen.getByRole('radio', { name: 'Покажи графика на Иван Петров' }),
    )

    expect(screen.getByText('Избрана дата')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '10:00' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '11:00' })).toBeInTheDocument()
  })
})
