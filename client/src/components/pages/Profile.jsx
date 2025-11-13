import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function Profile() {
  const { user, login } = useAuth()
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
  const [passwordSuccess, setPasswordSuccess] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setEditing(false)
        setSuccess('Perfil actualizado correctamente')
        
        // Actualizar los datos del usuario en el contexto
        const updatedUser = { ...user, ...formData }
        localStorage.setItem('userData', JSON.stringify(updatedUser))
        
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.message || 'Error al actualizar el perfil')
        setTimeout(() => setError(''), 5000)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Error de conexión al actualizar el perfil')
      setTimeout(() => setError(''), 5000)
    } finally {
      setLoading(false)
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
    setPasswordSuccess('')
    
    if (!validatePassword()) {
      setTimeout(() => setPasswordError(''), 5000)
      return
    }

    setLoadingPassword(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
        setPasswordSuccess('Contraseña actualizada correctamente')
        setTimeout(() => setPasswordSuccess(''), 3000)
      } else {
        setPasswordError(data.message || 'Error al cambiar la contraseña')
        setTimeout(() => setPasswordError(''), 5000)
      }
    } catch (error) {
      console.error('Error updating password:', error)
      setPasswordError('Error de conexión al cambiar la contraseña')
      setTimeout(() => setPasswordError(''), 5000)
    } finally {
      setLoadingPassword(false)
    }
  }

  return (
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
            <h3 className="font-semibold mb-4">Cambiar Contraseña</h3>
            
            {passwordSuccess && (
              <div className="mb-4 bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-3 rounded-md">
                {passwordSuccess}
              </div>
            )}
            
            {passwordError && (
              <div className="mb-4 bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-md">
                {passwordError}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Contraseña Actual *</label>
                <input
                  type="password"
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  placeholder="Ingresa tu contraseña actual"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nueva Contraseña *</label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  placeholder="Mínimo 6 caracteres"
                />
                {passwordData.new_password && passwordData.new_password.length < 6 && (
                  <p className="text-xs text-yellow-400 mt-1">La contraseña debe tener al menos 6 caracteres</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirmar Nueva Contraseña *</label>
                <input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  placeholder="Repite la nueva contraseña"
                />
                {passwordData.confirm_password && passwordData.new_password !== passwordData.confirm_password && (
                  <p className="text-xs text-red-400 mt-1">Las contraseñas no coinciden</p>
                )}
              </div>
              <button
                onClick={handlePasswordChange}
                className="w-full btn-primary"
                disabled={
                  loadingPassword || 
                  !passwordData.current_password || 
                  !passwordData.new_password || 
                  !passwordData.confirm_password ||
                  passwordData.new_password !== passwordData.confirm_password
                }
              >
                {loadingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}