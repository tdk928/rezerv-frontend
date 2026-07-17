import { Link } from 'react-router'
import type { ServiceCategory } from '../../api/business'
import { CategoryIcon } from './CategoryIcon'

interface CategoryTilesProps {
  categories: ServiceCategory[] | undefined
  cityId: number | undefined
}

export function CategoryTiles({ categories, cityId }: CategoryTilesProps) {
  if (!categories) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="glass h-28 animate-pulse rounded-3xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {categories.map((category) => {
        const params = new URLSearchParams({ categoryId: String(category.id) })
        if (cityId !== undefined) params.set('cityId', String(cityId))
        return (
          <Link
            key={category.id}
            to={`/salons?${params.toString()}`}
            className="glass group flex flex-col items-center gap-2.5 rounded-3xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/10"
          >
            <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-soft">
              <CategoryIcon code={category.icon} className="size-5 text-brand" />
            </span>
            <span className="text-center text-sm font-semibold text-ink">{category.name}</span>
          </Link>
        )
      })}
    </div>
  )
}
