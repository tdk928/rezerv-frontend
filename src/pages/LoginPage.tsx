import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router'
import { login } from '../api/auth'
import { ApiError } from '../api/http'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui/Button'
import { AuthCard, FieldError, inputClasses, labelClasses } from '../features/auth/AuthCard'
import { loginSchema, type LoginFormValues } from '../features/auth/schemas'

export function LoginPage() {
  const { setSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const {
    register: field,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (auth) => {
      setSession(auth)
      navigate(from)
    },
  })

  const serverError =
    mutation.error instanceof ApiError
      ? mutation.error.message
      : mutation.error
        ? 'Възникна грешка. Опитай отново.'
        : null

  return (
    <AuthCard title="Вход">
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
        <div className="mb-4">
          <label htmlFor="email" className={labelClasses}>
            Email
          </label>
          <input id="email" type="email" className={inputClasses} {...field('email')} />
          <FieldError message={errors.email?.message} />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className={labelClasses}>
            Парола
          </label>
          <input id="password" type="password" className={inputClasses} {...field('password')} />
          <FieldError message={errors.password?.message} />
        </div>

        {serverError && (
          <p className="mb-4 rounded-2xl bg-danger/10 px-3 py-2 text-sm text-danger">
            {serverError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? 'Влизане…' : 'Влез'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-secondary">
        Нямаш профил?{' '}
        <Link to="/register" className="font-semibold text-brand hover:text-brand-hover">
          Регистрирай се
        </Link>
      </p>
    </AuthCard>
  )
}
