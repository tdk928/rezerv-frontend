import { describe, expect, it } from 'vitest'
import type { City } from '../../api/business'
import { sortCitiesForSelect } from './sortCities'

describe('sortCitiesForSelect', () => {
  it('слага София/Пловдив/Варна/Бургас най-отгоре, останалите азбучно', () => {
    const cities: City[] = [
      { id: 10, name: 'Ямбол', slug: 'yambol' },
      { id: 3, name: 'Варна', slug: 'varna' },
      { id: 20, name: 'Асеновград', slug: 'asenovgrad' },
      { id: 1, name: 'София', slug: 'sofia' },
      { id: 4, name: 'Бургас', slug: 'burgas' },
      { id: 2, name: 'Пловдив', slug: 'plovdiv' },
      { id: 5, name: 'Русе', slug: 'ruse' },
    ]

    expect(sortCitiesForSelect(cities).map((c) => c.slug)).toEqual([
      'sofia',
      'plovdiv',
      'varna',
      'burgas',
      'asenovgrad',
      'ruse',
      'yambol',
    ])
  })
})
