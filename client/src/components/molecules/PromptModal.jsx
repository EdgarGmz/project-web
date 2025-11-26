import { useState } from 'react'
import Modal from './Modal'
import PasswordInput from '../atoms/PasswordInput'

/**
 * Modal de Prompt (solicitar input) con contraseña personalizado
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onConfirm - Función cuando se confirma (recibe el valor)
 * @param {Function} props.onCancel - Función cuando se cancela
 * @param {string} props.title - Título del modal
 * @param {string} props.message - Mensaje del modal
 * @param {string} props.placeholder - Placeholder del input
 * @param {string} props.confirmText - Texto del botón confirmar
 * @param {string} props.cancelText - Texto del botón cancelar
 * @param {boolean} props.isPassword - Si el input es de tipo password
 * @param {string} props.inputType - Tipo de input (text, email, number, password)
 */
export default function PromptModal({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Ingresa la información',
  message,
  placeholder = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isPassword = false,
  inputType = 'text',
  errorMessage = null,
  onClearError = null
}) {
  const [value, setValue] = useState('')

  const handleConfirm = () => {
    onConfirm(value)
    // No limpiar el valor si hay error, para que el usuario pueda corregir
    if (!errorMessage) {
      setValue('')
    }
  }

  const handleCancel = () => {
    onCancel()
    setValue('')
  }

  // Limpiar error cuando el usuario empiece a escribir
  const handleChange = (e) => {
    setValue(e.target.value)
    // Si hay error y el usuario empieza a escribir, limpiar el error
    if (errorMessage && e.target.value.length > 0) {
      // Si hay una función onClearError, llamarla
      if (onClearError) {
        onClearError()
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && value.trim()) {
      handleConfirm()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="md">
      <div className="p-6">
        {/* Mascota o Icono */}
        <div className="flex justify-center mb-4">
          <div className="h-20 w-20 rounded-full bg-accent/20 border-2 border-accent/30 flex items-center justify-center">
            <span className="text-4xl">🎮</span>
          </div>
        </div>

        {/* Título */}
        <h3 className="text-xl font-semibold text-center mb-2">
          {title}
        </h3>

        {/* Mensaje */}
        {message && (
          <p className="text-muted text-center mb-4">
            {message}
          </p>
        )}

        {/* Mensaje de error */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm text-center flex items-center justify-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </p>
          </div>
        )}

        {/* Input */}
        <div className="mb-6">
          {isPassword ? (
            <PasswordInput
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              autoComplete="current-password"
              onKeyPress={handleKeyPress}
              className={`bg-surface border-slate-600/30 ${errorMessage ? 'border-red-500/50 focus:ring-red-500' : ''}`}
              autoFocus
            />
          ) : (
            <input
              type={inputType}
              value={value}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              autoFocus
              className={`w-full px-3 py-2 border rounded-md bg-surface focus:outline-none focus:ring-2 ${
                errorMessage 
                  ? 'border-red-500/50 focus:ring-red-500' 
                  : 'border-slate-600/30 focus:ring-accent'
              }`}
            />
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-slate-600/30 rounded-md hover:bg-slate-700/30 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!value.trim()}
            className="px-4 py-2 bg-accent hover:bg-accent/80 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
