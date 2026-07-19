import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

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
  danger:
    'bg-danger text-white shadow-sm shadow-danger/25 ' +
    'enabled:hover:brightness-110 enabled:hover:shadow-lg enabled:hover:shadow-danger/40 enabled:hover:-translate-y-0.5 ' +
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
