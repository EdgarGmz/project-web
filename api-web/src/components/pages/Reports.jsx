import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function Reports() {
  const [reportType, setReportType] = useState('sales')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const { hasPermission } = useAuth()

  const reportTypes = [
    { value: 'sales', label: 'Ventas', icon: '💰' },
    { value: 'products', label: 'Productos', icon: '📦' },
    { value: 'inventory', label: 'Inventario', icon: '📊' },
    { value: 'customers', label: 'Clientes', icon: '👥' },
    { value: 'financial', label: 'Financiero', icon: '💹' }
  ]

  useEffect(() => {
    generateReport()
  }, [reportType, dateRange])

  const generateReport = async () => {
    if (!hasPermission(['owner', 'admin', 'supervisor'])) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        type: reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })

      const response = await fetch(`http://localhost:3000/api/reports?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      
      const data = await response.json()
      if (data.success) {
        setReportData(data.data)
      }
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format) => {
    try {
      const params = new URLSearchParams({
        type: reportType,
        format: format,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })

      const response = await fetch(`http://localhost:3000/api/reports/export?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  if (!hasPermission(['owner', 'admin', 'supervisor'])) {
    return (
      <div className="card text-center py-8">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="font-semibold mb-2">Acceso Restringido</h3>
        <p className="text-muted">No tienes permisos para ver los reportes</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reportes</h1>
          <p className="text-muted">Análisis y estadísticas del negocio</p>
        </div>
        {reportData && (
          <div className="flex gap-2">
            <button
              onClick={() => exportReport('pdf')}
              className="btn text-sm"
            >
              📄 PDF
            </button>
            <button
              onClick={() => exportReport('xlsx')}
              className="btn text-sm"
            >
              📊 Excel
            </button>
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Reporte</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fecha Inicio</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fecha Fin</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Contenido del reporte */}
      {loading ? (
        <div className="card text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted">Generando reporte...</p>
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Reporte de Ventas */}
          {reportType === 'sales' && (
            <>
              {/* KPIs principales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card text-center">
                  <div className="text-2xl font-semibold text-accent">
                    {reportData.totalSales}
                  </div>
                  <div className="text-muted">Total Ventas</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-semibold text-green-400">
                    ${reportData.totalRevenue?.toLocaleString()}
                  </div>
                  <div className="text-muted">Ingresos</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-semibold text-blue-400">
                    ${reportData.averageTicket?.toFixed(2)}
                  </div>
                  <div className="text-muted">Ticket Promedio</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-semibold text-purple-400">
                    {reportData.totalItems}
                  </div>
                  <div className="text-muted">Items Vendidos</div>
                </div>
              </div>

              {/* Gráficos y tablas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="font-semibold mb-4">Ventas por Día</h3>
                  <div className="space-y-2">
                    {reportData.dailySales?.map((day, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-slate-600/10 last:border-0">
                        <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                        <span className="font-medium">${day.total}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-semibold mb-4">Productos Más Vendidos</h3>
                  <div className="space-y-2">
                    {reportData.topProducts?.map((product, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-slate-600/10 last:border-0">
                        <div>
                          <div className="text-sm font-medium">{product.name}</div>
                          <div className="text-xs text-muted">{product.quantity} unidades</div>
                        </div>
                        <span className="font-medium text-accent">${product.revenue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold mb-4">Ventas por Método de Pago</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {reportData.paymentMethods?.map((method, index) => (
                    <div key={index} className="text-center p-4 bg-surface/50 rounded-lg">
                      <div className="text-xl mb-2">
                        {method.method === 'cash' ? '💵' : method.method === 'card' ? '💳' : '🏦'}
                      </div>
                      <div className="font-semibold">${method.total}</div>
                      <div className="text-muted text-sm">
                        {method.method === 'cash' ? 'Efectivo' : 
                         method.method === 'card' ? 'Tarjeta' : 'Transferencia'}
                      </div>
                      <div className="text-xs text-muted">{method.count} ventas</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Reporte de Inventario */}
          {reportType === 'inventory' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card text-center">
                  <div className="text-2xl font-semibold text-accent">
                    {reportData.totalProducts}
                  </div>
                  <div className="text-muted">Total Productos</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-semibold text-green-400">
                    ${reportData.inventoryValue?.toLocaleString()}
                  </div>
                  <div className="text-muted">Valor Inventario</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-semibold text-yellow-400">
                    {reportData.lowStockItems}
                  </div>
                  <div className="text-muted">Stock Bajo</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-semibold text-red-400">
                    {reportData.outOfStockItems}
                  </div>
                  <div className="text-muted">Sin Stock</div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold mb-4">Productos con Stock Crítico</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-600/20">
                        <th className="text-left py-2 px-3">Producto</th>
                        <th className="text-left py-2 px-3">Stock Actual</th>
                        <th className="text-left py-2 px-3">Stock Mínimo</th>
                        <th className="text-left py-2 px-3">Estado</th>
                        <th className="text-left py-2 px-3">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.criticalStock?.map((product, index) => (
                        <tr key={index} className="border-b border-slate-600/10 last:border-0">
                          <td className="py-2 px-3">{product.name}</td>
                          <td className="py-2 px-3">{product.stock}</td>
                          <td className="py-2 px-3">{product.min_stock}</td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              product.stock <= 0 ? 'bg-red-500/20 text-red-400' :
                              product.stock <= product.min_stock ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {product.stock <= 0 ? 'Agotado' : 
                               product.stock <= product.min_stock ? 'Crítico' : 'Normal'}
                            </span>
                          </td>
                          <td className="py-2 px-3">${(product.stock * product.cost).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Otros tipos de reportes... */}
          {reportType === 'financial' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card text-center">
                <div className="text-2xl font-semibold text-green-400">
                  ${reportData.totalIncome?.toLocaleString()}
                </div>
                <div className="text-muted">Ingresos Totales</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-semibold text-red-400">
                  ${reportData.totalExpenses?.toLocaleString()}
                </div>
                <div className="text-muted">Gastos Totales</div>
              </div>
              <div className="card text-center">
                <div className="text-2xl font-semibold text-accent">
                  ${reportData.netProfit?.toLocaleString()}
                </div>
                <div className="text-muted">Ganancia Neta</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-muted">Selecciona los parámetros para generar el reporte</p>
        </div>
      )}
    </div>
  )
}