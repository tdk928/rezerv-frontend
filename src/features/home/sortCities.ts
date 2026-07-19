import type { City } from '../../api/business'

/** Големите градове винаги първи; останалите — азбучно (bg). */
const PRIORITY_SLUGS = ['sofia', 'plovdiv', 'varna', 'burgas'] as const

export function sortCitiesForSelect(cities: City[]): City[] {
  const bySlug = new Map(cities.map((c) => [c.slug, c]))
  const priority = PRIORITY_SLUGS.map((slug) => bySlug.get(slug)).filter(
    (c): c is City => c !== undefined,
  )
  const prioritySet = new Set(priority.map((c) => c.id))
  const rest = cities
    .filter((c) => !prioritySet.has(c.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'bg'))
  return [...priority, ...rest]
}
