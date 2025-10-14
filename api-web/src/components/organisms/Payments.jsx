import { useEffect, useState } from 'react'

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchPayments()
    // eslint-disable-next-line
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:3000/api/payments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (data.success) {
        setPayments(data.data)
      } else {
        setError('No se pudieron cargar los pagos.')
      }
    } catch {
      setError('Error al cargar los pagos.')
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter(p =>
    p.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.method?.toLowerCase().includes(search.toLowerCase()) ||
    p.reference?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="card">
      <h1 className="text-2xl font-semibold mb-4">Pagos</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por cliente, método o referencia..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
        />
      </div>
      {loading ? (
        <div className="text-center py-8 text-muted">Cargando pagos...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-8 text-muted">No hay pagos registrados.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600/20">
                <th className="py-2 px-3 text-left">Fecha</th>
                <th className="py-2 px-3 text-left">Cliente</th>
                <th className="py-2 px-3 text-left">Monto</th>
                <th className="py-2 px-3 text-left">Método</th>
                <th className="py-2 px-3 text-left">Referencia</th>
                <th className="py-2 px-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p, idx) => (
                <tr key={idx} className="border-b border-slate-600/10 last:border-0">
                  <td className="py-2 px-3">{new Date(p.date).toLocaleString()}</td>
                  <td className="py-2 px-3">{p.customer_name}</td>
                  <td className="py-2 px-3">${p.amount.toFixed(2)}</td>
                  <td className="py-2 px-3">{p.method}</td>
                  <td className="py-2 px-3">{p.reference}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      p.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : p.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {p.status === 'completed'
                        ? 'Completado'
                        : p.status === 'pending'
                        ? 'Pendiente'
                        : 'Fallido'}
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