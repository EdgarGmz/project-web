import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: ''
  })
  const { hasPermission } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    brand: '',
    model: '',
    price: '',
    cost: '',
    stock: '',
    min_stock: '5',
    barcode: '',
    image: '',
    status: 'active'
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/products', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      if (data.success) setProducts(data.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/categories', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      if (data.success) setCategories(data.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const url = editingProduct 
        ? `http://localhost:3000/api/products/${editingProduct.id}`
        : 'http://localhost:3000/api/products'
      
      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        fetchProducts()
        setShowForm(false)
        setEditingProduct(null)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '', description: '', category_id: '', brand: '', model: '',
      price: '', cost: '', stock: '', min_stock: '5', barcode: '', image: '', status: 'active'
    })
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({ ...product })
    setShowForm(true)
  }

  const filteredProducts = products.filter(product => {
    return (
      (!filters.search || product.name.toLowerCase().includes(filters.search.toLowerCase())) &&
      (!filters.category || product.category_id === filters.category) &&
      (!filters.status || product.status === filters.status)
    )
  })

  const getStockStatus = (product) => {
    if (product.stock <= 0) return { color: 'text-red-400', label: 'Agotado' }
    if (product.stock <= product.min_stock) return { color: 'text-yellow-400', label: 'Stock Bajo' }
    return { color: 'text-green-400', label: 'En Stock' }
  }

  if (loading) {
    return <div className="card text-center py-8">Cargando productos...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-muted">Gestiona el catálogo de productos</p>
        </div>
        {hasPermission(['owner', 'admin', 'supervisor']) && (
          <button onClick={() => setShowForm(true)} className="btn">
            + Nuevo Producto
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-semibold text-accent">{products.length}</div>
          <div className="text-muted">Total Productos</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-green-400">
            {products.filter(p => p.stock > p.min_stock).length}
          </div>
          <div className="text-muted">En Stock</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-yellow-400">
            {products.filter(p => p.stock <= p.min_stock && p.stock > 0).length}
          </div>
          <div className="text-muted">Stock Bajo</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-red-400">
            {products.filter(p => p.stock <= 0).length}
          </div>
          <div className="text-muted">Agotados</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Buscar</label>
            <input
              type="text"
              placeholder="Nombre, marca, modelo..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Categoría</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            >
              <option value="">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-600/20">
                <th className="text-left py-3 px-4">Producto</th>
                <th className="text-left py-3 px-4">Categoría</th>
                <th className="text-left py-3 px-4">Precio</th>
                <th className="text-left py-3 px-4">Stock</th>
                <th className="text-left py-3 px-4">Estado</th>
                <th className="text-left py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product)
                const category = categories.find(c => c.id === product.category_id)
                
                return (
                  <tr key={product.id} className="border-b border-slate-600/10 last:border-0 hover:bg-surface/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded bg-surface border border-slate-600/20 flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs">📦</span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-muted text-sm">{product.brand} {product.model}</div>
                          {product.barcode && (
                            <div className="text-muted text-xs">#{product.barcode}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted">{category?.name || 'Sin categoría'}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium">${product.price}</div>
                      <div className="text-muted text-sm">Costo: ${product.cost}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`font-medium ${stockStatus.color}`}>
                        {product.stock} unidades
                      </div>
                      <div className="text-muted text-sm">Mín: {product.min_stock}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        product.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {product.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {hasPermission(['owner', 'admin', 'supervisor']) && (
                          <>
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-accent hover:opacity-80 transition"
                              title="Editar producto"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => console.log('View product', product.id)}
                              className="text-blue-400 hover:opacity-80 transition"
                              title="Ver detalles"
                            >
                              👁️
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Categoría *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Marca</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Modelo</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Precio de Venta *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Precio de Costo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Inicial</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Mínimo</label>
                  <input
                    type="number"
                    value={formData.min_stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_stock: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Código de Barras</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">URL de Imagen</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn flex-1">
                  {editingProduct ? 'Actualizar' : 'Crear'} Producto
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-slate-600/30 rounded-md"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}