import { useEffect, useState } from 'react'

export default function Returns() {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchReturns()
    // eslint-disable-next-line
  }, [])

  const fetchReturns = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:3000/api/returns', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (data.success) {
        setReturns(data.data)
      } else {
        setError('No se pudieron cargar las devoluciones.')
      }
    } catch {
      setError('Error al cargar las devoluciones.')
    } finally {
      setLoading(false)
    }
  }

  const filteredReturns = returns.filter(r =>
    r.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.reason?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="card">
      <h1 className="text-2xl font-semibold mb-4">Devoluciones</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por cliente, producto o motivo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
        />
      </div>
      {loading ? (
        <div className="text-center py-8 text-muted">Cargando devoluciones...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : filteredReturns.length === 0 ? (
        <div className="text-center py-8 text-muted">No hay devoluciones registradas.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600/20">
                <th className="py-2 px-3 text-left">Fecha</th>
                <th className="py-2 px-3 text-left">Cliente</th>
                <th className="py-2 px-3 text-left">Producto</th>
                <th className="py-2 px-3 text-left">Cantidad</th>
                <th className="py-2 px-3 text-left">Motivo</th>
                <th className="py-2 px-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.map((r, idx) => (
                <tr key={idx} className="border-b border-slate-600/10 last:border-0">
                  <td className="py-2 px-3">{new Date(r.date).toLocaleString()}</td>
                  <td className="py-2 px-3">{r.customer_name}</td>
                  <td className="py-2 px-3">{r.product_name}</td>
                  <td className="py-2 px-3">{r.quantity}</td>
                  <td className="py-2 px-3">{r.reason}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      r.status === 'approved'
                        ? 'bg-green-500/20 text-green-400'
                        : r.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {r.status === 'approved'
                        ? 'Aprobada'
                        : r.status === 'pending'
                        ? 'Pendiente'
                        : 'Rechazada'}
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