import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { createCompany } from '../api/businessOnboarding'
import { ApiError } from '../api/http'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui/Button'
import { FieldError, inputClasses, labelClasses } from '../features/auth/AuthCard'
import { companySchema, type CompanyFormValues } from '../features/business/onboardingSchemas'

const STEPS = ['Фирма', 'Условия и подпис'] as const

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
  const [doneMessage, setDoneMessage] = useState<string | null>(null)

  if (doneMessage !== null) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="glass-strong rounded-3xl p-8">
          <h1 className="mb-3 text-2xl font-bold tracking-tight text-ink">Готово!</h1>
          <p className="mb-6 text-ink-secondary">{doneMessage}</p>
          <Button onClick={() => navigate('/business/companies')}>Към моите фирми</Button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-2 text-center text-3xl font-bold tracking-tight text-ink">Регистрация на фирма</h1>
      <p className="mb-8 text-center text-sm text-ink-secondary">
        Стъпка {step + 1} от {STEPS.length}: {STEPS[step]}
      </p>

      <div className="mb-8 flex gap-2">
        {STEPS.map((label, index) => (
          <div
            key={label}
            className={`h-1.5 flex-1 rounded-full ${index <= step ? 'bg-brand' : 'bg-white/50'}`}
            aria-hidden
          />
        ))}
      </div>

      <div className="glass-strong rounded-3xl p-6 sm:p-8">
        {step === 0 && accessToken !== null && (
          <CompanyStep
            accessToken={accessToken}
            onSuccess={async () => {
              await refreshSession()
              setStep(1)
            }}
          />
        )}
        {step === 1 && (
          <TermsAndSignStep
            onComplete={() =>
              setDoneMessage(
                'Фирмата е регистрирана и очаква одобрение. Обекти можете да добавите от „Моите фирми“.',
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
  onSuccess: () => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormValues>({ resolver: zodResolver(companySchema) })

  const mutation = useMutation({
    mutationFn: (values: CompanyFormValues) => createCompany(accessToken, values),
    onSuccess: async () => onSuccess(),
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
      <div className="mb-4">
        <label htmlFor="legalName" className={labelClasses}>
          Юридическо име
        </label>
        <input id="legalName" className={inputClasses} {...register('legalName')} />
        <FieldError message={errors.legalName?.message} />
      </div>
      <div className="mb-4">
        <label htmlFor="email" className={labelClasses}>
          Email за контакт
        </label>
        <input id="email" type="email" className={inputClasses} {...register('email')} />
        <FieldError message={errors.email?.message} />
      </div>
      <div className="mb-6">
        <label htmlFor="phone" className={labelClasses}>
          Телефон за контакт
        </label>
        <input id="phone" type="tel" className={inputClasses} {...register('phone')} />
        <FieldError message={errors.phone?.message} />
      </div>
      {serverError && (
        <p className="mb-4 rounded-2xl bg-danger/10 px-3 py-2 text-sm text-danger">{serverError}</p>
      )}
      <Button type="submit" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? 'Регистриране…' : 'Продължи'}
      </Button>
    </form>
  )
}

function TermsAndSignStep({ onComplete }: { onComplete: () => void }) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold text-ink">Общи условия и подпис</h2>
      <p className="mb-6 text-sm leading-relaxed text-ink-secondary">{TERMS_LOREM}</p>

      <div className="mb-6 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="rounded-full border border-line bg-white/70 px-4 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
          onClick={() => undefined}
        >
          Общи условия
        </button>
        <button
          type="button"
          className="rounded-full border border-line bg-white/70 px-4 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:text-ink"
          onClick={() => undefined}
        >
          Договор за ползване
        </button>
      </div>

      <p className="mb-6 text-sm leading-relaxed text-ink-secondary">
        С натискане на бутона потвърждавате, че сте запознати с общите условия и договора за
        ползване. PDF и Borica / Evrotrust ще бъдат добавени на следващ етап.
      </p>

      <Button type="button" className="w-full" onClick={onComplete}>
        Подпиши и завърши
      </Button>
    </div>
  )
}
