import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import {
  createCompany,
  createSalon,
  createSalonPhoto,
  createSalonService,
} from '../api/businessOnboarding'
import { getCategories, getCities } from '../api/business'
import { ApiError } from '../api/http'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui/Button'
import { FieldError, inputClasses, labelClasses } from '../features/auth/AuthCard'
import {
  companySchema,
  photoSchema,
  salonSchema,
  serviceSchema,
  type CompanyFormValues,
  type PhotoFormValues,
  type SalonFormValues,
  type ServiceFormValues,
} from '../features/business/onboardingSchemas'

const STEPS = ['Фирма', 'Салон', 'Услуга', 'Снимка'] as const

function serverErrorMessage(error: unknown): string | null {
  if (error instanceof ApiError) return error.message
  if (error) return 'Възникна грешка. Опитайте отново.'
  return null
}

export function BusinessOnboardingPage() {
  const { accessToken, refreshSession } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [companyId, setCompanyId] = useState<number | null>(null)
  const [salonId, setSalonId] = useState<number | null>(null)
  const [doneMessage, setDoneMessage] = useState<string | null>(null)

  const citiesQuery = useQuery({ queryKey: ['cities'], queryFn: getCities })
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  if (doneMessage !== null) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-gradient mb-3 text-2xl font-bold">Готово!</h1>
        <p className="mb-6 text-ink-secondary">{doneMessage}</p>
        <Button onClick={() => navigate('/')}>Към началото</Button>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-gradient mb-2 text-center text-3xl font-extrabold">Регистрация на фирма</h1>
      <p className="mb-8 text-center text-sm text-ink-secondary">
        Стъпка {step + 1} от {STEPS.length}: {STEPS[step]}
      </p>

      <div className="mb-8 flex gap-2">
        {STEPS.map((label, index) => (
          <div
            key={label}
            className={`h-1 flex-1 rounded-full ${index <= step ? 'bg-gradient-brand' : 'bg-line'}`}
            aria-hidden
          />
        ))}
      </div>

      <div className="rounded-2xl border border-line bg-card p-6 sm:p-8">
        {step === 0 && accessToken !== null && (
          <CompanyStep
            accessToken={accessToken}
            onSuccess={async (id) => {
              setCompanyId(id)
              await refreshSession()
              setStep(1)
            }}
          />
        )}
        {step === 1 && accessToken !== null && companyId !== null && (
          <SalonStep
            accessToken={accessToken}
            companyId={companyId}
            cities={citiesQuery.data ?? []}
            citiesLoading={citiesQuery.isLoading}
            onSuccess={(id) => {
              setSalonId(id)
              setStep(2)
            }}
          />
        )}
        {step === 2 && accessToken !== null && salonId !== null && (
          <ServiceStep
            accessToken={accessToken}
            salonId={salonId}
            categories={categoriesQuery.data ?? []}
            categoriesLoading={categoriesQuery.isLoading}
            onSuccess={() => setStep(3)}
            onSkip={() => setStep(3)}
          />
        )}
        {step === 3 && accessToken !== null && salonId !== null && (
          <PhotoStep
            accessToken={accessToken}
            salonId={salonId}
            onSuccess={() =>
              setDoneMessage('Фирмата, салонът и услугите са регистрирани. Очаква одобрение от администратор.')
            }
            onSkip={() =>
              setDoneMessage('Фирмата и салонът са регистрирани. Можете да добавите снимки по-късно.')
            }
          />
        )}
      </div>
    </main>
  )
}

function CompanyStep({
  accessToken,
  onSuccess,
}: {
  accessToken: string
  onSuccess: (companyId: number) => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormValues>({ resolver: zodResolver(companySchema) })

  const mutation = useMutation({
    mutationFn: (values: CompanyFormValues) => createCompany(accessToken, values),
    onSuccess: async (company) => onSuccess(company.id),
  })

  const serverError = serverErrorMessage(mutation.error)

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
      <div className="mb-4">
        <label htmlFor="eik" className={labelClasses}>
          ЕИК
        </label>
        <input id="eik" inputMode="numeric" className={inputClasses} {...register('eik')} />
        <FieldError message={errors.eik?.message} />
      </div>
      <div className="mb-4">
        <label htmlFor="name" className={labelClasses}>
          Име на фирмата
        </label>
        <input id="name" className={inputClasses} {...register('name')} />
        <FieldError message={errors.name?.message} />
      </div>
      <div className="mb-6">
        <label htmlFor="legalName" className={labelClasses}>
          Юридическо име
        </label>
        <input id="legalName" className={inputClasses} {...register('legalName')} />
        <FieldError message={errors.legalName?.message} />
      </div>
      {serverError && (
        <p className="mb-4 rounded-lg bg-brand-soft px-3 py-2 text-sm text-danger">{serverError}</p>
      )}
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? 'Регистриране…' : 'Продължи'}
      </Button>
    </form>
  )
}

