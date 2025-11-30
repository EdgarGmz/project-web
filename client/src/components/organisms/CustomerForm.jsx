import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import LoadingModal from '../molecules/LoadingModal'

export default function CustomerForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    birth_date: '',
    document_type: 'dni',
    document_number: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) fetchCustomer()
    // eslint-disable-next-line
  }, [id])

  const fetchCustomer = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:3000/api/customers/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (data.success) {
        setForm({
          first_name: data.data.first_name || '',
          last_name: data.data.last_name || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
          address: data.data.address || '',
          birth_date: data.data.birth_date || '',
          document_type: data.data.document_type || 'dni',
          document_number: data.data.document_number || '',
          notes: data.data.notes || ''
        })
      }
    } catch (e) {
      setError('No se pudo cargar el cliente.')
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
        ? `http://localhost:3000/api/customers/${id}`
        : 'http://localhost:3000/api/customers'
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
        navigate('/customers')
      } else {
        setError(data.message || 'Error al guardar el cliente.')
      }
    } catch (e) {
      setError('Error al guardar el cliente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <LoadingModal isOpen={loading} message="Guardando cliente..." />
      <div className="card max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        {id ? 'Editar Cliente' : 'Nuevo Cliente'}
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
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Dirección</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Fecha de Nacimiento</label>
          <input
            type="date"
            name="birth_date"
            value={form.birth_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Tipo de Documento</label>
            <select
              name="document_type"
              value={form.document_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
            >
              <option value="dni">DNI</option>
              <option value="passport">Pasaporte</option>
              <option value="license">Licencia</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Número de Documento</label>
            <input
              type="text"
              name="document_number"
              value={form.document_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
            />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">Notas</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
            rows="3"
            placeholder="Información adicional del cliente..."
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
            onClick={() => navigate('/customers')}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
    </>
  )
}