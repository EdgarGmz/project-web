import { useEffect, useState } from 'react'

export default function InventoryReports() {
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
      const res = await fetch('http://localhost:3000/api/reports?type=inventory', {
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

  const filteredProducts = report?.products?.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div className="card">
      <h1 className="text-2xl font-semibold mb-4">Reporte de Inventario</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
        />
      </div>
      {loading ? (
        <div className="text-center py-8 text-muted">Cargando reporte...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : !report || !filteredProducts.length ? (
        <div className="text-center py-8 text-muted">No hay datos de inventario.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600/20">
                <th className="py-2 px-3 text-left">Producto</th>
                <th className="py-2 px-3 text-left">Sucursal</th>
                <th className="py-2 px-3 text-left">Stock</th>
                <th className="py-2 px-3 text-left">Stock Mínimo</th>
                <th className="py-2 px-3 text-left">Valor</th>
                <th className="py-2 px-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, idx) => (
                <tr key={idx} className="border-b border-slate-600/10 last:border-0">
                  <td className="py-2 px-3">{product.name}</td>
                  <td className="py-2 px-3">{product.branch_name}</td>
                  <td className="py-2 px-3">{product.stock}</td>
                  <td className="py-2 px-3">{product.min_stock}</td>
                  <td className="py-2 px-3">${(product.stock * product.cost).toFixed(2)}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}