import { useEffect } from 'react'
import Modal from './Modal'
import cancelledImage from '../../assets/img/cancelled.png'

/**
 * Modal de Cancelación que se muestra cuando se cancela o elimina un registro
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función cuando se cierra el modal
 * @param {string} props.message - Mensaje de cancelación a mostrar
 * @param {number} props.autoCloseDelay - Tiempo en ms antes de cerrar automáticamente (0 = no cerrar automáticamente)
 */
export default function CancelledModal({
  isOpen,
  onClose,
  message = 'Operación cancelada',
  autoCloseDelay = 2000
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
        {/* Imagen de cancelación */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <img 
              src={cancelledImage} 
              alt="Cancelado" 
              className="w-32 h-32 object-contain"
            />
          </div>
        </div>

        {/* Mensaje */}
        <p className="text-center text-lg font-medium mb-6 text-red-400">
          {message}
        </p>

        {/* Botón de cerrar (opcional, si no se cierra automáticamente) */}
        {autoCloseDelay === 0 && (
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
            >
              Aceptar
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

