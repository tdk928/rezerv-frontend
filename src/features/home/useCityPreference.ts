import { useCallback, useState } from 'react'
import type { City } from '../../api/business'

const STORAGE_KEY = 'rezerv.cityId'

/**
 * Запомненият град на потребителя (не е чувствителна информация — може в localStorage).
 * Ако няма запомнен, по подразбиране е София.
 */
export function useCityPreference(cities: City[] | undefined) {
  const [storedCityId, setStoredCityId] = useState<number | undefined>(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? Number(raw) : undefined
  })

  const setCityId = useCallback((id: number) => {
    localStorage.setItem(STORAGE_KEY, String(id))
    setStoredCityId(id)
  }, [])

  const storedIsValid =
    storedCityId !== undefined && (!cities || cities.some((c) => c.id === storedCityId))
  const cityId = storedIsValid
    ? storedCityId
    : cities?.find((c) => c.slug === 'sofia')?.id

  const city = cities?.find((c) => c.id === cityId)

  return { cityId, city, setCityId }
}
