import type { ReactNode } from 'react'

/** Обща обвивка за login/registration — glass-strong card. */
export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="flex flex-1 items-start justify-center px-4 pt-12 pb-12">
      <div className="glass-strong w-full max-w-md rounded-3xl p-7 sm:p-9">
        <h1 className="mb-1 text-center text-3xl font-bold tracking-tight text-ink">Rezerv</h1>
        <h2 className="mb-7 text-center text-lg font-semibold text-ink-secondary">{title}</h2>
        {children}
      </div>
    </main>
  )
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs font-medium text-danger">{message}</p>
}

export const inputClasses =
  'w-full rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm text-ink ' +
  'placeholder:text-ink-muted shadow-sm backdrop-blur-sm ' +
  'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25'

export const labelClasses = 'mb-1.5 block text-sm font-medium text-ink-secondary'
