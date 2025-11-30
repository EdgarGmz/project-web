import { useEffect, useState } from 'react'
import LoadingModal from '../molecules/LoadingModal'
import NotFound from '../molecules/NotFound'

export default function SalesReports() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchReport()
    // eslint-disable-next-line
  }, [])

  const fetchReport = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:3000/api/reports?type=sales', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (data.success) {
        setReport(data.data)
      } else {
        setError('No se pudo cargar el reporte.')
      }
    } catch {
      setError('Error al cargar el reporte.')
    } finally {
      setLoading(false)
    }
  }

  const filteredSales = report?.sales?.filter(sale =>
    sale.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    sale.payment_method?.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div className="card">
      <h1 className="text-2xl font-semibold mb-4">Reporte de Ventas</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por cliente o método de pago..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
        />
      </div>
      <LoadingModal isOpen={loading} message="Cargando reporte..." />
      {error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : !report || !filteredSales.length ? (
        <NotFound 
          message="No hay datos de ventas"
          subtitle="No se encontraron ventas con los filtros seleccionados"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600/20">
                <th className="py-2 px-3 text-left">Fecha</th>
                <th className="py-2 px-3 text-left">Cliente</th>
                <th className="py-2 px-3 text-left">Total</th>
                <th className="py-2 px-3 text-left">Método de Pago</th>
                <th className="py-2 px-3 text-left">Productos</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale, idx) => (
                <tr key={idx} className="border-b border-slate-600/10 last:border-0">
                  <td className="py-2 px-3">{new Date(sale.date).toLocaleString()}</td>
                  <td className="py-2 px-3">{sale.customer_name || 'Cliente general'}</td>
                  <td className="py-2 px-3">${Number(sale.total).toFixed(2)}</td>
                  <td className="py-2 px-3">{sale.payment_method}</td>
                  <td className="py-2 px-3">
                    {sale.items?.map((item, i) => (
                      <span key={i} className="inline-block mr-2">
                        {item.product_name} <span className="text-xs text-muted">x{item.quantity}</span>
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}