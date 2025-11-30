import { useEffect, useState } from 'react'
import { returnService } from '../../services/returnService'
import { authService } from '../../services/authService'
import { useAuth } from '../../contexts/AuthContext'
import ConfirmModal from '../molecules/ConfirmModal'
import PromptModal from '../molecules/PromptModal'
import SuccessModal from '../molecules/SuccessModal'
import LoadingModal from '../molecules/LoadingModal'
import NotFound from '../molecules/NotFound'

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
  const [promptModal, setPromptModal] = useState({ isOpen: false, title: '', message: '', errorMessage: null, onConfirm: null })

  const { hasPermission, user } = useAuth()

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
      // Si es cashier, el estado siempre será 'pending' y no se puede cambiar
      const initialStatus = user?.role === 'cashier' ? 'pending' : 'pending'
      setFormData({
        sale_id: '',
        sale_item_id: '',
        customer_id: '',
        product_id: '',
        quantity: 1,
        reason: '',
        status: initialStatus,
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
            errorMessage: null,
            onClearError: () => setPromptModal(prev => ({ ...prev, errorMessage: null })),
            onConfirm: async (password) => {
              if (!password) {
                setPromptModal(prev => ({ ...prev, errorMessage: 'Se requiere contraseña' }))
                return
              }

              // Verificar contraseña
              try {
                const verifyResponse = await authService.verifyPassword(password)
                if (!verifyResponse || !verifyResponse.success) {
                  setPromptModal(prev => ({ 
                    ...prev, 
                    errorMessage: 'Contraseña incorrecta. Por favor, intenta nuevamente.' 
                  }))
                  return
                }
                // Contraseña correcta, cerrar modal y continuar
                setPromptModal({ isOpen: false, title: '', message: '', onConfirm: null, errorMessage: null, onClearError: null })
                await saveReturnData()
              } catch (err) {
                // Verificar si el error es de contraseña incorrecta
                const errorMsg = err.message || ''
                const isPasswordError = errorMsg.toLowerCase().includes('incorrecta') || 
                                       errorMsg.toLowerCase().includes('incorrect') ||
                                       errorMsg.toLowerCase().includes('contraseña')
                
                setPromptModal(prev => ({ 
                  ...prev, 
                  errorMessage: isPasswordError 
                    ? 'Contraseña incorrecta. Por favor, intenta nuevamente.' 
                    : 'Error al verificar la contraseña. Por favor, intenta nuevamente.'
                }))
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
            errorMessage: null,
            onClearError: () => setPromptModal(prev => ({ ...prev, errorMessage: null })),
            onConfirm: async (password) => {
              if (!password) {
                setPromptModal(prev => ({ ...prev, errorMessage: 'Se requiere contraseña' }))
                return
              }

              // Verificar contraseña
              try {
                const verifyResponse = await authService.verifyPassword(password)
                if (!verifyResponse || !verifyResponse.success) {
                  setPromptModal(prev => ({ 
                    ...prev, 
                    errorMessage: 'Contraseña incorrecta. Por favor, intenta nuevamente.' 
                  }))
                  return
                }
                // Contraseña correcta, cerrar modal y continuar
                setPromptModal({ isOpen: false, title: '', message: '', onConfirm: null, errorMessage: null, onClearError: null })
                await saveReturnData()
              } catch (err) {
                // Verificar si el error es de contraseña incorrecta
                const errorMsg = err.message || ''
                const isPasswordError = errorMsg.toLowerCase().includes('incorrecta') || 
                                       errorMsg.toLowerCase().includes('incorrect') ||
                                       errorMsg.toLowerCase().includes('contraseña')
                
                setPromptModal(prev => ({ 
                  ...prev, 
                  errorMessage: isPasswordError 
                    ? 'Contraseña incorrecta. Por favor, intenta nuevamente.' 
                    : 'Error al verificar la contraseña. Por favor, intenta nuevamente.'
                }))
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
      // Preparar datos para enviar
      const dataToSend = { ...formData }
      
      // Si es cashier y está creando una nueva devolución, forzar estado a 'pending'
      if (!editingReturn && user?.role === 'cashier') {
        dataToSend.status = 'pending'
      }
      
      if (editingReturn) {
        await returnService.update(editingReturn.id, dataToSend)
        setSuccessModal({ isOpen: true, message: 'Devolución actualizada exitosamente' })
      } else {
        await returnService.create(dataToSend)
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
    <>
      <LoadingModal isOpen={loading} message="Cargando devoluciones..." />
      <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-gradient-to-r from-slate-800/50 via-slate-700/30 to-slate-800/50 rounded-xl border border-slate-700/50 shadow-lg">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-4xl">↩️</span>
            <span>Devoluciones</span>
          </h1>
          <p className="text-muted text-sm">Gestiona las devoluciones de productos</p>
        </div>
        {hasPermission(['admin', 'cashier']) && (
          <button 
            onClick={() => handleOpenModal()} 
            className="btn-primary flex items-center gap-2 px-6 py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <span className="text-xl">➕</span>
            <span>Nueva Devolución</span>
          </button>
        )}
      </div>

      {/* Mensajes de error y éxito */}
      {error && (
        <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 p-4 rounded-lg border border-red-500/30 shadow-lg animate-slide-down flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 p-4 rounded-lg border border-green-500/30 shadow-lg animate-slide-down flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <span>{successMessage}</span>
        </div>
      )}

      {/* Estadísticas */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="card text-center p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 hover:border-blue-500/40 transition-all hover:scale-105 shadow-lg">
            <div className="text-4xl font-bold text-blue-400 mb-2">{statistics.total}</div>
            <div className="text-muted text-sm font-medium flex items-center justify-center gap-2">
              <span>📊</span>
              <span>Total</span>
            </div>
          </div>
          <div className="card text-center p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 hover:border-yellow-500/40 transition-all hover:scale-105 shadow-lg">
            <div className="text-4xl font-bold text-yellow-400 mb-2">{statistics.pending}</div>
            <div className="text-muted text-sm font-medium flex items-center justify-center gap-2">
              <span>⏳</span>
              <span>Pendientes</span>
            </div>
          </div>
          <div className="card text-center p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 hover:border-green-500/40 transition-all hover:scale-105 shadow-lg">
            <div className="text-4xl font-bold text-green-400 mb-2">{statistics.approved}</div>
            <div className="text-muted text-sm font-medium flex items-center justify-center gap-2">
              <span>✅</span>
              <span>Aprobadas</span>
            </div>
          </div>
          <div className="card text-center p-6 bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 hover:border-red-500/40 transition-all hover:scale-105 shadow-lg">
            <div className="text-4xl font-bold text-red-400 mb-2">{statistics.rejected}</div>
            <div className="text-muted text-sm font-medium flex items-center justify-center gap-2">
              <span>❌</span>
              <span>Rechazadas</span>
            </div>
          </div>
          <div className="card text-center p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 hover:border-purple-500/40 transition-all hover:scale-105 shadow-lg">
            <div className="text-4xl font-bold text-purple-400 mb-2">{statistics.totalItems}</div>
            <div className="text-muted text-sm font-medium flex items-center justify-center gap-2">
              <span>📦</span>
              <span>Items Totales</span>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="card p-6 bg-gradient-to-br from-surface/50 to-surface/30 border border-slate-700/50 shadow-lg rounded-xl">
        <div className="flex items-center justify-between mb-6 border-b border-slate-700/40 pb-4">
          <h2 className="text-xl font-bold text-text flex items-center gap-3">
            <span className="text-accent text-2xl">🔍</span>
            <span>Filtros de Búsqueda</span>
          </h2>
          {(search || statusFilter) && (
            <button
              onClick={() => {
                handleSearchChange('')
                handleStatusChange('')
              }}
              className="text-sm text-red-400 hover:text-red-300 transition flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20"
              title="Limpiar filtros"
            >
              <span className="text-lg">🗑️</span>
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-muted flex items-center gap-1">
              <span className="text-blue-400">🔎</span>
              Buscar devolución
            </label>
            <input
              type="text"
              placeholder="Cliente, producto o motivo..."
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full px-4 py-3 border border-slate-600/30 rounded-lg bg-slate-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder:text-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-muted flex items-center gap-1">
              <span className="text-green-400">🚦</span>
              Filtrar por estado
            </label>
            <select
              value={statusFilter}
              onChange={e => handleStatusChange(e.target.value)}
              className="w-full px-4 py-3 border border-slate-600/30 rounded-lg bg-slate-800/50 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-white"
            >
              <option value="">✨ Todos los estados</option>
              <option value="pending">⏳ Pendiente</option>
              <option value="approved">✅ Aprobada</option>
              <option value="rejected">❌ Rechazada</option>
            </select>
          </div>
        </div>
        {(search || statusFilter) && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400">
              Mostrando resultados filtrados
              {search && <span className="font-semibold"> • Búsqueda: "{search}"</span>}
              {statusFilter && <span className="font-semibold"> • Estado: {statusFilter}</span>}
            </p>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="card border border-slate-600/20 shadow-xl">
        {returns.length === 0 ? (
          <NotFound 
            message="No hay devoluciones registradas"
            subtitle="Aún no se han registrado devoluciones en el sistema"
          />
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
                        <span>👤</span>
                        <span>Verificada por</span>
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
                          {returnItem.status === 'approved' && returnItem.approvedBy ? (
                            <span className="text-green-400">
                              ✅ {returnItem.approvedBy.first_name} {returnItem.approvedBy.last_name}
                            </span>
                          ) : returnItem.status === 'rejected' && returnItem.rejectedBy ? (
                            <span className="text-red-400">
                              ❌ {returnItem.rejectedBy.first_name} {returnItem.rejectedBy.last_name}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          {/* Owner solo puede ver detalles, no editar */}
                          {hasPermission(['owner']) ? (
                            <button
                              onClick={() => handleOpenModal(returnItem)}
                              className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all hover:scale-110"
                            >
                              Ver detalles
                            </button>
                          ) : hasPermission(['admin', 'supervisor']) ? (
                            <>
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
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-gradient-to-r from-slate-800/30 to-slate-700/20 rounded-lg border border-slate-600/20">
              <div className="text-sm text-muted flex items-center gap-2">
                <span className="text-lg">📄</span>
                <span>
                  Mostrando <strong className="text-white">{returns.length}</strong> de <strong className="text-white">{pagination.total}</strong> devoluciones
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-slate-600/30 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 disabled:hover:scale-100 flex items-center gap-2"
                >
                  <span>←</span>
                  <span>Anterior</span>
                </button>
                <span className="px-4 py-2 bg-slate-800/50 border border-slate-600/30 rounded-lg text-white font-semibold">
                  Página {pagination.page} de {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                  className="px-4 py-2 border border-slate-600/30 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 disabled:hover:scale-100 flex items-center gap-2"
                >
                  <span>Siguiente</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-surface via-slate-800 to-surface rounded-xl p-6 max-w-3xl w-full mx-4 my-8 border border-slate-700/50 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700/50">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">↩️</span>
                <span>{editingReturn ? 'Editar Devolución' : 'Nueva Devolución'}</span>
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white transition-colors text-2xl hover:scale-110"
              >
                ✕
              </button>
            </div>
            
            {!editingReturn && !saleData && (
              <div className="mb-6 p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/30 rounded-xl shadow-lg">
                <h3 className="font-bold text-xl mb-3 text-blue-400 flex items-center gap-2">
                  <span className="text-3xl">🎫</span>
                  <span>Paso 1: Buscar Ticket de Venta</span>
                </h3>
                <p className="text-sm text-muted mb-4 flex items-center gap-2">
                  <span>ℹ️</span>
                  <span>Ingresa el número de ticket de la venta para encontrar los productos que se pueden devolver</span>
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Ingresa el número de ticket (ej: TXN-20251113-XXX)"
                    value={ticketReference}
                    onChange={e => setTicketReference(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSearchSale()}
                    className="flex-1 px-4 py-3 border border-slate-600/30 rounded-lg bg-slate-800/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder:text-slate-500 text-lg"
                    autoFocus
                  />
                  <button
                    onClick={handleSearchSale}
                    disabled={searchingSale || !ticketReference.trim()}
                    className="btn-primary whitespace-nowrap px-6 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all text-base font-semibold"
                  >
                    {searchingSale ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>Buscando...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl">🔍</span>
                        <span>Buscar Ticket</span>
                      </>
                    )}
                  </button>
                </div>
                {error && error.includes('Ticket') && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{error}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {saleData && !selectedProduct && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-4 text-green-400 flex items-center gap-2">
                  <span className="text-2xl">📦</span>
                  <span>Paso 2: Seleccionar Producto</span>
                </h3>
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 p-5 rounded-xl mb-4 border border-slate-600/30 shadow-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted mb-1">👤 Cliente</p>
                      <p className="font-semibold text-white">{saleData.customer?.first_name} {saleData.customer?.last_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted mb-1">🎫 Ticket</p>
                      <p className="font-semibold text-white">{saleData.transaction_reference}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted mb-1">📅 Fecha</p>
                      <p className="font-semibold text-white">{new Date(saleData.sale_date).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted mb-1">💰 Total</p>
                      <p className="font-semibold text-green-400 text-lg">${parseFloat(saleData.total_amount).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {saleData.items?.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectProduct(item)}
                      className="flex justify-between items-center p-4 border border-slate-600/30 rounded-xl hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/30 cursor-pointer transition-all hover:scale-[1.02] hover:border-accent/50 shadow-md hover:shadow-lg"
                    >
                      <div>
                        <p className="font-semibold text-white text-lg">{item.product?.name}</p>
                        <p className="text-sm text-muted mt-1">SKU: {item.product?.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-400 text-lg">Cantidad: {item.quantity}</p>
                        <p className="text-sm text-muted mt-1">${parseFloat(item.unit_price).toFixed(2)} c/u</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(selectedProduct || editingReturn) && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="font-bold text-lg mb-4 text-purple-400 flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  <span>{editingReturn?.status === 'approved' ? 'Detalles de la Devolución' : 'Paso 3: Detalles de la Devolución'}</span>
                </h3>
                
                {selectedProduct && (
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 p-4 rounded-xl border border-slate-600/30 shadow-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted mb-1">📦 Producto</p>
                        <p className="font-semibold text-white">{selectedProduct.product?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted mb-1">🔢 Cantidad comprada</p>
                        <p className="font-semibold text-yellow-400 text-lg">{selectedProduct.quantity}</p>
                      </div>
                    </div>
                  </div>
                )}

                {editingReturn && (
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 p-4 rounded-xl border border-slate-600/30 shadow-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted mb-1">👤 Cliente</p>
                        <p className="font-semibold text-white">{editingReturn.customer?.first_name} {editingReturn.customer?.last_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted mb-1">📦 Producto</p>
                        <p className="font-semibold text-white">{editingReturn.product?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted mb-1">📅 Fecha de devolución</p>
                        <p className="font-semibold text-white">{new Date(editingReturn.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2 text-muted flex items-center gap-1">
                    <span>🔢</span>
                    <span>Cantidad a devolver *</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct?.quantity || 999}
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    required
                    disabled={editingReturn?.status === 'approved' || (editingReturn && user?.role === 'owner')}
                    className="w-full px-4 py-3 border border-slate-600/30 rounded-lg bg-slate-800/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-muted flex items-center gap-1">
                    <span>💬</span>
                    <span>Motivo de la devolución *</span>
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                    required
                    rows="4"
                    disabled={editingReturn?.status === 'approved' || (editingReturn && user?.role === 'owner')}
                    className="w-full px-4 py-3 border border-slate-600/30 rounded-lg bg-slate-800/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white placeholder:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Describe el motivo de la devolución..."
                  />
                </div>

                {/* Campo de estado: solo visible para admin y supervisor, o cuando se está editando (pero no para owner) */}
                {((hasPermission(['admin', 'supervisor']) || editingReturn) && user?.role !== 'owner') && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted flex items-center gap-1">
                      <span>🚦</span>
                      <span>Estado *</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                      required
                      disabled={editingReturn?.status === 'approved' || (editingReturn && !hasPermission(['admin', 'supervisor']))}
                      className="w-full px-4 py-3 border border-slate-600/30 rounded-lg bg-slate-800/50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="pending">⏳ Pendiente</option>
                      <option value="approved">✅ Aprobada</option>
                      <option value="rejected">❌ Rechazada</option>
                    </select>
                    {formData.status === 'approved' && (
                      <div className="mt-3 p-4 bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border border-yellow-500/40 rounded-xl shadow-lg">
                        <p className="text-yellow-400 text-sm flex items-start gap-2">
                          <span className="text-xl">⚠️</span>
                          <span>
                            <strong className="text-yellow-300">ADVERTENCIA:</strong> Al aprobar esta devolución, el inventario se actualizará automáticamente y <strong>NO se podrán revertir los cambios</strong>.
                          </span>
                        </p>
                      </div>
                    )}
                    {formData.status === 'rejected' && (
                      <div className="mt-3 p-4 bg-gradient-to-r from-red-500/20 to-red-600/10 border border-red-500/40 rounded-xl shadow-lg">
                        <p className="text-red-400 text-sm flex items-start gap-2">
                          <span className="text-xl">⚠️</span>
                          <span>
                            <strong className="text-red-300">ATENCIÓN:</strong> Debes especificar el motivo del rechazo.
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Mostrar estado fijo para cashiers cuando crean una devolución */}
                {!editingReturn && user?.role === 'cashier' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted flex items-center gap-1">
                      <span>🚦</span>
                      <span>Estado</span>
                    </label>
                    <div className="w-full px-4 py-3 border border-slate-600/30 rounded-lg bg-slate-800/50 text-white flex items-center gap-2">
                      <span className="text-yellow-400 text-xl">⏳</span>
                      <span className="font-semibold">Pendiente</span>
                      <span className="text-xs text-muted ml-auto">(Será revisada por un supervisor o administrador)</span>
                    </div>
                    <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <p className="text-blue-400 text-sm">
                        ℹ️ <strong>Información:</strong> Las devoluciones creadas por cajeros quedan en estado "Pendiente" y deben ser aprobadas o rechazadas por un supervisor o administrador.
                      </p>
                    </div>
                  </div>
                )}

                {/* Mensajes de estado para devoluciones editadas */}
                {editingReturn?.status === 'approved' && (
                  <div className="mt-3 p-4 bg-gradient-to-r from-green-500/20 to-green-600/10 border border-green-500/40 rounded-xl shadow-lg">
                    <p className="text-green-400 text-sm flex items-start gap-2 mb-2">
                      <span className="text-xl">✓</span>
                      <span>
                        <strong className="text-green-300">APROBADA:</strong> Esta devolución ya fue aprobada y procesada. El inventario fue actualizado.
                      </span>
                    </p>
                    {editingReturn?.approvedBy && (
                      <p className="text-green-400 text-sm ml-7">
                        Verificada por: <strong className="text-green-300">{editingReturn.approvedBy.first_name} {editingReturn.approvedBy.last_name}</strong>
                      </p>
                    )}
                  </div>
                )}
                {editingReturn?.status === 'rejected' && (
                  <div className="mt-3 p-4 bg-gradient-to-r from-red-500/20 to-red-600/10 border border-red-500/40 rounded-xl shadow-lg">
                    <p className="text-red-400 text-sm flex items-start gap-2 mb-2">
                      <span className="text-xl">✗</span>
                      <span>
                        <strong className="text-red-300">RECHAZADA:</strong> Esta devolución fue rechazada.
                      </span>
                    </p>
                    {editingReturn?.rejectedBy && (
                      <p className="text-red-400 text-sm ml-7 mb-1">
                        Verificada por: <strong className="text-red-300">{editingReturn.rejectedBy.first_name} {editingReturn.rejectedBy.last_name}</strong>
                      </p>
                    )}
                    {editingReturn?.rejection_reason && (
                      <p className="text-red-400 text-sm ml-7">
                        Motivo: <strong className="text-red-300">{editingReturn.rejection_reason}</strong>
                      </p>
                    )}
                  </div>
                )}

                {formData.status === 'rejected' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted flex items-center gap-1">
                      <span>❌</span>
                      <span>Motivo del rechazo *</span>
                    </label>
                    <textarea
                      value={formData.rejection_reason}
                      onChange={e => setFormData({ ...formData, rejection_reason: e.target.value })}
                      required={formData.status === 'rejected'}
                      rows="4"
                      disabled={editingReturn?.status === 'rejected' || (editingReturn && user?.role === 'owner')}
                      className="w-full px-4 py-3 border border-slate-600/30 rounded-lg bg-slate-800/50 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-white placeholder:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Explica por qué se rechaza esta devolución..."
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-6 border-t border-slate-700/50">
                  {editingReturn?.status === 'approved' || (editingReturn && user?.role === 'owner') ? (
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-6 py-3 border border-slate-600/30 rounded-lg w-full bg-slate-800/50 hover:bg-slate-700/50 text-white transition-all hover:scale-105"
                    >
                      Cerrar
                    </button>
                  ) : (
                    <>
                      <button 
                        type="submit" 
                        className="btn-primary flex-1 px-6 py-3 text-base font-semibold hover:scale-105 transition-all shadow-lg"
                      >
                        {editingReturn ? '💾 Actualizar' : '✨ Crear Devolución'}
                      </button>
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-6 py-3 border border-slate-600/30 rounded-lg flex-1 bg-slate-800/50 hover:bg-slate-700/50 text-white transition-all hover:scale-105"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </form>
            )}

            {!selectedProduct && !editingReturn && !saleData && (
              <div className="text-center py-8">
                <div className="inline-block p-6 bg-gradient-to-br from-slate-800/50 to-slate-700/30 rounded-xl border border-slate-600/30">
                  <div className="text-6xl mb-4">🎫</div>
                  <p className="text-lg text-white font-semibold mb-2">Busca el ticket de venta para comenzar</p>
                  <p className="text-sm text-muted">Ingresa el número de ticket en el campo de búsqueda arriba</p>
                </div>
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
        onCancel={() => setPromptModal({ isOpen: false, title: '', message: '', errorMessage: null, onConfirm: null, onClearError: null })}
        title={promptModal.title}
        message={promptModal.message}
        errorMessage={promptModal.errorMessage}
        onClearError={promptModal.onClearError}
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
    </>
  )
}
