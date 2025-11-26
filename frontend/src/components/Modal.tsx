import { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  title: string
  children: ReactNode
  onClose: () => void
  footer?: ReactNode
}

export function Modal({ isOpen, title, children, onClose, footer }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in-up">
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-100 bg-gradient-to-r from-primary-50 to-accent-50">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-primary-600 transition-colors p-1 hover:bg-white rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="p-6 border-t-2 border-gray-100 flex gap-3 bg-gray-50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
