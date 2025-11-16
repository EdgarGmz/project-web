
import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { productService} from '../../services/productService'
import ConfirmModal from '../molecules/ConfirmModal'

export default function Products() {
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
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

  // Estado para modal de confirmación
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, product: null })

  useEffect(() => {   
    loadProducts()
  }, [])

  // Cargar todos los productos (sin filtros del servidor)
  const loadProducts = async () => {
    try{
      setLoading(true)
      const response = await productService.getAll()
      if(response.success){
        setProducts(response.data)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar productos localmente (igual que en Users.jsx)
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && product.is_active) ||
        (statusFilter === 'inactive' && !product.is_active)
    
    return matchesSearch && matchesStatus
  })

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
        loadProducts()
        setShowForm(false)
        setEditingProduct(null)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert(error.message || 'Error al guardar el producto')
    }
  }

  const handleDelete = async (product) => {
    setConfirmModal({
      isOpen: true,
      product: product
    })
  }

  const confirmDelete = async () => {
    const id = confirmModal.product.id
    setConfirmModal({ isOpen: false, product: null })

    try {
      setLoading(true)
      const response = await productService.delete(id)
      
      if(response.success){
        loadProducts()
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
        {hasPermission(['owner', 'supervisor']) && (
          <button onClick={() => setShowForm(true)} className="btn">
            + Nuevo Producto
          </button>
        )}
      </div>
      
      {/* Filtros */}
      <section className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda por nombre/SKU/descripción */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">
              🔍 Buscar producto
            </label>
            <input
              type="text"
              placeholder="Buscar por nombre, SKU, código de barras o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Filtro por estado */}
          <div>
            <label className="block text-sm font-medium mb-2">
              🚦 Filtrar por estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="active">🟢 Solo activos</option>
              <option value="inactive">🔴 Solo inactivos</option>
            </select>
          </div>
        </div>
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
                {filteredProducts.map((product) => {
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
                          {hasPermission(['owner', 'supervisor']) && (
                            <>
                              <button
                                onClick={() => handleEdit(product)}
                                className="text-accent hover:opacity-80 transition"
                                title="Editar producto"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(product)}
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

      {/* Resumen de resultados */}
      <div className="text-center mt-4">
        <span className="text-muted text-sm">
          Mostrando {filteredProducts.length} de {products.length} productos
        </span>
      </div>

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
                    <option value="true">🟢 Activo</option>
                    <option value="false">🔴 Inactivo</option>
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

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, product: null })}
        title="Eliminar Producto"
        message="¿Estás seguro de que deseas eliminar este producto?"
        type="danger"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}
