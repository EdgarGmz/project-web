import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { saleService } from '../../services/saleServices'
import { branchService } from '../../services/branchService'
import { userService } from '../../services/userService'
import { jsPDF } from 'jspdf'

export default function Sales() {
  const { hasPermission, user } = useAuth()
  const [sales, setSales] = useState([])
  const [branches, setBranches] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Estados para filtros
  const [filterBranch, setFilterBranch] = useState('')
  const [filterUser, setFilterUser] = useState('')
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')

  useEffect(() => {
    // Solo cargar sucursales si el usuario no es cashier (cashier solo ve su sucursal)
    if (user?.role !== 'cashier') {
      fetchBranches()
    }
    fetchUsers()
  }, [user]) // Depender de user para saber si es cashier

  useEffect(() => {
    fetchSales()
  }, [currentPage, filterBranch, filterUser, filterPaymentMethod, filterDateFrom, filterDateTo])

  const fetchSales = async () => {
    try {
      setLoading(true)
      setError('')
      
      const params = {
        page: currentPage,
        limit: 10
      }
      
      if (filterBranch) params.branch_id = filterBranch
      if (filterUser) params.user_id = filterUser
      if (filterPaymentMethod) params.payment_method = filterPaymentMethod
      if (filterDateFrom) params.date_from = filterDateFrom
      if (filterDateTo) params.date_to = filterDateTo
      
      const queryParams = new URLSearchParams(params).toString()
      console.log('Cargando ventas con params:', queryParams)
      const response = await saleService.getAll(queryParams)
      console.log('Ventas recibidas:', response)
      console.log('Array de ventas:', response?.data)
      
      if (response && response.success) {
        setSales(response.data || [])
        console.log('Sales state actualizado con', response.data?.length, 'ventas')
        if (response.pagination) {
          setTotalPages(response.pagination.pages)
        }
      }
    } catch (error) {
      console.error('Error fetching sales:', error)
      setError('Error al cargar las ventas')
    } finally {
      setLoading(false)
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

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll()
      if (response && response.success) {
        setUsers(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const viewSaleDetails = async (saleId) => {
    try {
      const response = await saleService.getById(saleId)
      if (response && response.success) {
        setSelectedSale(response.data)
        setShowDetails(true)
      }
    } catch (error) {
      console.error('Error fetching sale details:', error)
      setError('Error al cargar los detalles de la venta')
    }
  }

  const handleClearFilters = () => {
    setFilterBranch('')
    setFilterUser('')
    setFilterPaymentMethod('')
    setFilterDateFrom('')
    setFilterDateTo('')
    setCurrentPage(1)
  }

  const getPaymentMethodIcon = (method) => {
    const icons = {
      cash: '💵',
      card: '💳',
      transfer: '🏦'
    }
    return icons[method] || '💰'
  }

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
      mixed: 'Mixto'
    }
    return labels[method] || method
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400', label: 'Pendiente' },
      completed: { color: 'bg-green-500/20 text-green-400', label: 'Completada' },
      cancelled: { color: 'bg-red-500/20 text-red-400', label: 'Cancelada' },
      refunded: { color: 'bg-blue-500/20 text-blue-400', label: 'Reembolsada' }
    }
    return badges[status] || { color: 'bg-gray-500/20 text-gray-400', label: status }
  }

  // Función para generar el PDF del ticket
  const generateTicketPDF = (sale) => {
    try {
      if (!sale) {
        console.error('❌ No hay datos de venta para generar el ticket')
        return
      }

      // Crear PDF con formato de ticket
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      
      // Configuración del ticket
      const ticketWidth = 80
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 8
      const contentWidth = ticketWidth - 2 * margin
      let yPos = margin

      // ========== ENCABEZADO ==========
      doc.setDrawColor(50, 50, 50)
      doc.setFillColor(30, 30, 30)
      doc.rect(margin, yPos - 2, ticketWidth - 2 * margin, 12, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('APEX STORE', pageWidth / 2, yPos + 4, { align: 'center' })
      
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('Sistema de Punto de Venta', pageWidth / 2, yPos + 7, { align: 'center' })
      
      yPos += 12
      doc.setTextColor(0, 0, 0)

      // Información de la sucursal
      if (sale.branch) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(60, 60, 60)
        doc.text(sale.branch.name || 'Sucursal', pageWidth / 2, yPos, { align: 'center' })
        yPos += 4
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(80, 80, 80)
        
        if (sale.branch.address) {
          const addressLines = doc.splitTextToSize(sale.branch.address, contentWidth)
          addressLines.forEach(line => {
            doc.text(line, pageWidth / 2, yPos, { align: 'center' })
            yPos += 3
          })
        }
      }

      yPos += 2
      doc.setTextColor(0, 0, 0)
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 4

      // Información del ticket
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(40, 40, 40)
      doc.text('TICKET DE COMPRA', pageWidth / 2, yPos, { align: 'center' })
      yPos += 5

      // Información de la transacción
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(60, 60, 60)
      
      const saleDate = sale.sale_date || sale.created_at ? new Date(sale.sale_date || sale.created_at) : new Date()
      const dateStr = saleDate.toLocaleDateString('es-MX', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
      const timeStr = saleDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      
      doc.setFont('helvetica', 'bold')
      doc.text('Fecha:', margin, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(`${dateStr} ${timeStr}`, margin + 20, yPos)
      yPos += 4

      if (sale.transaction_reference) {
        doc.setFont('helvetica', 'bold')
        doc.text('Ticket:', margin, yPos)
        doc.setFont('helvetica', 'normal')
        doc.setFont('courier', 'normal')
        doc.text(sale.transaction_reference, margin + 20, yPos)
        doc.setFont('helvetica', 'normal')
        yPos += 4
      }

      // Cliente
      doc.setFont('helvetica', 'bold')
      doc.text('Cliente:', margin, yPos)
      doc.setFont('helvetica', 'normal')
      if (sale.customer) {
        doc.text(`${sale.customer.first_name} ${sale.customer.last_name}`, margin + 20, yPos)
      } else {
        doc.text('Público en General', margin + 20, yPos)
      }
      yPos += 4

      // Cajero
      if (sale.user) {
        doc.setFont('helvetica', 'bold')
        doc.text('Cajero:', margin, yPos)
        doc.setFont('helvetica', 'normal')
        doc.text(`${sale.user.first_name} ${sale.user.last_name}`, margin + 20, yPos)
        yPos += 4
      }

      yPos += 2
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 4

      // Items de la venta
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(40, 40, 40)
      doc.text('PRODUCTOS', margin, yPos)
      yPos += 5

      doc.setDrawColor(100, 100, 100)
      doc.setLineWidth(0.5)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 3

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(0, 0, 0)
      
      sale.items?.forEach((item, index) => {
        if (yPos > doc.internal.pageSize.getHeight() - 30) {
          doc.addPage()
          yPos = margin
        }

        const itemName = item.product?.name || item.product_name || 'Producto'
        const quantity = item.quantity || 1
        const unitPrice = parseFloat(item.unit_price || 0)
        const subtotal = unitPrice * quantity

        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250)
          doc.rect(margin, yPos - 2, ticketWidth - 2 * margin, 8, 'F')
        }

        doc.setFont('helvetica', 'bold')
        doc.text(`${quantity}`, margin + 2, yPos)
        
        doc.setFont('helvetica', 'normal')
        const nameWidth = contentWidth - 35
        const nameLines = doc.splitTextToSize(itemName, nameWidth)
        doc.text(nameLines[0], margin + 12, yPos)
        
        doc.setFont('helvetica', 'bold')
        const subtotalText = `$${subtotal.toFixed(2)}`
        doc.text(subtotalText, pageWidth - margin - 2, yPos, { align: 'right' })
        yPos += 3.5

        if (nameLines.length > 1) {
          doc.setFont('helvetica', 'normal')
          for (let i = 1; i < nameLines.length; i++) {
            if (yPos > doc.internal.pageSize.getHeight() - 30) {
              doc.addPage()
              yPos = margin
            }
            doc.text(nameLines[i], margin + 12, yPos)
            yPos += 3
          }
        }

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(6)
        doc.setTextColor(120, 120, 120)
        doc.text(`@ $${unitPrice.toFixed(2)} c/u`, margin + 12, yPos)
        doc.setFontSize(7)
        doc.setTextColor(0, 0, 0)
        yPos += 4

        if (index < (sale.items?.length || 0) - 1) {
          doc.setDrawColor(230, 230, 230)
          doc.setLineWidth(0.2)
          doc.line(margin + 10, yPos - 1, pageWidth - margin - 10, yPos - 1)
        }
      })

      yPos += 2
      doc.setDrawColor(100, 100, 100)
      doc.setLineWidth(0.5)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 1
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 4

      // Totales
      const total = parseFloat(sale.total_amount || 0)
      
      doc.setFillColor(240, 240, 240)
      doc.rect(margin, yPos - 3, ticketWidth - 2 * margin, 8, 'F')
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(40, 40, 40)
      doc.text('TOTAL', margin + 5, yPos + 2)
      doc.text(`$${total.toFixed(2)}`, pageWidth - margin - 5, yPos + 2, { align: 'right' })
      yPos += 8

      // Método de pago
      yPos += 2
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(60, 60, 60)
      const paymentMethodLabel = {
        'cash': '💵 Efectivo',
        'card': '💳 Tarjeta',
        'transfer': '🏦 Transferencia',
        'mixed': '💰 Mixto'
      }[sale.payment_method] || sale.payment_method || '💵 Efectivo'
      
      doc.setFont('helvetica', 'bold')
      doc.text('Método de pago:', margin, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(paymentMethodLabel, margin + 35, yPos)
      yPos += 4

      yPos += 3
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 5

      // Mensaje de gratitud
      doc.setFillColor(245, 245, 245)
      doc.rect(margin, yPos - 2, ticketWidth - 2 * margin, 8, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(50, 50, 50)
      doc.text('¡GRACIAS POR SU COMPRA!', pageWidth / 2, yPos + 3, { align: 'center' })
      yPos += 8

      // Guardar el PDF
      const fileName = `ticket_${sale.transaction_reference || sale.id || Date.now()}.pdf`
      
      try {
        doc.save(fileName)
        console.log('✅ PDF generado y descargado exitosamente:', fileName)
        setSuccess('Ticket reimpreso exitosamente')
        setTimeout(() => setSuccess(''), 3000)
      } catch (saveError) {
        console.error('⚠️ Error al guardar PDF:', saveError)
        try {
          const pdfBlob = doc.output('blob')
          const url = URL.createObjectURL(pdfBlob)
          const link = document.createElement('a')
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          setSuccess('Ticket reimpreso exitosamente')
          setTimeout(() => setSuccess(''), 3000)
        } catch (altError) {
          console.error('❌ Error en método alternativo:', altError)
          setError('Error al generar el PDF del ticket')
          setTimeout(() => setError(''), 5000)
        }
      }
    } catch (error) {
      console.error('❌ Error crítico al generar ticket PDF:', error)
      setError('Error al generar el PDF del ticket')
      setTimeout(() => setError(''), 5000)
    }
  }

  // Calcular estadísticas de la página actual
  const totalSales = sales.length
  const totalAmount = sales.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0)
  const averageTicket = totalSales > 0 ? totalAmount / totalSales : 0

  if (loading) {
    return <div className="card text-center py-8">Cargando ventas...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ventas</h1>
          <p className="text-muted">Historial y gestión de ventas</p>
        </div>
      </div>

      {/* Mensajes */}
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

      {/* Filtros */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filtros</h2>
          {(filterBranch || filterUser || filterPaymentMethod || filterDateFrom || filterDateTo) && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-accent hover:opacity-80 transition flex items-center gap-2"
              title="Limpiar filtros"
            >
              🗑️ Limpiar filtros
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Solo mostrar filtro de sucursal si el usuario no es cashier */}
          {user?.role !== 'cashier' && (
            <div>
              <label className="block text-sm font-medium mb-2">Sucursal</label>
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
              >
                <option value="">Todas las sucursales</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Cajero</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            >
              <option value="">Todos los cajeros</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Método de pago</label>
            <select
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            >
              <option value="">Todos los métodos</option>
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
              <option value="mixed">Mixto</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fecha desde</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fecha hasta</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-semibold text-accent">{totalSales}</div>
          <div className="text-muted">Total Ventas</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-green-400">
            ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-muted">Monto Total</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-blue-400">
            ${averageTicket.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-muted">Ticket Promedio</div>
        </div>
      </div>

      {/* Lista de ventas */}
      <div className="card overflow-hidden border border-slate-600/20 shadow-xl">
        {loading ? (
          <div className="text-center py-8 text-muted">Cargando ventas...</div>
        ) : sales.length === 0 ? (
          <div className="text-center py-8 text-muted">
            No hay ventas registradas
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 border-b border-slate-600/30">
                    <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>🔖</span>
                        <span>Referencia</span>
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>Fecha</span>
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>👥</span>
                        <span>Cliente</span>
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>🏢</span>
                        <span>Sucursal</span>
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>👤</span>
                        <span>Cajero</span>
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>📦</span>
                        <span>Items</span>
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>💰</span>
                        <span>Total</span>
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>💳</span>
                        <span>Pago</span>
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
                  {sales.map((sale) => {
                    console.log('Renderizando venta:', sale)
                    return (
                    <tr key={sale.id} className="group hover:bg-gradient-to-r hover:from-slate-800/40 hover:to-slate-700/20 transition-all duration-200 border-b border-slate-600/10">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm bg-slate-800/30 rounded-lg px-2 py-1 border border-slate-600/20 text-white">{sale.transaction_reference || 'N/A'}</span>
                          {sale.transaction_reference && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(sale.transaction_reference)
                                setSuccess('Número de ticket copiado al portapapeles')
                                setTimeout(() => setSuccess(''), 2000)
                              }}
                              className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all hover:scale-110"
                              title="Copiar número de ticket"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-white">{new Date(sale.sale_date || sale.created_at).toLocaleDateString('es-MX', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</div>
                        <div className="text-muted text-xs mt-0.5">{new Date(sale.sale_date || sale.created_at).toLocaleTimeString()}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-white">
                          {sale.customer ? `${sale.customer.first_name} ${sale.customer.last_name}` : 'Cliente general'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 bg-slate-800/30 rounded-lg px-2 py-1 border border-slate-600/20">
                          <span className="text-blue-400">🏢</span>
                          <span className="text-sm text-white">{sale.branch?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-white">
                          {sale.user ? `${sale.user.first_name} ${sale.user.last_name}` : 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1.5 bg-accent/20 text-accent border border-accent/30 rounded-lg text-xs font-semibold shadow-sm">
                          {sale.items?.length || 0} items
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-lg text-green-400">
                          ${Number(sale.total_amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 bg-slate-800/30 rounded-lg px-2 py-1 border border-slate-600/20">
                          <span className="text-lg">{getPaymentMethodIcon(sale.payment_method)}</span>
                          <span className="text-sm text-white">{getPaymentMethodLabel(sale.payment_method)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-sm ${getStatusBadge(sale.status).color}`}>
                          {getStatusBadge(sale.status).label}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewSaleDetails(sale.id)}
                            className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all hover:scale-110"
                            title="Ver detalles"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => generateTicketPDF(sale)}
                            className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 hover:text-green-300 transition-all hover:scale-110"
                            title="Reimprimir ticket"
                          >
                            🖨️
                          </button>
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-600/20">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-slate-600/30 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-sm text-muted">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-slate-600/30 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de detalles */}
      {showDetails && selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-3xl w-full max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">
                Detalles de Venta
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-2xl hover:opacity-70 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Información general */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted">Referencia</div>
                  <div className="font-mono">{selectedSale.transaction_reference}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted">Fecha y hora</div>
                  <div>{new Date(selectedSale.sale_date || selectedSale.created_at).toLocaleString()}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted">Cliente</div>
                  <div>
                    {selectedSale.customer 
                      ? `${selectedSale.customer.first_name} ${selectedSale.customer.last_name}`
                      : 'Cliente general'
                    }
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted">Cajero</div>
                  <div>
                    {selectedSale.user 
                      ? `${selectedSale.user.first_name} ${selectedSale.user.last_name}`
                      : 'N/A'
                    }
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted">Sucursal</div>
                  <div>{selectedSale.branch?.name || 'N/A'}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted">Método de pago</div>
                  <div className="flex items-center gap-2">
                    <span>{getPaymentMethodIcon(selectedSale.payment_method)}</span>
                    <span>{getPaymentMethodLabel(selectedSale.payment_method)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted">Estado</div>
                  <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(selectedSale.status).color}`}>
                    {getStatusBadge(selectedSale.status).label}
                  </span>
                </div>
              </div>

              {/* Items vendidos */}
              <div>
                <h4 className="font-semibold mb-3">Productos vendidos</h4>
                <div className="border border-slate-600/20 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-surface/50">
                      <tr>
                        <th className="text-left py-2 px-3 text-sm">Producto</th>
                        <th className="text-left py-2 px-3 text-sm">SKU</th>
                        <th className="text-right py-2 px-3 text-sm">Cantidad</th>
                        <th className="text-right py-2 px-3 text-sm">Precio Unit.</th>
                        <th className="text-right py-2 px-3 text-sm">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.items?.map((item, index) => (
                        <tr key={index} className="border-t border-slate-600/10">
                          <td className="py-2 px-3">{item.product?.name || 'N/A'}</td>
                          <td className="py-2 px-3 text-muted text-sm">{item.product?.sku || 'N/A'}</td>
                          <td className="py-2 px-3 text-right">{item.quantity}</td>
                          <td className="py-2 px-3 text-right">
                            ${Number(item.unit_price).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-3 text-right font-medium">
                            ${(Number(item.unit_price) * Number(item.quantity)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totales */}
              <div className="bg-surface/50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${Number(selectedSale.subtotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {selectedSale.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-muted">
                      <span>Descuento:</span>
                      <span>-${Number(selectedSale.discount_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-muted">
                    <span>IVA ({(selectedSale.tax_rate * 100).toFixed(0)}%):</span>
                    <span>${Number(selectedSale.tax_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-slate-600/20 pt-2">
                    <span>Total:</span>
                    <span className="text-accent">
                      ${Number(selectedSale.total_amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {selectedSale.notes && (
                <div className="bg-surface/50 p-4 rounded-lg">
                  <div className="text-sm text-muted mb-1">Notas:</div>
                  <div>{selectedSale.notes}</div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => generateTicketPDF(selectedSale)}
                  className="btn flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  🖨️ Reimprimir Ticket
                </button>
                <button
                  onClick={() => setShowDetails(false)}
                  className="btn flex-1"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}