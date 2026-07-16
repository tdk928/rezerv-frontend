import { Link, useNavigate } from 'react-router'
import { useAuth } from '../auth/AuthContext'
import { Button } from './ui/Button'

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const hasCompany = (user?.companyIds?.length ?? 0) > 0

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link to="/" className="text-gradient shrink-0 text-2xl font-extrabold tracking-tight">
          Rezerv
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          {isAuthenticated && (
            <Button variant="ghost" onClick={() => navigate('/business/onboarding')}>
              {hasCompany ? 'Нова фирма' : 'Регистрирай фирма'}
            </Button>
          )}
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-ink-secondary md:inline">
                {user?.firstName} {user?.lastName}
              </span>
              <Button variant="secondary" onClick={logout}>
                Изход
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Вход
              </Button>
              <Button onClick={() => navigate('/register')}>Регистрация</Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
