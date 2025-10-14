import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

export default function InventoryForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    product_id: '',
    branch_id: '',
    quantity: '',
    min_stock: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [products, setProducts] = useState([])
  const [branches, setBranches] = useState([])

  useEffect(() => {
    fetchProducts()
    fetchBranches()
    if (id) fetchInventory()
    // eslint-disable-next-line
  }, [id])

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/products', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (data.success) setProducts(data.data)
    } catch {}
  }

  const fetchBranches = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/branches', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (data.success) setBranches(data.data)
    } catch {}
  }

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:3000/api/inventory/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (data.success) {
        setForm({
          product_id: data.data.product_id || '',
          branch_id: data.data.branch_id || '',
          quantity: data.data.quantity || '',
          min_stock: data.data.min_stock || '',
          notes: data.data.notes || ''
        })
      }
    } catch {
      setError('No se pudo cargar el registro de inventario.')
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
        ? `http://localhost:3000/api/inventory/${id}`
        : 'http://localhost:3000/api/inventory'
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
        navigate('/inventory')
      } else {
        setError(data.message || 'Error al guardar el inventario.')
      }
    } catch {
      setError('Error al guardar el inventario.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        {id ? 'Editar Inventario' : 'Nuevo Inventario'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Producto *</label>
          <select
            name="product_id"
            value={form.product_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
            disabled={!!id}
          >
            <option value="">Selecciona un producto</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Sucursal *</label>
          <select
            name="branch_id"
            value={form.branch_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
            disabled={!!id}
          >
            <option value="">Selecciona una sucursal</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Cantidad *</label>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
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
        <div>
          <label className="block mb-1 font-medium">Notas</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
            rows="2"
            placeholder="Notas adicionales..."
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
            onClick={() => navigate('/inventory')}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}