import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { getCities } from '../api/business'
import { createSalon, listMyCompanies, type CompanyWithSalonsResponse } from '../api/businessOnboarding'
import { ApiError } from '../api/http'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui/Button'
import { FieldError, inputClasses, labelClasses } from '../features/auth/AuthCard'
import { salonSchema, type SalonFormValues } from '../features/business/onboardingSchemas'

const STATUS_LABEL: Record<string, string> = {
  PENDING_APPROVAL: 'Чака одобрение',
  APPROVED: 'Одобрена',
  SUSPENDED: 'Спряна',
}

const SALON_STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Активен',
  INACTIVE: 'Неактивен',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('bg-BG')
}

function serverErrorMessage(error: unknown): string | null {
  if (error instanceof ApiError) return error.message
  if (error) return 'Възникна грешка. Опитайте отново.'
  return null
}

export function MyCompaniesPage() {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const [addingForCompanyId, setAddingForCompanyId] = useState<number | null>(null)

  const query = useQuery({
    queryKey: ['my-companies'],
    queryFn: () => listMyCompanies(accessToken!),
    enabled: accessToken !== null,
  })

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink">Моите фирми</h1>
          <p className="mt-2 text-sm text-ink-secondary">Фирми и обекти, регистрирани към акаунта ви.</p>
        </div>
        <Button onClick={() => navigate('/business/onboarding')}>Нова фирма</Button>
      </div>

      {query.isLoading && <p className="text-sm text-ink-muted">Зареждане…</p>}
      {query.isError && (
        <p className="glass-tint rounded-2xl px-4 py-3 text-sm text-danger">
          Неуспешно зареждане на фирмите.
        </p>
      )}
      {query.data?.length === 0 && (
        <div className="glass rounded-3xl p-8 text-center">
          <p className="text-ink-secondary">Все още нямате регистрирана фирма.</p>
          <Button className="mt-4" onClick={() => navigate('/business/onboarding')}>
            Регистрирай фирма
          </Button>
        </div>
      )}

      <ul className="flex flex-col gap-4">
        {query.data?.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            accessToken={accessToken!}
            isAdding={addingForCompanyId === company.id}
            onToggleAdd={() => {
              if (company.status !== 'APPROVED') return
              setAddingForCompanyId((id) => (id === company.id ? null : company.id))
            }}
            onSalonAdded={() => setAddingForCompanyId(null)}
          />
        ))}
      </ul>
    </main>
  )
}

function CompanyCard({
  company,
  accessToken,
  isAdding,
  onToggleAdd,
  onSalonAdded,
}: {
  company: CompanyWithSalonsResponse
  accessToken: string
  isAdding: boolean
  onToggleAdd: () => void
  onSalonAdded: () => void
}) {
  const canAddSalon = company.status === 'APPROVED'
  const showAddForm = isAdding && canAddSalon

  return (
    <li className="glass rounded-3xl p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-tight text-ink">{company.name}</h2>
          <p className="mt-1 text-sm text-ink-secondary">{company.legalName}</p>

          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-ink-muted">ЕИК</dt>
              <dd className="font-medium text-ink">{company.eik}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Имейл</dt>
              <dd className="font-medium text-ink">{company.email}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Телефон</dt>
              <dd className="font-medium text-ink">{company.phone}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">Регистрирана</dt>
              <dd className="font-medium text-ink">{formatDate(company.createdAt)}</dd>
            </div>
          </dl>
        </div>
        <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-ink-secondary shadow-sm">
          {STATUS_LABEL[company.status] ?? company.status}
        </span>
      </div>

      <div className="mt-5 border-t border-line pt-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-ink-secondary">Обекти</h3>
          {showAddForm ? (
            <Button type="button" variant="ghost" onClick={onToggleAdd}>
              Отказ
            </Button>
          ) : (
            <Button
              type="button"
              className={
                canAddSalon
                  ? '!bg-success px-5 py-2.5 text-sm text-white shadow-md shadow-success/30 enabled:hover:!brightness-110 enabled:hover:!shadow-lg enabled:hover:!shadow-success/45 enabled:hover:!-translate-y-0.5'
                  : '!bg-ink-muted/25 !text-ink-muted !shadow-none px-5 py-2.5 text-sm'
              }
              disabled={!canAddSalon}
              title={
                canAddSalon
                  ? undefined
                  : 'Обекти могат да се добавят само след одобрение на фирмата'
              }
              onClick={onToggleAdd}
            >
              + Добави обект
            </Button>
          )}
        </div>

        {!canAddSalon && (
          <p className="mb-3 text-xs text-ink-muted">
            Обекти се добавят след като фирмата бъде одобрена.
          </p>
        )}

        {company.salons.length === 0 && !showAddForm ? (
          <p className="text-sm text-ink-muted">Няма добавени обекти.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {company.salons.map((salon) => (
              <li
                key={salon.id}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-2xl bg-white/55 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">{salon.name}</p>
                  <p className="text-xs text-ink-muted">
                    {salon.city.name} · {salon.address}
                  </p>
                </div>
                <span className="text-xs font-medium text-ink-secondary">
                  {SALON_STATUS_LABEL[salon.status] ?? salon.status}
                </span>
              </li>
            ))}
          </ul>
        )}

        {showAddForm && (
          <div className="glass-strong mt-4 rounded-3xl p-4 sm:p-5">
            <h4 className="mb-4 text-sm font-semibold text-ink">Нов обект</h4>
            <AddSalonForm
              accessToken={accessToken}
              companyId={company.id}
              onSuccess={onSalonAdded}
              onCancel={onToggleAdd}
            />
          </div>
        )}
      </div>
    </li>
  )
}

