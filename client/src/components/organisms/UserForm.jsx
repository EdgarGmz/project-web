import { useEffect, useState } from 'react'
import { userService } from '../../services/userService'
import { branchService } from '../../services/branchService'

export default function UserForm({ user, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'cashier',
    branch_id: '',
    password: '',
    confirm_password: '',
    is_active: true
  })
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Cargar sucursales
    const loadBranches = async () => {
      try {
        console.log('Loading branches...')
        const response = await branchService.getAll()
        console.log('Branches response:', response)
        if (response.success) {
          setBranches(response.data)
          console.log('Branches loaded:', response.data)
        } else {
          console.error('Failed to load branches:', response.message)
        }
      } catch (error) {
        console.error('Error loading branches:', error)
      }
    }
    loadBranches()

    // Si estamos editando un usuario, cargar sus datos
    if (user) {
      // Extraer solo el nombre de usuario del email para mostrarlo
      const emailUsername = user.email ? user.email.split('@')[0] : ''
      
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: emailUsername,
        role: user.pendingRole || user.role || 'cashier', // Usar pendingRole si existe
        branch_id: user.branch_id || '',
        password: '',
        confirm_password: '',
        is_active: user.is_active !== undefined ? user.is_active : true
      })
    }
  }, [user])

  const handleChange = e => {
    const { name, value } = e.target
    
    // Si cambia el rol, aplicar reglas de negocio
    if (name === 'role') {
      const newForm = { ...form, [name]: value }
      
      // Si el nuevo rol no requiere sucursal, limpiar branch_id
      if (value === 'admin' || value === 'owner') {
        newForm.branch_id = ''
      }
      
      setForm(newForm)
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleEmailBlur = e => {
    const { value } = e.target
    
    if (!value) return // Si está vacío, no hacer nada
    
    // Si el usuario escribió algo que contiene @, extraer solo el nombre de usuario
    if (value.includes('@')) {
      const username = value.split('@')[0]
      if (username) {
        setForm({ ...form, email: username })
      }
    }
    // Si no contiene @, mantener el valor tal como está (solo el nombre)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    // Asegurar que el email esté completo antes de enviar
    let finalEmail = form.email
    if (finalEmail && !finalEmail.includes('@')) {
      finalEmail = finalEmail + '@apexstore.com'
    }
    
    if (!user && form.password !== form.confirm_password) {
      setError('Las contraseñas no coinciden.')
      setLoading(false)
      return
    }
    
    try {
      const body = { ...form, email: finalEmail }
      
      // Para admins y owners, no enviar branch_id (se asigna automáticamente en backend)
      if (body.role === 'admin' || body.role === 'owner') {
        delete body.branch_id
      }
      
      // Limpiar branch_id si está vacío
      if (body.branch_id === '' || body.branch_id === null || body.branch_id === undefined) {
        delete body.branch_id
      }
      
      if (user) {
        // Si estamos editando, solo enviar contraseña si se proporciona
        if (!form.password) {
          delete body.password
          delete body.confirm_password
        }
      }
      
      // Debug: ver qué datos se están enviando
      console.log('Sending user data:', body)
      
      let response
      if (user) {
        // Actualizar usuario existente
        response = await userService.update(user.id, body)
      } else {
        // Crear nuevo usuario
        response = await userService.create(body)
      }
      
      if (response.success) {
        onSuccess()
      } else {
        setError(response.message || 'Error al guardar el usuario.')
      }
    } catch (error) {
      console.error('Error saving user:', error)
      setError('Error al guardar el usuario.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="card max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">
            {user ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h1>
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        {/* Mostrar mensaje informativo si hay un rol pendiente */}
        {user && user.pendingRole && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Para cambiar el rol a <strong>{user.pendingRole}</strong>, primero selecciona una sucursal específica (no CEDIS).
                </p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Nombre *</label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Apellido *</label>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">
              Nombre de usuario *
              <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                (será: @apexstore.com)
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleEmailBlur}
                placeholder="carlos"
                required
                className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-sm">@apexstore.com</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">Rol *</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
            >
              <option value="admin">Administrador</option>
              <option value="supervisor">Supervisor</option>
              <option value="cashier">Cajero</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Estado *</label>
            <select
              name="is_active"
              value={form.is_active}
              onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
              className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
            >
              <option value="true">🟢 Activo</option>
              <option value="false">🔴 Inactivo</option>
            </select>
          </div>
          {/* Sucursal - Solo para supervisores y cajeros */}
          {(form.role === 'supervisor' || form.role === 'cashier') && (
            <div>
              <label className="block mb-1 font-medium">Sucursal *</label>
              <select
                name="branch_id"
                value={form.branch_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
              >
                <option value="">Seleccionar sucursal</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Mensaje informativo para otros roles */}
          {(form.role === 'admin' || form.role === 'owner') && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                ℹ️ Los {form.role === 'owner' ? 'propietarios' : 'administradores'} se asignarán automáticamente al CEDIS (Centro de Distribución) ya que manejan varias zonas.
              </p>
            </div>
          )}
          {!user && (
            <>
              <div>
                <label className="block mb-1 font-medium">Contraseña *</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Confirmar Contraseña *</label>
                <input
                  type="password"
                  name="confirm_password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
                />
              </div>
            </>
          )}
          
          {user && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 Deja los campos de contraseña vacíos si no deseas cambiarla.
              </p>
              <div className="mt-2 space-y-2">
                <div>
                  <label className="block mb-1 font-medium">Nueva Contraseña (opcional)</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Confirmar Nueva Contraseña</label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
                  />
                </div>
              </div>
            </div>
          )}
          
          {error && <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</div>}
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="btn flex-1"
              disabled={loading}
            >
              {loading ? 'Guardando...' : user ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              className="px-4 py-2 border border-slate-600/30 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}