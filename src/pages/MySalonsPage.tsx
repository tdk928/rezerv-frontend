import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { getCategories } from '../api/business'
import {
  createSalonService,
  listMyCompanies,
  removeSalonService,
  type SalonResponse,
  type SalonServiceResponse,
} from '../api/businessOnboarding'
import { ApiError } from '../api/http'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui/Button'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { formatEuro } from '../lib/formatEuro'
import { FieldError, inputClasses, labelClasses } from '../features/auth/AuthCard'
import { salonServiceSchema, type SalonServiceFormValues } from '../features/business/onboardingSchemas'

const SALON_STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Активен',
  INACTIVE: 'Неактивен',
}

type SalonWithCompany = SalonResponse & {
  companyName: string
  companyLegalName: string
}

function serverErrorMessage(error: unknown): string | null {
  if (error instanceof ApiError) return error.message
  if (error) return 'Възникна грешка. Опитайте отново.'
  return null
}

/** Само цели цифри (минути). */
function sanitizeIntegerDigits(value: string): string {
  return value.replace(/\D/g, '')
}

/** Число с до 2 десетични (цена); без букви. */
function sanitizeDecimalPrice(value: string): string {
  let v = value.replace(',', '.').replace(/[^\d.]/g, '')
  const dot = v.indexOf('.')
  if (dot !== -1) {
    v = `${v.slice(0, dot + 1)}${v.slice(dot + 1).replace(/\./g, '')}`
    const [whole, frac = ''] = v.split('.')
    v = `${whole}.${frac.slice(0, 2)}`
  }
  return v
}

