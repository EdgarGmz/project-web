import { useEffect, useState } from 'react'
import { returnService } from '../../services/returnService'
import { authService } from '../../services/authService'
import { useAuth } from '../../contexts/AuthContext'
import ConfirmModal from '../molecules/ConfirmModal'
import PromptModal from '../molecules/PromptModal'
import SuccessModal from '../molecules/SuccessModal'

export default function Returns() {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [statistics, setStatistics] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingReturn, setEditingReturn] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 })
  
  // Estados para búsqueda de ticket
  const [ticketReference, setTicketReference] = useState('')
  const [searchingSale, setSearchingSale] = useState(false)
  const [saleData, setSaleData] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  
  const [formData, setFormData] = useState({
    sale_id: '',
    sale_item_id: '',
    customer_id: '',
    product_id: '',
    quantity: 1,
    reason: '',
    status: 'pending',
    rejection_reason: ''
  })

  // Estados para modales
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: 'warning', message: '', onConfirm: null })
  const [promptModal, setPromptModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null })

  const { hasPermission } = useAuth()

  useEffect(() => {
    fetchReturns()
    // eslint-disable-next-line
  }, [pagination.page, statusFilter, search])

  const fetchReturns = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
        status: statusFilter
      }
      
      const response = await returnService.getAll(params)
      
      if (response && response.success) {
        setReturns(response.data)
        setStatistics(response.statistics)
        setPagination(prev => ({
          ...prev,
          total: response.pagination.total,
          pages: response.pagination.pages
        }))
      }
    } catch (err) {
      setError('Error al cargar las devoluciones: ' + (err.message || 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  const handleSearchSale = async () => {
    if (!ticketReference.trim()) {
      setError('Ingresa un número de ticket')
      return
    }

    setSearchingSale(true)
    setError('')
    try {
      const response = await returnService.getSaleByReference(ticketReference)
      
      if (response && response.success) {
        setSaleData(response.data)
        setSuccessMessage('Ticket encontrado exitosamente')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (err) {
      setError('Ticket no encontrado: ' + (err.message || 'Error desconocido'))
      setSaleData(null)
    } finally {
      setSearchingSale(false)
    }
  }

  const handleSelectProduct = (saleItem) => {
    setSelectedProduct(saleItem)
    setFormData({
      sale_id: saleData.id,
      sale_item_id: saleItem.id,
      customer_id: saleData.customer_id,
      product_id: saleItem.product_id,
      quantity: 1,
      reason: '',
      status: 'pending',
      rejection_reason: ''
    })
  }

  const handleSearchChange = (value) => {
    setSearch(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleStatusChange = (value) => {
    setStatusFilter(value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleOpenModal = (returnItem = null) => {
    if (returnItem) {
      setEditingReturn(returnItem)
      setFormData({
        sale_id: returnItem.sale_id || '',
        sale_item_id: returnItem.sale_item_id || '',
        customer_id: returnItem.customer_id,
        product_id: returnItem.product_id,
        quantity: returnItem.quantity,
        reason: returnItem.reason,
        status: returnItem.status,
        rejection_reason: returnItem.rejection_reason || ''
      })
    } else {
      setEditingReturn(null)
      setSaleData(null)
      setSelectedProduct(null)
      setTicketReference('')
      setFormData({
        sale_id: '',
        sale_item_id: '',
        customer_id: '',
        product_id: '',
        quantity: 1,
        reason: '',
        status: 'pending',
        rejection_reason: ''
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingReturn(null)
    setSaleData(null)
    setSelectedProduct(null)
    setTicketReference('')
    setFormData({
      sale_id: '',
      sale_item_id: '',
      customer_id: '',
      product_id: '',
      quantity: 1,
      reason: '',
      status: 'pending'
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Si se está rechazando una devolución, validar motivo de rechazo
    if (formData.status === 'rejected' && (!editingReturn || editingReturn.status !== 'rejected')) {
      if (!formData.rejection_reason || formData.rejection_reason.trim() === '') {
        setError('Debes especificar el motivo del rechazo')
        return
      }

      // Mostrar modal de confirmación de rechazo
      setConfirmModal({
        isOpen: true,
        type: 'warning',
        message: `¿Estás seguro de que deseas rechazar esta devolución?\n\nMotivo: ${formData.rejection_reason}`,
        onConfirm: () => {
          setConfirmModal({ isOpen: false })
          // Solicitar contraseña
          setPromptModal({
            isOpen: true,
            title: 'Confirmar Rechazo',
            message: 'Por favor, ingresa tu contraseña para confirmar el rechazo:',
            onConfirm: async (password) => {
              setPromptModal({ isOpen: false })
              if (!password) {
                setError('Rechazo cancelado: Se requiere contraseña')
                return
              }

              // Verificar contraseña
              try {
                const verifyResponse = await authService.verifyPassword(password)
                if (!verifyResponse || !verifyResponse.success) {
                  setError('Contraseña incorrecta. No se puede rechazar la devolución.')
                  return
                }
                // Continuar con el guardado
                await saveReturnData()
              } catch (err) {
                setError('Contraseña incorrecta: ' + (err.message || 'Error al verificar'))
              }
            }
          })
        }
      })
      return
    }
    
    // Si se está aprobando una devolución, solicitar contraseña
    if (formData.status === 'approved' && (!editingReturn || editingReturn.status !== 'approved')) {
      // Mostrar modal de confirmación de aprobación
      setConfirmModal({
        isOpen: true,
        type: 'warning',
        message: '⚠️ ATENCIÓN: Una vez aprobada la devolución, se actualizará el inventario y NO se podrán revertir los cambios.\n\n¿Estás seguro de que deseas aprobar esta devolución?',
        onConfirm: () => {
          setConfirmModal({ isOpen: false })
          // Solicitar contraseña
          setPromptModal({
            isOpen: true,
            title: 'Confirmar Aprobación',
            message: 'Por favor, ingresa tu contraseña para confirmar la aprobación:',
            onConfirm: async (password) => {
              setPromptModal({ isOpen: false })
              if (!password) {
                setError('Aprobación cancelada: Se requiere contraseña')
                return
              }

              // Verificar contraseña
              try {
                const verifyResponse = await authService.verifyPassword(password)
                if (!verifyResponse || !verifyResponse.success) {
                  setError('Contraseña incorrecta. No se puede aprobar la devolución.')
                  return
                }
                // Continuar con el guardado
                await saveReturnData()
              } catch (err) {
                setError('Contraseña incorrecta: ' + (err.message || 'Error al verificar'))
              }
            }
          })
        }
      })
      return
    }
    
    // Si no requiere confirmación especial, guardar directamente
    await saveReturnData()
  }

  // Función auxiliar para guardar los datos
  const saveReturnData = async () => {
    
    try {
      if (editingReturn) {
        await returnService.update(editingReturn.id, formData)
        setSuccessModal({ isOpen: true, message: 'Devolución actualizada exitosamente' })
      } else {
        await returnService.create(formData)
        setSuccessModal({ isOpen: true, message: 'Devolución creada exitosamente' })
      }
      
      handleCloseModal()
      fetchReturns()
    } catch (err) {
      setError('Error al guardar la devolución: ' + (err.message || 'Error desconocido'))
    }
  }

  // Función deshabilitada: Las devoluciones no deben ser eliminadas para mantener registro completo
  // const handleDelete = async (id) => {
  //   if (!window.confirm('¿Estás seguro de eliminar esta devolución?')) return
  //   
  //   try {
  //     await returnService.delete(id)
  //     setSuccessMessage('Devolución eliminada exitosamente')
  //     fetchReturns()
  //     setTimeout(() => setSuccessMessage(''), 3000)
  //   } catch (err) {
  //     setError('Error al eliminar la devolución: ' + (err.message || 'Error desconocido'))
  //   }
  // }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'bg-yellow-500/20 text-yellow-400', label: 'Pendiente' },
      approved: { class: 'bg-green-500/20 text-green-400', label: 'Aprobada' },
      rejected: { class: 'bg-red-500/20 text-red-400', label: 'Rechazada' }
    }
    const config = statusConfig[status] || statusConfig.pending
    return <span className={`px-2 py-1 rounded text-xs ${config.class}`}>{config.label}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Devoluciones</h1>
        {hasPermission(['admin']) && (
          <button onClick={() => handleOpenModal()} className="btn-primary">
            + Nueva Devolución
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/20 text-red-400 p-3 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-500/20 text-green-400 p-3 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Estadísticas */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="card text-center">
            <div className="text-2xl font-semibold text-blue-400">{statistics.total}</div>
            <div className="text-muted text-sm">Total</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-semibold text-yellow-400">{statistics.pending}</div>
            <div className="text-muted text-sm">Pendientes</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-semibold text-green-400">{statistics.approved}</div>
            <div className="text-muted text-sm">Aprobadas</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-semibold text-red-400">{statistics.rejected}</div>
            <div className="text-muted text-sm">Rechazadas</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-semibold text-purple-400">{statistics.totalItems}</div>
            <div className="text-muted text-sm">Items Totales</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filtros</h2>
          {(search || statusFilter) && (
            <button
              onClick={() => {
                handleSearchChange('')
                handleStatusChange('')
              }}
              className="text-sm text-accent hover:opacity-80 transition flex items-center gap-2"
              title="Limpiar filtros"
            >
              🗑️ Limpiar filtros
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2">Buscar</label>
            <input
              type="text"
              placeholder="Cliente, producto o motivo..."
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Estado</label>
            <select
              value={statusFilter}
              onChange={e => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
            >
              <option value="">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobada</option>
              <option value="rejected">Rechazada</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card border border-slate-600/20 shadow-xl">
        {loading ? (
          <div className="text-center py-8 text-muted">Cargando devoluciones...</div>
        ) : returns.length === 0 ? (
          <div className="text-center py-8 text-muted">No hay devoluciones registradas.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 border-b border-slate-600/30">
                    <th className="py-4 px-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>Fecha</span>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>👥</span>
                        <span>Cliente</span>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>📦</span>
                        <span>Producto</span>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>🔢</span>
                        <span>Cantidad</span>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>💬</span>
                        <span>Motivo</span>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>🚦</span>
                        <span>Estado</span>
                      </div>
                    </th>
                    <th className="py-4 px-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>✅</span>
                        <span>Aprobada por</span>
                      </div>
                    </th>
                    {hasPermission(['owner', 'admin', 'supervisor', 'cashier']) && (
                      <th className="py-4 px-6 text-left text-sm font-bold text-white uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <span>⚙️</span>
                          <span>Acciones</span>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-600/20">
                  {returns.map((returnItem) => (
                    <tr key={returnItem.id} className="group hover:bg-gradient-to-r hover:from-slate-800/40 hover:to-slate-700/20 transition-all duration-200 border-b border-slate-600/10">
                      <td className="py-4 px-6">
                        <div className="text-sm text-white">{new Date(returnItem.created_at).toLocaleDateString('es-MX', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-white">
                          {returnItem.customer ? 
                            `${returnItem.customer.first_name} ${returnItem.customer.last_name}` : 
                            'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white group-hover:text-accent transition-colors">{returnItem.product?.name || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-lg text-yellow-400">{returnItem.quantity}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="bg-slate-800/30 rounded-lg p-2 border border-slate-600/20">
                          <p className="text-sm text-white/90">{returnItem.reason}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(returnItem.status)}</td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-white">
                          {returnItem.approvedBy ? 
                            `${returnItem.approvedBy.first_name} ${returnItem.approvedBy.last_name}` : 
                            '-'}
                        </div>
                      </td>
                      {hasPermission(['owner', 'admin', 'supervisor']) && (
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            {returnItem.status === 'approved' ? (
                              <button
                                onClick={() => handleOpenModal(returnItem)}
                                className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all hover:scale-110"
                              >
                                Ver detalles
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenModal(returnItem)}
                                className="p-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent hover:text-accent/80 transition-all hover:scale-110"
                              >
                                Editar
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted">
                Mostrando {returns.length} de {pagination.total} devoluciones
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-slate-600/30 rounded-md disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-3 py-1">
                  Página {pagination.page} de {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                  className="px-3 py-1 border border-slate-600/30 rounded-md disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-surface rounded-lg p-6 max-w-2xl w-full mx-4 my-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingReturn ? 'Editar Devolución' : 'Nueva Devolución'}
            </h2>
            
            {!editingReturn && !saleData && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-md">
                <h3 className="font-semibold mb-3">Paso 1: Buscar Ticket de Venta</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ingresa el número de ticket (ej: TXN-20251113-XXX)"
                    value={ticketReference}
                    onChange={e => setTicketReference(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-600/30 rounded-md bg-surface"
                  />
                  <button
                    onClick={handleSearchSale}
                    disabled={searchingSale}
                    className="btn-primary whitespace-nowrap"
                  >
                    {searchingSale ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>
              </div>
            )}

            {saleData && !selectedProduct && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Paso 2: Seleccionar Producto</h3>
                <div className="bg-slate-800/30 p-4 rounded-md mb-4">
                  <p><strong>Cliente:</strong> {saleData.customer?.first_name} {saleData.customer?.last_name}</p>
                  <p><strong>Ticket:</strong> {saleData.transaction_reference}</p>
                  <p><strong>Fecha:</strong> {new Date(saleData.sale_date).toLocaleString()}</p>
                  <p><strong>Total:</strong> ${parseFloat(saleData.total_amount).toFixed(2)}</p>
                </div>
                <div className="space-y-2">
                  {saleData.items?.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectProduct(item)}
                      className="flex justify-between items-center p-3 border border-slate-600/30 rounded-md hover:bg-slate-700/30 cursor-pointer"
                    >
                      <div>
                        <p className="font-medium">{item.product?.name}</p>
                        <p className="text-sm text-muted">SKU: {item.product?.sku}</p>
                      </div>
                      <div className="text-right">
                        <p>Cantidad: {item.quantity}</p>
                        <p className="text-sm text-muted">${parseFloat(item.unit_price).toFixed(2)} c/u</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(selectedProduct || editingReturn) && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-semibold mb-3">
                  {editingReturn?.status === 'approved' ? 'Detalles de la Devolución' : 'Paso 3: Detalles de la Devolución'}
                </h3>
                
                {selectedProduct && (
                  <div className="bg-slate-800/30 p-3 rounded-md">
                    <p><strong>Producto:</strong> {selectedProduct.product?.name}</p>
                    <p><strong>Cantidad comprada:</strong> {selectedProduct.quantity}</p>
                  </div>
                )}

                {editingReturn && (
                  <div className="bg-slate-800/30 p-3 rounded-md space-y-2">
                    <p><strong>Cliente:</strong> {editingReturn.customer?.first_name} {editingReturn.customer?.last_name}</p>
                    <p><strong>Producto:</strong> {editingReturn.product?.name}</p>
                    <p><strong>Fecha de devolución:</strong> {new Date(editingReturn.created_at).toLocaleDateString()}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm mb-2">Cantidad a devolver *</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct?.quantity || 999}
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    required
                    disabled={editingReturn?.status === 'approved'}
                    className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Motivo de la devolución *</label>
                  <textarea
                    value={formData.reason}
                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                    required
                    rows="3"
                    disabled={editingReturn?.status === 'approved'}
                    className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Describe el motivo de la devolución"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">Estado *</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    required
                    disabled={editingReturn?.status === 'approved'}
                    className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="approved">Aprobada</option>
                    <option value="rejected">Rechazada</option>
                  </select>
                  {formData.status === 'approved' && (
                    <div className="mt-2 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-md">
                      <p className="text-yellow-400 text-sm">
                        ⚠️ <strong>ADVERTENCIA:</strong> Al aprobar esta devolución, el inventario se actualizará automáticamente y <strong>NO se podrán revertir los cambios</strong>.
                      </p>
                    </div>
                  )}
                  {formData.status === 'rejected' && (
                    <div className="mt-2 p-3 bg-red-500/20 border border-red-500/30 rounded-md">
                      <p className="text-red-400 text-sm mb-2">
                        ⚠️ <strong>ATENCIÓN:</strong> Debes especificar el motivo del rechazo.
                      </p>
                    </div>
                  )}
                  {editingReturn?.status === 'approved' && (
                    <div className="mt-2 p-3 bg-green-500/20 border border-green-500/30 rounded-md">
                      <p className="text-green-400 text-sm">
                        ✓ <strong>APROBADA:</strong> Esta devolución ya fue aprobada y procesada. El inventario fue actualizado.
                      </p>
                      {editingReturn?.approvedBy && (
                        <p className="text-green-400 text-sm mt-1">
                          Aprobada por: {editingReturn.approvedBy.first_name} {editingReturn.approvedBy.last_name}
                        </p>
                      )}
                    </div>
                  )}
                  {editingReturn?.status === 'rejected' && (
                    <div className="mt-2 p-3 bg-red-500/20 border border-red-500/30 rounded-md">
                      <p className="text-red-400 text-sm">
                        ✗ <strong>RECHAZADA:</strong> Esta devolución fue rechazada.
                      </p>
                      {editingReturn?.RejectedBy && (
                        <p className="text-red-400 text-sm mt-1">
                          Rechazada por: {editingReturn.RejectedBy.first_name} {editingReturn.RejectedBy.last_name}
                        </p>
                      )}
                      {editingReturn?.rejection_reason && (
                        <p className="text-red-400 text-sm mt-1">
                          Motivo: {editingReturn.rejection_reason}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {formData.status === 'rejected' && (
                  <div>
                    <label className="block text-sm mb-2">Motivo del rechazo *</label>
                    <textarea
                      value={formData.rejection_reason}
                      onChange={e => setFormData({ ...formData, rejection_reason: e.target.value })}
                      required={formData.status === 'rejected'}
                      rows="3"
                      disabled={editingReturn?.status === 'rejected'}
                      className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Explica por qué se rechaza esta devolución"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  {editingReturn?.status === 'approved' ? (
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 border border-slate-600/30 rounded-md w-full"
                    >
                      Cerrar
                    </button>
                  ) : (
                    <>
                      <button type="submit" className="btn-primary flex-1">
                        {editingReturn ? 'Actualizar' : 'Crear Devolución'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-4 py-2 border border-slate-600/30 rounded-md flex-1"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </form>
            )}

            {!selectedProduct && !editingReturn && !saleData && (
              <div className="text-center py-8 text-muted">
                <p>Busca el ticket de venta para comenzar</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modales */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ isOpen: false })}
        title={confirmModal.type === 'warning' ? '⚠️ Confirmación Requerida' : '¿Estás seguro?'}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText="Confirmar"
        cancelText="Cancelar"
      />

      <PromptModal
        isOpen={promptModal.isOpen}
        onConfirm={promptModal.onConfirm}
        onCancel={() => setPromptModal({ isOpen: false })}
        title={promptModal.title}
        message={promptModal.message}
        placeholder="Ingresa tu contraseña"
        isPassword={true}
      />

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        message={successModal.message}
      />
    </div>
  )
}
