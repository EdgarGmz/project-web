import { useEffect, useState } from 'react'
import { purchaseService } from '../../services/purchaseService'

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
      const response = await purchaseService.getAll()
      
      if (response && response.success) {
        setPurchases(response.data || [])
      } else {
        setError(response?.message || 'No se pudieron cargar las compras.')
      }
    } catch (error) {
      console.error('Error fetching purchases:', error)
      
      // El servicio api.js ya maneja la sesión expirada automáticamente
      // Solo necesitamos manejar otros tipos de errores aquí
      if (error.message && error.message.includes('403')) {
        setError('No tiene permisos para ver las compras. Solo propietarios y administradores pueden acceder.')
      } else if (error.message) {
        setError(error.message)
      } else {
        setError('Error de conexión al cargar las compras.')
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredPurchases = purchases.filter(p =>
    p.supplier_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.invoice_number?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="card">
      <h1 className="text-2xl font-semibold mb-4">Compras</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por proveedor o factura..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
        />
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="text-lg text-muted">Cargando compras...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
          <div className="flex items-center mb-2">
            <div className="text-red-600 font-medium">Error:</div>
          </div>
          <div className="text-red-700 mb-4">{error}</div>
          <button 
            onClick={fetchPurchases}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="text-center py-8 text-muted">No hay compras registradas.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600/20">
                <th className="py-2 px-3 text-left">Fecha</th>
                <th className="py-2 px-3 text-left">Proveedor</th>
                <th className="py-2 px-3 text-left">Factura</th>
                <th className="py-2 px-3 text-left">Total</th>
                <th className="py-2 px-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((p) => (
                <tr key={p.id} className="border-b border-slate-600/10 last:border-0">
                  <td className="py-2 px-3">{new Date(p.purchase_date || p.created_at).toLocaleDateString()}</td>
                  <td className="py-2 px-3">{p.supplier_name}</td>
                  <td className="py-2 px-3">{p.invoice_number || 'Sin factura'}</td>
                  <td className="py-2 px-3">${p.total_amount ? parseFloat(p.total_amount).toFixed(2) : '0.00'}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      p.status === 'completed'
                        ? 'bg-green-500/20 text-green-400'
                        : p.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : p.status === 'cancelled'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {p.status === 'completed'
                        ? 'Completada'
                        : p.status === 'pending'
                        ? 'Pendiente'
                        : p.status === 'cancelled'
                        ? 'Cancelada'
                        : p.status || 'Desconocido'}
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