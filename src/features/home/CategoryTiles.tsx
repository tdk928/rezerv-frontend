import { Link } from 'react-router'
import type { ServiceCategory } from '../../api/business'
import { CategoryIcon } from './CategoryIcon'

interface CategoryTilesProps {
  categories: ServiceCategory[] | undefined
  cityId: number | undefined
}

/** Плочките — главният вход: 1 клик = списък салони от категорията в твоя град. */
export function CategoryTiles({ categories, cityId }: CategoryTilesProps) {
  if (!categories) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-card" />
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
            className="group flex flex-col items-center gap-2 rounded-2xl border border-line bg-card p-4 transition-colors hover:border-brand"
          >
            <CategoryIcon
              code={category.icon}
              className="size-6 text-ink-secondary transition-colors group-hover:text-brand"
            />
            <span className="text-center text-sm font-medium text-ink">{category.name}</span>
          </Link>
        )
      })}
    </div>
  )
}
