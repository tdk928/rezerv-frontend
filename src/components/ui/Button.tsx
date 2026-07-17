import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-brand text-white shadow-sm shadow-brand/25 hover:bg-brand-hover hover:shadow-md hover:shadow-brand/30 active:scale-[0.98] disabled:opacity-40',
  secondary:
    'glass text-ink hover:bg-white/80 disabled:text-ink-muted',
  ghost:
    'bg-transparent text-ink-secondary hover:bg-white/50 hover:text-ink disabled:text-ink-muted',
  danger:
    'bg-danger text-white shadow-sm hover:opacity-90 active:scale-[0.98] disabled:opacity-40',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold tracking-tight transition-all duration-200 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
