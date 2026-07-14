import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/renderApp'
import { makeCategories, makeCities, makeSalonPage } from '../test/fixtures'
import { getCategories, getCities, searchSalons } from '../api/business'

vi.mock('../api/business', () => ({
  getCities: vi.fn(),
  getCategories: vi.fn(),
  searchSalons: vi.fn(),
  getSalon: vi.fn(),
}))

describe('HomePage', () => {
  beforeEach(() => {
    vi.mocked(getCities).mockResolvedValue(makeCities())
    vi.mocked(getCategories).mockResolvedValue(makeCategories())
    vi.mocked(searchSalons).mockResolvedValue(makeSalonPage())
  })

  it('показва hero, категории и топ салони', async () => {
    renderApp('/')

    expect(await screen.findByText('Запази час за минути')).toBeInTheDocument()
    expect(await screen.findByText('Топ салони в София')).toBeInTheDocument()
    expect(await screen.findByText('Barber Bros')).toBeInTheDocument()
    expect(screen.getByText('Масаж')).toBeInTheDocument()
  })

  it('търсенето навигира към /salons с параметри', async () => {
    renderApp('/')
    await screen.findByLabelText('Услуга или салон')

    await userEvent.type(screen.getByLabelText('Услуга или салон'), 'масаж')
    await userEvent.click(screen.getByRole('button', { name: 'Търси' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Салони/ })).toBeInTheDocument()
    })
  })
})
