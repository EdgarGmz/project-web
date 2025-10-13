import { useEffect, useState } from 'react'

export default function Audit() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const fetchAuditLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/audit', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      if (data.success) setLogs(data.data)
    } catch (error) {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log =>
    log.user?.toLowerCase().includes(search.toLowerCase()) ||
    log.action?.toLowerCase().includes(search.toLowerCase()) ||
    log.entity?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="card">
      <h1 className="text-2xl font-semibold mb-4">Auditoría</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar usuario, acción o entidad..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
        />
      </div>
      {loading ? (
        <div className="text-center py-8 text-muted">Cargando registros...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-8 text-muted">No hay registros de auditoría.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600/20">
                <th className="py-2 px-3 text-left">Fecha</th>
                <th className="py-2 px-3 text-left">Usuario</th>
                <th className="py-2 px-3 text-left">Acción</th>
                <th className="py-2 px-3 text-left">Entidad</th>
                <th className="py-2 px-3 text-left">Detalle</th>
                <th className="py-2 px-3 text-left">IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => (
                <tr key={idx} className="border-b border-slate-600/10 last:border-0">
                  <td className="py-2 px-3">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-2 px-3">{log.user}</td>
                  <td className="py-2 px-3">{log.action}</td>
                  <td className="py-2 px-3">{log.entity}</td>
                  <td className="py-2 px-3">{log.details}</td>
                  <td className="py-2 px-3">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}