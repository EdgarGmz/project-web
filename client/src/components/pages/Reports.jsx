import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { reportService } from '../../services/reportService'
import { logService } from '../../services/logService'
import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export default function Reports() {
    const [filterBranch, setFilterBranch] = useState('');
    // Paginación para inventario
    const [inventoryPage, setInventoryPage] = useState(1);
    const pageSize = 10;
  const [reportType, setReportType] = useState('sales')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]
  })
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [filterStatus, setFilterStatus] = useState('');
  const { hasPermission, user } = useAuth()

  const reportTypes = [
    { value: 'sales', label: 'Ventas', icon: '💰' },
    { value: 'inventory', label: 'Inventario', icon: '📊' },
    { value: 'customers', label: 'Clientes', icon: '👥' },
    { value: 'financial', label: 'Financiero', icon: '💹' },
    { value: 'returns', label: 'Devoluciones', icon: '↩️' }
  ]

  useEffect(() => {
    generateReport();
    setInventoryPage(1); // Reiniciar página al cambiar filtro
  }, [reportType, dateRange, filterStatus, filterBranch])

  const generateReport = async () => {
    if (!hasPermission(['owner', 'admin', 'supervisor'])) return

    setLoading(true)
    setError('')
    try {
      const params = {
        type: reportType,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }

      console.log('Generando reporte con params:', params)
      const response = await reportService.generate(params)
      console.log('Reporte recibido:', response)
      
      if (response && response.success) {
        setReportData(response.data)
        setSuccessMessage('Reporte generado exitosamente')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error generating report:', error)
      setError(error.message || 'Error al generar el reporte')
      setTimeout(() => setError(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  const exportToPDF = () => {
    if (!reportData) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 15
    let yPos = 20

    // Título del reporte
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    const reportTitle = reportTypes.find(t => t.value === reportType)?.label || 'Reporte'
    doc.text(reportTitle, margin, yPos)
    yPos += 10

    // Información del período
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Período: ${new Date(dateRange.startDate).toLocaleDateString('es-MX')} - ${new Date(dateRange.endDate).toLocaleDateString('es-MX')}`, margin, yPos)
    doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`, margin, yPos + 5)
    yPos += 15

    // Contenido según el tipo de reporte
    if (reportType === 'sales') {
      // KPIs
      const kpiData = [
        ['Total Ventas', reportData.totalSales || 0],
        ['Ingresos', `$${parseFloat(reportData.totalRevenue || 0).toFixed(2)}`],
        ['Ticket Promedio', `$${parseFloat(reportData.averageTicket || 0).toFixed(2)}`],
        ['Items Vendidos', reportData.totalItems || 0]
      ]
      autoTable(doc, {
        startY: yPos,
        head: [['Métrica', 'Valor']],
        body: kpiData,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] }
      })
      yPos = doc.lastAutoTable.finalY + 15

      // Ventas por día
      if (reportData.dailySales && reportData.dailySales.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Fecha', 'Total']],
          body: reportData.dailySales.map(day => [
            new Date(day.date).toLocaleDateString('es-MX'),
            `$${parseFloat(day.total || 0).toFixed(2)}`
          ]),
          theme: 'striped',
          headStyles: { fillColor: [66, 139, 202] }
        })
        yPos = doc.lastAutoTable.finalY + 15
      }

      // Productos más vendidos
      if (reportData.topProducts && reportData.topProducts.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Producto', 'Cantidad', 'Ingresos']],
          body: reportData.topProducts.map(product => [
            product.name || 'N/A',
            product.quantity || 0,
            `$${parseFloat(product.revenue || 0).toFixed(2)}`
          ]),
          theme: 'striped',
          headStyles: { fillColor: [66, 139, 202] }
        })
      }
    } else if (reportType === 'inventory') {
      const kpiData = [
        ['Total Productos', reportData.totalProducts || 0],
        ['Stock Bajo', reportData.lowStockItems || 0],
        ['Sin Stock', reportData.outOfStockItems || 0],
        ['Valor Inventario', `$${parseFloat(reportData.inventoryValue || 0).toFixed(2)}`]
      ]
      autoTable(doc, {
        startY: yPos,
        head: [['Métrica', 'Valor']],
        body: kpiData,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] }
      })
      yPos = doc.lastAutoTable.finalY + 15

      // Lista de productos
      if (reportData.productsList && reportData.productsList.length > 0) {
        const filtered = reportData.productsList.filter(product => 
          (!filterStatus || product.status === filterStatus) && 
          (!filterBranch || product.branch === filterBranch)
        )
        autoTable(doc, {
          startY: yPos,
          head: [['Producto', 'Sucursal', 'Stock', 'Stock Mín', 'Estado', 'Valor']],
          body: filtered.map(product => [
            product.name || 'N/A',
            product.branch || 'N/A',
            product.stock || 0,
            product.min_stock || 0,
            product.status || 'N/A',
            `$${(product.stock * product.cost).toFixed(2)}`
          ]),
          theme: 'striped',
          headStyles: { fillColor: [66, 139, 202] }
        })
      }
    } else if (reportType === 'customers') {
      const kpiData = [
        ['Total Clientes', reportData.totalCustomers || 0],
        ['Activos', reportData.activeCustomers || 0],
        ['Nuevos', reportData.newCustomers || 0],
        ['Gasto Promedio', `$${parseFloat(reportData.averageSpent || 0).toFixed(2)}`]
      ]
      autoTable(doc, {
        startY: yPos,
        head: [['Métrica', 'Valor']],
        body: kpiData,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] }
      })
      yPos = doc.lastAutoTable.finalY + 15

      // Lista de clientes
      if (reportData.customers && reportData.customers.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Cliente', 'Email', 'Compras', 'Total Gastado']],
          body: reportData.customers.map(customer => [
            customer.name || 'N/A',
            customer.email || 'N/A',
            customer.totalPurchases || 0,
            `$${parseFloat(customer.totalSpent || 0).toFixed(2)}`
          ]),
          theme: 'striped',
          headStyles: { fillColor: [66, 139, 202] }
        })
      }
    } else if (reportType === 'financial') {
      const kpiData = [
        ['Ingresos Totales', `$${parseFloat(reportData.totalIncome || 0).toFixed(2)}`],
        ['Gastos Totales', `$${parseFloat(reportData.totalExpenses || 0).toFixed(2)}`],
        ['Devoluciones', `$${parseFloat(reportData.totalReturns || 0).toFixed(2)}`],
        ['Ganancia Neta', `$${parseFloat(reportData.netProfit || 0).toFixed(2)}`],
        ['Margen de Ganancia', `${reportData.profitMargin || 0}%`]
      ]
      autoTable(doc, {
        startY: yPos,
        head: [['Métrica', 'Valor']],
        body: kpiData,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] }
      })
    } else if (reportType === 'returns' && reportData.summary) {
      const kpiData = [
        ['Total Devoluciones', reportData.summary.totalReturns || 0],
        ['Aprobadas', reportData.summary.approvedReturns || 0],
        ['Rechazadas', reportData.summary.rejectedReturns || 0],
        ['Pendientes', reportData.summary.pendingReturns || 0],
        ['Valor Total Devuelto', `$${parseFloat(reportData.summary.totalReturnValue || 0).toFixed(2)}`],
        ['Items Devueltos', reportData.summary.totalReturnedQuantity || 0],
        ['Valor Promedio', `$${parseFloat(reportData.summary.averageReturnValue || 0).toFixed(2)}`]
      ]
      autoTable(doc, {
        startY: yPos,
        head: [['Métrica', 'Valor']],
        body: kpiData,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] }
      })
      yPos = doc.lastAutoTable.finalY + 15

      // Productos más devueltos
      if (reportData.topReturnedProducts && reportData.topReturnedProducts.length > 0) {
        autoTable(doc, {
          startY: yPos,
          head: [['Producto', 'Total', 'Aprobadas', 'Rechazadas']],
          body: reportData.topReturnedProducts.map(product => [
            product.productName || 'N/A',
            product.quantity || 0,
            product.approved || 0,
            product.rejected || 0
          ]),
          theme: 'striped',
          headStyles: { fillColor: [66, 139, 202] }
        })
      }
    }

    // Guardar el PDF
    const fileName = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
    
    // Registrar log de exportación
    if (user?.id) {
      const reportTypeLabel = reportTypes.find(t => t.value === reportType)?.label || reportType
      logService.create({
        user_id: user.id,
        action: 'EXPORT',
        service: 'report',
        message: `Exportó reporte de ${reportTypeLabel} a PDF (${new Date(dateRange.startDate).toLocaleDateString('es-MX')} - ${new Date(dateRange.endDate).toLocaleDateString('es-MX')})`
      }).catch(err => console.error('Error al registrar log:', err))
    }
    
    setSuccessMessage('Reporte PDF exportado exitosamente')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const exportToExcel = () => {
    if (!reportData) return

    const workbook = XLSX.utils.book_new()
    const reportTitle = reportTypes.find(t => t.value === reportType)?.label || 'Reporte'

    if (reportType === 'sales') {
      // Hoja de KPIs
      const kpiData = [
        ['Métrica', 'Valor'],
        ['Total Ventas', reportData.totalSales || 0],
        ['Ingresos', parseFloat(reportData.totalRevenue || 0).toFixed(2)],
        ['Ticket Promedio', parseFloat(reportData.averageTicket || 0).toFixed(2)],
        ['Items Vendidos', reportData.totalItems || 0]
      ]
      const kpiSheet = XLSX.utils.aoa_to_sheet(kpiData)
      XLSX.utils.book_append_sheet(workbook, kpiSheet, 'Resumen')

      // Hoja de ventas por día
      if (reportData.dailySales && reportData.dailySales.length > 0) {
        const dailyData = [
          ['Fecha', 'Total']
        ]
        reportData.dailySales.forEach(day => {
          dailyData.push([
            new Date(day.date).toLocaleDateString('es-MX'),
            parseFloat(day.total || 0).toFixed(2)
          ])
        })
        const dailySheet = XLSX.utils.aoa_to_sheet(dailyData)
        XLSX.utils.book_append_sheet(workbook, dailySheet, 'Ventas por Día')
      }

      // Hoja de productos más vendidos
      if (reportData.topProducts && reportData.topProducts.length > 0) {
        const productsData = [
          ['Producto', 'Cantidad', 'Ingresos']
        ]
        reportData.topProducts.forEach(product => {
          productsData.push([
            product.name || 'N/A',
            product.quantity || 0,
            parseFloat(product.revenue || 0).toFixed(2)
          ])
        })
        const productsSheet = XLSX.utils.aoa_to_sheet(productsData)
        XLSX.utils.book_append_sheet(workbook, productsSheet, 'Productos Más Vendidos')
      }

      // Hoja de métodos de pago
      if (reportData.paymentMethods && reportData.paymentMethods.length > 0) {
        const paymentData = [
          ['Método', 'Total', 'Cantidad']
        ]
        reportData.paymentMethods.forEach(method => {
          paymentData.push([
            method.method === 'cash' ? 'Efectivo' : method.method === 'card' ? 'Tarjeta' : 'Transferencia',
            parseFloat(method.total || 0).toFixed(2),
            method.count || 0
          ])
        })
        const paymentSheet = XLSX.utils.aoa_to_sheet(paymentData)
        XLSX.utils.book_append_sheet(workbook, paymentSheet, 'Métodos de Pago')
      }
    } else if (reportType === 'inventory') {
      // Hoja de KPIs
      const kpiData = [
        ['Métrica', 'Valor'],
        ['Total Productos', reportData.totalProducts || 0],
        ['Stock Bajo', reportData.lowStockItems || 0],
        ['Sin Stock', reportData.outOfStockItems || 0],
        ['Valor Inventario', parseFloat(reportData.inventoryValue || 0).toFixed(2)]
      ]
      const kpiSheet = XLSX.utils.aoa_to_sheet(kpiData)
      XLSX.utils.book_append_sheet(workbook, kpiSheet, 'Resumen')

      // Hoja de productos
      if (reportData.productsList && reportData.productsList.length > 0) {
        const filtered = reportData.productsList.filter(product => 
          (!filterStatus || product.status === filterStatus) && 
          (!filterBranch || product.branch === filterBranch)
        )
        const productsData = [
          ['Producto', 'Sucursal', 'Stock', 'Stock Mínimo', 'Estado', 'Valor']
        ]
        filtered.forEach(product => {
          productsData.push([
            product.name || 'N/A',
            product.branch || 'N/A',
            product.stock || 0,
            product.min_stock || 0,
            product.status || 'N/A',
            (product.stock * product.cost).toFixed(2)
          ])
        })
        const productsSheet = XLSX.utils.aoa_to_sheet(productsData)
        XLSX.utils.book_append_sheet(workbook, productsSheet, 'Inventario')
      }
    } else if (reportType === 'customers') {
      // Hoja de KPIs
      const kpiData = [
        ['Métrica', 'Valor'],
        ['Total Clientes', reportData.totalCustomers || 0],
        ['Activos', reportData.activeCustomers || 0],
        ['Nuevos', reportData.newCustomers || 0],
        ['Gasto Promedio', parseFloat(reportData.averageSpent || 0).toFixed(2)]
      ]
      const kpiSheet = XLSX.utils.aoa_to_sheet(kpiData)
      XLSX.utils.book_append_sheet(workbook, kpiSheet, 'Resumen')

      // Hoja de clientes
      if (reportData.customers && reportData.customers.length > 0) {
        const customersData = [
          ['Cliente', 'Email', 'Compras', 'Total Gastado']
        ]
        reportData.customers.forEach(customer => {
          customersData.push([
            customer.name || 'N/A',
            customer.email || 'N/A',
            customer.totalPurchases || 0,
            parseFloat(customer.totalSpent || 0).toFixed(2)
          ])
        })
        const customersSheet = XLSX.utils.aoa_to_sheet(customersData)
        XLSX.utils.book_append_sheet(workbook, customersSheet, 'Clientes')
      }
    } else if (reportType === 'financial') {
      const financialData = [
        ['Métrica', 'Valor'],
        ['Ingresos Totales', parseFloat(reportData.totalIncome || 0).toFixed(2)],
        ['Gastos Totales', parseFloat(reportData.totalExpenses || 0).toFixed(2)],
        ['Devoluciones', parseFloat(reportData.totalReturns || 0).toFixed(2)],
        ['Ganancia Neta', parseFloat(reportData.netProfit || 0).toFixed(2)],
        ['Margen de Ganancia', `${reportData.profitMargin || 0}%`],
        ['Total de Compras', reportData.totalPurchases || 0],
        ['Compra Promedio', parseFloat(reportData.averagePurchase || 0).toFixed(2)],
        ['Total Devoluciones', reportData.totalReturnCount || 0]
      ]
      const financialSheet = XLSX.utils.aoa_to_sheet(financialData)
      XLSX.utils.book_append_sheet(workbook, financialSheet, 'Reporte Financiero')
    } else if (reportType === 'returns' && reportData.summary) {
      // Hoja de resumen
      const summaryData = [
        ['Métrica', 'Valor'],
        ['Total Devoluciones', reportData.summary.totalReturns || 0],
        ['Aprobadas', reportData.summary.approvedReturns || 0],
        ['Rechazadas', reportData.summary.rejectedReturns || 0],
        ['Pendientes', reportData.summary.pendingReturns || 0],
        ['Valor Total Devuelto', parseFloat(reportData.summary.totalReturnValue || 0).toFixed(2)],
        ['Items Devueltos', reportData.summary.totalReturnedQuantity || 0],
        ['Valor Promedio', parseFloat(reportData.summary.averageReturnValue || 0).toFixed(2)],
        ['Tasa de Aprobación', `${reportData.summary.approvalRate || 0}%`],
        ['Tasa de Rechazo', `${reportData.summary.rejectionRate || 0}%`]
      ]
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen')

      // Hoja de productos más devueltos
      if (reportData.topReturnedProducts && reportData.topReturnedProducts.length > 0) {
        const productsData = [
          ['Producto', 'Total', 'Aprobadas', 'Rechazadas', 'Pendientes']
        ]
        reportData.topReturnedProducts.forEach(product => {
          productsData.push([
            product.productName || 'N/A',
            product.quantity || 0,
            product.approved || 0,
            product.rejected || 0,
            product.pending || 0
          ])
        })
        const productsSheet = XLSX.utils.aoa_to_sheet(productsData)
        XLSX.utils.book_append_sheet(workbook, productsSheet, 'Productos Más Devueltos')
      }
    }

    // Guardar el archivo Excel
    const fileName = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
    
    // Registrar log de exportación
    if (user?.id) {
      const reportTypeLabel = reportTypes.find(t => t.value === reportType)?.label || reportType
      logService.create({
        user_id: user.id,
        action: 'EXPORT',
        service: 'report',
        message: `Exportó reporte de ${reportTypeLabel} a Excel (${new Date(dateRange.startDate).toLocaleDateString('es-MX')} - ${new Date(dateRange.endDate).toLocaleDateString('es-MX')})`
      }).catch(err => console.error('Error al registrar log:', err))
    }
    
    setSuccessMessage('Reporte Excel exportado exitosamente')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  if (!hasPermission(['owner', 'admin', 'supervisor'])) {
    return (
      <div className="card text-center py-8">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="font-semibold mb-2">Acceso Restringido</h3>
        <p className="text-muted">No tienes permisos para ver los reportes</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Reportes</h1>
          <p className="text-muted">Análisis y estadísticas del negocio</p>
        </div>
        {reportData && (
          <div className="flex gap-2">
            <button
              onClick={exportToPDF}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <span>📄</span>
              <span>Exportar PDF</span>
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-green-400 font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <span>📊</span>
              <span>Exportar Excel</span>
            </button>
          </div>
        )}
      </div>

      {/* Mensajes de éxito y error */}
      {successMessage && (
        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Controles */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Reporte</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon}{type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fecha Inicio</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fecha Fin</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Contenido del reporte */}
      {loading ? (
        <div className="card text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted">Generando reporte...</p>
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Reporte de Ventas */}
          {reportType === 'sales' && (
            <>
              {/* KPIs principales */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card text-center">
                  <div className="text-2xl font-semibold text-accent">
                    {reportData.totalSales}
                  </div>
                  <div className="text-muted">Total Ventas</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-semibold text-green-400">
                    ${parseFloat(reportData.totalRevenue || 0).toFixed(2)}
                  </div>
                  <div className="text-muted">Ingresos</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-semibold text-blue-400">
                    ${parseFloat(reportData.averageTicket || 0).toFixed(2)}
                  </div>
                  <div className="text-muted">Ticket Promedio</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-semibold text-purple-400">
                    {reportData.totalItems}
                  </div>
                  <div className="text-muted">Items Vendidos</div>
                </div>
              </div>

              {/* Gráficos y tablas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="font-semibold mb-4">Ventas por Día</h3>
                  <div className="space-y-2">
                    {reportData.dailySales?.map((day, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-slate-600/10 last:border-0">
                        <span className="text-sm">{new Date(day.date).toLocaleDateString()}</span>
                        <span className="font-medium">${parseFloat(day.total || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3 className="font-semibold mb-4">Productos Más Vendidos</h3>
                  <div className="space-y-2">
                    {reportData.topProducts?.map((product, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-slate-600/10 last:border-0">
                        <div>
                          <div className="text-sm font-medium">{product.name}</div>
                          <div className="text-xs text-muted">{product.quantity} unidades</div>
                        </div>
                        <span className="font-medium text-accent">${parseFloat(product.revenue || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold mb-4">Ventas por Método de Pago</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {reportData.paymentMethods?.map((method, index) => (
                    <div key={index} className="text-center p-4 bg-surface/50 rounded-lg">
                      <div className="text-xl mb-2">
                        {method.method === 'cash' ? '💵' : method.method === 'card' ? '💳' : '🏦'}
                      </div>
                      <div className="font-semibold">${parseFloat(method.total || 0).toFixed(2)}</div>
                      <div className="text-muted text-sm">
                        {method.method === 'cash' ? 'Efectivo' : 
                         method.method === 'card' ? 'Tarjeta' : 'Transferencia'}
                      </div>
                      <div className="text-xs text-muted">{method.count} ventas</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Reporte de Inventario */}
          {reportType === 'inventory' && (
            <>
              <div className="mb-4 flex gap-4 items-center">
                {/* Filtros envueltos en un solo div padre */}
                <div className="flex gap-4">
                  <div className="flex gap-2 items-center">
                    <label className="font-medium text-slate-500">Filtrar por estado:</label>
                    <select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-600/40 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
                    >
                      <option value="" className="text-slate-400">Todos</option>
                      <option value="Agotado" className="text-red-400">Agotado</option>
                      <option value="Crítico" className="text-yellow-400">Crítico</option>
                      <option value="Normal" className="text-green-400">Normal</option>
                    </select>
                  </div>
                  <div className="flex gap-2 items-center">
                    <label className="font-medium text-slate-500">Filtrar por sucursal:</label>
                    <select
                      value={filterBranch}
                      onChange={e => setFilterBranch(e.target.value)}
                      className="px-3 py-2 rounded-lg border border-slate-600/40 bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-sm"
                    >
                      <option value="">Todas</option>
                      {Array.from(new Set((reportData.productsList || []).map(p => p.branch)))
                        .filter(branch => branch)
                        .map(branch => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card text-center">
                  <div className="text-2xl font-semibold text-accent">
                    {reportData.totalProducts}
                  </div>
                  <div className="text-muted">Total Productos</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-semibold text-yellow-400">
                    {reportData.lowStockItems}
                  </div>
                  <div className="text-muted">Stock Bajo</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-semibold text-red-400">
                    {reportData.outOfStockItems}
                  </div>
                  <div className="text-muted">Sin Stock</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-semibold text-green-400">
                    ${parseFloat(reportData.inventoryValue || 0).toFixed(2)}
                  </div>
                  <div className="text-muted">Valor Inventario</div>
                </div>
              </div>
              <div className="card">
                <h3 className="font-semibold mb-4">Inventario de Productos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-600/20">
                        <th className="text-left py-2 px-3">Producto</th>
                        <th className="text-left py-2 px-3">Sucursal</th>
                        <th className="text-left py-2 px-3">Stock Actual</th>
                        <th className="text-left py-2 px-3">Stock Mínimo</th>
                        <th className="text-left py-2 px-3">Estado</th>
                        <th className="text-left py-2 px-3">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const filtered = (reportData.productsList || [])
                          .filter(product => (!filterStatus || product.status === filterStatus) && (!filterBranch || product.branch === filterBranch));
                        const totalPages = Math.ceil(filtered.length / pageSize);
                        const startIdx = (inventoryPage - 1) * pageSize;
                        const pageProducts = filtered.slice(startIdx, startIdx + pageSize);
                        return pageProducts.map((product, index) => (
                          <tr key={index} className="border-b border-slate-600/10 last:border-0">
                            <td className="py-2 px-3">{product.name}</td>
                            <td className="py-2 px-3">{product.branch}</td>
                            <td className="py-2 px-3">{product.stock}</td>
                            <td className="py-2 px-3">{product.min_stock}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                product.status === 'Agotado' ? 'bg-red-500/20 text-red-400' :
                                product.status === 'Crítico' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {product.status}
                              </span>
                            </td>
                            <td className="py-2 px-3">${(product.stock * product.cost).toFixed(2)}</td>
                          </tr>
                        ))
                      })()}
                    </tbody>
                  </table>
                </div>
                {/* Paginación */}
                <div className="flex justify-end items-center mt-4 gap-2">
                  <button
                    className="btn px-3 py-1 text-sm"
                    disabled={inventoryPage === 1}
                    onClick={() => setInventoryPage(p => Math.max(1, p - 1))}
                  >Anterior</button>
                  <button
                    className="btn px-3 py-1 text-sm"
                    disabled={(() => {
                      const filtered = (reportData.productsList || [])
                        .filter(product => (!filterStatus || product.status === filterStatus) && (!filterBranch || product.branch === filterBranch));
                      const totalPages = Math.ceil(filtered.length / pageSize);
                      return inventoryPage === totalPages || totalPages === 0;
                    })()}
                    onClick={() => setInventoryPage(p => p + 1)}
                  >Siguiente</button>
                </div>
              </div>
            </>
          )}

          {reportType === 'customers' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card text-center">
                  <div className="text-2xl font-semibold text-blue-400">
                    {reportData.totalCustomers}
                  </div>
                  <div className="text-muted">Total Clientes</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-semibold text-green-400">
                    {reportData.activeCustomers}
                  </div>
                  <div className="text-muted">Activos</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-semibold text-purple-400">
                    {reportData.newCustomers}
                  </div>
                  <div className="text-muted">Nuevos</div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-semibold text-accent">
                    ${parseFloat(reportData.averageSpent || 0).toFixed(2)}
                  </div>
                  <div className="text-muted">Gasto Promedio</div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-semibold mb-4">Clientes Registrados</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-600/20">
                        <th className="text-left py-2 px-3">Cliente</th>
                        <th className="text-left py-2 px-3">Email</th>
                        <th className="text-left py-2 px-3">Compras</th>
                        <th className="text-left py-2 px-3">Total Gastado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.customers?.map((customer, index) => (
                        <tr key={index} className="border-b border-slate-600/10 last:border-0">
                          <td className="py-2 px-3">{customer.name}</td>
                          <td className="py-2 px-3">{customer.email}</td>
                          <td className="py-2 px-3">{customer.totalPurchases}</td>
                          <td className="py-2 px-3">${parseFloat(customer.totalSpent || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {reportType === 'financial' && (
            <>
              {/* KPIs principales en una sola fila */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="card text-center flex flex-col items-center justify-center">
                  <div className="text-3xl mb-2">💵</div>
                  <div className="text-2xl font-semibold text-green-400">
                    {parseFloat(reportData.totalIncome).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </div>
                  <div className="text-muted">Ingresos Totales</div>
                </div>
                <div className="card text-center flex flex-col items-center justify-center">
                  <div className="text-3xl mb-2">💸</div>
                  <div className="text-2xl font-semibold text-red-400">
                    {parseFloat(reportData.totalExpenses).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </div>
                  <div className="text-muted">Gastos Totales</div>
                </div>
                <div className="card text-center flex flex-col items-center justify-center">
                  <div className="text-3xl mb-2">↩️</div>
                  <div className="text-2xl font-semibold text-orange-400">
                    {parseFloat(reportData.totalReturns).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </div>
                  <div className="text-muted">Devoluciones</div>
                </div>
                <div className="card text-center flex flex-col items-center justify-center">
                  <div className="text-3xl mb-2">📈</div>
                  <div className="text-2xl font-semibold text-accent">
                    {parseFloat(reportData.netProfit).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </div>
                  <div className="text-muted">Ganancia Neta</div>
                </div>
                <div className="card text-center flex flex-col items-center justify-center">
                  <div className="text-3xl mb-2">🟡</div>
                  <div className="text-2xl font-semibold text-yellow-400">
                    {reportData.profitMargin}%
                  </div>
                  <div className="text-muted">Margen de Ganancia</div>
                </div>
              </div>

              {/* KPIs secundarios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="card text-center flex flex-col items-center justify-center">
                  <div className="text-3xl mb-2">🛒</div>
                  <div className="text-2xl font-semibold text-blue-400">
                    {reportData.totalPurchases}
                  </div>
                  <div className="text-muted">Total de Compras</div>
                </div>
                <div className="card text-center flex flex-col items-center justify-center">
                  <div className="text-3xl mb-2">💳</div>
                  <div className="text-2xl font-semibold text-purple-400">
                    {parseFloat(reportData.averagePurchase).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                  </div>
                  <div className="text-muted">Compra Promedio</div>
                </div>
                <div className="card text-center flex flex-col items-center justify-center">
                  <div className="text-3xl mb-2">↩️</div>
                  <div className="text-2xl font-semibold text-orange-400">
                    {reportData.totalReturnCount || 0}
                  </div>
                  <div className="text-muted">Total Devoluciones</div>
                </div>
              </div>
            </>
          )}

          {reportType === 'returns' && reportData && (
            <>
              {reportData.summary ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card bg-blue-500/10 border-blue-500/20 text-center">
                      <div className="text-2xl font-semibold">{reportData.summary.totalReturns || 0}</div>
                      <div className="text-muted text-sm">Total Devoluciones</div>
                    </div>
                    <div className="card bg-green-500/10 border-green-500/20 text-center">
                      <div className="text-2xl font-semibold text-green-400">{reportData.summary.approvedReturns || 0}</div>
                      <div className="text-muted text-sm">Aprobadas</div>
                      <div className="text-xs text-muted">{reportData.summary.approvalRate || '0.00'}%</div>
                    </div>
                    <div className="card bg-red-500/10 border-red-500/20 text-center">
                      <div className="text-2xl font-semibold text-red-400">{reportData.summary.rejectedReturns || 0}</div>
                      <div className="text-muted text-sm">Rechazadas</div>
                      <div className="text-xs text-muted">{reportData.summary.rejectionRate || '0.00'}%</div>
                    </div>
                    <div className="card bg-yellow-500/10 border-yellow-500/20 text-center">
                      <div className="text-2xl font-semibold text-yellow-400">{reportData.summary.pendingReturns || 0}</div>
                      <div className="text-muted text-sm">Pendientes</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card text-center">
                      <div className="text-2xl font-semibold text-red-400">
                        ${parseFloat(reportData.summary.totalReturnValue || 0).toFixed(2)}
                      </div>
                      <div className="text-muted">Valor Total Devuelto</div>
                    </div>
                    <div className="card text-center">
                      <div className="text-2xl font-semibold text-blue-400">
                        {reportData.summary.totalReturnedQuantity || 0}
                      </div>
                      <div className="text-muted">Items Devueltos</div>
                    </div>
                    <div className="card text-center">
                      <div className="text-2xl font-semibold text-purple-400">
                        ${parseFloat(reportData.summary.averageReturnValue || 0).toFixed(2)}
                      </div>
                      <div className="text-muted">Valor Promedio</div>
                    </div>
                  </div>

                  {reportData.topReturnedProducts && reportData.topReturnedProducts.length > 0 && (
                    <div className="card">
                      <h3 className="font-semibold mb-4">Productos Más Devueltos</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-600/20">
                              <th className="py-2 px-3 text-left">Producto</th>
                              <th className="py-2 px-3 text-left">Total</th>
                              <th className="py-2 px-3 text-left">Aprobadas</th>
                              <th className="py-2 px-3 text-left">Rechazadas</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.topReturnedProducts.slice(0, 5).map((product, idx) => (
                              <tr key={idx} className="border-b border-slate-600/10">
                                <td className="py-2 px-3">{product.productName}</td>
                                <td className="py-2 px-3 font-semibold">{product.quantity}</td>
                                <td className="py-2 px-3 text-green-400">{product.approved}</td>
                                <td className="py-2 px-3 text-red-400">{product.rejected}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="card text-center py-8">
                  <div className="text-4xl mb-4">↩️</div>
                  <p className="text-muted">No hay devoluciones en el período seleccionado</p>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="card text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-muted">Selecciona los parámetros para generar el reporte</p>
        </div>
      )}
    </div>
  )
}