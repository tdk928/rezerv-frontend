import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover disabled:bg-ink-muted',
  secondary: 'bg-card text-ink border border-line hover:bg-surface disabled:text-ink-muted',
  ghost: 'bg-transparent text-ink-secondary hover:bg-surface disabled:text-ink-muted',
  danger: 'bg-danger text-white hover:opacity-90 disabled:bg-ink-muted',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
