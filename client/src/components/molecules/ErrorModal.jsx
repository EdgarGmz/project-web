import { useEffect } from 'react'
import Modal from './Modal'
import deniedImage from '../../assets/img/denied.png'

/**
 * Modal de Error que se muestra cuando ocurre un error
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función cuando se cierra el modal
 * @param {string} props.message - Mensaje de error a mostrar
 * @param {number} props.autoCloseDelay - Tiempo en ms antes de cerrar automáticamente (0 = no cerrar automáticamente)
 */
export default function ErrorModal({
  isOpen,
  onClose,
  message = 'Ha ocurrido un error',
  autoCloseDelay = 0
}) {
  // Cerrar automáticamente después del delay
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, autoCloseDelay)

      return () => clearTimeout(timer)
    }
  }, [isOpen, autoCloseDelay, onClose])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6">
        {/* Imagen de error */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <img 
              src={deniedImage} 
              alt="Error" 
              className="w-32 h-32 object-contain"
            />
          </div>
        </div>

        {/* Mensaje */}
        <p className="text-center text-lg font-medium mb-6 text-red-400">
          {message}
        </p>

        {/* Botón de cerrar */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </Modal>
  )
}