export function MySalonsPage() {
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const [addingForSalonId, setAddingForSalonId] = useState<number | null>(null)

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink">Моите обекти</h1>
        <p className="mt-2 text-sm text-ink-secondary">Обекти към одобрените ви фирми.</p>
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
        {salons.map((salon) => {
          const showAddForm = addingForSalonId === salon.id
          const services = salon.services ?? []
          return (
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
                <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-ink shadow-sm">
                  {SALON_STATUS_LABEL[salon.status] ?? salon.status}
                </span>
              </div>

              <div className="mt-5 border-t border-line pt-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-ink-secondary">Услуги</h3>
                  {showAddForm ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setAddingForSalonId(null)}
                    >
                      Отказ
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="!bg-success px-5 py-2.5 text-sm text-white shadow-md shadow-success/30 enabled:hover:!brightness-110 enabled:hover:!shadow-lg enabled:hover:!shadow-success/45 enabled:hover:!-translate-y-0.5"
                      onClick={() => setAddingForSalonId(salon.id)}
                    >
                      + Добави услуга
                    </Button>
                  )}
                </div>

                {services.length === 0 && !showAddForm ? (
                  <p className="text-sm text-ink-muted">Няма добавени услуги.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {services.map((service) => (
                      <ServiceRow
                        key={service.id}
                        service={service}
                        accessToken={accessToken!}
                        salonId={salon.id}
                      />
                    ))}
                  </ul>
                )}

                {showAddForm && accessToken && (
                  <div className="glass-strong mt-4 rounded-3xl p-4 sm:p-5">
                    <h4 className="mb-4 text-sm font-semibold text-ink">Нова услуга</h4>
                    <AddServiceForm
                      accessToken={accessToken}
                      salonId={salon.id}
                      onSuccess={() => setAddingForSalonId(null)}
                      onCancel={() => setAddingForSalonId(null)}
                    />
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </main>
  )
}

function ServiceRow({
  service,
  accessToken,
  salonId,
}: {
  service: SalonServiceResponse
  accessToken: string
  salonId: number
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const queryClient = useQueryClient()
  const removeMutation = useMutation({
    mutationFn: () => removeSalonService(accessToken, salonId, service.id),
    onSuccess: async () => {
      setConfirmOpen(false)
      await queryClient.invalidateQueries({ queryKey: ['my-companies'] })
    },
  })

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/55 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{service.name}</p>
        <p className="text-xs text-ink-muted">
          {service.categoryName ?? `Категория #${service.categoryId}`}
          {' · '}
          {service.durationMin} мин
          {' · '}
          <span className="font-semibold text-ink">{formatEuro(service.price)} €</span>
        </p>
        {removeMutation.isError && (
          <p className="mt-1 text-xs text-danger">Неуспешно премахване.</p>
        )}
      </div>
      <Button
        type="button"
        variant="danger"
        className="!px-3.5 !py-1.5 text-xs"
        disabled={removeMutation.isPending}
        onClick={() => setConfirmOpen(true)}
      >
        Премахни
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title="Премахване на услуга"
        message={`Сигурни ли сте, че искате да премахнете „${service.name}"? Това действие не може да бъде отменено.`}
        confirmLabel="Премахни"
        cancelLabel="Отказ"
        confirming={removeMutation.isPending}
        onConfirm={() => removeMutation.mutate()}
        onCancel={() => {
          if (!removeMutation.isPending) setConfirmOpen(false)
        }}
      />
    </li>
  )
}

function AddServiceForm({
  accessToken,
  salonId,
  onSuccess,
  onCancel,
}: {
  accessToken: string
  salonId: number
  onSuccess: () => void
  onCancel: () => void
}) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SalonServiceFormValues>({ resolver: zodResolver(salonServiceSchema) })

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const mutation = useMutation({
    mutationFn: (values: SalonServiceFormValues) =>
      createSalonService(accessToken, salonId, {
        categoryId: Number(values.categoryId),
        name: values.name,
        durationMin: Number(values.durationMin),
        price: Number(values.price),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['my-companies'] })
      onSuccess()
    },
  })

  const serverError = serverErrorMessage(mutation.error)
  const durationReg = register('durationMin')
  const priceReg = register('price')

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      noValidate
      className="space-y-4"
    >
      <div>
        <label htmlFor={`svc-name-${salonId}`} className={labelClasses}>
          Име на услугата
        </label>
        <input id={`svc-name-${salonId}`} className={inputClasses} {...register('name')} />
        <FieldError message={errors.name?.message} />
      </div>

      <div>
        <label htmlFor={`svc-cat-${salonId}`} className={labelClasses}>
          Категория
        </label>
        <select
          id={`svc-cat-${salonId}`}
          className={inputClasses}
          defaultValue=""
          {...register('categoryId')}
        >
          <option value="" disabled>
            {categoriesQuery.isLoading ? 'Зареждане…' : 'Изберете категория'}
          </option>
          {categoriesQuery.data?.map((cat) => (
            <option key={cat.id} value={String(cat.id)}>
              {cat.name}
            </option>
          ))}
        </select>
        <FieldError message={errors.categoryId?.message} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`svc-dur-${salonId}`} className={labelClasses}>
            Времетраене (мин)
          </label>
          <input
            id={`svc-dur-${salonId}`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            className={inputClasses}
            placeholder="60"
            {...durationReg}
            onChange={(event) => {
              const next = sanitizeIntegerDigits(event.target.value)
              setValue('durationMin', next, { shouldValidate: true, shouldDirty: true })
            }}
          />
          <FieldError message={errors.durationMin?.message} />
        </div>
        <div>
          <label htmlFor={`svc-price-${salonId}`} className={labelClasses}>
            Цена (€)
          </label>
          <input
            id={`svc-price-${salonId}`}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            className={inputClasses}
            placeholder="15.39"
            {...priceReg}
            onChange={(event) => {
              const next = sanitizeDecimalPrice(event.target.value)
              setValue('price', next, { shouldValidate: true, shouldDirty: true })
            }}
          />
          <FieldError message={errors.price?.message} />
        </div>
      </div>

      {serverError && (
        <p className="rounded-2xl bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Запазване…' : 'Запази услуга'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={mutation.isPending}>
          Отказ
        </Button>
      </div>
    </form>
  )
}