function SalonStep({
  accessToken,
  companyId,
  cities,
  citiesLoading,
  onSuccess,
}: {
  accessToken: string
  companyId: number
  cities: { id: number; name: string }[]
  citiesLoading: boolean
  onSuccess: (salonId: number) => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SalonFormValues>({ resolver: zodResolver(salonSchema) })

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
    onSuccess: (salon) => onSuccess(salon.id),
  })

  const serverError = serverErrorMessage(mutation.error)

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
      <div className="mb-4">
        <label htmlFor="salonName" className={labelClasses}>
          Име на салона
        </label>
        <input id="salonName" className={inputClasses} {...register('name')} />
        <FieldError message={errors.name?.message} />
      </div>
      <div className="mb-4">
        <label htmlFor="description" className={labelClasses}>
          Описание (по избор)
        </label>
        <textarea
          id="description"
          rows={3}
          className={inputClasses}
          {...register('description')}
        />
        <FieldError message={errors.description?.message} />
      </div>
      <div className="mb-4">
        <label htmlFor="cityId" className={labelClasses}>
          Град
        </label>
        <select id="cityId" className={inputClasses} disabled={citiesLoading} {...register('cityId')}>
          <option value="">Изберете град</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
        <FieldError message={errors.cityId?.message} />
      </div>
      <div className="mb-4">
        <label htmlFor="address" className={labelClasses}>
          Адрес
        </label>
        <input id="address" className={inputClasses} {...register('address')} />
        <FieldError message={errors.address?.message} />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className={labelClasses}>
          Email
        </label>
        <input id="email" type="email" className={inputClasses} {...register('email')} />
        <FieldError message={errors.email?.message} />
      </div>
      <div className="mb-6">
        <label htmlFor="phone" className={labelClasses}>
          Телефон
        </label>
        <input id="phone" type="tel" className={inputClasses} {...register('phone')} />
        <FieldError message={errors.phone?.message} />
      </div>
      {serverError && (
        <p className="mb-4 rounded-lg bg-brand-soft px-3 py-2 text-sm text-danger">{serverError}</p>
      )}
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? 'Създаване…' : 'Продължи'}
      </Button>
    </form>
  )
}

function ServiceStep({
  accessToken,
  salonId,
  categories,
  categoriesLoading,
  onSuccess,
  onSkip,
}: {
  accessToken: string
  salonId: number
  categories: { id: number; name: string }[]
  categoriesLoading: boolean
  onSuccess: () => void
  onSkip: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormValues>({ resolver: zodResolver(serviceSchema) })

  const mutation = useMutation({
    mutationFn: (values: ServiceFormValues) =>
      createSalonService(accessToken, salonId, {
        categoryId: Number(values.categoryId),
        name: values.name,
        durationMin: Number(values.durationMin),
        price: Number(values.price),
      }),
    onSuccess: () => onSuccess(),
  })

  const serverError = serverErrorMessage(mutation.error)

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
      <div className="mb-4">
        <label htmlFor="categoryId" className={labelClasses}>
          Категория
        </label>
        <select
          id="categoryId"
          className={inputClasses}
          disabled={categoriesLoading}
          {...register('categoryId')}
        >
          <option value="">Изберете категория</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <FieldError message={errors.categoryId?.message} />
      </div>
      <div className="mb-4">
        <label htmlFor="serviceName" className={labelClasses}>
          Име на услугата
        </label>
        <input id="serviceName" className={inputClasses} {...register('name')} />
        <FieldError message={errors.name?.message} />
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="durationMin" className={labelClasses}>
            Продължителност (мин)
          </label>
          <input id="durationMin" type="number" min={1} className={inputClasses} {...register('durationMin')} />
          <FieldError message={errors.durationMin?.message} />
        </div>
        <div>
          <label htmlFor="price" className={labelClasses}>
            Цена (лв.)
          </label>
          <input id="price" type="number" min={0} step="0.01" className={inputClasses} {...register('price')} />
          <FieldError message={errors.price?.message} />
        </div>
      </div>
      {serverError && (
        <p className="mb-4 rounded-lg bg-brand-soft px-3 py-2 text-sm text-danger">{serverError}</p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="secondary" className="flex-1" onClick={onSkip}>
          Пропусни
        </Button>
        <Button type="submit" className="flex-1" disabled={mutation.isPending}>
          {mutation.isPending ? 'Добавяне…' : 'Продължи'}
        </Button>
      </div>
    </form>
  )
}

function PhotoStep({
  accessToken,
  salonId,
  onSuccess,
  onSkip,
}: {
  accessToken: string
  salonId: number
  onSuccess: () => void
  onSkip: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PhotoFormValues>({
    resolver: zodResolver(photoSchema),
    defaultValues: { url: 'https://picsum.photos/800/600' },
  })

  const mutation = useMutation({
    mutationFn: (values: PhotoFormValues) => createSalonPhoto(accessToken, salonId, values),
    onSuccess: () => onSuccess(),
  })

  const serverError = serverErrorMessage(mutation.error)

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
      <p className="mb-4 text-sm text-ink-secondary">
        Добавете URL на снимка за салона (можете да ползвате picsum.photos за тест).
      </p>
      <div className="mb-6">
        <label htmlFor="url" className={labelClasses}>
          URL на снимка
        </label>
        <input id="url" type="url" className={inputClasses} {...register('url')} />
        <FieldError message={errors.url?.message} />
      </div>
      {serverError && (
        <p className="mb-4 rounded-lg bg-brand-soft px-3 py-2 text-sm text-danger">{serverError}</p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" variant="secondary" className="flex-1" onClick={onSkip}>
          Пропусни
        </Button>
        <Button type="submit" className="flex-1" disabled={mutation.isPending}>
          {mutation.isPending ? 'Качване…' : 'Завърши'}
        </Button>
      </div>
    </form>
  )
}
