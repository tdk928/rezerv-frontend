import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router'
import { Clock, Mail, MapPin, Phone, Star } from 'lucide-react'
import { getSalon } from '../api/business'
import { Button } from '../components/ui/Button'

export function SalonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const salonId = Number(id)

  const { data: salon, isLoading, isError } = useQuery({
    queryKey: ['salon', salonId],
    queryFn: () => getSalon(salonId),
    enabled: Number.isFinite(salonId),
  })

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="glass h-64 animate-pulse rounded-3xl" />
        <div className="mt-6 h-8 w-1/3 animate-pulse rounded-full bg-white/50" />
        <div className="mt-4 h-4 w-1/2 animate-pulse rounded-full bg-white/40" />
      </main>
    )
  }

  if (isError || !salon) {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-16 sm:px-6">
        <p className="text-ink-secondary">Салонът не е намерен.</p>
        <Link to="/">
          <Button variant="secondary">Към началото</Button>
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Галерия */}
      {salon.photos.length > 0 && (
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {salon.photos.map((url) => (
            <img
              key={url}
              src={url}
              alt={salon.name}
              className="h-48 w-72 shrink-0 rounded-3xl object-cover shadow-sm sm:h-64 sm:w-96"
            />
          ))}
        </div>
      )}

      {/* Инфо */}
      <header className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {salon.name}
            </h1>
            <p className="mt-2 flex items-center gap-1 text-sm text-ink-secondary">
              <MapPin aria-hidden className="size-4 shrink-0" />
              {salon.address}, {salon.city.name}
            </p>
            {salon.email && (
              <p className="mt-1 flex items-center gap-1 text-sm text-ink-secondary">
                <Mail aria-hidden className="size-4 shrink-0" />
                {salon.email}
              </p>
            )}
            {salon.phone && (
              <p className="mt-1 flex items-center gap-1 text-sm text-ink-secondary">
                <Phone aria-hidden className="size-4 shrink-0" />
                {salon.phone}
              </p>
            )}
          </div>
          <span className="glass flex items-center gap-1 rounded-full px-4 py-2 text-sm">
            <Star aria-hidden className="size-4 fill-warning text-warning" />
            <span className="font-semibold text-ink">{salon.ratingAvg.toFixed(1)}</span>
            <span className="text-ink-muted">({salon.ratingCount} отзива)</span>
          </span>
        </div>
        {salon.description && (
          <p className="mt-4 max-w-2xl text-sm text-ink-secondary">{salon.description}</p>
        )}
      </header>

      {/* Услуги по категории */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-ink">Услуги</h2>
        {salon.serviceGroups.map((group) => (
          <div key={group.categoryId} className="glass rounded-3xl p-5 sm:p-6">
            <h3 className="mb-4 font-semibold text-ink">{group.categoryName}</h3>
            <ul className="divide-y divide-line">
              {group.services.map((service) => (
                <li
                  key={service.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-ink">{service.name}</p>
                    <p className="flex items-center gap-1 text-sm text-ink-muted">
                      <Clock aria-hidden className="size-3.5" />
                      {service.durationMin} мин
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-ink">{service.price} лв.</span>
                    <Button className="shrink-0" disabled title="Резервацията идва скоро">
                      Запази
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  )
}
