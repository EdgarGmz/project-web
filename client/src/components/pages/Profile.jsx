import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import PasswordInput from '../atoms/PasswordInput'
import SuccessModal from '../molecules/SuccessModal'
import LoadingModal from '../molecules/LoadingModal'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: ''
  })
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [loading, setLoading] = useState(false)
  const [loadingPassword, setLoadingPassword] = useState(false)
  const [error, setError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPasswordSuccessModal, setShowPasswordSuccessModal] = useState(false)

  useEffect(() => {
    // Usar los datos del usuario del contexto directamente
    // No hacer llamada al servidor para evitar problemas de autenticación
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    // Validar formato de teléfono antes de enviar (debe coincidir con la validación del backend)
    // El backend requiere: /^[+]?[\d\s\-().]{10,20}$/
    // Permite: un '+' opcional al inicio, seguido de 10-20 caracteres (dígitos, espacios, guiones, paréntesis, puntos)
    if (formData.phone && formData.phone.trim() !== '') {
      const phoneRegex = /^[+]?[\d\s\-().]{10,20}$/;
      const phoneWithoutSpaces = formData.phone.replace(/\s/g, '');
      
      if (!phoneRegex.test(formData.phone)) {
        setError("El teléfono debe tener entre 10 y 20 caracteres y solo puede contener números, espacios, guiones, paréntesis, puntos y un '+' inicial");
        setTimeout(() => setError(''), 5000);
        return;
      }
      
      // Validar que tenga al menos 10 dígitos (sin contar espacios, guiones, paréntesis, puntos)
      if (phoneWithoutSpaces.replace(/[+\-().]/g, '').length < 10) {
        setError("El teléfono debe contener al menos 10 dígitos");
        setTimeout(() => setError(''), 5000);
        return;
      }
    }
    
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      // Preparar datos para enviar (convertir teléfono vacío a null)
      const updateData = {
        ...formData,
        phone: formData.phone && formData.phone.trim() !== '' ? formData.phone.trim() : null
      };
      
      // Usar el servicio estándar para actualizar usuario
      const response = await import('../../services/userService').then(mod => mod.userService.update(user.id, updateData));
      if (response && response.success) {
        setEditing(false);
        setSuccess('Perfil actualizado correctamente');
        // Actualizar los datos del usuario en el contexto y localStorage
        const updatedUser = { 
          ...user, 
          ...updateData,
          phone: updateData.phone || null
        };
        // Actualizar el contexto de autenticación sin limpiar la sesión
        if (typeof updateUser === 'function') {
          updateUser(updatedUser);
        }
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response?.message || 'Error al actualizar el perfil');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error de conexión al actualizar el perfil');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || ''
    })
    setError('')
  }

  const validatePassword = () => {
    if (!passwordData.current_password) {
      setPasswordError('Debes ingresar tu contraseña actual')
      return false
    }
    if (!passwordData.new_password) {
      setPasswordError('Debes ingresar una nueva contraseña')
      return false
    }
    if (passwordData.new_password.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres')
      return false
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('Las contraseñas no coinciden')
      return false
    }
    return true
  }

  const handlePasswordChange = async () => {
    setPasswordError('')
    
    if (!validatePassword()) {
      setTimeout(() => setPasswordError(''), 5000)
      return
    }

    setLoadingPassword(true)
    try {
      // Usar el servicio api para mantener consistencia y manejo correcto del token
      const { api } = await import('../../services/api')
      const response = await api.put('/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      })
      
      if (response && response.success) {
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
        setPasswordError('')
        setShowPasswordSuccessModal(true)
      } else {
        setPasswordError(response?.message || 'Error al cambiar la contraseña')
        setTimeout(() => setPasswordError(''), 5000)
      }
    } catch (error) {
      console.error('Error updating password:', error)
      setPasswordError(error.message || 'Error de conexión al cambiar la contraseña')
      setTimeout(() => setPasswordError(''), 5000)
    } finally {
      setLoadingPassword(false)
    }
  }

  return (
    <>
      <LoadingModal isOpen={loading || loadingPassword} message={loading ? "Guardando perfil..." : "Cambiando contraseña..."} />
      <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">Mi Perfil</h1>
        <p className="text-muted">Administra tu información personal</p>
      </div>

      {/* Mensajes globales */}
      {success && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-md">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar y rol */}
        <div className="card text-center">
          <div className="h-24 w-24 rounded-full bg-accent/20 border-2 border-accent/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold uppercase">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
          <h3 className="font-semibold text-lg">{user?.first_name} {user?.last_name}</h3>
          <p className="text-accent capitalize text-sm font-medium">{user?.role}</p>
          <p className="text-muted text-sm mt-2">{user?.email}</p>
          
          {user?.branch && (
            <div className="mt-4 pt-4 border-t border-slate-600/20">
              <p className="text-xs text-muted mb-1">Sucursal</p>
              <p className="font-medium">{user.branch.name}</p>
              <p className="text-xs text-muted">{user.branch.city}</p>
            </div>
          )}
          
          {user?.employee_id && (
            <div className="mt-4 pt-4 border-t border-slate-600/20">
              <p className="text-xs text-muted mb-1">ID Empleado</p>
              <p className="font-mono font-medium">{user.employee_id}</p>
            </div>
          )}
        </div>

        {/* Información personal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Información Personal</h3>
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      disabled={loading}
                      className="px-3 py-1 text-sm border border-slate-600/30 rounded-md hover:bg-slate-700/30 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-3 py-1 text-sm bg-accent hover:bg-accent/80 rounded-md disabled:opacity-50"
                    >
                      {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1 text-sm bg-accent hover:bg-accent/80 rounded-md"
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre *</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  disabled={!editing}
                  required
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Apellido *</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  disabled={!editing}
                  required
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!editing}
                  required
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!editing}
                  placeholder="(opcional)"
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Cambiar contraseña */}
          <div className="card">
            {/* Header con icono */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-600/20">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-500/10 border-2 border-purple-500/40 flex items-center justify-center text-2xl">
                🔐
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Cambiar Contraseña</h3>
                <p className="text-xs text-muted mt-0.5">Actualiza tu contraseña para mantener tu cuenta segura</p>
              </div>
            </div>
            
            {/* Mensajes de error */}
            {passwordError && (
              <div className="mb-4 bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <span>{passwordError}</span>
              </div>
            )}
            
            <div className="space-y-5">
              {/* Contraseña Actual */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-white">
                  <span>🔑</span>
                  Contraseña Actual *
                </label>
                <PasswordInput
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all placeholder:text-slate-500"
                  placeholder="Ingresa tu contraseña actual"
                  autoComplete="current-password"
                />
              </div>

              {/* Nueva Contraseña */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-white">
                  <span>✨</span>
                  Nueva Contraseña *
                </label>
                <PasswordInput
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all placeholder:text-slate-500"
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
                {passwordData.new_password && passwordData.new_password.length < 6 && (
                  <div className="flex items-center gap-2 text-xs text-yellow-400 mt-1">
                    <span>ℹ️</span>
                    <span>La contraseña debe tener al menos 6 caracteres</span>
                  </div>
                )}
                {passwordData.new_password && passwordData.new_password.length >= 6 && (
                  <div className="flex items-center gap-2 text-xs text-green-400 mt-1">
                    <span>✅</span>
                    <span>Contraseña válida</span>
                  </div>
                )}
              </div>

              {/* Confirmar Nueva Contraseña */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-white">
                  <span>🔒</span>
                  Confirmar Nueva Contraseña *
                </label>
                <PasswordInput
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all placeholder:text-slate-500"
                  placeholder="Repite la nueva contraseña"
                  autoComplete="new-password"
                />
                {passwordData.confirm_password && passwordData.new_password !== passwordData.confirm_password && (
                  <div className="flex items-center gap-2 text-xs text-red-400 mt-1">
                    <span>❌</span>
                    <span>Las contraseñas no coinciden</span>
                  </div>
                )}
                {passwordData.confirm_password && passwordData.new_password === passwordData.confirm_password && passwordData.new_password.length >= 6 && (
                  <div className="flex items-center gap-2 text-xs text-green-400 mt-1">
                    <span>✅</span>
                    <span>Las contraseñas coinciden</span>
                  </div>
                )}
              </div>

              {/* Botón de actualizar */}
              <div className="pt-2">
                <button
                  onClick={handlePasswordChange}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  disabled={
                    loadingPassword || 
                    !passwordData.current_password || 
                    !passwordData.new_password || 
                    !passwordData.confirm_password ||
                    passwordData.new_password !== passwordData.confirm_password ||
                    passwordData.new_password.length < 6
                  }
                >
                  {loadingPassword ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <span>🔐</span>
                      Actualizar Contraseña
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de éxito para cambio de contraseña */}
      <SuccessModal
        isOpen={showPasswordSuccessModal}
        onClose={() => setShowPasswordSuccessModal(false)}
        message="Contraseña actualizada correctamente"
      />
    </div>
    </>
  )
}