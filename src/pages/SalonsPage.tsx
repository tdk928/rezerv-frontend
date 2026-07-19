import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { getCategories, getCities, searchSalons } from '../api/business'
import { SalonCard, SalonCardSkeleton } from '../features/salons/SalonCard'

function parseOptionalInt(value: string | null): number | undefined {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function SalonsPage() {
  const [searchParams] = useSearchParams()
  const cityId = parseOptionalInt(searchParams.get('cityId'))
  const categoryId = parseOptionalInt(searchParams.get('categoryId'))
  const q = searchParams.get('q') ?? undefined

  const { data: cities } = useQuery({ queryKey: ['cities'], queryFn: getCities })
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  const { data: results, isLoading } = useQuery({
    queryKey: ['salons', 'search', cityId, categoryId, q],
    queryFn: () => searchSalons({ cityId, categoryId, q, size: 20 }),
  })

  const activeCity = useMemo(
    () => cities?.find((c) => c.id === cityId),
    [cities, cityId],
  )
  const activeCategory = useMemo(
    () => categories?.find((c) => c.id === categoryId),
    [categories, categoryId],
  )

  const titleParts = ['Салони']
  if (activeCategory) titleParts.push(activeCategory.name.toLowerCase())
  if (activeCity) titleParts.push(`в ${activeCity.name}`)
  if (q) titleParts.push(`„${q}"`)

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {titleParts.join(' ')}
        </h1>
        {!isLoading && results && (
          <p className="mt-1 text-sm text-ink-secondary">
            {results.totalElements} {results.totalElements === 1 ? 'резултат' : 'резултата'}
          </p>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }, (_, i) => <SalonCardSkeleton key={i} />)
          : results?.content.map((salon) => <SalonCard key={salon.id} salon={salon} />)}
      </div>

      {!isLoading && results?.content.length === 0 && (
        <div className="glass rounded-3xl p-8 text-center">
          <p className="text-ink-secondary">Няма намерени салони с тези критерии.</p>
          <p className="mt-1 text-sm text-ink-muted">Опитай с друг град или категория.</p>
        </div>
      )}
    </main>
  )
}
