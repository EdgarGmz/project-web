
import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { productService} from '../../services/productService'
import { inventoryService } from '../../services/inventoryService'
import ConfirmModal from '../molecules/ConfirmModal'
import SuccessModal from '../molecules/SuccessModal'
import CancelledModal from '../molecules/CancelledModal'
import LoadingModal from '../molecules/LoadingModal'
import NotFound from '../molecules/NotFound'
import Modal from '../molecules/Modal'

export default function Products() {
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all') // Filtro por estado de stock
  const [priceRangeFilter, setPriceRangeFilter] = useState('all') // Filtro por rango de precio
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' })
  const [cancelledModal, setCancelledModal] = useState({ isOpen: false, message: '' })
  const [inventoryModal, setInventoryModal] = useState({ isOpen: false, product: null, inventory: [] })
  const [loadingInventory, setLoadingInventory] = useState(false)
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
    stock_inicial: '',
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
    // Filtro de búsqueda por texto
    const matchesSearch = searchTerm === '' || 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtro por estado (activo/inactivo)
    const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && product.is_active) ||
        (statusFilter === 'inactive' && !product.is_active)

    // Filtro por estado de stock
    const stock = product.total_stock || 0
    let matchesStock = true
    if (stockFilter === 'no_stock') {
      matchesStock = stock === 0
    } else if (stockFilter === 'low_stock') {
      matchesStock = stock > 0 && stock <= product.min_stock
    } else if (stockFilter === 'in_stock') {
      matchesStock = stock > product.min_stock
    }

    // Filtro por rango de precio
    let matchesPrice = true
    if (priceRangeFilter === 'low') {
      matchesPrice = product.unit_price <= 100
    } else if (priceRangeFilter === 'medium') {
      matchesPrice = product.unit_price > 100 && product.unit_price <= 500
    } else if (priceRangeFilter === 'high') {
      matchesPrice = product.unit_price > 500
    }

    return matchesSearch && matchesStatus && matchesStock && matchesPrice
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
        // Al crear, incluir stock inicial para asignarlo a CEDIS (obligatorio)
        if (!formData.stock_inicial || formData.stock_inicial === '' || formData.stock_inicial === '0') {
          alert('El stock inicial en CEDIS es obligatorio y debe ser mayor a 0')
          return
        }
        productData.stock_inicial = parseFloat(formData.stock_inicial)
        if (productData.stock_inicial <= 0 || isNaN(productData.stock_inicial)) {
          alert('El stock inicial debe ser un número mayor a 0')
          return
        }
        response = await productService.create(productData)
      }
      
      if (response.success) {
        setSuccessModal({ 
          isOpen: true, 
          message: editingProduct ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente' 
        })
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
        setCancelledModal({ isOpen: true, message: 'Producto eliminado exitosamente' })
        loadProducts()
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
      stock_inicial: '',
      is_active: true
    })
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setStockFilter('all')
    setPriceRangeFilter('all')
  }

  const handleViewInventory = async (product) => {
    setInventoryModal({ isOpen: true, product, inventory: [] })
    setLoadingInventory(true)
    try {
      // Obtener inventario de todas las sucursales para este producto
      const response = await inventoryService.getAll({
        page: 1,
        limit: 1000,
        product_id: product.id
      })
      if (response && response.success) {
        setInventoryModal({ isOpen: true, product, inventory: response.data || [] })
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoadingInventory(false)
    }
  }

  const getStockStatus = (product) => {
    const stock = product.total_stock || 0
    
    // Si no hay stock (0 o null/undefined)
    if (stock === 0 || stock === null || stock === undefined) {
      return { 
        color: 'text-red-400', 
        bgColor: 'bg-red-500/20',
        borderColor: 'border-red-500/30',
        label: 'Sin Existencia', 
        stock: 0,
        icon: '🔴'
      }
    }
    
    // Si el stock está por debajo del mínimo
    if (stock <= product.min_stock) {
      return { 
        color: 'text-yellow-400', 
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500/30',
        label: 'Stock Bajo', 
        stock,
        icon: '⚠️'
      }
    }
    
    // Stock normal
    return { 
      color: 'text-green-400', 
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      label: 'En Stock', 
      stock,
      icon: '✅'
    }
  }

  return (
    <>
      <LoadingModal isOpen={loading && products.length === 0} message="Cargando productos..." />
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-muted">Gestiona el catálogo de productos</p>
        </div>
        {hasPermission(['owner']) && (
          <button onClick={() => setShowForm(true)} className="btn">
            + Nuevo Producto
          </button>
        )}
      </div>
      
      {/* Filtros mejorados */}
      <section className="card bg-gradient-to-r from-slate-800/50 to-slate-700/30 border border-slate-600/30">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center text-xl">
              🔍
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Filtros de Búsqueda</h2>
              <p className="text-xs text-muted">Filtra productos por diferentes criterios</p>
            </div>
          </div>
          {(searchTerm || statusFilter !== 'all' || stockFilter !== 'all' || priceRangeFilter !== 'all') && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all flex items-center gap-2 hover:scale-105"
              title="Limpiar todos los filtros"
            >
              <span>🗑️</span>
              <span className="text-sm font-medium">Limpiar filtros</span>
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Búsqueda por texto */}
          <div>
            <label className="block text-sm font-semibold mb-2 flex items-center gap-2 text-white">
              <span>🔎</span>
              <span>Búsqueda General</span>
            </label>
            <input
              type="text"
              placeholder="Buscar por nombre, SKU, código de barras o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-slate-600/30 rounded-lg bg-slate-800/50 focus:ring-2 focus:ring-accent focus:border-transparent transition-all placeholder:text-slate-500 text-white"
            />
          </div>

          {/* Filtros en grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por estado */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2 text-white">
                <span>🚦</span>
                <span>Estado del Producto</span>
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-slate-600/30 rounded-lg bg-slate-800/50 focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-white"
              >
                <option value="all">📦 Todos los productos</option>
                <option value="active">🟢 Solo activos</option>
                <option value="inactive">🔴 Solo inactivos</option>
              </select>
            </div>

            {/* Filtro por stock */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2 text-white">
                <span>📊</span>
                <span>Estado de Stock</span>
              </label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full px-4 py-3 border border-slate-600/30 rounded-lg bg-slate-800/50 focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-white"
              >
                <option value="all">📦 Todos los niveles</option>
                <option value="no_stock">🔴 Sin existencia</option>
                <option value="low_stock">⚠️ Stock bajo</option>
                <option value="in_stock">✅ En stock</option>
              </select>
            </div>

            {/* Filtro por rango de precio */}
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2 text-white">
                <span>💰</span>
                <span>Rango de Precio</span>
              </label>
              <select
                value={priceRangeFilter}
                onChange={(e) => setPriceRangeFilter(e.target.value)}
                className="w-full px-4 py-3 border border-slate-600/30 rounded-lg bg-slate-800/50 focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-white"
              >
                <option value="all">💵 Todos los precios</option>
                <option value="low">💚 Bajo (≤ $100)</option>
                <option value="medium">💛 Medio ($101 - $500)</option>
                <option value="high">❤️ Alto (&gt; $500)</option>
              </select>
            </div>
          </div>

          {/* Indicador de resultados filtrados */}
          {(searchTerm || statusFilter !== 'all' || stockFilter !== 'all' || priceRangeFilter !== 'all') && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-400">ℹ️</span>
                <span className="text-blue-300">
                  Mostrando <strong>{filteredProducts.length}</strong> de <strong>{products.length}</strong> productos
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Lista de productos */}
      <div className="card overflow-hidden border border-slate-600/20 shadow-xl">
        {products.length === 0 ? (
          <NotFound 
            message="No hay productos registrados"
            subtitle="Crea el primer producto para comenzar"
          />
        ) : filteredProducts.length === 0 ? (
          <NotFound 
            message="No se encontraron productos"
            subtitle="Intenta ajustar los filtros de búsqueda"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 border-b border-slate-600/30">
                  <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span>📦</span>
                      <span>Producto</span>
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span>🔖</span>
                      <span>SKU</span>
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span>💰</span>
                      <span>Precio</span>
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span>📊</span>
                      <span>Stock</span>
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span>🚦</span>
                      <span>Estado</span>
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span>⚙️</span>
                      <span>Acciones</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-600/20">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product)
                  
                  return (
                    <tr key={product.id} className="group hover:bg-gradient-to-r hover:from-slate-800/40 hover:to-slate-700/20 transition-all duration-200 border-b border-slate-600/10">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-500/10 border-2 border-orange-500/30 flex items-center justify-center overflow-hidden shadow-sm">
                            <span className="text-xl">📦</span>
                          </div>
                          <div>
                            <div className="font-semibold text-white group-hover:text-accent transition-colors">{product.name}</div>
                            <div className="text-muted text-sm mt-0.5">{product.description?.substring(0, 30)}...</div>
                            {product.barcode && (
                              <div className="text-muted text-xs mt-0.5">Código: {product.barcode}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white">{product.sku}</div>
                        <div className="text-muted text-xs mt-0.5">{product.unit_measure}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-green-400">${parseFloat(product.unit_price || 0).toFixed(2)}</div>
                        <div className="text-muted text-sm mt-0.5">Costo: ${parseFloat(product.cost_price || 0).toFixed(2)}</div>
                        <div className="text-muted text-xs mt-0.5">IVA: {(product.tax_rate * 100).toFixed(0)}%</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${stockStatus.bgColor} ${stockStatus.color} ${stockStatus.borderColor}`}>
                            <span className="text-base">{stockStatus.icon}</span>
                            <span>{stockStatus.label}</span>
                          </span>
                        </div>
                        <div className={`font-semibold ${stockStatus.color} text-lg mb-1`}>
                          {stockStatus.stock} unidades
                        </div>
                        <div className="text-muted text-sm mt-0.5">
                          Mín: {product.min_stock} / Máx: {product.max_stock}
                        </div>
                        <button
                          onClick={() => handleViewInventory(product)}
                          className="text-accent text-xs hover:text-accent/80 transition cursor-pointer underline mt-1"
                          title="Ver detalles de inventario por sucursal"
                        >
                          Ver detalle en Inventario
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-sm ${
                          product.is_active 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                          {product.is_active ? '✓ Activo' : '✗ Inactivo'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {hasPermission(['owner']) && (
                            <>
                              <button
                                onClick={() => handleEdit(product)}
                                className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all hover:scale-110"
                                title="Editar producto"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(product)}
                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all hover:scale-110"
                                title="Eliminar producto"
                              >
                                🗑️
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
          {filteredProducts.length === products.length ? (
            <span>Total: {products.length} productos</span>
          ) : (
            <span>Mostrando {filteredProducts.length} de {products.length} productos</span>
          )}
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

              {!editingProduct && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    📦 Stock Inicial en CEDIS *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.stock_inicial}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock_inicial: e.target.value }))}
                    required
                    placeholder="Cantidad inicial en el centro de distribución"
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                  <p className="text-xs text-muted mt-1">
                    Este stock se asignará automáticamente al CEDIS al crear el producto. El valor debe ser mayor a 0.
                  </p>
                </div>
              )}

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

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        message={successModal.message}
      />

      {/* Modal de cancelación */}
      <CancelledModal
        isOpen={cancelledModal.isOpen}
        onClose={() => setCancelledModal({ isOpen: false, message: '' })}
        message={cancelledModal.message}
      />

      {/* Modal de detalles de inventario */}
      {inventoryModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="card max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slide-up border border-slate-600/30 shadow-2xl">
            {/* Header con gradiente */}
            <div className="relative p-6 bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-transparent border-b border-slate-600/30">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border-2 border-blue-500/40 flex items-center justify-center text-3xl shadow-lg">
                  📦
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">
                    Detalles de Inventario
                  </h2>
                  <p className="text-sm text-muted">
                    {inventoryModal.product?.name || 'Producto'}
                  </p>
                </div>
                <button
                  onClick={() => setInventoryModal({ isOpen: false, product: null, inventory: [] })}
                  className="text-2xl text-muted hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                  title="Cerrar"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingInventory ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="animate-spin w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                  </div>
                  <p className="mt-4 text-muted text-lg">Cargando inventario...</p>
                </div>
              ) : inventoryModal.inventory.length === 0 ? (
                <NotFound 
                  message="Sin Inventario"
                  subtitle="No hay inventario registrado para este producto en ninguna sucursal"
                  size="lg"
                />
              ) : (
                <div className="space-y-6">
                  {/* Información del producto */}
                  <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 rounded-xl p-5 border border-slate-600/30">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-xl">
                          🏷️
                        </div>
                        <div>
                          <p className="text-xs text-muted uppercase tracking-wide mb-1">SKU</p>
                          <p className="font-bold text-white">{inventoryModal.product?.sku || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-xl">
                          📏
                        </div>
                        <div>
                          <p className="text-xs text-muted uppercase tracking-wide mb-1">Unidad de Medida</p>
                          <p className="font-bold text-white">{inventoryModal.product?.unit_measure || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center text-xl">
                          📊
                        </div>
                        <div>
                          <p className="text-xs text-muted uppercase tracking-wide mb-1">Stock Total</p>
                          <p className="font-bold text-green-400 text-xl">
                            {inventoryModal.inventory.reduce((sum, item) => sum + (item.stock_current || 0), 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tabla de inventario */}
                  <div className="bg-surface/30 rounded-xl overflow-hidden border border-slate-600/30">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 border-b border-slate-600/30">
                            <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <span>🏢</span>
                                <span>Sucursal</span>
                              </div>
                            </th>
                            <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <span>📦</span>
                                <span>Stock Actual</span>
                              </div>
                            </th>
                            <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <span>⚠️</span>
                                <span>Stock Mínimo</span>
                              </div>
                            </th>
                            <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <span>✅</span>
                                <span>Estado</span>
                              </div>
                            </th>
                            <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                              <div className="flex items-center gap-2">
                                <span>📝</span>
                                <span>Notas</span>
                              </div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventoryModal.inventory.map((item) => {
                            const stockStatus = item.stock_current <= item.stock_minimum
                              ? { 
                                  color: 'text-yellow-400', 
                                  bgColor: 'bg-yellow-500/20',
                                  borderColor: 'border-yellow-500/30',
                                  label: 'Stock Bajo',
                                  icon: '⚠️'
                                }
                              : item.stock_current === 0
                              ? { 
                                  color: 'text-red-400', 
                                  bgColor: 'bg-red-500/20',
                                  borderColor: 'border-red-500/30',
                                  label: 'Agotado',
                                  icon: '🔴'
                                }
                              : { 
                                  color: 'text-green-400', 
                                  bgColor: 'bg-green-500/20',
                                  borderColor: 'border-green-500/30',
                                  label: 'En Stock',
                                  icon: '✅'
                                }
                            
                            return (
                              <tr 
                                key={item.id} 
                                className="border-b border-slate-600/10 last:border-0 hover:bg-slate-700/30 transition-colors"
                              >
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-sm">
                                      🏢
                                    </div>
                                    <div>
                                      <div className="font-semibold text-white">{item.branch?.name || 'N/A'}</div>
                                      <div className="text-muted text-xs font-mono">{item.branch?.code || ''}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-white">{item.stock_current || 0}</span>
                                    <span className="text-muted text-sm">{inventoryModal.product?.unit_measure || 'unidades'}</span>
                                  </div>
                                </td>
                                <td className="py-4 px-6">
                                  <div className="text-muted font-medium">{item.stock_minimum || 0}</div>
                                </td>
                                <td className="py-4 px-6">
                                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${stockStatus.bgColor} ${stockStatus.color} ${stockStatus.borderColor}`}>
                                    <span>{stockStatus.icon}</span>
                                    <span>{stockStatus.label}</span>
                                  </span>
                                </td>
                                <td className="py-4 px-6">
                                  <div 
                                    className="text-muted text-sm max-w-xs truncate" 
                                    title={item.notes || 'Sin notas'}
                                  >
                                    {item.notes || <span className="text-slate-500 italic">Sin notas</span>}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Estadísticas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-5 border border-blue-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">🏢</span>
                        <span className="text-3xl font-bold text-blue-400">
                          {inventoryModal.inventory.length}
                        </span>
                      </div>
                      <p className="text-sm text-muted uppercase tracking-wide">Total Sucursales</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-xl p-5 border border-green-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">📦</span>
                        <span className="text-3xl font-bold text-green-400">
                          {inventoryModal.inventory.reduce((sum, item) => sum + (item.stock_current || 0), 0)}
                        </span>
                      </div>
                      <p className="text-sm text-muted uppercase tracking-wide">Stock Total</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 rounded-xl p-5 border border-yellow-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">⚠️</span>
                        <span className="text-3xl font-bold text-yellow-400">
                          {inventoryModal.inventory.filter(item => item.stock_current <= item.stock_minimum).length}
                        </span>
                      </div>
                      <p className="text-sm text-muted uppercase tracking-wide">Con Stock Bajo</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
