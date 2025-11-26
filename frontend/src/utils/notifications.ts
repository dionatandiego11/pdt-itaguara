interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

export function showToast({ type, message, duration = 3000 }: ToastProps) {
  const toastElement = document.createElement('div')
  const colors = {
    success: 'bg-success-50 text-success-700 border-success-200',
    error: 'bg-danger-50 text-danger-700 border-danger-200',
    info: 'bg-primary-50 text-primary-700 border-primary-200',
    warning: 'bg-warning-50 text-warning-700 border-warning-200',
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ⓘ',
    warning: '⚠',
  }

  toastElement.className = `fixed top-4 right-4 px-4 py-3 rounded-lg border ${colors[type]} z-50`
  toastElement.textContent = `${icons[type]} ${message}`

  document.body.appendChild(toastElement)

  setTimeout(() => {
    toastElement.remove()
  }, duration)
}
