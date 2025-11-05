import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function UserForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'cashier',
    password: '',
    confirm_password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) fetchUser()
    // eslint-disable-next-line
  }, [id])

  const fetchUser = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (data.success) {
        setForm({
          first_name: data.data.first_name || '',
          last_name: data.data.last_name || '',
          email: data.data.email || '',
          role: data.data.role || 'cashier',
          password: '',
          confirm_password: ''
        })
      }
    } catch {
      setError('No se pudo cargar el usuario.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    if (!id && form.password !== form.confirm_password) {
      setError('Las contraseñas no coinciden.')
      setLoading(false)
      return
    }
    try {
      const method = id ? 'PUT' : 'POST'
      const url = id
        ? `http://localhost:3000/api/users/${id}`
        : 'http://localhost:3000/api/users'
      const body = { ...form }
      if (id) {
        delete body.password
        delete body.confirm_password
      }
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.success) {
        navigate('/users')
      } else {
        setError(data.message || 'Error al guardar el usuario.')
      }
    } catch {
      setError('Error al guardar el usuario.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        {id ? 'Editar Usuario' : 'Nuevo Usuario'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Nombre *</label>
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Apellido *</label>
            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
            />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">Email *</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Rol *</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
          >
            <option value="owner">Dueño</option>
            <option value="admin">Administrador</option>
            <option value="supervisor">Supervisor</option>
            <option value="cashier">Cajero</option>
            <option value="auditor">Auditor</option>
          </select>
        </div>
        {!id && (
          <>
            <div>
              <label className="block mb-1 font-medium">Contraseña *</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Confirmar Contraseña *</label>
              <input
                type="password"
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
              />
            </div>
          </>
        )}
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="btn flex-1"
            disabled={loading}
          >
            {loading ? 'Guardando...' : id ? 'Actualizar' : 'Crear'}
          </button>
          <button
            type="button"
            className="px-4 py-2 border border-slate-600/30 rounded-md"
            onClick={() => navigate('/users')}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}