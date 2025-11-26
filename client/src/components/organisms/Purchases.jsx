import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { purchaseService } from '../../services/purchaseService'
import { branchService } from '../../services/branchService'
import { userService } from '../../services/userService'
import ConfirmModal from '../molecules/ConfirmModal'
import SuccessModal from '../molecules/SuccessModal'
import CancelledModal from '../molecules/CancelledModal'

export default function Purchases() {
  const { hasPermission, user } = useAuth()
  const [purchases, setPurchases] = useState([])
  const [branches, setBranches] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Estados para formulario
  const [showForm, setShowForm] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState(null)
  const [formData, setFormData] = useState({
    supplier_name: '',
    supplier_contact: '',
    supplier_phone: '',
    total_amount: '',
    purchase_date: new Date().toISOString().split('T')[0],
    invoice_number: '',
    status: 'pending',
    notes: ''
  })
  
  // Estado para modal de éxito
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' })
  // Estado para modal de cancelación
  const [cancelledModal, setCancelledModal] = useState({ isOpen: false, message: '' })
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Estados para filtros
  const [filterBranch, setFilterBranch] = useState('')
  const [filterUser, setFilterUser] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSearch, setFilterSearch] = useState('')
  
  // Estado para modal de confirmación
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, purchase: null })

  useEffect(() => {
    fetchBranches()
    fetchUsers()
  }, [])

  useEffect(() => {
    fetchPurchases()
  }, [currentPage, filterBranch, filterUser, filterStatus])

  const fetchPurchases = async () => {
    try {
      setLoading(true)
      setError('')
      
      const params = {
        page: currentPage,
        limit: 10
      }
      
      if (filterBranch) params.branch_id = filterBranch
      if (filterUser) params.user_id = filterUser
      if (filterStatus) params.status = filterStatus
      
      const queryParams = new URLSearchParams(params).toString()
      const response = await purchaseService.getAll(queryParams)
      
      if (response && response.success) {
        setPurchases(response.data || [])
        if (response.pagination) {
          setTotalPages(response.pagination.pages)
        }
      }
    } catch (error) {
      console.error('Error fetching purchases:', error)
      if (error.message && error.message.includes('403')) {
        setError('No tiene permisos para ver las compras.')
      } else {
        setError('Error al cargar las compras')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchBranches = async () => {
    try {
      const response = await branchService.getAll()
      if (response && response.success) {
        setBranches(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching branches:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll()
      if (response && response.success) {
        setUsers(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleClearFilters = () => {
    setFilterBranch('')
    setFilterUser('')
    setFilterStatus('')
    setFilterSearch('')
    setCurrentPage(1)
  }

  const resetForm = () => {
    setFormData({
      supplier_name: '',
      supplier_contact: '',
      supplier_phone: '',
      total_amount: '',
      purchase_date: new Date().toISOString().split('T')[0],
      invoice_number: '',
      status: 'pending',
      notes: ''
    })
    setEditingPurchase(null)
  }

  const handleOpenForm = (purchase = null) => {
    if (purchase) {
      setEditingPurchase(purchase)
      setFormData({
        supplier_name: purchase.supplier_name || '',
        supplier_contact: purchase.supplier_contact || '',
        supplier_phone: purchase.supplier_phone || '',
        total_amount: purchase.total_amount || '',
        purchase_date: purchase.purchase_date ? new Date(purchase.purchase_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        invoice_number: purchase.invoice_number || '',
        status: purchase.status || 'pending',
        notes: purchase.notes || ''
      })
    } else {
      resetForm()
    }
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const purchaseData = {
        ...formData,
        total_amount: parseFloat(formData.total_amount)
      }

      let response
      if (editingPurchase) {
        response = await purchaseService.update(editingPurchase.id, purchaseData)
      } else {
        response = await purchaseService.create(purchaseData)
      }

      if (response && response.success) {
        const message = editingPurchase ? 'Compra actualizada exitosamente' : 'Compra creada exitosamente'
        setSuccessModal({ isOpen: true, message })
        setShowForm(false)
        resetForm()
        fetchPurchases()
      }
    } catch (error) {
      console.error('Error saving purchase:', error)
      setError(error.response?.data?.message || error.message || 'Error al guardar la compra')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmModal.purchase) return

    try {
      setError('')
      const response = await purchaseService.delete(confirmModal.purchase.id)
      if (response && response.success) {
        setCancelledModal({ isOpen: true, message: 'Compra eliminada exitosamente' })
        setConfirmModal({ isOpen: false, purchase: null })
        fetchPurchases()
      }
    } catch (error) {
      console.error('Error deleting purchase:', error)
      setError(error.response?.data?.message || error.message || 'Error al eliminar la compra')
      setConfirmModal({ isOpen: false, purchase: null })
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Pendiente' },
      completed: { color: 'bg-green-500/20 text-green-400', label: 'Completada' },
      cancelled: { color: 'bg-red-500/20 text-red-400', label: 'Cancelada' }
    }
    return badges[status] || { color: 'bg-gray-500/20 text-gray-400', label: status }
  }

  // Filtrar compras por búsqueda de texto (cliente-side)
  const filteredPurchases = purchases.filter(purchase => {
    if (!filterSearch) return true
    const searchLower = filterSearch.toLowerCase()
    const supplierName = purchase.supplier_name?.toLowerCase() || ''
    const invoiceNumber = purchase.invoice_number?.toLowerCase() || ''
    return supplierName.includes(searchLower) || invoiceNumber.includes(searchLower)
  })

  // Calcular estadísticas de la página actual
  const totalPurchases = filteredPurchases.length
  const totalAmount = filteredPurchases.reduce((sum, purchase) => sum + Number(purchase.total_amount || 0), 0)
  const pendingPurchases = filteredPurchases.filter(p => p.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Compras</h1>
          <p className="text-muted">Gestión de compras a proveedores</p>
        </div>
        {hasPermission(['owner', 'admin']) && (
          <button 
            onClick={() => handleOpenForm()}
            className="btn"
          >
            + Nueva Compra
          </button>
        )}
      </div>

      {/* Mensajes */}
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

      {/* Filtros */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filtros</h2>
          {(filterBranch || filterUser || filterStatus || filterSearch) && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-accent hover:opacity-80 transition flex items-center gap-2"
              title="Limpiar filtros"
            >
              🗑️ Limpiar filtros
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Buscar</label>
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Proveedor o factura..."
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sucursal</label>
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            >
              <option value="">Todas las sucursales</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Usuario</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            >
              <option value="">Todos los usuarios</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Estado</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="completed">Completada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-semibold text-accent">{totalPurchases}</div>
          <div className="text-muted">Total Compras</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-green-400">
            ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-muted">Monto Total</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-yellow-400">{pendingPurchases}</div>
          <div className="text-muted">Pendientes</div>
        </div>
      </div>

      {/* Lista de compras */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-muted">Cargando compras...</div>
        ) : filteredPurchases.length === 0 ? (
          <div className="text-center py-8 text-muted">
            No hay compras registradas
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-600/20">
                    <th className="text-left py-3 px-4">Fecha</th>
                    <th className="text-left py-3 px-4">Proveedor</th>
                    <th className="text-left py-3 px-4">Contacto</th>
                    <th className="text-left py-3 px-4">Factura</th>
                    <th className="text-left py-3 px-4">Sucursal</th>
                    <th className="text-left py-3 px-4">Usuario</th>
                    <th className="text-left py-3 px-4">Total</th>
                    <th className="text-left py-3 px-4">Estado</th>
                    {hasPermission(['owner', 'admin']) && (
                      <th className="text-left py-3 px-4">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b border-slate-600/10 last:border-0 hover:bg-surface/50 transition">
                      <td className="py-3 px-4">
                        <div className="text-sm">{new Date(purchase.purchase_date || purchase.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{purchase.supplier_name}</div>
                        {purchase.supplier_phone && (
                          <div className="text-muted text-xs">{purchase.supplier_phone}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted">
                        {purchase.supplier_contact || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-mono text-sm">{purchase.invoice_number || 'Sin factura'}</div>
                      </td>
                      <td className="py-3 px-4 text-sm">{purchase.Branch?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-muted text-sm">
                        {purchase.User ? `${purchase.User.first_name} ${purchase.User.last_name}` : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold">
                          ${Number(purchase.total_amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(purchase.status).color}`}>
                          {getStatusBadge(purchase.status).label}
                        </span>
                      </td>
                      {hasPermission(['owner', 'admin']) && (
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenForm(purchase)}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => setConfirmModal({ isOpen: true, purchase })}
                              className="text-red-400 hover:text-red-300 text-sm"
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-600/20">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-slate-600/30 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-sm text-muted">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-slate-600/30 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {editingPurchase ? 'Editar Compra' : 'Nueva Compra'}
              </h3>
              <button 
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }} 
                className="text-2xl hover:opacity-70"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Proveedor *</label>
                  <input
                    type="text"
                    value={formData.supplier_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier_name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                    placeholder="Nombre del proveedor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Contacto</label>
                  <input
                    type="text"
                    value={formData.supplier_contact}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier_contact: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                    placeholder="Nombre del contacto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.supplier_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier_phone: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                    placeholder="Teléfono del proveedor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Monto Total *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.total_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, total_amount: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fecha de Compra *</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Número de Factura</label>
                  <input
                    type="text"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                    placeholder="Número de factura"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Estado *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  placeholder="Notas adicionales sobre la compra"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  className="px-4 py-2 border border-slate-600/30 rounded-md hover:bg-surface/50"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : (editingPurchase ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, purchase: null })}
        onConfirm={handleDelete}
        title="Eliminar Compra"
        message={`¿Estás seguro de que deseas eliminar la compra de ${confirmModal.purchase?.supplier_name}? Esta acción no se puede deshacer.`}
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
  )
}