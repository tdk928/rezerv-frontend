import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-gradient-brand text-white hover:opacity-90 disabled:opacity-40',
  secondary:
    'bg-card text-ink border border-line hover:border-brand disabled:text-ink-muted disabled:hover:border-line',
  ghost: 'bg-transparent text-ink-secondary hover:bg-card hover:text-ink disabled:text-ink-muted',
  danger: 'bg-danger text-white hover:opacity-90 disabled:opacity-40',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
