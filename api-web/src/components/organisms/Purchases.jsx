import { useEffect, useState } from 'react'

export default function Purchases() {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchPurchases()
    // eslint-disable-next-line
  }, [])

  const fetchPurchases = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:3000/api/purchases', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (data.success) {
        setPurchases(data.data)
      } else {
        setError('No se pudieron cargar las compras.')
      }
    } catch {
      setError('Error al cargar las compras.')
    } finally {
      setLoading(false)
    }
  }

  const filteredPurchases = purchases.filter(p =>
    p.supplier_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.reference?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="card">
      <h1 className="text-2xl font-semibold mb-4">Compras</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por proveedor o referencia..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
        />
      </div>
      {loading ? (
        <div className="text-center py-8 text-muted">Cargando compras...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : filteredPurchases.length === 0 ? (
        <div className="text-center py-8 text-muted">No hay compras registradas.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600/20">
                <th className="py-2 px-3 text-left">Fecha</th>
                <th className="py-2 px-3 text-left">Proveedor</th>
                <th className="py-2 px-3 text-left">Referencia</th>
                <th className="py-2 px-3 text-left">Total</th>
                <th className="py-2 px-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((p, idx) => (
                <tr key={idx} className="border-b border-slate-600/10 last:border-0">
                  <td className="py-2 px-3">{new Date(p.date).toLocaleString()}</td>
                  <td className="py-2 px-3">{p.supplier_name}</td>
                  <td className="py-2 px-3">{p.reference}</td>
                  <td className="py-2 px-3">${p.total.toFixed(2)}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      p.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : p.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {p.status === 'completed'
                        ? 'Completada'
                        : p.status === 'pending'
                        ? 'Pendiente'
                        : 'Cancelada'}
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