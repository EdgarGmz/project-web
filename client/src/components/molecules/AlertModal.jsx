import Modal from './Modal'

/**
 * Modal de Alerta personalizado
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función cuando se cierra
 * @param {string} props.title - Título del modal
 * @param {string} props.message - Mensaje del modal
 * @param {string} props.buttonText - Texto del botón
 * @param {string} props.type - Tipo de alerta (success, error, warning, info)
 */
export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'Aceptar',
  type = 'info'
}) {
  const typeStyles = {
    success: {
      iconBg: 'bg-green-500/20',
      iconBorder: 'border-green-500/30',
      icon: '✅',
      btnBg: 'bg-green-500 hover:bg-green-600'
    },
    error: {
      iconBg: 'bg-red-500/20',
      iconBorder: 'border-red-500/30',
      icon: '❌',
      btnBg: 'bg-red-500 hover:bg-red-600'
    },
    warning: {
      iconBg: 'bg-yellow-500/20',
      iconBorder: 'border-yellow-500/30',
      icon: '⚠️',
      btnBg: 'bg-yellow-500 hover:bg-yellow-600'
    },
    info: {
      iconBg: 'bg-blue-500/20',
      iconBorder: 'border-blue-500/30',
      icon: 'ℹ️',
      btnBg: 'bg-blue-500 hover:bg-blue-600'
    }
  }

  const style = typeStyles[type]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6">
        {/* Mascota o Icono */}
        <div className="flex justify-center mb-4">
          <div className={`h-20 w-20 rounded-full ${style.iconBg} border-2 ${style.iconBorder} flex items-center justify-center`}>
            <span className="text-4xl">{style.icon}</span>
          </div>
        </div>

        {/* Título */}
        {title && (
          <h3 className="text-xl font-semibold text-center mb-2">
            {title}
          </h3>
        )}

        {/* Mensaje */}
        <p className="text-muted text-center mb-6">
          {message}
        </p>

        {/* Botón */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className={`px-6 py-2 ${style.btnBg} text-white rounded-md transition-colors min-w-[120px]`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
