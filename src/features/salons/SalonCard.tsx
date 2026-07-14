import { Link } from 'react-router'
import { MapPin, Star } from 'lucide-react'
import type { SalonCard as SalonCardData } from '../../api/business'

/** Карта на салон — ползва се на home ("Топ салони") и в списъка с резултати. */
export function SalonCard({ salon }: { salon: SalonCardData }) {
  return (
    <Link
      to={`/salons/${salon.id}`}
      className="group overflow-hidden rounded-2xl border border-line bg-card transition-colors hover:border-brand"
    >
      {salon.photoUrl ? (
        <img
          src={salon.photoUrl}
          alt={salon.name}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
      ) : (
        <div className="aspect-[4/3] w-full bg-surface" />
      )}

      <div className="flex flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-ink">{salon.name}</h3>
          <span className="flex shrink-0 items-center gap-1 text-sm text-ink">
            <Star aria-hidden className="size-4 fill-warning text-warning" />
            {salon.ratingAvg.toFixed(1)}
            <span className="text-ink-muted">({salon.ratingCount})</span>
          </span>
        </div>

        <p className="flex items-center gap-1 text-sm text-ink-secondary">
          <MapPin aria-hidden className="size-3.5 shrink-0" />
          {salon.address}, {salon.city.name}
        </p>

        {salon.priceFrom !== null && (
          <p className="text-sm text-ink-muted">
            от <span className="font-semibold text-ink">{salon.priceFrom} лв.</span>
          </p>
        )}
      </div>
    </Link>
  )
}

export function SalonCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="aspect-[4/3] w-full animate-pulse bg-surface" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-surface" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-surface" />
      </div>
    </div>
  )
}
