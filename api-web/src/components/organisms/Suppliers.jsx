import { useEffect, useState } from 'react'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchSuppliers()
    // eslint-disable-next-line
  }, [])

  const fetchSuppliers = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:3000/api/suppliers', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (data.success) {
        setSuppliers(data.data)
      } else {
        setError('No se pudieron cargar los proveedores.')
      }
    } catch {
      setError('Error al cargar los proveedores.')
    } finally {
      setLoading(false)
    }
  }

  const filteredSuppliers = suppliers.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.contact?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="card">
      <h1 className="text-2xl font-semibold mb-4">Proveedores</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar proveedor o contacto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
        />
      </div>
      {loading ? (
        <div className="text-center py-8 text-muted">Cargando proveedores...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="text-center py-8 text-muted">No hay proveedores registrados.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600/20">
                <th className="py-2 px-3 text-left">Nombre</th>
                <th className="py-2 px-3 text-left">Contacto</th>
                <th className="py-2 px-3 text-left">Teléfono</th>
                <th className="py-2 px-3 text-left">Email</th>
                <th className="py-2 px-3 text-left">Dirección</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((s, idx) => (
                <tr key={idx} className="border-b border-slate-600/10 last:border-0">
                  <td className="py-2 px-3">{s.name}</td>
                  <td className="py-2 px-3">{s.contact}</td>
                  <td className="py-2 px-3">{s.phone}</td>
                  <td className="py-2 px-3">{s.email}</td>
                  <td className="py-2 px-3">{s.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}