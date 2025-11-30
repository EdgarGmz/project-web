import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import LoadingModal from '../molecules/LoadingModal'

export default function SaleForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    customer_id: '',
    items: [],
    payment_method: 'cash',
    total: 0,
    notes: ''
  })
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCustomers()
    fetchProducts()
    if (id) fetchSale()
    // eslint-disable-next-line
  }, [id])

  const fetchCustomers = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/customers', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (data.success) setCustomers(data.data)
    } catch {}
  }

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/products', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (data.success) setProducts(data.data)
    } catch {}
  }

  const fetchSale = async () => {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:3000/api/sales/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (data.success) {
        setForm({
          customer_id: data.data.customer_id || '',
          items: data.data.items || [],
          payment_method: data.data.payment_method || 'cash',
          total: data.data.total || 0,
          notes: data.data.notes || ''
        })
      }
    } catch {
      setError('No se pudo cargar la venta.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleItemChange = (idx, field, value) => {
    const items = [...form.items]
    items[idx][field] = value
    if (field === 'product_id') {
      const product = products.find(p => p.id === value)
      items[idx].price = product ? product.price : 0
      items[idx].quantity = 1
    }
    setForm({ ...form, items })
    recalculateTotal(items)
  }

  const handleAddItem = () => {
    setForm({ ...form, items: [...form.items, { product_id: '', quantity: 1, price: 0 }] })
  }

  const handleRemoveItem = idx => {
    const items = form.items.filter((_, i) => i !== idx)
    setForm({ ...form, items })
    recalculateTotal(items)
  }

  const recalculateTotal = (items = form.items) => {
    const total = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0)
    setForm(f => ({ ...f, total }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const method = id ? 'PUT' : 'POST'
      const url = id
        ? `http://localhost:3000/api/sales/${id}`
        : 'http://localhost:3000/api/sales'
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
        navigate('/sales')
      } else {
        setError(data.message || 'Error al guardar la venta.')
      }
    } catch {
      setError('Error al guardar la venta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <LoadingModal isOpen={loading} message="Guardando venta..." />
      <div className="card max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        {id ? 'Editar Venta' : 'Nueva Venta'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Cliente</label>
          <select
            name="customer_id"
            value={form.customer_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
          >
            <option value="">Cliente general</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Productos</label>
          <div className="space-y-2">
            {form.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <select
                  value={item.product_id}
                  onChange={e => handleItemChange(idx, 'product_id', e.target.value)}
                  className="px-2 py-1 border border-slate-600/30 rounded-md bg-surface"
                  required
                >
                  <option value="">Selecciona producto</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                  className="w-20 px-2 py-1 border border-slate-600/30 rounded-md bg-surface"
                  required
                />
                <span className="w-20 text-right">
                  ${Number(item.price).toFixed(2)}
                </span>
                <button
                  type="button"
                  className="text-red-400 px-2"
                  onClick={() => handleRemoveItem(idx)}
                  title="Quitar"
                >
                  ✖
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn px-3 py-1 text-sm"
              onClick={handleAddItem}
            >
              + Agregar producto
            </button>
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">Método de Pago</label>
          <select
            name="payment_method"
            value={form.payment_method}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
          >
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="transfer">Transferencia</option>
          </select>
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
        <div className="font-bold text-lg text-right">
          Total: ${Number(form.total).toFixed(2)}
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
            onClick={() => navigate('/sales')}
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