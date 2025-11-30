import { useEffect } from 'react'

/**
 * Componente Modal base
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {React.ReactNode} props.children - Contenido del modal
 * @param {string} props.size - Tamaño del modal (sm, md, lg)
 * @param {boolean} props.closeOnBackdropClick - Si se puede cerrar haciendo click fuera (default: true)
 * @param {boolean} props.closeOnEscape - Si se puede cerrar con la tecla Escape (default: true)
 */
export default function Modal({ 
  isOpen, 
  onClose, 
  children, 
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true
}) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && closeOnEscape) {
        onClose()
      }
    }

    if (isOpen) {
      if (closeOnEscape) {
        document.addEventListener('keydown', handleEscape)
      }
      document.body.style.overflow = 'hidden'
    }

    return () => {
      if (closeOnEscape) {
        document.removeEventListener('keydown', handleEscape)
      }
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, closeOnEscape])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      <div 
        className={`${sizeClasses[size]} w-full bg-surface border border-slate-600/30 rounded-xl shadow-2xl animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
