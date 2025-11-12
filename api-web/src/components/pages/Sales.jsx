import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { saleService } from '../../services/saleServices'
import { branchService } from '../../services/branchService'
import { userService } from '../../services/userService'

export default function Sales() {
  const { hasPermission } = useAuth()
  const [sales, setSales] = useState([])
  const [branches, setBranches] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Estados para filtros
  const [filterBranch, setFilterBranch] = useState('')
  const [filterUser, setFilterUser] = useState('')
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  useEffect(() => {
    fetchBranches()
    fetchUsers()
  }, []) // Solo cargar una vez al montar

  useEffect(() => {
    fetchSales()
  }, [currentPage, filterBranch, filterUser, filterPaymentMethod, filterDateFrom, filterDateTo])

  const fetchSales = async () => {
    try {
      setLoading(true)
      setError('')
      
      const params = {
        page: currentPage,
        limit: 10
      }
      
      if (filterBranch) params.branch_id = filterBranch
      if (filterUser) params.user_id = filterUser
      if (filterDateFrom) params.date_from = filterDateFrom
      if (filterDateTo) params.date_to = filterDateTo
      
      const queryParams = new URLSearchParams(params).toString()
      const response = await saleService.getAll(queryParams)
      
      if (response && response.success) {
        setSales(response.data || [])
        if (response.pagination) {
          setTotalPages(response.pagination.pages)
        }
      }
    } catch (error) {
      console.error('Error fetching sales:', error)
      setError('Error al cargar las ventas')
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

  const viewSaleDetails = async (saleId) => {
    try {
      const response = await saleService.getById(saleId)
      if (response && response.success) {
        setSelectedSale(response.data)
        setShowDetails(true)
      }
    } catch (error) {
      console.error('Error fetching sale details:', error)
      setError('Error al cargar los detalles de la venta')
    }
  }

  const handleClearFilters = () => {
    setFilterBranch('')
    setFilterUser('')
    setFilterPaymentMethod('')
    setFilterDateFrom('')
    setFilterDateTo('')
    setCurrentPage(1)
  }

  const getPaymentMethodIcon = (method) => {
    const icons = {
      cash: '💵',
      card: '💳',
      transfer: '🏦'
    }
    return icons[method] || '💰'
  }

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
      mixed: 'Mixto'
    }
    return labels[method] || method
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Pendiente' },
      completed: { color: 'bg-green-500/20 text-green-400', label: 'Completada' },
      cancelled: { color: 'bg-red-500/20 text-red-400', label: 'Cancelada' },
      refunded: { color: 'bg-blue-500/20 text-blue-400', label: 'Reembolsada' }
    }
    return badges[status] || { color: 'bg-gray-500/20 text-gray-400', label: status }
  }

  // Calcular estadísticas de la página actual
  const totalSales = sales.length
  const totalAmount = sales.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0)
  const averageTicket = totalSales > 0 ? totalAmount / totalSales : 0

  if (loading) {
    return <div className="card text-center py-8">Cargando ventas...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ventas</h1>
          <p className="text-muted">Historial y gestión de ventas</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <label className="block text-sm font-medium mb-2">Cajero</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            >
              <option value="">Todos los cajeros</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Método de pago</label>
            <select
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            >
              <option value="">Todos los métodos</option>
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
              <option value="mixed">Mixto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fecha desde</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fecha hasta</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-semibold text-accent">{totalSales}</div>
          <div className="text-muted">Total Ventas</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-green-400">
            ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-muted">Monto Total</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-blue-400">
            ${averageTicket.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-muted">Ticket Promedio</div>
        </div>
      </div>

      {/* Lista de ventas */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-muted">Cargando ventas...</div>
        ) : sales.length === 0 ? (
          <div className="text-center py-8 text-muted">
            No hay ventas registradas
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-600/20">
                    <th className="text-left py-3 px-4">Referencia</th>
                    <th className="text-left py-3 px-4">Fecha</th>
                    <th className="text-left py-3 px-4">Cliente</th>
                    <th className="text-left py-3 px-4">Sucursal</th>
                    <th className="text-left py-3 px-4">Cajero</th>
                    <th className="text-left py-3 px-4">Items</th>
                    <th className="text-left py-3 px-4">Total</th>
                    <th className="text-left py-3 px-4">Pago</th>
                    <th className="text-left py-3 px-4">Estado</th>
                    <th className="text-left py-3 px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-b border-slate-600/10 last:border-0 hover:bg-surface/50 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono text-sm">{sale.transaction_reference || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">{new Date(sale.sale_date || sale.created_at).toLocaleDateString()}</div>
                        <div className="text-muted text-xs">{new Date(sale.sale_date || sale.created_at).toLocaleTimeString()}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {sale.Customer ? `${sale.Customer.first_name} ${sale.Customer.last_name}` : 'Cliente general'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">{sale.branch?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-muted text-sm">
                        {sale.User ? `${sale.User.first_name} ${sale.User.last_name}` : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-accent/20 text-accent px-2 py-1 rounded text-xs">
                          {sale.SaleItems?.length || 0} items
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold">
                          ${Number(sale.total_amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span>{getPaymentMethodIcon(sale.payment_method)}</span>
                          <span className="text-sm">{getPaymentMethodLabel(sale.payment_method)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(sale.status).color}`}>
                          {getStatusBadge(sale.status).label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => viewSaleDetails(sale.id)}
                          className="text-accent hover:opacity-80 transition"
                          title="Ver detalles"
                        >
                          👁️
                        </button>
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

      {/* Modal de detalles */}
      {showDetails && selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-3xl w-full max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                Detalles de Venta
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-2xl hover:opacity-70 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Información general */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted">Referencia</div>
                  <div className="font-mono">{selectedSale.transaction_reference}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted">Fecha y hora</div>
                  <div>{new Date(selectedSale.sale_date || selectedSale.created_at).toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted">Cliente</div>
                  <div>
                    {selectedSale.Customer 
                      ? `${selectedSale.Customer.first_name} ${selectedSale.Customer.last_name}`
                      : 'Cliente general'
                    }
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted">Cajero</div>
                  <div>
                    {selectedSale.User 
                      ? `${selectedSale.User.first_name} ${selectedSale.User.last_name}`
                      : 'N/A'
                    }
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted">Sucursal</div>
                  <div>{selectedSale.branch?.name || 'N/A'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted">Método de pago</div>
                  <div className="flex items-center gap-2">
                    <span>{getPaymentMethodIcon(selectedSale.payment_method)}</span>
                    <span>{getPaymentMethodLabel(selectedSale.payment_method)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted">Estado</div>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(selectedSale.status).color}`}>
                    {getStatusBadge(selectedSale.status).label}
                  </span>
                </div>
              </div>

              {/* Items vendidos */}
              <div>
                <h4 className="font-semibold mb-3">Productos vendidos</h4>
                <div className="border border-slate-600/20 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-surface/50">
                      <tr>
                        <th className="text-left py-2 px-3 text-sm">Producto</th>
                        <th className="text-left py-2 px-3 text-sm">SKU</th>
                        <th className="text-right py-2 px-3 text-sm">Cantidad</th>
                        <th className="text-right py-2 px-3 text-sm">Precio Unit.</th>
                        <th className="text-right py-2 px-3 text-sm">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.SaleItems?.map((item, index) => (
                        <tr key={index} className="border-t border-slate-600/10">
                          <td className="py-2 px-3">{item.Product?.name || 'N/A'}</td>
                          <td className="py-2 px-3 text-muted text-sm">{item.Product?.sku || 'N/A'}</td>
                          <td className="py-2 px-3 text-right">{item.quantity}</td>
                          <td className="py-2 px-3 text-right">
                            ${Number(item.unit_price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-3 text-right font-medium">
                            ${(Number(item.unit_price) * Number(item.quantity)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totales */}
              <div className="bg-surface/50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${Number(selectedSale.subtotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {selectedSale.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-muted">
                      <span>Descuento:</span>
                      <span>-${Number(selectedSale.discount_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-muted">
                    <span>IVA ({(selectedSale.tax_rate * 100).toFixed(0)}%):</span>
                    <span>${Number(selectedSale.tax_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-slate-600/20 pt-2">
                    <span>Total:</span>
                    <span className="text-accent">
                      ${Number(selectedSale.total_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {selectedSale.notes && (
                <div className="bg-surface/50 p-4 rounded-lg">
                  <div className="text-sm text-muted mb-1">Notas:</div>
                  <div>{selectedSale.notes}</div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDetails(false)}
                  className="btn flex-1"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}