import { useEffect, useState } from 'react'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchNotifications()
    // eslint-disable-next-line
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (data.success) {
        setNotifications(data.data)
      } else {
        setError('No se pudieron cargar las notificaciones.')
      }
    } catch {
      setError('Error al cargar las notificaciones.')
    } finally {
      setLoading(false)
    }
  }

  const filteredNotifications = notifications.filter(n =>
    n.title?.toLowerCase().includes(search.toLowerCase()) ||
    n.message?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="card">
      <h1 className="text-2xl font-semibold mb-4">Notificaciones</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar notificación..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
        />
      </div>
      {loading ? (
        <div className="text-center py-8 text-muted">Cargando notificaciones...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-8 text-muted">No hay notificaciones.</div>
      ) : (
        <ul className="space-y-4">
          {filteredNotifications.map((n, idx) => (
            <li key={idx} className={`p-4 rounded-lg border ${n.read ? 'border-slate-600/10 bg-surface/50' : 'border-accent/30 bg-accent/10'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">{n.title}</span>
                <span className="text-xs text-muted">{new Date(n.created_at).toLocaleString()}</span>
              </div>
              <div className="text-sm mb-1">{n.message}</div>
              {n.read ? (
                <span className="text-xs text-green-400">Leído</span>
              ) : (
                <span className="text-xs text-yellow-400">No leído</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}