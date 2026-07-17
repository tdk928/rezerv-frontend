import { useQuery } from '@tanstack/react-query'
import { getCategories, getCities, searchSalons } from '../api/business'
import { CategoryTiles } from '../features/home/CategoryTiles'
import { SearchBar } from '../features/home/SearchBar'
import { useCityPreference } from '../features/home/useCityPreference'
import { SalonCard, SalonCardSkeleton } from '../features/salons/SalonCard'

const HOW_IT_WORKS = [
  { step: '1', title: 'Избери услуга', text: 'Кликни категория или потърси салон в твоя град.' },
  { step: '2', title: 'Избери час', text: 'Виж свободните слотове и избери удобно време.' },
  { step: '3', title: 'Готово', text: 'Потвърди резервацията — отнема под минута.' },
] as const

export function HomePage() {
  const { data: cities, isLoading: citiesLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: getCities,
  })
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })
  const { cityId, city, setCityId } = useCityPreference(cities)

  const { data: topSalons, isLoading: salonsLoading } = useQuery({
    queryKey: ['salons', 'top', cityId],
    queryFn: () => searchSalons({ cityId, size: 8 }),
    enabled: cityId !== undefined,
  })

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Hero + търсачка */}
      <section className="mb-12 flex flex-col items-center gap-6 text-center">
        <div className="space-y-3">
          <h1 className="text-gradient text-3xl font-extrabold tracking-tight sm:text-4xl">
            Запази час за минути
          </h1>
          <p className="mx-auto max-w-lg text-sm text-ink-secondary sm:text-base">
            Намери салон, избери услуга и резервирай — без обаждания и чакане.
          </p>
        </div>

        {citiesLoading || !cities ? (
          <div className="h-14 w-full max-w-2xl animate-pulse rounded-2xl bg-card" />
        ) : (
          <SearchBar cities={cities} cityId={cityId} onCityChange={setCityId} />
        )}
      </section>

      {/* Категорийни плочки */}
      <section className="mb-12">
        <h2 className="text-gradient-soft mb-4 text-lg font-semibold">Популярни категории</h2>
        <CategoryTiles categories={categories} cityId={cityId} />
      </section>

      {/* Топ салони */}
      <section className="mb-12">
        <h2 className="text-gradient-soft mb-4 text-lg font-semibold">
          Топ салони{city ? ` в ${city.name}` : ''}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {salonsLoading || !topSalons
            ? Array.from({ length: 4 }, (_, i) => <SalonCardSkeleton key={i} />)
            : topSalons.content.map((salon) => <SalonCard key={salon.id} salon={salon} />)}
        </div>
        {!salonsLoading && topSalons?.content.length === 0 && (
          <p className="text-sm text-ink-secondary">Няма салони в този град все още.</p>
        )}
      </section>

      {/* Как работи */}
      <section className="rounded-2xl border border-line bg-card p-6 sm:p-8">
        <h2 className="text-gradient-soft mb-6 text-center text-lg font-semibold">Как работи</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="text-center">
              <span className="text-gradient text-2xl font-extrabold">{item.step}</span>
              <h3 className="mt-2 font-semibold text-ink">{item.title}</h3>
              <p className="mt-1 text-sm text-ink-secondary">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
