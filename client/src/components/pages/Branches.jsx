import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { branchService } from '../../services/branchService'
import { userService } from '../../services/userService'
import ConfirmModal from '../molecules/ConfirmModal'
import SuccessModal from '../molecules/SuccessModal'
import CancelledModal from '../molecules/CancelledModal'
import LoadingModal from '../molecules/LoadingModal'
import NotFound from '../molecules/NotFound'

export default function Branches() {
  const [branches, setBranches] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingBranch, setEditingBranch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' })
  const [cancelledModal, setCancelledModal] = useState({ isOpen: false, message: '' })
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
  
  // Estado para modal de confirmación
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, branch: null })

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
        setSuccessModal({ 
          isOpen: true, 
          message: editingBranch ? 'Sucursal actualizada exitosamente' : 'Sucursal creada exitosamente' 
        })
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
    setConfirmModal({
      isOpen: true,
      branch: branch
    })
  }

  const confirmDelete = async () => {
    const branch = confirmModal.branch
    setConfirmModal({ isOpen: false, branch: null })
    
    try {
      setError('')
      const response = await branchService.delete(branch.id)
      if (response && response.success) {
        setCancelledModal({ isOpen: true, message: 'Sucursal eliminada exitosamente' })
        fetchBranches()
      }
    } catch (error) {
      console.error('Error deleting branch:', error)
      setError(error.message || 'Error al eliminar la sucursal. Puede que tenga datos asociados.')
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
        setSuccessModal({ isOpen: true, message: 'Supervisores asignados exitosamente' })
        fetchBranches()
        setShowAssignModal(false)
      }
    } catch (error) {
      console.error('Error assigning users:', error)
      setError(error.message || 'Error al asignar supervisores.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <LoadingModal isOpen={loading} message="Cargando sucursales..." />
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
          {hasPermission(['owner']) && (
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
        <div className="card text-center relative overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="text-4xl mb-2">🏢</div>
            <div className="text-3xl font-bold text-accent mb-1">{branches.length}</div>
            <div className="text-muted font-medium">Total Sucursales</div>
          </div>
        </div>
        <div className="card text-center relative overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-3xl font-bold text-green-400 mb-1">
              {branches.filter(b => b.is_active).length}
            </div>
            <div className="text-muted font-medium">Activas</div>
          </div>
        </div>
        <div className="card text-center relative overflow-hidden group hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative">
            <div className="text-4xl mb-2">⛔</div>
            <div className="text-3xl font-bold text-red-400 mb-1">
              {branches.filter(b => !b.is_active).length}
            </div>
            <div className="text-muted font-medium">Inactivas</div>
          </div>
        </div>
      </div>

      {/* Lista de sucursales */}
      {branches.length === 0 ? (
        <NotFound 
          message="No hay sucursales registradas"
          subtitle={searchTerm ? "No se encontraron sucursales con ese término de búsqueda" : "Crea la primera sucursal para comenzar"}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
          <div 
            key={branch.id} 
            className={`card group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
              branch.is_active 
                ? 'border-l-4 border-l-green-500' 
                : 'border-l-4 border-l-red-500 opacity-75'
            }`}
          >
            {/* Header con gradiente */}
            <div className={`relative p-4 mb-4 rounded-t-lg ${
              branch.is_active 
                ? 'bg-gradient-to-r from-accent/20 via-accent/10 to-transparent' 
                : 'bg-gradient-to-r from-red-500/20 via-red-500/10 to-transparent'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-2xl shadow-lg transition-transform group-hover:scale-110 ${
                    branch.is_active 
                      ? 'bg-gradient-to-br from-accent/30 to-accent/10 border-2 border-accent/40' 
                      : 'bg-gradient-to-br from-red-500/30 to-red-500/10 border-2 border-red-500/40'
                  }`}>
                    🏢
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg mb-1 truncate">{branch.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        branch.is_active 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {branch.is_active ? '✓ Activa' : '✗ Inactiva'}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-slate-600/30 text-muted rounded font-mono">
                        {branch.code}
                      </span>
                    </div>
                  </div>
                </div>
                {hasPermission(['owner']) && (
                  <div className="flex gap-1 ml-2">
                    
                    <button
                      onClick={() => handleEdit(branch)}
                      className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all hover:scale-110"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(branch)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all hover:scale-110"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Contenido */}
            <div className="px-4 pb-4 space-y-3">
              {/* Información de contacto */}
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface/50 transition-colors">
                  <span className="text-lg mt-0.5">📍</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted mb-0.5">Dirección</div>
                    <div className="text-sm font-medium leading-tight">
                      {branch.address}
                    </div>
                    <div className="text-xs text-muted mt-1">
                      {branch.city}, {branch.state} {branch.postal_code}
                    </div>
                  </div>
                </div>

                {branch.phone && (
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface/50 transition-colors">
                    <span className="text-lg">📞</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted mb-0.5">Teléfono</div>
                      <div className="text-sm font-medium">{branch.phone}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface/50 transition-colors">
                  <span className="text-lg">📧</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted mb-0.5">Email</div>
                    <div className="text-sm font-medium truncate">{branch.email}</div>
                  </div>
                </div>
              </div>

              {/* Personal asignado */}
              <div className="mt-4 pt-4 border-t border-slate-600/20">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">👥</span>
                  <span className="text-sm font-semibold text-muted">Personal Asignado</span>
                  <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                    branch.users && branch.users.length > 0
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-slate-600/20 text-muted'
                  }`}>
                    {branch.users?.length || 0}
                  </span>
                </div>
                {branch.users && branch.users.length > 0 ? (
                  <div className="space-y-2">
                    {branch.users.slice(0, 3).map(user => (
                      <div 
                        key={user.id} 
                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-600/10 hover:bg-slate-600/20 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-blue-500/30 flex items-center justify-center text-xs font-bold">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-xs text-muted truncate">{user.email}</div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          user.role === 'supervisor' 
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                            : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}>
                          {user.role === 'supervisor' ? '👔 Supervisor' : '💰 Cajero'}
                        </span>
                      </div>
                    ))}
                    {branch.users.length > 3 && (
                      <div className="text-xs text-center text-muted pt-1">
                        +{branch.users.length - 3} más
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-3 text-sm text-muted bg-slate-600/10 rounded-lg">
                    <span className="opacity-50">Sin personal asignado</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-surface border border-slate-600/30 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
            {/* Header con gradiente */}
            <div className="relative bg-gradient-to-r from-accent/20 via-accent/10 to-transparent border-b border-slate-600/30 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent/30 to-accent/10 border-2 border-accent/40 flex items-center justify-center text-2xl">
                    🏢
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      {editingBranch ? 'Modifica la información de la sucursal' : 'Completa los datos para crear una nueva sucursal'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowForm(false)} 
                  className="h-10 w-10 rounded-lg bg-slate-600/20 hover:bg-slate-600/30 flex items-center justify-center text-xl transition-colors hover:scale-110"
                  title="Cerrar"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenido del formulario */}
            <div className="overflow-y-auto flex-1 px-6 py-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información básica */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📋</span>
                    <h4 className="text-sm font-semibold text-muted uppercase tracking-wide">Información Básica</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <span>🏷️</span>
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        placeholder="Sucursal Centro"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <span>🔖</span>
                        Código *
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        required
                        placeholder="SUC-001"
                        maxLength="20"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all placeholder:text-slate-500 uppercase font-mono"
                      />
                      <p className="text-xs text-muted flex items-center gap-1">
                        <span>ℹ️</span>
                        3-20 caracteres en mayúsculas
                      </p>
                    </div>
                  </div>
                </div>

                {/* Dirección */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📍</span>
                    <h4 className="text-sm font-semibold text-muted uppercase tracking-wide">Ubicación</h4>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                      <span>🏠</span>
                      Dirección *
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      required
                      placeholder="Av. Principal #123, Col. Centro"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all placeholder:text-slate-500 resize-none"
                      rows="2"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <span>🏙️</span>
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        required
                        placeholder="Ciudad de México"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <span>🗺️</span>
                        Estado *
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        required
                        placeholder="CDMX"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <span>📮</span>
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        value={formData.postal_code}
                        onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                        required
                        placeholder="12345"
                        pattern="\d{5}(-\d{4})?"
                        maxLength="10"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all placeholder:text-slate-500 font-mono"
                      />
                      <p className="text-xs text-muted flex items-center gap-1">
                        <span>ℹ️</span>
                        Formato: 12345 o 12345-6789
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contacto */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📞</span>
                    <h4 className="text-sm font-semibold text-muted uppercase tracking-wide">Contacto</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <span>☎️</span>
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+52 55 1234 5678"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <span>📧</span>
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        placeholder="sucursal@ejemplo.com"
                        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Estado */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">⚙️</span>
                    <h4 className="text-sm font-semibold text-muted uppercase tracking-wide">Estado</h4>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-lg border border-slate-600/20">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="h-5 w-5 rounded border-slate-600 bg-slate-800 text-accent focus:ring-2 focus:ring-accent/50 focus:ring-offset-0 cursor-pointer transition-all"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{formData.is_active ? '✅' : '⭕'}</span>
                        <span className="text-sm font-medium text-white group-hover:text-accent transition-colors">
                          Sucursal activa
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4 border-t border-slate-600/30">
                  <button 
                    type="submit" 
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2" 
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <span>{editingBranch ? '💾' : '✨'}</span>
                        {editingBranch ? 'Actualizar Sucursal' : 'Crear Sucursal'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 border border-slate-600/30 hover:bg-slate-700/30 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, branch: null })}
        title="Eliminar Sucursal"
        message={`¿Estás seguro de que quieres eliminar la sucursal "${confirmModal.branch?.name}"?`}
        type="danger"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        message={successModal.message}
      />

      {/* Modal de cancelación */}
      <CancelledModal
        isOpen={cancelledModal.isOpen}
        onClose={() => setCancelledModal({ isOpen: false, message: '' })}
        message={cancelledModal.message}
      />
    </div>
    </>
  )
}
