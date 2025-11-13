import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { purchaseService } from '../../services/purchaseService'
import { branchService } from '../../services/branchService'
import { userService } from '../../services/userService'

export default function Purchases() {
  const { hasPermission } = useAuth()
  const [purchases, setPurchases] = useState([])
  const [branches, setBranches] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Estados para filtros
  const [filterBranch, setFilterBranch] = useState('')
  const [filterUser, setFilterUser] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSearch, setFilterSearch] = useState('')

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
          <h3 className="font-semibold">Filtros</h3>
          <button
            onClick={handleClearFilters}
            className="text-sm text-accent hover:opacity-80 transition flex items-center gap-2"
          >
            <span>✖</span> Limpiar filtros
          </button>
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
    </div>
  )
}