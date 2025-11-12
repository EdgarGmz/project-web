import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { branchService } from '../../services/branchService'
import { userService } from '../../services/userService'

export default function Branches() {
  const [branches, setBranches] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [users, setUsers] = useState([])
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])
  const { hasPermission } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    phone: '',
    email: '',
    manager_id: '',
    is_active: true
  })
  
  // Estados para paginación y búsqueda
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchBranches()
    fetchUsers()
  }, [currentPage, searchTerm])

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll()
      if (response && response.success) {
        // Filtrar solo supervisores y cajeros que pueden ser asignados a sucursales
        const availableUsers = response.data.filter(user => 
          ['supervisor', 'cashier'].includes(user.role)
        )
        setUsers(availableUsers)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchBranches = async () => {
    try {
      setError('')
      const response = await branchService.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm
      })
      if (response && response.success) {
        setBranches(response.data || [])
        if (response.pagination) {
          setTotalPages(response.pagination.pages)
        }
      }
    } catch (error) {
      console.error('Error fetching branches:', error)
      setError('Error al cargar las sucursales.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      setError('')
      
      // Validar código postal
      if (!/^\d{5}(-\d{4})?$/.test(formData.postal_code)) {
        setError('El código postal debe tener el formato: 12345 o 12345-6789')
        setSaving(false)
        return
      }
      
      // Validar email
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('El email no tiene un formato válido')
        setSaving(false)
        return
      }
      
      // Preparar datos para enviar (eliminar campos vacíos opcionales)
      const dataToSend = { ...formData }
      if (!dataToSend.manager_id) {
        delete dataToSend.manager_id
      }
      if (!dataToSend.phone) {
        delete dataToSend.phone
      }
      
      let response
      if (editingBranch) {
        response = await branchService.update(editingBranch.id, dataToSend)
      } else {
        response = await branchService.create(dataToSend)
      }
      
      if (response && response.success) {
        fetchBranches()
        setShowForm(false)
        setEditingBranch(null)
        setFormData({
          name: '',
          code: '',
          address: '',
          city: '',
          state: '',
          postal_code: '',
          phone: '',
          email: '',
          manager_id: '',
          is_active: true
        })
        setSuccess(editingBranch ? 'Sucursal actualizada exitosamente' : 'Sucursal creada exitosamente')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      console.error('Error saving branch:', error)
      setError(error.message || 'Error al guardar la sucursal.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (branch) => {
    setEditingBranch(branch)
    setFormData({
      name: branch.name || '',
      code: branch.code || '',
      address: branch.address || '',
      city: branch.city || '',
      state: branch.state || '',
      postal_code: branch.postal_code || '',
      phone: branch.phone || '',
      email: branch.email || '',
      manager_id: branch.manager_id || '',
      is_active: branch.is_active !== undefined ? branch.is_active : true
    })
    setShowForm(true)
  }

  const handleDelete = async (branch) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la sucursal "${branch.name}"?`)) {
      try {
        setError('')
        const response = await branchService.delete(branch.id)
        if (response && response.success) {
          fetchBranches()
          setSuccess('Sucursal eliminada exitosamente')
          setTimeout(() => setSuccess(''), 3000)
        }
      } catch (error) {
        console.error('Error deleting branch:', error)
        setError(error.message || 'Error al eliminar la sucursal. Puede que tenga datos asociados.')
      }
    }
  }

  const handleAssignUsers = (branch) => {
    setSelectedBranch(branch)
    // Pre-seleccionar usuarios ya asignados
    const currentUserIds = branch.users?.map(user => user.id) || []
    setSelectedUsers(currentUserIds)
    setShowAssignModal(true)
  }

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSubmitAssignment = async () => {
    try {
      setError('')
      setSaving(true)
      const response = await branchService.assignUsers(selectedBranch.id, selectedUsers)
      if (response && response.success) {
        fetchBranches()
        setShowAssignModal(false)
        setSuccess('Supervisores asignados exitosamente')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      console.error('Error assigning users:', error)
      setError(error.message || 'Error al asignar supervisores.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="card text-center py-8">Cargando sucursales...</div>
  }

  return (
    <div className="space-y-6">
      {/* Mensajes de éxito y error */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-800">{success}</div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Sucursales</h1>
          <p className="text-muted">Gestiona las sucursales de la franquicia</p>
        </div>
        <div className="flex gap-3 items-center">
          {/* Buscador */}
          <input
            type="text"
            placeholder="Buscar sucursal..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
          />
          {hasPermission(['owner', 'admin']) && (
            <button onClick={() => {
              setEditingBranch(null)
              setFormData({
                name: '',
                code: '',
                address: '',
                city: '',
                state: '',
                postal_code: '',
                phone: '',
                email: '',
                manager_id: '',
                is_active: true
              })
              setShowForm(true)
            }} className="btn">
              + Nueva Sucursal
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-semibold text-accent">{branches.length}</div>
          <div className="text-muted">Total Sucursales</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-green-400">
            {branches.filter(b => b.is_active).length}
          </div>
          <div className="text-muted">Activas</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-red-400">
            {branches.filter(b => !b.is_active).length}
          </div>
          <div className="text-muted">Inactivas</div>
        </div>
      </div>

      {/* Lista de sucursales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <div key={branch.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-accent/20 border border-accent/30 flex items-center justify-center">
                  🏢
                </div>
                <div>
                  <h3 className="font-semibold">{branch.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${
                    branch.is_active 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {branch.is_active ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>
              {hasPermission(['owner', 'admin']) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAssignUsers(branch)}
                    className="text-green-400 hover:opacity-80"
                    title="Asignar Supervisores"
                  >
                    👥
                  </button>
                  <button
                    onClick={() => handleEdit(branch)}
                    className="text-blue-400 hover:opacity-80"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(branch)}
                    className="text-red-400 hover:opacity-80"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted">
                <span>🏷️</span>
                <span className="font-medium">{branch.code}</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <span>📍</span>
                <span>{branch.address}, {branch.city}, {branch.state}</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <span>�</span>
                <span>{branch.postal_code}</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <span>�📞</span>
                <span>{branch.phone || 'Sin teléfono'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <span>📧</span>
                <span>{branch.email}</span>
              </div>
              <div className="text-muted mt-3">
                <div className="flex items-center gap-2 mb-1">
                  <span>👥</span>
                  <span className="font-medium">Personal asignado:</span>
                </div>
                {branch.users && branch.users.length > 0 ? (
                  <div className="space-y-1 ml-6">
                    {branch.users.map(user => (
                      <div key={user.id} className="text-sm">
                        {user.first_name} {user.last_name} 
                        <span className="text-xs ml-2 px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                          {user.role}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm ml-6 text-muted">Sin personal asignado</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-slate-600/30 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface"
          >
            ← Anterior
          </button>
          <span className="text-sm text-muted">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-slate-600/30 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-2xl hover:opacity-70">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Sucursal Centro"
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Código *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    required
                    placeholder="SUC-001"
                    maxLength="20"
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md uppercase"
                  />
                  <p className="text-xs text-muted mt-1">3-20 caracteres en mayúsculas</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Dirección *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  required
                  placeholder="Av. Principal #123, Col. Centro"
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  rows="2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ciudad *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    required
                    placeholder="Ciudad de México"
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estado *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    required
                    placeholder="CDMX"
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Código Postal *</label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                    required
                    placeholder="12345"
                    pattern="\d{5}(-\d{4})?"
                    maxLength="10"
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                  <p className="text-xs text-muted mt-1">Formato: 12345 o 12345-6789</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+52 55 1234 5678"
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    placeholder="sucursal@ejemplo.com"
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Sucursal activa</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="btn flex-1" 
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : (editingBranch ? 'Actualizar' : 'Crear')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-slate-600/30 rounded-md hover:bg-surface"
                  disabled={saving}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal asignar supervisores */}
      {showAssignModal && selectedBranch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                Asignar Supervisores - {selectedBranch.name}
              </h3>
              <button onClick={() => setShowAssignModal(false)}>✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted mb-4">
                  Selecciona los supervisores y cajeros que trabajarán en esta sucursal:
                </p>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {users.map(user => (
                    <label key={user.id} className="flex items-center gap-3 p-2 rounded hover:bg-surface">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserToggle(user.id)}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-muted">{user.email}</div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        user.role === 'supervisor' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {user.role}
                      </span>
                    </label>
                  ))}
                  
                  {users.length === 0 && (
                    <div className="text-center py-4 text-muted">
                      No hay supervisores o cajeros disponibles
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleSubmitAssignment}
                  className="btn flex-1" 
                  disabled={saving}
                >
                  {saving ? 'Asignando...' : 'Asignar Supervisores'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-slate-600/30 rounded-md"
                  disabled={saving}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}