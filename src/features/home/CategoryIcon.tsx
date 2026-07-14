import {
  Brush,
  Droplets,
  Eye,
  Flower2,
  Hand,
  Scissors,
  Slice,
  Smile,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** Мапва icon кодовете от номенклатурата (rezerv-business) към lucide икони. */
const icons: Record<string, LucideIcon> = {
  scissors: Scissors,
  razor: Slice,
  'nail-polish': Hand,
  massage: Flower2,
  face: Smile,
  brush: Brush,
  eye: Eye,
  wax: Droplets,
}

export function CategoryIcon({ code, className }: { code: string; className?: string }) {
  const Icon = icons[code] ?? Sparkles
  return <Icon aria-hidden className={className} />
}
