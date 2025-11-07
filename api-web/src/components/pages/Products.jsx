
import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { productService} from '../../services/productService'

export default function Products() {
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const { hasPermission } = useAuth()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    barcode: '',
    unit_price: '',
    cost_price: '',
    tax_rate: '0.16',
    unit_measure: 'pza',
    min_stock: '5', 
    max_stock: '1000',
    is_active: true
  })

  useEffect(() => {   
    loadProducts()
  }, [])

  // Cargar productos con paginación y filtros
  const loadProducts = async (page = 1) => {
    try{
      setLoading(true)
      const response = await productService.getAll(
        page, 
        pagination.limit, 
        filters.search, 
        filters.status
      )
      if(response.success){
        setProducts(response.data)
        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
          pages: response.pagination.pages
        })
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Aplicar filtros y reiniciar a página 1
  const applyFilters = () => {
    loadProducts(1)
  }

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({ search: '', status: '' })
    // Esperar a que se actualice el estado y luego cargar
    setTimeout(() => loadProducts(1), 0)
  }

  // Handlers
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Convertir strings a números y limpiar datos
      const productData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        sku: formData.sku.trim(),
        barcode: formData.barcode?.trim() || null,
        unit_price: parseFloat(formData.unit_price),
        cost_price: parseFloat(formData.cost_price),
        tax_rate: parseFloat(formData.tax_rate),
        unit_measure: formData.unit_measure,
        min_stock: parseInt(formData.min_stock),
        max_stock: parseInt(formData.max_stock),
        is_active: formData.is_active
      }
      
      // Validación adicional en el frontend
      if (productData.unit_price <= productData.cost_price) {
        alert('El precio de venta debe ser mayor al costo')
        return
      }
      
      if (productData.min_stock >= productData.max_stock) {
        alert('El stock mínimo debe ser menor al máximo')
        return
      }
      
      let response
      
      if (editingProduct) {
        response = await productService.update(editingProduct.id, productData)
      } else {
        response = await productService.create(productData)
      }
      
      if (response.success) {
        alert('Producto guardado exitosamente')
        loadProducts(pagination.page)
        setShowForm(false)
        setEditingProduct(null)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert(error.message || 'Error al guardar el producto')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return
    }

    try {
      setLoading(true)
      const response = await productService.delete(id)
      
      if(response.success){
        loadProducts(pagination.page)
        alert('Producto eliminado correctamente')
      }
    } catch (error) {
      console.error('Error al eliminar el producto:', error)
      alert('Error al eliminar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }
  
  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({ ...product })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '', description: '', sku: '', barcode: '',
      unit_price: '', cost_price: '', tax_rate: '0.16',
      unit_measure: 'pza', min_stock: '5', max_stock: '1000',
      is_active: true
    })
  }

  const getStockStatus = (product) => {
    const stock = product.total_stock || 0
    if(stock <= product.min_stock) return { color: 'text-yellow-400', label: 'Stock Bajo', stock }
    return { color: 'text-green-400', label: 'En Stock', stock }
  }

  if (loading && products.length === 0) {
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
      
      {/* Filtros */}
      <section className="card">
        <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={(e) => { e.preventDefault(); applyFilters() }}>
          <fieldset>
            <label htmlFor="search" className="block text-sm font-medium mb-2">Buscar</label>
            <input
              id="search"
              type="text"
              placeholder="Nombre, SKU, descripción..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            />
          </fieldset>
          <fieldset>
            <label htmlFor="status" className="block text-sm font-medium mb-2">Estado</label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            >
              <option value="">Todos los estados</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </fieldset>
          <fieldset className="flex items-end gap-2">
            <button type="submit" className="btn flex-1">
              🔍 Buscar
            </button>
            <button 
              type="button" 
              onClick={clearFilters}
              className="px-4 py-2 border border-slate-600/30 rounded-md hover:bg-surface/50 transition"
              title="Limpiar filtros"
            >
              ✕
            </button>
          </fieldset>
        </form>
      </section>

      {/* Lista de productos */}
      <div className="card overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-8 text-muted">
            No se encontraron productos con los filtros aplicados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-600/20">
                  <th className="text-left py-3 px-4">Producto</th>
                  <th className="text-left py-3 px-4">SKU</th>
                  <th className="text-left py-3 px-4">Precio</th>
                  <th className="text-left py-3 px-4">Stock</th>
                  <th className="text-left py-3 px-4">Estado</th>
                  <th className="text-left py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const stockStatus = getStockStatus(product)
                  
                  return (
                    <tr key={product.id} className="border-b border-slate-600/10 last:border-0 hover:bg-surface/50 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded bg-surface border border-slate-600/20 flex items-center justify-center overflow-hidden">
                            <span className="text-xs">📦</span>
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-muted text-sm">{product.description?.substring(0, 30)}...</div>
                            {product.barcode && (
                              <div className="text-muted text-xs">Código: {product.barcode}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{product.sku}</div>
                        <div className="text-muted text-xs">{product.unit_measure}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">${product.unit_price}</div>
                        <div className="text-muted text-sm">Costo: ${product.cost_price}</div>
                        <div className="text-muted text-xs">IVA: {(product.tax_rate * 100).toFixed(0)}%</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`font-medium ${stockStatus.color}`}>
                          {stockStatus.stock} unidades
                        </div>
                        <div className="text-muted text-sm">
                          Mín: {product.min_stock} / Máx: {product.max_stock}
                        </div>
                        <div className="text-muted text-xs">
                          Ver detalle en Inventario
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          product.is_active 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {product.is_active ? 'Activo' : 'Inactivo'}
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
                                onClick={() => handleDelete(product.id)}
                                className="text-red-400 hover:opacity-80 transition"
                                title="Eliminar producto"
                              >
                                🗑
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
        )}
      </div>

      {/* Paginación */}
      {pagination.pages > 1 && (
        <div className="card">
          <div className="flex items-center justify-between">
            <button
              onClick={() => loadProducts(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
              className="btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Anterior
            </button>
            
            <div className="flex flex-col items-center gap-1">
              <span className="text-muted text-sm">
                Página {pagination.page} de {pagination.pages}
              </span>
              <span className="text-muted text-xs">
                ({pagination.total} productos en total)
              </span>
            </div>
            
            <button
              onClick={() => loadProducts(pagination.page + 1)}
              disabled={pagination.page === pagination.pages || loading}
              className="btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          </div>
          
          {/* Navegación rápida de páginas - Solo si hay menos de 10 páginas */}
          {pagination.pages <= 10 && (
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => loadProducts(page)}
                  disabled={loading}
                  className={`px-3 py-1 rounded transition ${
                    page === pagination.page 
                      ? 'bg-accent text-white' 
                      : 'bg-surface text-muted hover:bg-surface/50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={() => { setShowForm(false); setEditingProduct(null); resetForm() }}>✕</button>
            </div>
          
            {/* ... resto del formulario igual ... */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    minLength="2"
                    maxLength="150"
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SKU *</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                    required
                    pattern="[A-Z0-9\-]+"
                    minLength="3"
                    maxLength="50"
                    placeholder="ABC-123"
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  rows="3"
                  minLength="10"
                  maxLength="1000"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Precio de Venta *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.unit_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit_price: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Precio de Costo *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.cost_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost_price: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
              </div>
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tasa de IVA *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.tax_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                  <span className="text-xs text-muted">0.16 = 16%</span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Unidad de Medida *</label>
                  <select
                    value={formData.unit_measure}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit_measure: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  >
                    <option value="pza">Pieza</option>
                    <option value="kg">Kilogramo</option>
                    <option value="m">Metro</option>
                    <option value="litro">Litro</option>
                    <option value="m2">Metro Cuadrado</option>
                    <option value="m3">Metro Cúbico</option>
                    <option value="caja">Caja</option>
                    <option value="paquete">Paquete</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Mínimo *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.min_stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_stock: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock Máximo *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_stock: e.target.value }))}
                    required
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
                    pattern="[0-9]{8,20}"
                    placeholder="Solo números, 8-20 dígitos"
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estado *</label>
                  <select
                    value={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'true' }))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn flex-1">
                  {editingProduct ? 'Actualizar' : 'Crear'} Producto
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingProduct(null); resetForm() }}
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