import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { listMyCompanies, type SalonResponse } from '../api/businessOnboarding'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui/Button'

const SALON_STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Активен',
  INACTIVE: 'Неактивен',
}

type SalonWithCompany = SalonResponse & {
  companyName: string
  companyLegalName: string
}

export function MySalonsPage() {
  const { accessToken } = useAuth()
  const navigate = useNavigate()

  const query = useQuery({
    queryKey: ['my-companies'],
    queryFn: () => listMyCompanies(accessToken!),
    enabled: accessToken !== null,
  })

  const salons = useMemo<SalonWithCompany[]>(() => {
    const rows: SalonWithCompany[] = []
    for (const company of query.data ?? []) {
      if (company.status !== 'APPROVED') continue
      for (const salon of company.salons) {
        rows.push({
          ...salon,
          companyName: company.name,
          companyLegalName: company.legalName,
        })
      }
    }
    rows.sort((a, b) => a.name.localeCompare(b.name, 'bg'))
    return rows
  }, [query.data])

  const approvedCompanies = (query.data ?? []).filter((c) => c.status === 'APPROVED')

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Моите обекти</h1>
          <p className="mt-2 text-sm text-ink-secondary">
            Обекти към одобрените ви фирми.
          </p>
        </div>
        {approvedCompanies.length > 0 && (
          <Button onClick={() => navigate('/business/companies')}>Към моите фирми</Button>
        )}
      </div>

      {query.isLoading && <p className="text-sm text-ink-muted">Зареждане…</p>}
      {query.isError && (
        <p className="glass-tint rounded-2xl px-4 py-3 text-sm text-danger">
          Неуспешно зареждане на обектите.
        </p>
      )}

      {!query.isLoading && !query.isError && approvedCompanies.length === 0 && (
        <div className="glass rounded-3xl p-8 text-center">
          <p className="text-ink-secondary">
            Нямате одобрена фирма. Обектите се показват след одобрение.
          </p>
          <Button className="mt-4" onClick={() => navigate('/business/companies')}>
            Към моите фирми
          </Button>
        </div>
      )}

      {!query.isLoading && approvedCompanies.length > 0 && salons.length === 0 && (
        <div className="glass rounded-3xl p-8 text-center">
          <p className="text-ink-secondary">Няма добавени обекти към одобрените фирми.</p>
          <Button className="mt-4" onClick={() => navigate('/business/companies')}>
            Добави обект от фирмите
          </Button>
        </div>
      )}

      <ul className="flex flex-col gap-4">
        {salons.map((salon) => (
          <li key={salon.id} className="glass rounded-3xl p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold tracking-tight text-ink">{salon.name}</h2>
                <p className="mt-1 text-sm text-ink-secondary">
                  {salon.companyName}
                  {salon.companyLegalName ? (
                    <span className="text-ink-muted"> · {salon.companyLegalName}</span>
                  ) : null}
                </p>

                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-ink-muted">Град</dt>
                    <dd className="font-medium text-ink">{salon.city.name}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-muted">Адрес</dt>
                    <dd className="font-medium text-ink">{salon.address}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-muted">Имейл</dt>
                    <dd className="font-medium text-ink">{salon.email}</dd>
                  </div>
                  <div>
                    <dt className="text-ink-muted">Телефон</dt>
                    <dd className="font-medium text-ink">{salon.phone}</dd>
                  </div>
                  {salon.description ? (
                    <div className="sm:col-span-2">
                      <dt className="text-ink-muted">Описание</dt>
                      <dd className="font-medium text-ink">{salon.description}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>
              <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-ink-secondary shadow-sm">
                {SALON_STATUS_LABEL[salon.status] ?? salon.status}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
