import { Link, useNavigate } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { switchCompany } from '../api/auth'
import { listMyCompanies } from '../api/businessOnboarding'
import { useAuth } from '../auth/AuthContext'
import { Button } from './ui/Button'

export function Navbar() {
  const { isAuthenticated, user, accessToken, setSession, logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const companiesQuery = useQuery({
    queryKey: ['my-companies', user?.id],
    queryFn: () => listMyCompanies(accessToken!),
    enabled: isAuthenticated && accessToken !== null && (user?.companyIds?.length ?? 0) > 0,
  })

  const switchMutation = useMutation({
    mutationFn: (companyId: number) => switchCompany(accessToken!, companyId),
    onSuccess: (auth) => {
      setSession(auth)
      void queryClient.invalidateQueries({ queryKey: ['my-companies'] })
    },
  })

  const companies = companiesQuery.data ?? []
  const activeCompany = companies.find((c) => c.id === user?.companyId)

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link to="/" className="text-gradient shrink-0 text-2xl font-extrabold tracking-tight">
          Rezerv
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          {isAuthenticated && companies.length > 0 && (
            <label className="flex items-center gap-2 text-sm text-ink-secondary">
              <span className="hidden sm:inline">Фирма</span>
              <select
                className="max-w-[10rem] rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-ink sm:max-w-[14rem]"
                value={user?.companyId ?? ''}
                disabled={switchMutation.isPending}
                onChange={(e) => {
                  const id = Number(e.target.value)
                  if (Number.isFinite(id) && id !== user?.companyId) {
                    switchMutation.mutate(id)
                  }
                }}
                aria-label="Активна фирма"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {isAuthenticated && (
            <Button variant="ghost" onClick={() => navigate('/business/onboarding')}>
              {companies.length > 0 ? 'Нова фирма' : 'Регистрирай фирма'}
            </Button>
          )}
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-ink-secondary md:inline">
                {user?.firstName} {user?.lastName}
                {activeCompany ? ` · ${activeCompany.name}` : null}
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
