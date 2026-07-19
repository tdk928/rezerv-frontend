import { Building2, Home, PlusCircle, Shield } from 'lucide-react'
import { NavLink } from 'react-router'
import { useAuth } from '../auth/AuthContext'

type NavItem = {
  to: string
  label: string
  icon: typeof Home
  end?: boolean
}

function linkClass({ isActive }: { isActive: boolean }): string {
  return [
    'flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-white/80 text-ink shadow-sm'
      : 'text-ink-secondary hover:bg-white/45 hover:text-ink',
  ].join(' ')
}

/** Ляв sidebar в стил Adobe/Liquid Glass — бизнес навигация. */
export function Sidebar() {
  const { isAuthenticated, user } = useAuth()
  const hasCompany = (user?.companyIds?.length ?? 0) > 0
  const isAdmin = (user?.roles ?? []).includes('PLATFORM_ADMIN')

  const mainItems: NavItem[] = [{ to: '/', label: 'Начало', icon: Home, end: true }]

  const businessItems: NavItem[] = []
  if (isAuthenticated && hasCompany) {
    businessItems.push({ to: '/business/companies', label: 'Моите фирми', icon: Building2 })
  }
  if (isAdmin) {
    businessItems.push({ to: '/admin/companies', label: 'Всички фирми', icon: Shield })
  }
  if (isAuthenticated && !isAdmin) {
    businessItems.push({
      to: '/business/onboarding',
      label: hasCompany ? 'Нова фирма' : 'Регистрирай фирма',
      icon: PlusCircle,
    })
  }

  return (
    <aside className="w-full shrink-0 px-3 pb-2 sm:w-56 sm:px-0 sm:pb-0 sm:pl-3 sm:pt-1 lg:w-60">
      <div className="glass flex flex-row gap-1 overflow-x-auto rounded-3xl p-2 sm:sticky sm:top-[4.5rem] sm:flex-col sm:overflow-visible sm:p-3">
        <NavSection label="Навигация" items={mainItems} />
        {businessItems.length > 0 && <NavSection label="Бизнес" items={businessItems} />}
      </div>
    </aside>
  )
}

function NavSection({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <div className="flex min-w-max flex-row gap-1 sm:min-w-0 sm:flex-col sm:gap-0.5">
      <p className="hidden px-3.5 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted sm:block">
        {label}
      </p>
      {items.map((item) => {
        const Icon = item.icon
        return (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
            <Icon aria-hidden className="size-4 shrink-0 opacity-80" strokeWidth={1.75} />
            <span className="whitespace-nowrap">{item.label}</span>
          </NavLink>
        )
      })}
    </div>
  )
}
