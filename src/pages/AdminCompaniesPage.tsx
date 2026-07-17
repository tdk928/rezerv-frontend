import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approveCompany,
  listAdminCompanies,
  type AdminCompanyResponse,
} from '../api/businessOnboarding'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui/Button'

const STATUS_LABEL: Record<string, string> = {
  PENDING_APPROVAL: 'Чака одобрение',
  APPROVED: 'Одобрена',
  SUSPENDED: 'Спряна',
}

const STATUS_BADGE: Record<string, string> = {
  PENDING_APPROVAL:
    'inline-flex items-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm',
  APPROVED:
    'inline-flex items-center rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 px-3 py-1.5 text-sm font-semibold text-white shadow-sm',
  SUSPENDED:
    'inline-flex items-center rounded-lg bg-gradient-to-r from-rose-500 to-red-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm',
}

type SortKey = 'name' | 'eik' | 'status' | 'ownerName' | 'ownerEmail' | 'createdAt' | 'updatedAt'
type SortDir = 'asc' | 'desc'

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('bg-BG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ownerName(owner: AdminCompanyResponse['owner']): string {
  const name = [owner.firstName, owner.lastName].filter(Boolean).join(' ').trim()
  return name || `User #${owner.id}`
}

function sortValue(row: AdminCompanyResponse, key: SortKey): string | number {
  switch (key) {
    case 'name':
      return row.name.toLocaleLowerCase('bg')
    case 'eik':
      return row.eik
    case 'status':
      return row.status
    case 'ownerName':
      return ownerName(row.owner).toLocaleLowerCase('bg')
    case 'ownerEmail':
      return (row.owner.email ?? '').toLocaleLowerCase('bg')
    case 'createdAt':
      return new Date(row.createdAt).getTime()
    case 'updatedAt':
      return new Date(row.updatedAt).getTime()
  }
}

function SortHeader({
  label,
  column,
  active,
  dir,
  onSort,
}: {
  label: string
  column: SortKey
  active: SortKey
  dir: SortDir
  onSort: (key: SortKey) => void
}) {
  const isActive = active === column
  return (
    <th className="px-4 py-3 font-medium">
      <button
        type="button"
        className={`group inline-flex items-center gap-1.5 text-left transition-colors ${
          isActive ? 'text-ink' : 'text-ink-secondary hover:text-ink'
        }`}
        onClick={() => onSort(column)}
        aria-sort={isActive ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      >
        <span className={isActive ? 'font-semibold' : undefined}>{label}</span>
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-md ${
            isActive ? 'bg-brand-soft text-brand' : 'text-ink-muted group-hover:text-ink-secondary'
          }`}
          aria-hidden
        >
          <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="currentColor">
            {isActive ? (
              dir === 'asc' ? (
                <path d="M6 2.5 10 9H2z" />
              ) : (
                <path d="M6 9.5 2 3h8z" />
              )
            ) : (
              <>
                <path d="M6 1.5 8.5 5h-5z" opacity="0.4" />
                <path d="M6 10.5 3.5 7h5z" opacity="0.4" />
              </>
            )}
          </svg>
        </span>
      </button>
    </th>
  )
}

export function AdminCompaniesPage() {
  const { accessToken } = useAuth()
  const queryClient = useQueryClient()
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const query = useQuery({
    queryKey: ['admin-companies'],
    queryFn: () => listAdminCompanies(accessToken!),
    enabled: accessToken !== null,
  })

  const approveMutation = useMutation({
    mutationFn: (companyId: number) => approveCompany(accessToken!, companyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-companies'] })
    },
  })

  const sortedRows = useMemo(() => {
    const rows = [...(query.data ?? [])]
    rows.sort((a, b) => {
      const av = sortValue(a, sortKey)
      const bv = sortValue(b, sortKey)
      let cmp = 0
      if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv
      } else {
        cmp = String(av).localeCompare(String(bv), 'bg')
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return rows
  }, [query.data, sortKey, sortDir])

  const pendingCount = query.data?.filter((r) => r.status === 'PENDING_APPROVAL').length ?? 0

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'createdAt' || key === 'updatedAt' ? 'desc' : 'asc')
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="text-gradient text-3xl font-extrabold tracking-tight">Всички фирми</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          Регистрирани фирми и собственици.
          {pendingCount > 0 ? (
            <>
              {' '}
              <span className="text-warning">{pendingCount} чакат одобрение</span>.
            </>
          ) : null}
        </p>
      </div>

      {query.isLoading && <p className="text-sm text-ink-muted">Зареждане…</p>}
      {query.isError && (
        <p className="rounded-lg bg-brand-soft px-3 py-2 text-sm text-danger">
          Неуспешно зареждане (нужна роля PLATFORM_ADMIN).
        </p>
      )}
      {query.data?.length === 0 && (
        <p className="text-sm text-ink-secondary">Няма регистрирани фирми.</p>
      )}

      {sortedRows.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="border-b border-line bg-card">
              <tr>
                <SortHeader label="Фирма" column="name" active={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader label="ЕИК" column="eik" active={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader label="Статус" column="status" active={sortKey} dir={sortDir} onSort={toggleSort} />
                <SortHeader
                  label="Собственик"
                  column="ownerName"
                  active={sortKey}
                  dir={sortDir}
                  onSort={toggleSort}
                />
                <SortHeader
                  label="Имейл"
                  column="ownerEmail"
                  active={sortKey}
                  dir={sortDir}
                  onSort={toggleSort}
                />
                <SortHeader
                  label="Регистрирана"
                  column="createdAt"
                  active={sortKey}
                  dir={sortDir}
                  onSort={toggleSort}
                />
                <SortHeader
                  label="Последна промяна"
                  column="updatedAt"
                  active={sortKey}
                  dir={sortDir}
                  onSort={toggleSort}
                />
                <th className="px-4 py-3 font-medium text-ink-secondary">Действие</th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row) => {
                const pending = row.status === 'PENDING_APPROVAL'
                const approving =
                  approveMutation.isPending && approveMutation.variables === row.id
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-line last:border-0 ${pending ? 'bg-brand-soft/40' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{row.name}</p>
                      <p className="text-xs text-ink-muted">{row.legalName}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">{row.eik}</td>
                    <td className="px-4 py-3">
                      <span className={STATUS_BADGE[row.status] ?? STATUS_BADGE.SUSPENDED}>
                        {STATUS_LABEL[row.status] ?? row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-secondary">{ownerName(row.owner)}</td>
                    <td className="px-4 py-3 text-ink-secondary">{row.owner.email ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-muted">{formatDateTime(row.createdAt)}</td>
                    <td className="px-4 py-3 text-ink-muted">{formatDateTime(row.updatedAt)}</td>
                    <td className="px-4 py-3">
                      {pending ? (
                        <Button
                          className="!px-3 !py-1.5 text-xs"
                          disabled={approveMutation.isPending}
                          onClick={() => approveMutation.mutate(row.id)}
                        >
                          {approving ? 'Одобряване…' : 'Одобри'}
                        </Button>
                      ) : (
                        <span className="text-xs text-ink-muted">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {approveMutation.isError && (
        <p className="mt-4 rounded-lg bg-brand-soft px-3 py-2 text-sm text-danger">
          Неуспешно одобрение. Опитайте отново.
        </p>
      )}
    </main>
  )
}
