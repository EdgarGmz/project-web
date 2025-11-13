import { useEffect, useState } from 'react'
import { reportService } from '../../services/reportService'

export default function ReturnsReports() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    // Establecer fechas por defecto (último mes)
    const today = new Date()
    const lastMonth = new Date(today)
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    
    setEndDate(today.toISOString().split('T')[0])
    setStartDate(lastMonth.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    if (startDate && endDate) {
      fetchReport()
    }
    // eslint-disable-next-line
  }, [startDate, endDate])

  const fetchReport = async () => {
    if (!startDate || !endDate) return
    
    setLoading(true)
    setError('')
    try {
      const response = await reportService.getReport('returns', startDate, endDate)
      if (response && response.success) {
        setReport(response.data)
      } else {
        setError('No se pudo cargar el reporte.')
      }
    } catch (err) {
      setError('Error al cargar el reporte: ' + (err.message || 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-yellow-500/20 text-yellow-400', label: 'Pendiente' },
      approved: { class: 'bg-green-500/20 text-green-400', label: 'Aprobada' },
      rejected: { class: 'bg-red-500/20 text-red-400', label: 'Rechazada' }
    }
    const config = statusConfig[status] || statusConfig.pending
    return <span className={`px-2 py-1 rounded text-xs ${config.class}`}>{config.label}</span>
  }

  return (
    <div className="space-y-6">
      {/* Filtros de fecha */}
      <div className="card">
        <h1 className="text-2xl font-semibold mb-4">Reporte de Devoluciones</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-2">Fecha inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Fecha fin</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReport}
              className="btn-primary w-full"
            >
              Generar Reporte
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card text-center py-8 text-muted">Cargando reporte...</div>
      ) : error ? (
        <div className="card text-center py-8 text-red-500">{error}</div>
      ) : !report ? (
        <div className="card text-center py-8 text-muted">Selecciona un rango de fechas para generar el reporte.</div>
      ) : (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card bg-blue-500/10 border-blue-500/20">
              <h3 className="text-sm text-muted mb-1">Total Devoluciones</h3>
              <p className="text-2xl font-bold">{report.summary?.totalReturns || 0}</p>
            </div>
            <div className="card bg-green-500/10 border-green-500/20">
              <h3 className="text-sm text-muted mb-1">Aprobadas</h3>
              <p className="text-2xl font-bold">{report.summary?.approvedReturns || 0}</p>
              <p className="text-xs text-muted">{report.summary?.approvalRate || 0}% del total</p>
            </div>
            <div className="card bg-red-500/10 border-red-500/20">
              <h3 className="text-sm text-muted mb-1">Rechazadas</h3>
              <p className="text-2xl font-bold">{report.summary?.rejectedReturns || 0}</p>
              <p className="text-xs text-muted">{report.summary?.rejectionRate || 0}% del total</p>
            </div>
            <div className="card bg-yellow-500/10 border-yellow-500/20">
              <h3 className="text-sm text-muted mb-1">Pendientes</h3>
              <p className="text-2xl font-bold">{report.summary?.pendingReturns || 0}</p>
            </div>
          </div>

          {/* Valor monetario */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <h3 className="text-sm text-muted mb-1">Valor Total Devuelto</h3>
              <p className="text-xl font-bold text-red-400">
                ${parseFloat(report.summary?.totalReturnValue || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="card">
              <h3 className="text-sm text-muted mb-1">Items Devueltos</h3>
              <p className="text-xl font-bold">{report.summary?.totalReturnedQuantity || 0}</p>
            </div>
            <div className="card">
              <h3 className="text-sm text-muted mb-1">Valor Promedio</h3>
              <p className="text-xl font-bold">
                ${parseFloat(report.summary?.averageReturnValue || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* Productos más devueltos */}
          {report.topReturnedProducts && report.topReturnedProducts.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Productos Más Devueltos</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600/20">
                      <th className="py-2 px-3 text-left">Producto</th>
                      <th className="py-2 px-3 text-left">Total Devuelto</th>
                      <th className="py-2 px-3 text-left">Aprobadas</th>
                      <th className="py-2 px-3 text-left">Rechazadas</th>
                      <th className="py-2 px-3 text-left">Pendientes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.topReturnedProducts.map((product, idx) => (
                      <tr key={idx} className="border-b border-slate-600/10 last:border-0">
                        <td className="py-2 px-3">{product.productName}</td>
                        <td className="py-2 px-3 font-semibold">{product.quantity}</td>
                        <td className="py-2 px-3 text-green-400">{product.approved}</td>
                        <td className="py-2 px-3 text-red-400">{product.rejected}</td>
                        <td className="py-2 px-3 text-yellow-400">{product.pending}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Motivos más comunes */}
          {report.topReasons && report.topReasons.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Motivos de Devolución Más Comunes</h2>
              <div className="space-y-3">
                {report.topReasons.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-md">
                    <span>{item.reason}</span>
                    <span className="font-semibold">{item.count} veces</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de devoluciones */}
          {report.returns && report.returns.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Detalle de Devoluciones</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-600/20">
                      <th className="py-2 px-3 text-left">Fecha</th>
                      <th className="py-2 px-3 text-left">Producto</th>
                      <th className="py-2 px-3 text-left">Cliente</th>
                      <th className="py-2 px-3 text-left">Cantidad</th>
                      <th className="py-2 px-3 text-left">Motivo</th>
                      <th className="py-2 px-3 text-left">Estado</th>
                      <th className="py-2 px-3 text-left">Procesado por</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.returns.map((returnItem, idx) => (
                      <tr key={idx} className="border-b border-slate-600/10 last:border-0">
                        <td className="py-2 px-3">
                          {new Date(returnItem.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-3">{returnItem.product}</td>
                        <td className="py-2 px-3">{returnItem.customer}</td>
                        <td className="py-2 px-3">{returnItem.quantity}</td>
                        <td className="py-2 px-3 max-w-xs truncate" title={returnItem.reason}>
                          {returnItem.reason}
                        </td>
                        <td className="py-2 px-3">{getStatusBadge(returnItem.status)}</td>
                        <td className="py-2 px-3 text-muted text-xs">
                          {returnItem.approvedBy || returnItem.rejectedBy || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
