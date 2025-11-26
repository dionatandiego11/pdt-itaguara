interface BadgeProps {
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'primary', children, className }: BadgeProps) {
  const variantClasses = {
    primary: 'badge-primary',
    accent: 'badge-accent',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
  }

  return <span className={`badge ${variantClasses[variant]} ${className || ''}`}>{children}</span>
}
