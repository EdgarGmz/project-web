import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { inventoryService } from '../../services/inventoryService'
import { productService } from '../../services/productService'
import { branchService } from '../../services/branchService'
import ConfirmModal from '../molecules/ConfirmModal'

export default function Inventory() {
  const [inventory, setInventory] = useState([])
  const [products, setProducts] = useState([])
  const [branches, setBranches] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { hasPermission } = useAuth()

  // Estados para paginación y filtros
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterBranch, setFilterBranch] = useState('')
  const [filterProduct, setFilterProduct] = useState('')
  const [filterSearch, setFilterSearch] = useState('')
  const [filterLowStock, setFilterLowStock] = useState(false)

  const [formData, setFormData] = useState({
    product_id: '',
    branch_id: '',
    quantity: '',
    min_stock: '',
    notes: ''
  })

  // Estado para modal de confirmación
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, item: null })

  useEffect(() => {
    fetchInventory()
    fetchProducts()
    fetchBranches()
  }, [currentPage, filterBranch, filterProduct, filterLowStock])

  const fetchProducts = async () => {
    try {
      const response = await productService.getAll()
      if (response && response.success) {
        setProducts(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchBranches = async () => {
    try {
      const response = await branchService.getAll()
      if (response && response.success) {
        setBranches(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching branches:', error)
    }
  }

  const fetchInventory = async () => {
    try {
      setError('')
      const response = await inventoryService.getAll({
        page: currentPage,
        limit: 10,
        branch_id: filterBranch || undefined,
        product_id: filterProduct || undefined,
        low_stock: filterLowStock || undefined
      })
      if (response && response.success) {
        setInventory(response.data || [])
        if (response.pagination) {
          setTotalPages(response.pagination.pages)
        }
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
      setError('Error al cargar el inventario.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      setError('')
      
      // Validar cantidad
      if (formData.quantity < 0) {
        setError('La cantidad no puede ser negativa')
        setSaving(false)
        return
      }
      
      // Al crear, verificar si ya existe inventario para este producto en esta sucursal
      if (!editingItem) {
        const existingInventory = inventory.find(
          item => item.product_id === formData.product_id && item.branch_id === formData.branch_id
        )
        if (existingInventory) {
          setError(`Ya existe inventario para este producto en la sucursal seleccionada. Por favor, edita el registro existente.`)
          setSaving(false)
          return
        }
      }
      
      let response
      if (editingItem) {
        // Al editar, solo enviamos los campos que se pueden actualizar
        const updateData = {
          quantity: parseInt(formData.quantity),
          min_stock: parseInt(formData.min_stock) || 0,
          notes: formData.notes
        }
        console.log('Actualizando inventario:', updateData)
        response = await inventoryService.update(editingItem.id, updateData)
      } else {
        // Al crear, enviamos todos los campos requeridos
        const createData = {
          product_id: formData.product_id,
          branch_id: formData.branch_id,
          quantity: parseInt(formData.quantity),
          min_stock: parseInt(formData.min_stock) || 0,
          notes: formData.notes
        }
        console.log('Creando inventario:', createData)
        response = await inventoryService.create(createData)
      }
      
      if (response && response.success) {
        fetchInventory()
        setShowForm(false)
        setEditingItem(null)
        setFormData({
          product_id: '',
          branch_id: '',
          quantity: '',
          min_stock: '',
          notes: ''
        })
        setSuccess(editingItem ? 'Inventario actualizado exitosamente' : 'Inventario creado exitosamente')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      console.error('Error saving inventory:', error)
      // Intentar extraer el mensaje de error más específico
      let errorMessage = 'Error al guardar el inventario.'
      if (error.message) {
        errorMessage = error.message
      }
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message
      }
      
      // Si es un error de duplicado, recargar el inventario para actualizar la lista
      if (errorMessage.includes('Ya existe inventario')) {
        await fetchInventory()
        errorMessage += ' Los datos se han actualizado. Por favor, intenta de nuevo o edita el registro existente.'
      }
      
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      product_id: item.product_id || '',
      branch_id: item.branch_id || '',
      quantity: item.stock_current || '',
      min_stock: item.stock_minimum || '',
      notes: item.notes || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (item) => {
    setConfirmModal({
      isOpen: true,
      item: item
    })
  }

  const confirmDelete = async () => {
    const item = confirmModal.item
    setConfirmModal({ isOpen: false, item: null })
    
    try {
      setError('')
      const response = await inventoryService.delete(item.id)
      if (response && response.success) {
        fetchInventory()
        setSuccess('Inventario eliminado exitosamente')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      console.error('Error deleting inventory:', error)
      setError(error.message || 'Error al eliminar el inventario.')
    }
  }

  const getStockStatus = (item) => {
    const stock = item.stock_current || 0
    const minStock = item.stock_minimum || 0
    
    if (stock <= 0) {
      return { color: 'bg-red-500/20 text-red-400', label: 'Agotado' }
    }
    if (stock <= minStock) {
      return { color: 'bg-yellow-500/20 text-yellow-400', label: 'Stock Bajo' }
    }
    return { color: 'bg-green-500/20 text-green-400', label: 'Normal' }
  }

  // Filtrar inventario por búsqueda de texto (cliente-side)
  const filteredInventory = inventory.filter(item => {
    if (!filterSearch) return true
    const searchLower = filterSearch.toLowerCase()
    const productName = item.product?.name?.toLowerCase() || ''
    const productSku = item.product?.sku?.toLowerCase() || ''
    return productName.includes(searchLower) || productSku.includes(searchLower)
  })

  // Calcular estadísticas de la página actual
  const totalItems = filteredInventory.length
  const lowStockItems = filteredInventory.filter(item => 
    item.stock_current <= item.stock_minimum
  ).length
  const outOfStockItems = filteredInventory.filter(item => 
    item.stock_current <= 0
  ).length

  if (loading) {
    return <div className="card text-center py-8">Cargando inventario...</div>
  }

  return (
    <div className="space-y-6">
      {/* Mensajes de éxito y error */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-800">{success}</div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inventario</h1>
          <p className="text-muted">Control de stock por sucursal</p>
        </div>
        {hasPermission(['owner', 'admin']) && (
          <button onClick={() => {
            setEditingItem(null)
            setFormData({
              product_id: '',
              branch_id: '',
              quantity: '',
              min_stock: '',
              notes: ''
            })
            setShowForm(true)
          }} className="btn">
            + Nuevo Item
          </button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-semibold text-accent">{totalItems}</div>
          <div className="text-muted">Total Items</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-yellow-400">{lowStockItems}</div>
          <div className="text-muted">Stock Bajo</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-red-400">{outOfStockItems}</div>
          <div className="text-muted">Agotados</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Filtros de Búsqueda</h3>
          {/* Botón para limpiar filtros - visible siempre */}
          {(filterSearch || filterProduct || filterBranch || filterLowStock) && (
            <button
              onClick={() => {
                setFilterSearch('')
                setFilterProduct('')
                setFilterBranch('')
                setFilterLowStock(false)
                setCurrentPage(1)
              }}
              className="px-4 py-2 text-sm border border-slate-600/30 rounded-md hover:bg-surface/50 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar filtros
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro de búsqueda por texto */}
          <div>
            <label className="block text-sm font-medium mb-2">Buscar</label>
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Nombre o SKU del producto..."
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            />
          </div>

          {/* Filtro por producto */}
          <div>
            <label className="block text-sm font-medium mb-2">Producto</label>
            <select
              value={filterProduct}
              onChange={(e) => {
                setFilterProduct(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            >
              <option value="">Todos los productos</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por sucursal */}
          <div>
            <label className="block text-sm font-medium mb-2">Sucursal</label>
            <select
              value={filterBranch}
              onChange={(e) => {
                setFilterBranch(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            >
              <option value="">Todas las sucursales</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de stock bajo */}
          <div className="flex items-end">
            <div className="flex items-center gap-2 pb-2">
              <input
                type="checkbox"
                id="lowStock"
                checked={filterLowStock}
                onChange={(e) => {
                  setFilterLowStock(e.target.checked)
                  setCurrentPage(1)
                }}
                className="rounded"
              />
              <label htmlFor="lowStock" className="text-sm font-medium">
                Solo stock bajo
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de inventario */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-600/20">
              <th className="py-3 px-4 text-left text-sm font-medium">Producto</th>
              <th className="py-3 px-4 text-left text-sm font-medium">Sucursal</th>
              <th className="py-3 px-4 text-left text-sm font-medium">Stock Actual</th>
              <th className="py-3 px-4 text-left text-sm font-medium">Stock Mínimo</th>
              <th className="py-3 px-4 text-left text-sm font-medium">Reservado</th>
              <th className="py-3 px-4 text-left text-sm font-medium">Estado</th>
              {hasPermission(['owner', 'admin']) && (
                <th className="py-3 px-4 text-right text-sm font-medium">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-muted">
                  {filterSearch || filterProduct || filterBranch || filterLowStock 
                    ? 'No se encontraron resultados con los filtros aplicados' 
                    : 'No hay registros de inventario'}
                </td>
              </tr>
            ) : (
              filteredInventory.map((item) => {
                const status = getStockStatus(item)
                return (
                  <tr key={item.id} className="border-b border-slate-600/10 hover:bg-surface/50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{item.product?.name || 'N/A'}</div>
                      <div className="text-xs text-muted">{item.product?.sku || ''}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{item.branch?.name || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">{item.stock_current || 0}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{item.stock_minimum || 0}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">{item.reserved_stock || 0}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    {hasPermission(['owner', 'admin']) && (
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-400 hover:opacity-80"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="text-red-400 hover:opacity-80"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-slate-600/30 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface"
          >
            ← Anterior
          </button>
          <span className="text-sm text-muted">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-slate-600/30 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                {editingItem ? 'Editar Inventario' : 'Nuevo Item de Inventario'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-2xl hover:opacity-70">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Advertencia si la combinación ya existe */}
              {!editingItem && formData.product_id && formData.branch_id && (
                (() => {
                  const exists = inventory.find(
                    item => item.product_id === formData.product_id && item.branch_id === formData.branch_id
                  )
                  if (exists) {
                    return (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <span className="text-yellow-600 text-xl">⚠️</span>
                          <div className="flex-1">
                            <p className="text-sm text-yellow-800 font-medium">
                              Ya existe inventario para esta combinación
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                              Stock actual: {exists.stock_current} | Stock mínimo: {exists.stock_minimum}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                handleEdit(exists)
                              }}
                              className="text-xs text-yellow-800 underline mt-2 hover:text-yellow-900"
                            >
                              Editar registro existente
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                })()
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Producto *</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_id: e.target.value }))}
                  required
                  disabled={!!editingItem}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md disabled:opacity-50"
                >
                  <option value="">Selecciona un producto</option>
                  {products.map(product => {
                    // Contar en cuántas sucursales ya tiene inventario
                    const inventoryCount = !editingItem ? inventory.filter(
                      item => item.product_id === product.id
                    ).length : 0
                    const totalBranches = branches.length
                    const label = inventoryCount > 0 
                      ? `${product.name} (${product.sku}) - ${inventoryCount}/${totalBranches} sucursales`
                      : `${product.name} (${product.sku})`
                    return (
                      <option key={product.id} value={product.id}>
                        {label}
                      </option>
                    )
                  })}
                </select>
                {editingItem && (
                  <p className="text-xs text-muted mt-1">El producto no se puede cambiar al editar</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sucursal *</label>
                <select
                  value={formData.branch_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, branch_id: e.target.value }))}
                  required
                  disabled={!!editingItem}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md disabled:opacity-50"
                >
                  <option value="">Selecciona una sucursal</option>
                  {branches.map(branch => {
                    // Verificar si esta sucursal ya tiene inventario del producto seleccionado
                    const hasInventory = !editingItem && formData.product_id && inventory.some(
                      item => item.product_id === formData.product_id && item.branch_id === branch.id
                    )
                    return (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}{hasInventory ? ' ✓ (Ya tiene inventario)' : ''}
                      </option>
                    )
                  })}
                </select>
                {editingItem && (
                  <p className="text-xs text-muted mt-1">La sucursal no se puede cambiar al editar</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cantidad en Stock *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  required
                  min="0"
                  step="1"
                  placeholder="0"
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Stock Mínimo</label>
                <input
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_stock: e.target.value }))}
                  min="0"
                  step="1"
                  placeholder="0"
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                />
                <p className="text-xs text-muted mt-1">Cantidad mínima para alertas de stock bajo</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observaciones o notas adicionales..."
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="submit" 
                  className="btn flex-1" 
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : (editingItem ? 'Actualizar' : 'Crear')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-slate-600/30 rounded-md hover:bg-surface"
                  disabled={saving}
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
        onCancel={() => setConfirmModal({ isOpen: false, item: null })}
        title="Eliminar Inventario"
        message="¿Estás seguro de que deseas eliminar este registro de inventario?"
        type="danger"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  )
}