function AddSalonForm({
  accessToken,
  companyId,
  onSuccess,
  onCancel,
}: {
  accessToken: string
  companyId: number
  onSuccess: () => void
  onCancel: () => void
}) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SalonFormValues>({ resolver: zodResolver(salonSchema) })

  const citiesQuery = useQuery({
    queryKey: ['cities'],
    queryFn: getCities,
  })

  const mutation = useMutation({
    mutationFn: (values: SalonFormValues) =>
      createSalon(accessToken, companyId, {
        name: values.name,
        description: values.description || undefined,
        cityId: Number(values.cityId),
        address: values.address,
        email: values.email,
        phone: values.phone,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-companies'] })
      onSuccess()
    },
  })

  const serverError = serverErrorMessage(mutation.error)

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate className="space-y-4">
      <div>
        <label htmlFor={`salon-name-${companyId}`} className={labelClasses}>
          Име на обекта
        </label>
        <input
          id={`salon-name-${companyId}`}
          className={inputClasses}
          {...register('name')}
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`salon-email-${companyId}`} className={labelClasses}>
            Имейл
          </label>
          <input
            id={`salon-email-${companyId}`}
            type="email"
            className={inputClasses}
            {...register('email')}
          />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <label htmlFor={`salon-phone-${companyId}`} className={labelClasses}>
            Телефон
          </label>
          <input
            id={`salon-phone-${companyId}`}
            type="tel"
            className={inputClasses}
            {...register('phone')}
          />
          <FieldError message={errors.phone?.message} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`salon-city-${companyId}`} className={labelClasses}>
            Град
          </label>
          <select
            id={`salon-city-${companyId}`}
            className={inputClasses}
            defaultValue=""
            {...register('cityId')}
          >
            <option value="" disabled>
              {citiesQuery.isLoading ? 'Зареждане…' : 'Изберете град'}
            </option>
            {citiesQuery.data?.map((city) => (
              <option key={city.id} value={String(city.id)}>
                {city.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.cityId?.message} />
        </div>
        <div>
          <label htmlFor={`salon-address-${companyId}`} className={labelClasses}>
            Адрес
          </label>
          <input
            id={`salon-address-${companyId}`}
            className={inputClasses}
            {...register('address')}
          />
          <FieldError message={errors.address?.message} />
        </div>
      </div>

      <div>
        <label htmlFor={`salon-description-${companyId}`} className={labelClasses}>
          Описание
        </label>
        <textarea
          id={`salon-description-${companyId}`}
          rows={3}
          className={inputClasses}
          {...register('description')}
        />
        <FieldError message={errors.description?.message} />
      </div>

      {serverError && (
        <p className="rounded-2xl bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Запазване…' : 'Запази обект'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={mutation.isPending}>
          Отказ
        </Button>
      </div>
    </form>
  )
}
