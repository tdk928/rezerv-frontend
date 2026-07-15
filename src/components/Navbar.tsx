import { Link, useNavigate } from 'react-router'
import { useAuth } from '../auth/AuthContext'
import { Button } from './ui/Button'

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const showOnboarding =
    isAuthenticated && (user?.companyId === null || user?.companyId === undefined)

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="text-gradient text-2xl font-extrabold tracking-tight">
          Rezerv
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {showOnboarding && (
            <Button variant="ghost" onClick={() => navigate('/business/onboarding')}>
              Регистрирай фирма
            </Button>
          )}
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-ink-secondary sm:inline">
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
