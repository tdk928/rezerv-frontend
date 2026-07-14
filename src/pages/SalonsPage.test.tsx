import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderApp } from '../test/renderApp'
import { makeCategories, makeCities, makeSalonCard, makeSalonPage } from '../test/fixtures'
import { getCategories, getCities, searchSalons } from '../api/business'

vi.mock('../api/business', () => ({
  getCities: vi.fn(),
  getCategories: vi.fn(),
  searchSalons: vi.fn(),
  getSalon: vi.fn(),
}))

describe('SalonsPage', () => {
  beforeEach(() => {
    vi.mocked(getCities).mockResolvedValue(makeCities())
    vi.mocked(getCategories).mockResolvedValue(makeCategories())
    vi.mocked(searchSalons).mockResolvedValue(
      makeSalonPage([makeSalonCard({ name: 'Studio Glamour' })]),
    )
  })

  it('показва резултатите от търсенето', async () => {
    renderApp('/salons?cityId=1&categoryId=1')

    expect(await screen.findByText('Studio Glamour')).toBeInTheDocument()
    expect(screen.getByText('1 резултат')).toBeInTheDocument()
    expect(searchSalons).toHaveBeenCalledWith(
      expect.objectContaining({ cityId: 1, categoryId: 1 }),
    )
  })

  it('показва съобщение при празни резултати', async () => {
    vi.mocked(searchSalons).mockResolvedValue(makeSalonPage([]))
    renderApp('/salons?q=няма')

    expect(await screen.findByText('Няма намерени салони с тези критерии.')).toBeInTheDocument()
  })
})
