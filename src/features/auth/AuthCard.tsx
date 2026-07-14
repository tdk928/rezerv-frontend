import type { ReactNode } from 'react'

/** Обща обвивка за login/registration страниците. */
export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-sm">
        <h1 className="mb-1 text-center text-2xl font-bold text-brand">REZERV</h1>
        <h2 className="mb-6 text-center text-lg font-semibold text-ink">{title}</h2>
        {children}
      </div>
    </div>
  )
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-danger">{message}</p>
}

export const inputClasses =
  'w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm text-ink ' +
  'placeholder:text-ink-muted focus:border-brand focus:outline-none'

export const labelClasses = 'mb-1 block text-sm font-medium text-ink-secondary'
