import type { ReactNode } from 'react'

/** Обща обвивка за login/registration страниците. */
export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="flex flex-1 items-start justify-center px-4 pt-10 pb-10">
      <div className="w-full max-w-md rounded-2xl border border-line bg-card p-6 sm:p-8">
        <h1 className="text-gradient mb-1 text-center text-3xl font-extrabold tracking-tight">
          Rezerv
        </h1>
        <h2 className="text-gradient-soft mb-6 text-center text-lg font-semibold">{title}</h2>
        {children}
      </div>
    </main>
  )
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-danger">{message}</p>
}

export const inputClasses =
  'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink ' +
  'placeholder:text-ink-muted focus:border-brand focus:outline-none'

export const labelClasses = 'mb-1 block text-sm font-medium text-ink-secondary'
