import Modal from './Modal'

/**
 * Modal de Confirmación personalizado
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onConfirm - Función cuando se confirma
 * @param {Function} props.onCancel - Función cuando se cancela
 * @param {string} props.title - Título del modal
 * @param {string} props.message - Mensaje del modal
 * @param {string} props.confirmText - Texto del botón confirmar
 * @param {string} props.cancelText - Texto del botón cancelar
 * @param {string} props.type - Tipo de confirmación (danger, warning, info)
 */
export default function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title = '¿Estás seguro?',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning'
}) {
  const typeStyles = {
    danger: {
      iconBg: 'bg-red-500/20',
      iconBorder: 'border-red-500/30',
      iconColor: 'text-red-500',
      icon: '🗑️',
      btnBg: 'bg-red-500 hover:bg-red-600'
    },
    warning: {
      iconBg: 'bg-yellow-500/20',
      iconBorder: 'border-yellow-500/30',
      iconColor: 'text-yellow-500',
      icon: '⚠️',
      btnBg: 'bg-yellow-500 hover:bg-yellow-600'
    },
    info: {
      iconBg: 'bg-blue-500/20',
      iconBorder: 'border-blue-500/30',
      iconColor: 'text-blue-500',
      icon: 'ℹ️',
      btnBg: 'bg-blue-500 hover:bg-blue-600'
    },
    success: {
      iconBg: 'bg-green-500/20',
      iconBorder: 'border-green-500/30',
      iconColor: 'text-green-500',
      icon: '✅',
      btnBg: 'bg-green-500 hover:bg-green-600'
    }
  }

  const style = typeStyles[type] || typeStyles.warning

  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="md">
      <div className="p-6">
        {/* Mascota o Icono */}
        <div className="flex justify-center mb-4">
          <div className={`h-20 w-20 rounded-full ${style.iconBg} border-2 ${style.iconBorder} flex items-center justify-center`}>
            <span className="text-4xl">{style.icon}</span>
          </div>
        </div>

        {/* Título */}
        <h3 className="text-xl font-semibold text-center mb-2">
          {title}
        </h3>

        {/* Mensaje */}
        <p className="text-muted text-center mb-6">
          {message}
        </p>

        {/* Botones */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-slate-600/30 rounded-md hover:bg-slate-700/30 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 ${style.btnBg} text-white rounded-md transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
