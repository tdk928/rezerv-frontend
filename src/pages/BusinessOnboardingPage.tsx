import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { createCompany, createSalon } from '../api/businessOnboarding'
import { getCities } from '../api/business'
import { ApiError } from '../api/http'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui/Button'
import { FieldError, inputClasses, labelClasses } from '../features/auth/AuthCard'
import {
  companySchema,
  salonSchema,
  type CompanyFormValues,
  type SalonFormValues,
} from '../features/business/onboardingSchemas'

const STEPS = ['Фирма', 'Обект', 'Условия', 'Подпис'] as const

const TERMS_LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'

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
  const [doneMessage, setDoneMessage] = useState<string | null>(null)

  const citiesQuery = useQuery({ queryKey: ['cities'], queryFn: getCities })

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
            onSuccess={() => setStep(2)}
          />
        )}
        {step === 2 && <TermsStep onContinue={() => setStep(3)} />}
        {step === 3 && (
          <SignStep
            onComplete={() =>
              setDoneMessage(
                'Фирмата и обектът са регистрирани. Услуги и снимки можете да добавите от администрацията. Очаква одобрение от администратор.',
              )
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
  onSuccess: () => void
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
    onSuccess: () => onSuccess(),
  })

  const serverError = serverErrorMessage(mutation.error)

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
      <div className="mb-4">
        <label htmlFor="salonName" className={labelClasses}>
          Име на обекта
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

function TermsStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-ink">Общи условия</h2>
      <p className="mb-6 text-sm leading-relaxed text-ink-secondary">{TERMS_LOREM}</p>

      <div className="mb-6 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-ink-secondary transition-colors hover:border-brand hover:text-ink"
          onClick={() => undefined}
        >
          Общи условия
        </button>
        <button
          type="button"
          className="rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-ink-secondary transition-colors hover:border-brand hover:text-ink"
          onClick={() => undefined}
        >
          Договор за ползване
        </button>
      </div>

      <p className="mb-6 text-xs text-ink-muted">
        PDF документите ще бъдат налични скоро. Продължете към електронния подпис.
      </p>

      <Button type="button" className="w-full" onClick={onContinue}>
        Продължи
      </Button>
    </div>
  )
}

function SignStep({ onComplete }: { onComplete: () => void }) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-ink">Електронен подпис</h2>
      <p className="mb-6 text-sm leading-relaxed text-ink-secondary">
        С натискане на бутона потвърждавате, че сте запознати с общите условия и договора за
        ползване на платформата REZERV. Интеграцията с Borica / Evrotrust ще бъде добавена на
        следващ етап.
      </p>

      <Button type="button" className="w-full" onClick={onComplete}>
        Подпиши и завърши
      </Button>
    </div>
  )
}
