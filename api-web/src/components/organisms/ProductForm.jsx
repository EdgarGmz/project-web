import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    sku: '',
    brand: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    min_stock: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) fetchProduct()
    // eslint-disable-next-line
  }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:3000/api/products/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (data.success) {
        setForm({
          name: data.data.name || '',
          sku: data.data.sku || '',
          brand: data.data.brand || '',
          category: data.data.category || '',
          price: data.data.price || '',
          cost: data.data.cost || '',
          stock: data.data.stock || '',
          min_stock: data.data.min_stock || '',
          description: data.data.description || ''
        })
      }
    } catch {
      setError('No se pudo cargar el producto.')
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
        ? `http://localhost:3000/api/products/${id}`
        : 'http://localhost:3000/api/products'
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
        navigate('/products')
      } else {
        setError(data.message || 'Error al guardar el producto.')
      }
    } catch {
      setError('Error al guardar el producto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        {id ? 'Editar Producto' : 'Nuevo Producto'}
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
          <label className="block mb-1 font-medium">SKU</label>
          <input
            type="text"
            name="sku"
            value={form.sku}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Marca</label>
          <input
            type="text"
            name="brand"
            value={form.brand}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Categoría</label>
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Precio *</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Costo</label>
            <input
              type="number"
              name="cost"
              value={form.cost}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Stock *</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Stock Mínimo</label>
            <input
              type="number"
              name="min_stock"
              value={form.min_stock}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
            />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">Descripción</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
            rows="3"
            placeholder="Descripción del producto..."
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
            onClick={() => navigate('/products')}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}