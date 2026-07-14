import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router'
import { register as registerRequest } from '../api/auth'
import { ApiError } from '../api/http'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui/Button'
import { AuthCard, FieldError, inputClasses, labelClasses } from '../features/auth/AuthCard'
import { registerSchema, type RegisterFormValues } from '../features/auth/schemas'

export function RegisterPage() {
  const { setSession } = useAuth()
  const navigate = useNavigate()

  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) })

  const mutation = useMutation({
    mutationFn: (values: RegisterFormValues) =>
      registerRequest({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || undefined,
      }),
    onSuccess: (auth) => {
      setSession(auth)
      navigate('/')
    },
  })

  const serverError =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? 'Възникна грешка. Опитай отново.'
        : null

  return (
    <AuthCard title="Регистрация">
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className={labelClasses}>
              Име
            </label>
            <input id="firstName" type="text" className={inputClasses} {...field('firstName')} />
            <FieldError message={errors.firstName?.message} />
          </div>
          <div>
            <label htmlFor="lastName" className={labelClasses}>
              Фамилия
            </label>
            <input id="lastName" type="text" className={inputClasses} {...field('lastName')} />
            <FieldError message={errors.lastName?.message} />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="email" className={labelClasses}>
            Email
          </label>
          <input id="email" type="email" className={inputClasses} {...field('email')} />
          <FieldError message={errors.email?.message} />
        </div>

        <div className="mb-4">
          <label htmlFor="phone" className={labelClasses}>
            Телефон (по избор)
          </label>
          <input id="phone" type="tel" className={inputClasses} {...field('phone')} />
          <FieldError message={errors.phone?.message} />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className={labelClasses}>
            Парола
          </label>
          <input id="password" type="password" className={inputClasses} {...field('password')} />
          <FieldError message={errors.password?.message} />
        </div>

        {serverError && (
          <p className="mb-4 rounded-lg bg-brand-soft px-3 py-2 text-sm text-danger">
            {serverError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Създаване…' : 'Регистрирай се'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-secondary">
        Вече имаш профил?{' '}
        <Link to="/login" className="font-semibold text-brand hover:text-brand-hover">
          Влез
        </Link>
      </p>
    </AuthCard>
  )
}
