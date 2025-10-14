import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function BranchForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    manager: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      fetchBranch()
    }
    // eslint-disable-next-line
  }, [id])

  const fetchBranch = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:3000/api/branches/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (data.success) {
        setForm({
          name: data.data.name || '',
          address: data.data.address || '',
          phone: data.data.phone || '',
          manager: data.data.manager || ''
        })
      }
    } catch (e) {
      setError('No se pudo cargar la sucursal.')
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
    try {
      const method = id ? 'PUT' : 'POST'
      const url = id
        ? `http://localhost:3000/api/branches/${id}`
        : 'http://localhost:3000/api/branches'
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) {
        navigate('/branches')
      } else {
        setError(data.message || 'Error al guardar la sucursal.')
      }
    } catch (e) {
      setError('Error al guardar la sucursal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        {id ? 'Editar Sucursal' : 'Nueva Sucursal'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Nombre *</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Dirección *</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Teléfono</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Encargado</label>
          <input
            type="text"
            name="manager"
            value={form.manager}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
          />
        </div>
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
            onClick={() => navigate('/branches')}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}