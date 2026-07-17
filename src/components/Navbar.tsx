import { Link, useNavigate } from 'react-router'
import { useAuth } from '../auth/AuthContext'
import { Button } from './ui/Button'

/** Горен navbar — само бранд + вход/регистрация/изход. */
export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-20 px-3 pt-3 sm:px-4">
      <nav className="glass mx-auto flex max-w-[90rem] items-center justify-between gap-2 rounded-full px-4 py-2.5 sm:px-5">
        <Link
          to="/"
          className="shrink-0 text-[1.35rem] font-bold tracking-tight text-ink transition-opacity hover:opacity-80"
        >
          Rezerv
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm font-medium text-ink-secondary md:inline">
                {user?.firstName} {user?.lastName}
              </span>
              <Button variant="secondary" className="!px-4 !py-1.5" onClick={logout}>
                Изход
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="!px-3 !py-1.5" onClick={() => navigate('/login')}>
                Вход
              </Button>
              <Button className="!px-4 !py-1.5" onClick={() => navigate('/register')}>
                Регистрация
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
