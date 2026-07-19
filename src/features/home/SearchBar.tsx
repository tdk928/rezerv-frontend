import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Search } from 'lucide-react'
import type { City } from '../../api/business'
import { Button } from '../../components/ui/Button'

interface SearchBarProps {
  cities: City[]
  cityId: number | undefined
  onCityChange: (id: number) => void
}

/** Едно търсачно поле — glass pill (Liquid Glass control). */
export function SearchBar({ cities, cityId, onCityChange }: SearchBarProps) {
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (cityId !== undefined) params.set('cityId', String(cityId))
    if (q.trim()) params.set('q', q.trim())
    navigate(`/salons?${params.toString()}`)
  }

  return (
    <form
      onSubmit={submit}
      className="glass flex w-full max-w-2xl flex-col gap-2 rounded-full p-2 sm:flex-row sm:items-center"
    >
      <div className="flex flex-1 items-center gap-2 px-3">
        <Search aria-hidden className="size-4 shrink-0 text-ink-muted" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Каква услуга или салон търсиш?"
          aria-label="Услуга или салон"
          className="w-full bg-transparent py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none"
        />
      </div>

      <div className="flex gap-2">
        <select
          value={cityId ?? ''}
          onChange={(e) => onCityChange(Number(e.target.value))}
          aria-label="Град"
          className="w-full rounded-full border border-line bg-white/70 px-4 py-2.5 text-sm text-ink focus:border-brand focus:outline-none sm:w-44"
        >
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
        <Button type="submit">Търси</Button>
      </div>
    </form>
  )
}
