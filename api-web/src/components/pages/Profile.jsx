import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function Profile() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  })
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert('Las contraseñas no coinciden')
      return
    }

    try {
      const response = await fetch('http://localhost:3000/api/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.new
        })
      })
      
      if (response.ok) {
        setPasswordData({ current: '', new: '', confirm: '' })
        alert('Contraseña actualizada correctamente')
      }
    } catch (error) {
      console.error('Error updating password:', error)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">Mi Perfil</h1>
        <p className="text-muted">Administra tu información personal</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar y rol */}
        <div className="card text-center">
          <div className="h-24 w-24 rounded-full bg-accent/20 border-2 border-accent/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
          <h3 className="font-semibold">{user?.first_name} {user?.last_name}</h3>
          <p className="text-accent capitalize">{user?.role}</p>
          <p className="text-muted text-sm mt-2">{user?.email}</p>
        </div>

        {/* Información personal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Información Personal</h3>
              <button
                onClick={() => editing ? handleSave() : setEditing(true)}
                disabled={loading}
                className="btn text-sm"
              >
                {editing ? (loading ? 'Guardando...' : 'Guardar') : 'Editar'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  disabled={!editing}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Apellido</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  disabled={!editing}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!editing}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={!editing}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Cambiar contraseña */}
          <div className="card">
            <h3 className="font-semibold mb-4">Cambiar Contraseña</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Contraseña Actual</label>
                <input
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nueva Contraseña</label>
                <input
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirmar Contraseña</label>
                <input
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                />
              </div>
              <button
                onClick={handlePasswordChange}
                className="btn"
                disabled={!passwordData.current || !passwordData.new || !passwordData.confirm}
              >
                Actualizar Contraseña
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}