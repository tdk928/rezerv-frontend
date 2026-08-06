import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'warm' | 'danger' | 'dangerSoft'

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand text-white shadow-sm shadow-brand/25 ' +
    'enabled:hover:bg-brand-hover enabled:hover:shadow-lg enabled:hover:shadow-brand/35 enabled:hover:-translate-y-0.5 ' +
    'enabled:active:translate-y-0 enabled:active:scale-[0.98] disabled:opacity-40',
  secondary:
    'glass text-ink enabled:hover:bg-white/90 enabled:hover:shadow-md enabled:hover:-translate-y-0.5 ' +
    'disabled:text-ink-muted disabled:opacity-50',
  ghost:
    'bg-transparent text-ink-secondary enabled:hover:bg-white/60 enabled:hover:text-ink enabled:hover:shadow-sm ' +
    'disabled:text-ink-muted disabled:opacity-50',
  warm:
    'border border-warning/25 bg-warning/[0.14] text-ink shadow-sm shadow-warning/10 backdrop-blur-xl ' +
    'enabled:hover:border-warning/35 enabled:hover:bg-warning/[0.22] enabled:hover:shadow-md enabled:hover:shadow-warning/15 enabled:hover:-translate-y-0.5 ' +
    'enabled:active:translate-y-0 enabled:active:scale-[0.98] disabled:opacity-40',
  danger:
    'bg-danger text-white shadow-sm shadow-danger/25 ' +
    'enabled:hover:brightness-110 enabled:hover:shadow-lg enabled:hover:shadow-danger/40 enabled:hover:-translate-y-0.5 ' +
    'enabled:active:translate-y-0 enabled:active:scale-[0.98] disabled:opacity-40',
  dangerSoft:
    'border border-danger/15 bg-danger/[0.07] text-danger shadow-sm shadow-danger/5 backdrop-blur-xl ' +
    'enabled:hover:border-danger/25 enabled:hover:bg-danger/[0.12] enabled:hover:shadow-md enabled:hover:shadow-danger/10 enabled:hover:-translate-y-0.5 ' +
    'enabled:active:translate-y-0 enabled:active:scale-[0.98] disabled:opacity-40',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex cursor-pointer items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold tracking-tight transition-all duration-200 disabled:pointer-events-none disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
