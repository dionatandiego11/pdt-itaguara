interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  ...props
}: ButtonProps) {
  const baseClasses =
    'font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-lg focus:ring-primary-500',
    secondary:
      'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300',
    outline:
      'border-2 border-gray-300 text-gray-900 hover:border-primary-600 hover:text-primary-600 focus:ring-primary-500 transition-all',
    danger: 
      'bg-danger-600 text-white hover:bg-danger-700 hover:shadow-lg focus:ring-danger-500',
    accent:
      'bg-gradient-to-r from-accent-500 to-accent-600 text-white hover:shadow-lg focus:ring-accent-500',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${props.className || ''}`}
    >
      {isLoading ? '⏳' : children}
    </button>
  )
}