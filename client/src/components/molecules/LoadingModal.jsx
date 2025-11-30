import Modal from './Modal'
import loadingImage from '../../assets/img/loading.png'

/**
 * Modal de Carga que se muestra mientras se está cargando información
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {string} props.message - Mensaje de carga a mostrar (opcional)
 */
export default function LoadingModal({
  isOpen,
  message = 'Cargando información...'
}) {
  // No permitir cerrar el modal haciendo click fuera o con Escape
  const handleClose = () => {
    // No hacer nada - el modal de carga no se puede cerrar manualmente
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size="sm"
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      <div className="p-6">
        {/* Imagen de carga */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <img 
              src={loadingImage} 
              alt="Cargando" 
              className="w-32 h-32 object-contain animate-pulse"
            />
          </div>
        </div>

        {/* Mensaje */}
        <p className="text-center text-lg font-medium text-text">
          {message}
        </p>
      </div>
    </Modal>
  )
}

