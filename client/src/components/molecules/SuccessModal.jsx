import { useEffect } from 'react'
import Modal from './Modal'
import successfulImage from '../../assets/img/succesful.PNG'

/**
 * Modal de Éxito que se muestra cuando se guarda un registro exitosamente
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función cuando se cierra el modal
 * @param {string} props.message - Mensaje de éxito a mostrar
 * @param {number} props.autoCloseDelay - Tiempo en ms antes de cerrar automáticamente (0 = no cerrar automáticamente)
 */
export default function SuccessModal({
  isOpen,
  onClose,
  message = 'Registro guardado exitosamente',
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
        {/* Imagen de éxito */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <img 
              src={successfulImage} 
              alt="Éxito" 
              className="w-32 h-32 object-contain"
            />
          </div>
        </div>

        {/* Mensaje */}
        <p className="text-center text-lg font-medium mb-6 text-green-400">
          {message}
        </p>

        {/* Botón de cerrar (opcional, si no se cierra automáticamente) */}
        {autoCloseDelay === 0 && (
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
            >
              Aceptar
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}

