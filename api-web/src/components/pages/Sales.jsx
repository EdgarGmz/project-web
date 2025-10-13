import { useEffect, useState } from 'react'

export default function Sales() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    cashier: '',
    paymentMethod: ''
  })
  const [stats, setStats] = useState({
    totalSales: 0,
    totalAmount: 0,
    averageTicket: 0,
    topProducts: []
  })

  useEffect(() => {
    fetchSales()
    fetchStats()
  }, [filters])

  const fetchSales = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`http://localhost:3000/api/sales?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      if (data.success) setSales(data.data)
    } catch (error) {
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`http://localhost:3000/api/sales/stats?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      if (data.success) setStats(data.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const viewSaleDetails = async (saleId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/sales/${saleId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      if (data.success) {
        setSelectedSale(data.data)
        setShowDetails(true)
      }
    } catch (error) {
      console.error('Error fetching sale details:', error)
    }
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
      transfer: 'Transferencia'
    }
    return labels[method] || method
  }

  if (loading) {
    return <div className="card text-center py-8">Cargando ventas...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ventas</h1>
          <p className="text-muted">Historial y estadísticas de ventas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <h3 className="font-semibold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Fecha inicio</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fecha fin</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Cajero</label>
            <select
              value={filters.cashier}
              onChange={(e) => setFilters(prev => ({ ...prev, cashier: e.target.value }))}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            >
              <option value="">Todos los cajeros</option>
              {/* Aquí irían los cajeros disponibles */}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Método de pago</label>
            <select
              value={filters.paymentMethod}
              onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            >
              <option value="">Todos los métodos</option>
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-semibold text-accent">{stats.totalSales}</div>
          <div className="text-muted">Total Ventas</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-green-400">
            ${stats.totalAmount?.toLocaleString()}
          </div>
          <div className="text-muted">Monto Total</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-blue-400">
            ${stats.averageTicket?.toFixed(2)}
          </div>
          <div className="text-muted">Ticket Promedio</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-purple-400">
            {stats.topProducts?.length || 0}
          </div>
          <div className="text-muted">Productos Vendidos</div>
        </div>
      </div>

      {/* Lista de ventas */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-600/20">
                <th className="text-left py-3 px-4">ID Venta</th>
                <th className="text-left py-3 px-4">Fecha</th>
                <th className="text-left py-3 px-4">Cliente</th>
                <th className="text-left py-3 px-4">Cajero</th>
                <th className="text-left py-3 px-4">Items</th>
                <th className="text-left py-3 px-4">Total</th>
                <th className="text-left py-3 px-4">Pago</th>
                <th className="text-left py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-slate-600/10 last:border-0 hover:bg-surface/50 transition">
                  <td className="py-3 px-4">
                    <div className="font-mono text-sm">#{sale.id.toString().padStart(6, '0')}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">{new Date(sale.created_at).toLocaleDateString()}</div>
                    <div className="text-muted text-xs">{new Date(sale.created_at).toLocaleTimeString()}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      {sale.customer_name || 'Cliente general'}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted text-sm">{sale.cashier_name}</td>
                  <td className="py-3 px-4">
                    <span className="bg-accent/20 text-accent px-2 py-1 rounded text-xs">
                      {sale.total_items} items
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold">${sale.total}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span>{getPaymentMethodIcon(sale.payment_method)}</span>
                      <span className="text-sm">{getPaymentMethodLabel(sale.payment_method)}</span>
                    </div>
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
      </div>

      {/* Modal de detalles */}
      {showDetails && selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                Detalles de Venta #{selectedSale.id.toString().padStart(6, '0')}
              </h3>
              <button onClick={() => setShowDetails(false)}>✕</button>
            </div>

            <div className="space-y-6">
              {/* Información general */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted">Fecha y hora</div>
                  <div>{new Date(selectedSale.created_at).toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted">Cliente</div>
                  <div>{selectedSale.customer_name || 'Cliente general'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted">Cajero</div>
                  <div>{selectedSale.cashier_name}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted">Método de pago</div>
                  <div className="flex items-center gap-2">
                    <span>{getPaymentMethodIcon(selectedSale.payment_method)}</span>
                    <span>{getPaymentMethodLabel(selectedSale.payment_method)}</span>
                  </div>
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
                        <th className="text-left py-2 px-3 text-sm">Cantidad</th>
                        <th className="text-left py-2 px-3 text-sm">Precio Unit.</th>
                        <th className="text-left py-2 px-3 text-sm">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.items?.map((item, index) => (
                        <tr key={index} className="border-t border-slate-600/10">
                          <td className="py-2 px-3">{item.product_name}</td>
                          <td className="py-2 px-3">{item.quantity}</td>
                          <td className="py-2 px-3">${item.unit_price}</td>
                          <td className="py-2 px-3 font-medium">${item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totales */}
              <div className="bg-surface/50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedSale.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-slate-600/20 pt-2">
                    <span>Total:</span>
                    <span className="text-accent">${selectedSale.total}</span>
                  </div>
                  {selectedSale.payment_method === 'cash' && (
                    <>
                      <div className="flex justify-between text-sm text-muted">
                        <span>Efectivo recibido:</span>
                        <span>${selectedSale.amount_received}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted">
                        <span>Cambio:</span>
                        <span>${selectedSale.change}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="btn flex-1"
                >
                  🖨️ Imprimir Recibo
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 border border-slate-600/30 rounded-md"
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