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
      <section className="mb-12 flex flex-col items-center gap-7 text-center">
        <div className="space-y-3">
          <p className="text-sm font-semibold tracking-wide text-brand">Rezerv</p>
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Запази час за минути
          </h1>
          <p className="mx-auto max-w-lg text-base text-ink-secondary">
            Намери салон, избери услуга и резервирай — без обаждания и чакане.
          </p>
        </div>

        {citiesLoading || !cities ? (
          <div className="glass h-16 w-full max-w-2xl animate-pulse rounded-full" />
        ) : (
          <SearchBar cities={cities} cityId={cityId} onCityChange={setCityId} />
        )}
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-ink">Популярни категории</h2>
        <CategoryTiles categories={categories} cityId={cityId} />
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-ink">
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

      <section className="glass rounded-3xl p-7 sm:p-9">
        <h2 className="mb-7 text-center text-xl font-semibold tracking-tight text-ink">Как работи</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="text-center">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-brand text-lg font-bold text-white shadow-sm shadow-brand/30">
                {item.step}
              </span>
              <h3 className="mt-3 font-semibold text-ink">{item.title}</h3>
              <p className="mt-1 text-sm text-ink-secondary">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
