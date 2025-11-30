import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { inventoryService } from '../../services/inventoryService'
import { productService } from '../../services/productService'
import { branchService } from '../../services/branchService'
import ConfirmModal from '../molecules/ConfirmModal'
import SuccessModal from '../molecules/SuccessModal'
import CancelledModal from '../molecules/CancelledModal'
import ErrorModal from '../molecules/ErrorModal'

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
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' })
  const [cancelledModal, setCancelledModal] = useState({ isOpen: false, message: '' })
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' })
  const [cedisStock, setCedisStock] = useState(null) // Stock disponible en CEDIS
  const { hasPermission, user } = useAuth()

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

  // Efecto para obtener stock de CEDIS cuando se selecciona un producto (solo para admin)
  useEffect(() => {
    const fetchCedisStock = async () => {
      if (!formData.product_id || user?.role !== 'admin' || editingItem) {
        setCedisStock(null)
        return
      }

      try {
        // Buscar CEDIS
        const cedisBranch = branches.find(b => b.code === 'CEDIS-000')
        if (!cedisBranch) {
          setCedisStock(0)
          return
        }

        // Buscar inventario del producto en CEDIS
        const cedisInventory = inventory.find(
          item => item.product_id === formData.product_id && item.branch_id === cedisBranch.id
        )

        setCedisStock(cedisInventory ? parseFloat(cedisInventory.stock_current) : 0)
      } catch (error) {
        console.error('Error fetching CEDIS stock:', error)
        setCedisStock(null)
      }
    }

    fetchCedisStock()
  }, [formData.product_id, inventory, branches, user?.role, editingItem])

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
      // Para supervisores, no enviar filterBranch ya que el backend filtra automáticamente por su sucursal
      const response = await inventoryService.getAll({
        page: currentPage,
        limit: 10,
        branch_id: (user?.role !== 'supervisor' && filterBranch) ? filterBranch : undefined,
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

        // Validación para admin: no puede asignar más de lo disponible en CEDIS
        if (user?.role === 'admin') {
          const selectedBranch = branches.find(b => b.id === formData.branch_id)
          const isCedis = selectedBranch?.code === 'CEDIS-000'
          
          // Si no es CEDIS, validar que no se asigne más de lo disponible en CEDIS
          if (!isCedis && cedisStock !== null) {
            const requestedQuantity = parseFloat(formData.quantity) || 0
            if (requestedQuantity > cedisStock) {
              setErrorModal({
                isOpen: true,
                message: `No puedes asignar más de lo disponible en CEDIS. Stock disponible en CEDIS: ${cedisStock} unidades. Intentaste asignar: ${requestedQuantity} unidades.`
              })
              setSaving(false)
              return
            }
          }
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
        setSuccessModal({ 
          isOpen: true, 
          message: editingItem ? 'Inventario actualizado exitosamente' : 'Inventario creado exitosamente' 
        })
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
        setCedisStock(null) // Reset CEDIS stock
        setCedisStock(null) // Reset CEDIS stock
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
        // Si es un error de stock insuficiente, mostrar modal de error
        if (errorMessage.includes('No puedes asignar más de lo disponible en CEDIS')) {
          setErrorModal({
            isOpen: true,
            message: errorMessage
          })
          setSaving(false)
          return
        }
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
    setCedisStock(null) // Reset CEDIS stock al editar
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
        setCancelledModal({ isOpen: true, message: 'Inventario eliminado exitosamente' })
        fetchInventory()
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
        {hasPermission(['admin']) && (
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
          <h2 className="text-lg font-semibold">Filtros</h2>
          {(filterSearch || filterProduct || (user?.role !== 'supervisor' && filterBranch) || filterLowStock) && (
            <button
              onClick={() => {
                setFilterSearch('')
                setFilterProduct('')
                setFilterBranch('')
                setFilterLowStock(false)
                setCurrentPage(1)
              }}
              className="text-sm text-accent hover:opacity-80 transition flex items-center gap-2"
              title="Limpiar filtros"
            >
              🗑️ Limpiar filtros
            </button>
          )}
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-2 ${user?.role === 'supervisor' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-4`}>
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

          {/* Filtro por sucursal - Oculto para supervisores */}
          {user?.role !== 'supervisor' && (
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
          )}

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
      <div className="card overflow-x-auto border border-slate-600/20 shadow-xl">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 border-b border-slate-600/30">
              <th className="py-4 px-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>📦</span>
                  <span>Producto</span>
                </div>
              </th>
              {/* Columna de sucursal - Oculto para supervisores */}
              {user?.role !== 'supervisor' && (
                <th className="py-4 px-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>🏢</span>
                    <span>Sucursal</span>
                  </div>
                </th>
              )}
              <th className="py-4 px-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>📊</span>
                  <span>Stock Actual</span>
                </div>
              </th>
              <th className="py-4 px-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Stock Mínimo</span>
                </div>
              </th>
              <th className="py-4 px-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>🔒</span>
                  <span>Reservado</span>
                </div>
              </th>
              <th className="py-4 px-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span>🚦</span>
                  <span>Estado</span>
                </div>
              </th>
              {hasPermission(['owner', 'admin']) && (
                <th className="py-4 px-6 text-right text-sm font-bold text-white uppercase tracking-wider">
                  <div className="flex items-center gap-2 justify-end">
                    <span>⚙️</span>
                    <span>Acciones</span>
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-600/20">
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan={
                  (hasPermission(['owner', 'admin']) ? 1 : 0) + // Acciones
                  (user?.role !== 'supervisor' ? 1 : 0) + // Sucursal
                  5 // Producto, Stock Actual, Stock Mínimo, Reservado, Estado
                } className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl">📭</span>
                    <span className="text-muted font-medium">
                      {filterSearch || filterProduct || (user?.role !== 'supervisor' && filterBranch) || filterLowStock 
                        ? 'No se encontraron resultados con los filtros aplicados' 
                        : 'No hay registros de inventario'}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredInventory.map((item) => {
                const status = getStockStatus(item)
                return (
                  <tr key={item.id} className="group hover:bg-gradient-to-r hover:from-slate-800/40 hover:to-slate-700/20 transition-all duration-200 border-b border-slate-600/10">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white group-hover:text-accent transition-colors">{item.product?.name || 'N/A'}</div>
                      <div className="text-xs text-muted mt-0.5">{item.product?.sku || ''}</div>
                    </td>
                    {/* Celda de sucursal - Oculto para supervisores */}
                    {user?.role !== 'supervisor' && (
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 bg-slate-800/30 rounded-lg px-2 py-1 border border-slate-600/20">
                          <span className="text-blue-400">🏢</span>
                          <span className="text-sm text-white">{item.branch?.name || 'N/A'}</span>
                        </div>
                      </td>
                    )}
                    <td className="py-4 px-6">
                      <div className="font-bold text-lg text-green-400">{item.stock_current || 0}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-white">{item.stock_minimum || 0}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-yellow-400">{item.reserved_stock || 0}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-sm ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    {hasPermission(['owner', 'admin']) && (
                      <td className="py-4 px-6">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all hover:scale-110"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all hover:scale-110"
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
              <button 
                onClick={() => {
                  setShowForm(false)
                  setEditingItem(null)
                  setFormData({
                    product_id: '',
                    branch_id: '',
                    quantity: '',
                    min_stock: '',
                    notes: ''
                  })
                  setCedisStock(null)
                }} 
                className="text-2xl hover:opacity-70"
              >
                ✕
              </button>
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

              {/* Mostrar stock disponible en CEDIS para admin */}
              {!editingItem && user?.role === 'admin' && formData.product_id && cedisStock !== null && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 text-lg">📦</span>
                    <div>
                      <p className="text-sm font-medium text-blue-300">
                        Stock disponible en CEDIS: <span className="font-bold text-lg">{cedisStock}</span> unidades
                      </p>
                      <p className="text-xs text-blue-400/80 mt-1">
                        No puedes asignar más de esta cantidad a otras sucursales
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
                  max={user?.role === 'admin' && cedisStock !== null && !editingItem ? cedisStock : undefined}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                />
                {!editingItem && user?.role === 'admin' && cedisStock !== null && (
                  <p className="text-xs text-muted mt-1">
                    Máximo disponible: {cedisStock} unidades (desde CEDIS)
                  </p>
                )}
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
                  className="px-4 py-2 border border-slate-600/30 rounded-md hover:bg-surface/50"
                  disabled={saving}
                  onClick={() => {
                    setShowForm(false)
                    setEditingItem(null)
                    setFormData({
                      product_id: '',
                      branch_id: '',
                      quantity: '',
                      min_stock: '',
                      notes: ''
                    })
                    setCedisStock(null)
                  }}
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

      {/* Modal de error */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        message={errorModal.message}
      />
    </div>
  )
}
