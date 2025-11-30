import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { productService } from '../../services/productService'
import { customerService } from '../../services/customerService'
import { saleService } from '../../services/saleServices'
import { inventoryService } from '../../services/inventoryService'
import SuccessModal from '../molecules/SuccessModal'
import { jsPDF } from 'jspdf'

export default function POS() {
  const [products, setProducts] = useState([])
  const [inventory, setInventory] = useState({})
  const [cart, setCart] = useState([])
  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amountReceived, setAmountReceived] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [loading, setLoading] = useState(true)
  const [inventoryLoaded, setInventoryLoaded] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' })
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [customerFormData, setCustomerFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    birth_date: '',
    document_type: 'dni',
    document_number: '',
    notes: ''
  })
  const [creatingCustomer, setCreatingCustomer] = useState(false)
  const [cartWidth, setCartWidth] = useState(() => {
    // Cargar el ancho guardado del localStorage o usar el valor por defecto
    const savedWidth = localStorage.getItem('pos_cart_width')
    return savedWidth ? parseInt(savedWidth) : 450
  })
  const [isResizing, setIsResizing] = useState(false)
  const cartScrollRef = useRef(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchProducts()
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (user?.branch_id) {
      fetchInventory()
    }
  }, [user])

  // Guardar el ancho del carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('pos_cart_width', cartWidth.toString())
  }, [cartWidth])

  // Restaurar la posición de scroll del carrito al cargar
  useEffect(() => {
    if (cartScrollRef.current) {
      const savedScrollPosition = localStorage.getItem('pos_cart_scroll')
      if (savedScrollPosition) {
        // Usar setTimeout para asegurar que el DOM esté completamente renderizado
        setTimeout(() => {
          if (cartScrollRef.current) {
            cartScrollRef.current.scrollTop = parseInt(savedScrollPosition)
          }
        }, 100)
      }
    }
  }, [cart.length]) // Restaurar cuando cambie el contenido del carrito

  // Guardar la posición de scroll cuando el usuario hace scroll
  const handleCartScroll = () => {
    if (cartScrollRef.current) {
      localStorage.setItem('pos_cart_scroll', cartScrollRef.current.scrollTop.toString())
    }
  }

  // Manejar el redimensionamiento del carrito
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return
      
      // Calcular el nuevo ancho basado en la posición del mouse
      const newWidth = window.innerWidth - e.clientX
      
      // Limitar el ancho entre 300px y 800px
      const minWidth = 300
      const maxWidth = 800
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      
      setCartWidth(clampedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productService.getAll(1, 1000, '', 'active')
      if (response.success) {
        console.log('Productos cargados:', response.data[0]) // Ver estructura del primer producto
        setProducts(response.data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const fetchInventory = async () => {
    try {
      console.log('Fetching inventory for branch:', user?.branch_id)
      // Obtener todo el inventario sin paginación
      const response = await inventoryService.getAll({ 
        page: 1, 
        limit: 10000,
        branch_id: user?.branch_id 
      })
      console.log('Inventory response:', response)
      if (response.success) {
        // Crear un mapa de inventario por producto_id y branch_id
        const inventoryMap = {}
        const items = response.data || []
        console.log('Items de inventario:', items)
        items.forEach(item => {
          const key = `${item.product_id}_${item.branch_id}`
          // El campo es stock_current, no quantity
          inventoryMap[key] = item.stock_current || item.quantity || 0
          console.log(`Agregando al mapa: ${key} = ${item.stock_current || item.quantity || 0}`)
        })
        setInventory(inventoryMap)
        setInventoryLoaded(true)
        console.log('Inventario final cargado:', inventoryMap)
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
      setInventoryLoaded(true) // Marcar como cargado incluso si hay error para no bloquear la UI
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getAll({ page: 1, limit: 1000 })
      if (response.success) {
        setCustomers(response.data)
        // Seleccionar "Publico en General" por defecto
        const publicoGeneral = response.data.find(
          customer => customer.first_name === 'Publico' && customer.last_name === 'en General'
        )
        if (publicoGeneral && !selectedCustomer) {
          setSelectedCustomer(publicoGeneral)
        }
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const handleCreateCustomer = async (e) => {
    e.preventDefault()
    setCreatingCustomer(true)
    setError('')
    
    try {
      const response = await customerService.create(customerFormData)
      if (response.success) {
        setSuccessModal({ 
          isOpen: true, 
          message: 'Cliente creado exitosamente' 
        })
        setShowCustomerForm(false)
        setCustomerFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          address: '',
          birth_date: '',
          document_type: 'dni',
          document_number: '',
          notes: ''
        })
        // Actualizar lista de clientes y seleccionar el nuevo cliente
        await fetchCustomers()
        // Seleccionar el cliente recién creado
        if (response.data && response.data.id) {
          setSelectedCustomer(response.data)
        }
      } else {
        setError(response.message || 'Error al crear el cliente')
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      setError(error.message || 'Error al crear el cliente')
    } finally {
      setCreatingCustomer(false)
    }
  }

  const getProductStock = (productId) => {
    const key = `${productId}_${user?.branch_id}`
    const stock = inventory[key] || 0
    return stock
  }

  const addToCart = (product) => {
    const stock = getProductStock(product.id)
    
    if (stock <= 0) {
      setError('Producto sin stock disponible en esta sucursal')
      setTimeout(() => setError(''), 3000)
      return
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      if (existingItem) {
        if (existingItem.quantity >= stock) {
          setError('No hay suficiente stock disponible en esta sucursal')
          setTimeout(() => setError(''), 3000)
          return prevCart
        }
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prevCart, { ...product, quantity: 1 }]
      }
    })
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    const product = products.find(p => p.id === productId)
    const stock = getProductStock(productId)
    
    if (newQuantity > stock) {
      setError('No hay suficiente stock disponible en esta sucursal')
      setTimeout(() => setError(''), 3000)
      return
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.unit_price || item.price || 0)
      return total + (price * item.quantity)
    }, 0)
  }

  const getCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getChange = () => {
    const total = getCartTotal()
    const received = parseFloat(amountReceived) || 0
    return received - total
  }

  const generateTicketPDF = (saleData, cartItems, totalAmount, customer, paymentMethodParam, amountReceivedParam, changeAmount) => {
    try {
      console.log('🖨️ Iniciando generación de PDF...', { 
        saleData: saleData ? 'existe' : 'null',
        cartItemsCount: cartItems?.length || 0,
        totalAmount,
        customer: customer ? 'existe' : 'null'
      })
      
      // Validar que tenemos los datos necesarios
      if (!saleData) {
        console.error('❌ No hay datos de venta para generar el ticket')
        return
      }

      if (!cartItems || cartItems.length === 0) {
        console.error('❌ No hay items en el carrito para generar el ticket')
        return
      }

      console.log('✅ Datos validados, creando PDF...')

      // Crear PDF con formato de ticket (80mm de ancho)
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
      // Fondo del encabezado (simulado con rectángulo)
      doc.setDrawColor(50, 50, 50)
      doc.setFillColor(30, 30, 30)
      doc.rect(margin, yPos - 2, ticketWidth - 2 * margin, 12, 'F')
      
      // Título principal
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('APEX STORE', pageWidth / 2, yPos + 4, { align: 'center' })
      
      // Subtítulo
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text('Sistema de Punto de Venta', pageWidth / 2, yPos + 7, { align: 'center' })
      
      yPos += 12
      doc.setTextColor(0, 0, 0) // Volver a color negro

      // Información de la sucursal
      if (user?.branch) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(60, 60, 60)
        doc.text(user.branch.name || 'Sucursal', pageWidth / 2, yPos, { align: 'center' })
        yPos += 4
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(80, 80, 80)
        
        if (user.branch.address) {
          const addressLines = doc.splitTextToSize(user.branch.address, contentWidth)
          addressLines.forEach(line => {
            doc.text(line, pageWidth / 2, yPos, { align: 'center' })
            yPos += 3
          })
        }
        
        if (user.branch.city && user.branch.state) {
          doc.text(`${user.branch.city}, ${user.branch.state}`, pageWidth / 2, yPos, { align: 'center' })
          yPos += 3
        }
        
        if (user.branch.phone) {
          doc.text(`📞 ${user.branch.phone}`, pageWidth / 2, yPos, { align: 'center' })
          yPos += 3
        }
        
        if (user.branch.email) {
          doc.text(`✉ ${user.branch.email}`, pageWidth / 2, yPos, { align: 'center' })
          yPos += 3
        }
      }

      yPos += 2
      doc.setTextColor(0, 0, 0)
      
      // Línea separadora decorativa
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

      // Información de la transacción en formato de tabla
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(60, 60, 60)
      
      // Usar created_at si sale_date no existe
      const saleDate = saleData.sale_date || saleData.created_at ? new Date(saleData.sale_date || saleData.created_at) : new Date()
      const dateStr = saleDate.toLocaleDateString('es-MX', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
      const timeStr = saleDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      
      // Fecha y hora
      doc.setFont('helvetica', 'bold')
      doc.text('Fecha:', margin, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(`${dateStr} ${timeStr}`, margin + 20, yPos)
      yPos += 4

      // Referencia de transacción
      if (saleData.transaction_reference) {
        doc.setFont('helvetica', 'bold')
        doc.text('Ticket:', margin, yPos)
        doc.setFont('helvetica', 'normal')
        doc.setFont('courier', 'normal') // Fuente monoespaciada para referencia
        doc.text(saleData.transaction_reference, margin + 20, yPos)
        doc.setFont('helvetica', 'normal')
        yPos += 4
      }

      // Información del cliente
      doc.setFont('helvetica', 'bold')
      doc.text('Cliente:', margin, yPos)
      doc.setFont('helvetica', 'normal')
      if (customer) {
        doc.text(`${customer.first_name} ${customer.last_name}`, margin + 20, yPos)
      } else {
        doc.text('Público en General', margin + 20, yPos)
      }
      yPos += 4

      // Cajero
      if (user) {
        doc.setFont('helvetica', 'bold')
        doc.text('Cajero:', margin, yPos)
        doc.setFont('helvetica', 'normal')
        doc.text(`${user.first_name} ${user.last_name}`, margin + 20, yPos)
        yPos += 4
      }

      yPos += 2
      // Línea separadora
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 4

      // Items de la venta - Encabezado de tabla
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(40, 40, 40)
      doc.text('PRODUCTOS', margin, yPos)
      yPos += 5

      // Línea de encabezado de tabla
      doc.setDrawColor(100, 100, 100)
      doc.setLineWidth(0.5)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 3

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(0, 0, 0)
      
      cartItems.forEach((item, index) => {
        // Verificar si hay espacio suficiente en la página
        if (yPos > doc.internal.pageSize.getHeight() - 30) {
          doc.addPage()
          yPos = margin
        }

        const itemName = item.name || 'Producto'
        const quantity = item.quantity || 1
        const unitPrice = parseFloat(item.unit_price || item.price || 0)
        const subtotal = unitPrice * quantity

        // Fondo alternado para filas (simulado)
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250)
          doc.rect(margin, yPos - 2, ticketWidth - 2 * margin, 8, 'F')
        }

        // Cantidad (izquierda)
        doc.setFont('helvetica', 'bold')
        doc.text(`${quantity}`, margin + 2, yPos)
        
        // Nombre del producto (centro)
        doc.setFont('helvetica', 'normal')
        const nameWidth = contentWidth - 35 // Espacio para cantidad y precio
        const nameLines = doc.splitTextToSize(itemName, nameWidth)
        doc.text(nameLines[0], margin + 12, yPos)
        
        // Subtotal (derecha, alineado)
        doc.setFont('helvetica', 'bold')
        const subtotalText = `$${subtotal.toFixed(2)}`
        doc.text(subtotalText, pageWidth - margin - 2, yPos, { align: 'right' })
        yPos += 3.5

        // Si el nombre es muy largo, agregar líneas adicionales
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

        // Precio unitario (pequeño, debajo del nombre)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(6)
        doc.setTextColor(120, 120, 120)
        doc.text(`@ $${unitPrice.toFixed(2)} c/u`, margin + 12, yPos)
        doc.setFontSize(7)
        doc.setTextColor(0, 0, 0)
        yPos += 4

        // Línea separadora sutil entre items
        if (index < cartItems.length - 1) {
          doc.setDrawColor(230, 230, 230)
          doc.setLineWidth(0.2)
          doc.line(margin + 10, yPos - 1, pageWidth - margin - 10, yPos - 1)
        }
      })

      yPos += 2
      // Línea separadora doble antes de totales
      doc.setDrawColor(100, 100, 100)
      doc.setLineWidth(0.5)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 1
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 4

      // Totales - Sección destacada
      const total = parseFloat(saleData.total_amount || totalAmount || 0)
      
      // Fondo para total
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
      }[paymentMethodParam] || paymentMethodParam || '💵 Efectivo'
      
      doc.setFont('helvetica', 'bold')
      doc.text('Método de pago:', margin, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(paymentMethodLabel, margin + 35, yPos)
      yPos += 4

      if (paymentMethodParam === 'cash' && amountReceivedParam) {
        const received = parseFloat(amountReceivedParam)
        const change = changeAmount !== undefined ? changeAmount : (received - total)
        
        doc.setFont('helvetica', 'bold')
        doc.text('Recibido:', margin, yPos)
        doc.setFont('helvetica', 'normal')
        doc.text(`$${received.toFixed(2)}`, margin + 25, yPos)
        yPos += 3.5
        
        doc.setFont('helvetica', 'bold')
        doc.text('Cambio:', margin, yPos)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 120, 0)
        doc.text(`$${change.toFixed(2)}`, margin + 25, yPos)
        doc.setTextColor(0, 0, 0)
        yPos += 4
      }

      yPos += 3
      // Línea separadora decorativa
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 5

      // Mensaje de gratitud - destacado
      doc.setFillColor(245, 245, 245)
      doc.rect(margin, yPos - 2, ticketWidth - 2 * margin, 8, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(50, 50, 50)
      doc.text('¡GRACIAS POR SU COMPRA!', pageWidth / 2, yPos + 3, { align: 'center' })
      yPos += 8

      // Información de garantía
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      doc.setTextColor(60, 60, 60)
      doc.text('📋 GARANTÍA', pageWidth / 2, yPos, { align: 'center' })
      yPos += 4
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6)
      doc.setTextColor(80, 80, 80)
      const warrantyText = 'Este producto tiene 6 meses de garantía en esta sucursal. Para hacer válida la garantía, presente este ticket al momento de la reclamación.'
      const warrantyLines = doc.splitTextToSize(warrantyText, contentWidth)
      warrantyLines.forEach((line) => {
        if (yPos > doc.internal.pageSize.getHeight() - 15) {
          doc.addPage()
          yPos = margin
        }
        doc.text(line, pageWidth / 2, yPos, { align: 'center' })
        yPos += 3
      })

      // Información de contacto adicional
      yPos += 4
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      doc.setTextColor(60, 60, 60)
      doc.text('📞 CONTACTO', pageWidth / 2, yPos, { align: 'center' })
      yPos += 4

      if (user?.branch) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(6)
        doc.setTextColor(80, 80, 80)
        if (user.branch.phone) {
          doc.text(`📞 ${user.branch.phone}`, pageWidth / 2, yPos, { align: 'center' })
          yPos += 3
        }
        if (user.branch.email) {
          doc.text(`✉ ${user.branch.email}`, pageWidth / 2, yPos, { align: 'center' })
          yPos += 3
        }
        if (user.branch.address) {
          const addressLines = doc.splitTextToSize(user.branch.address, contentWidth)
          addressLines.forEach((line) => {
            if (yPos > doc.internal.pageSize.getHeight() - 10) {
              doc.addPage()
              yPos = margin
            }
            doc.text(line, pageWidth / 2, yPos, { align: 'center' })
            yPos += 3
          })
        }
      }

      // Pie de página
      yPos += 4
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.line(margin, yPos, pageWidth - margin, yPos)
      yPos += 3
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(6)
      doc.setTextColor(120, 120, 120)
      doc.text('Conserve este ticket para garantía', pageWidth / 2, yPos, { align: 'center' })
      yPos += 3
      doc.text('Este documento es válido como comprobante fiscal', pageWidth / 2, yPos, { align: 'center' })

      // Guardar el PDF
      const fileName = `ticket_${saleData.transaction_reference || saleData.id || Date.now()}.pdf`
      console.log('💾 Guardando PDF con nombre:', fileName)
      
      try {
        doc.save(fileName)
        console.log('✅ PDF generado y descargado exitosamente:', fileName)
      } catch (saveError) {
        console.error('⚠️ Error al guardar PDF con doc.save(), intentando método alternativo:', saveError)
        try {
          // Intentar método alternativo
          const pdfBlob = doc.output('blob')
          const url = URL.createObjectURL(pdfBlob)
          const link = document.createElement('a')
          link.href = url
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          console.log('✅ PDF generado usando método alternativo:', fileName)
        } catch (altError) {
          console.error('❌ Error en método alternativo de guardado:', altError)
          // Intentar abrir en nueva ventana como último recurso
          try {
            const pdfDataUri = doc.output('datauristring')
            const newWindow = window.open()
            if (newWindow) {
              newWindow.document.write(`<iframe width='100%' height='100%' src='${pdfDataUri}'></iframe>`)
              console.log('✅ PDF abierto en nueva ventana')
            }
          } catch (finalError) {
            console.error('❌ Error crítico al generar PDF:', finalError)
            alert('Error al generar el PDF del ticket. Por favor, contacte al administrador.')
          }
        }
      }
    } catch (error) {
      console.error('❌ Error crítico al generar ticket PDF:', error)
      console.error('Stack trace:', error.stack)
      console.error('Datos recibidos:', { saleData, cartItems, totalAmount, customer })
      alert('Error al generar el PDF del ticket. Por favor, verifique la consola para más detalles.')
    }
  }

  const processSale = async () => {
    if (cart.length === 0) {
      setError('El carrito está vacío')
      setTimeout(() => setError(''), 3000)
      return
    }

    if (paymentMethod === 'cash' && getChange() < 0) {
      setError('El monto recibido es insuficiente')
      setTimeout(() => setError(''), 3000)
      return
    }

    if (!user?.branch_id) {
      setError('No se puede determinar la sucursal del usuario')
      setTimeout(() => setError(''), 3000)
      return
    }

    try {
      setLoading(true)
      const saleData = {
        customer_id: selectedCustomer?.id || null,
        user_id: user.id,
        branch_id: user.branch_id,
        payment_method: paymentMethod,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price || item.price),
          discount_percentage: 0
        }))
      }

      console.log('Enviando venta:', saleData)
      const response = await saleService.create(saleData)
      console.log('Respuesta del servidor:', response)
      
      if (response.success) {
        console.log('✅ Venta procesada exitosamente')
        console.log('📦 Datos de respuesta completa:', response)
        console.log('📦 Datos de respuesta.data:', response.data)
        
        // Guardar datos antes de limpiar el carrito
        const cartItemsForPDF = [...cart] // Copia del carrito
        const totalForPDF = response.data?.total_amount || getCartTotal()
        const customerForPDF = response.data?.customer || selectedCustomer
        
        // Crear objeto de venta para el PDF (usar datos del servidor o crear uno sintético)
        let saleDataForPDF = response.data || response.sale
        
        // Si no hay datos del servidor, crear un objeto sintético con los datos disponibles
        if (!saleDataForPDF) {
          console.log('⚠️ response.data es null, creando objeto de venta sintético')
          saleDataForPDF = {
            id: response.id || `temp-${Date.now()}`,
            transaction_reference: response.transaction_reference || `TXN-${Date.now()}`,
            total_amount: totalForPDF,
            created_at: new Date().toISOString(),
            sale_date: new Date().toISOString(),
            payment_method: paymentMethod,
            customer: customerForPDF,
            user: user,
            branch: user?.branch
          }
        }
        
        console.log('📄 Preparando datos para PDF:', {
          saleDataForPDF: saleDataForPDF ? 'existe' : 'null',
          saleDataKeys: saleDataForPDF ? Object.keys(saleDataForPDF) : [],
          cartItemsCount: cartItemsForPDF.length,
          totalForPDF,
          customerForPDF: customerForPDF ? 'existe' : 'null'
        })
        
        // Generar PDF del ticket siempre que tengamos items en el carrito
        if (cartItemsForPDF.length > 0) {
          console.log('🚀 Llamando a generateTicketPDF en 100ms...')
          const changeAmount = paymentMethod === 'cash' && amountReceived ? getChange() : undefined
          setTimeout(() => {
            console.log('⏰ Ejecutando generateTicketPDF ahora...')
            generateTicketPDF(
              saleDataForPDF, 
              cartItemsForPDF, 
              totalForPDF, 
              customerForPDF,
              paymentMethod,
              amountReceived,
              changeAmount
            )
          }, 100) // Pequeño delay para asegurar que los datos estén disponibles
        } else {
          console.warn('⚠️ No se pudo generar el PDF: carrito vacío')
        }
        
        setSuccessModal({ 
          isOpen: true, 
          message: `Venta procesada exitosamente. Total: $${totalForPDF.toFixed(2)}` 
        })
        setCart([])
        setSelectedCustomer(null)
        setAmountReceived('')
        setShowPayment(false)
        // Resetear la posición de scroll cuando se vacía el carrito
        localStorage.removeItem('pos_cart_scroll')
        if (cartScrollRef.current) {
          cartScrollRef.current.scrollTop = 0
        }
        fetchInventory() // Actualizar inventario
      }
    } catch (error) {
      console.error('Error processing sale:', error)
      setError(error.message || 'Error al procesar la venta')
      setTimeout(() => setError(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    // Filtrar por término de búsqueda
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.includes(searchTerm) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Si el inventario aún no se ha cargado, mostrar todos los productos que coincidan con la búsqueda
    if (!inventoryLoaded || !user?.branch_id) {
      return matchesSearch
    }
    
    // Filtrar por disponibilidad en la sucursal (solo productos con stock > 0)
    const stock = getProductStock(product.id)
    const hasStock = stock > 0
    
    return matchesSearch && hasStock
  })

  if (loading || !inventoryLoaded) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-muted font-medium">Cargando productos e inventario...</p>
          <p className="text-sm text-muted mt-2">Por favor espera un momento</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-bg">
      {/* Header mejorado */}
      <div className="relative p-6 bg-gradient-to-r from-accent/20 via-blue-500/10 to-purple-500/10 border-b border-slate-600/30 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-accent/30 to-blue-500/30 border-2 border-accent/40 flex items-center justify-center text-3xl shadow-lg">
              🛒
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text">Punto de Venta</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface/60 rounded-lg border border-slate-600/30">
                  <span className="text-accent text-lg">👤</span>
                  <div>
                    <div className="text-xs text-muted uppercase tracking-wide">Cajero</div>
                    <div className="font-semibold text-white">{user?.first_name} {user?.last_name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface/60 rounded-lg border border-slate-600/30">
                  <span className="text-blue-400 text-lg">🏢</span>
                  <div>
                    <div className="text-xs text-muted uppercase tracking-wide">Sucursal</div>
                    <div className="font-semibold text-white">{user?.branch?.name || 'N/A'}</div>
                    {user?.branch?.code && (
                      <div className="text-xs text-muted font-mono">{user.branch.code}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right bg-surface/50 px-4 py-3 rounded-lg border border-slate-600/30">
            <div className="text-xs text-muted uppercase tracking-wide mb-1">Fecha</div>
            <div className="font-semibold text-white">{new Date().toLocaleDateString('es-MX', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
            <div className="text-xs text-muted mt-1">{new Date().toLocaleTimeString('es-MX', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}</div>
          </div>
        </div>
      </div>

      {/* Mensajes de éxito y error */}
      {successMessage && (
        <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/50 rounded-xl text-green-400 shadow-lg animate-slide-down">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-red-500/20 to-rose-500/10 border border-red-500/50 rounded-xl text-red-400 shadow-lg animate-slide-down">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Panel de productos */}
        <div className="flex-1 flex flex-col p-6 bg-gradient-to-br from-surface/30 to-surface/10">
          {/* Búsqueda mejorada */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-2xl text-muted">🔍</span>
              </div>
              <input
                type="text"
                placeholder="Buscar productos por nombre, marca, SKU o código de barras..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-800/90 border-2 border-slate-600/50 rounded-xl text-lg text-white placeholder:text-slate-400 focus:ring-2 focus:ring-accent focus:border-accent focus:bg-slate-800 transition-all shadow-lg"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted hover:text-text transition-colors"
                >
                  <span className="text-xl">✕</span>
                </button>
              )}
            </div>
            {filteredProducts.length > 0 && (
              <p className="mt-2 text-sm text-muted">
                Mostrando <span className="font-semibold text-white">{filteredProducts.length}</span> producto(s) disponible(s)
              </p>
            )}
          </div>

          {/* Grid de productos mejorado */}
          <div className="flex-1 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="text-6xl mb-4 animate-bounce-slow">📦</div>
                <p className="text-xl font-semibold text-muted mb-2">
                  {searchTerm ? 'No se encontraron productos' : 'No hay productos disponibles'}
                </p>
                <p className="text-sm text-muted">
                  {searchTerm ? 'Intenta con otro término de búsqueda' : 'Contacta al administrador para agregar productos'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  const stock = getProductStock(product.id)
                  const stockStatus = stock <= 0 
                    ? { label: 'Sin Stock', color: 'red', icon: '🔴' }
                    : stock <= (product.min_stock || 10)
                    ? { label: 'Stock Bajo', color: 'yellow', icon: '⚠️' }
                    : { label: 'Disponible', color: 'green', icon: '✅' }
                  
                  return (
                    <div
                      key={product.id}
                      onClick={() => stock > 0 && addToCart(product)}
                      className={`group relative bg-gradient-to-br from-surface/80 to-surface/60 border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                        stock <= 0 
                          ? 'opacity-50 cursor-not-allowed border-red-500/30' 
                          : 'hover:scale-105 hover:shadow-2xl hover:border-accent/50 border-slate-600/30'
                      }`}
                    >
                      {/* Badge de stock */}
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                        stockStatus.color === 'red' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        stockStatus.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                        'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}>
                        <span>{stockStatus.icon}</span>
                        <span>{stock}</span>
                      </div>

                      {/* Imagen del producto */}
                      <div className="h-32 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-slate-600/20 group-hover:border-accent/30 transition-colors">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-5xl opacity-50">📦</span>
                        )}
                      </div>

                      {/* Información del producto */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm text-white line-clamp-2 group-hover:text-accent transition-colors">
                          {product.name}
                        </h3>
                        {product.brand && (
                          <p className="text-muted text-xs line-clamp-1">{product.brand}</p>
                        )}
                        {product.sku && (
                          <p className="text-muted text-xs font-mono">SKU: {product.sku}</p>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-600/20">
                          <span className="text-accent font-bold text-lg">
                            ${parseFloat(product.unit_price || product.price).toFixed(2)}
                          </span>
                          {stock > 0 && (
                            <span className="text-xs text-muted group-hover:text-accent transition-colors">
                              Click para agregar
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Panel de carrito mejorado con redimensionamiento */}
        <div 
          className="relative flex flex-col bg-gradient-to-b from-surface/50 to-surface/30 shadow-2xl"
          style={{ width: `${cartWidth}px` }}
        >
          {/* Handle de redimensionamiento */}
          <div
            onMouseDown={(e) => {
              e.preventDefault()
              setIsResizing(true)
            }}
            className={`absolute left-0 top-0 bottom-0 w-2 cursor-col-resize transition-all z-10 group ${
              isResizing 
                ? 'bg-accent/70 w-3' 
                : 'bg-slate-600/30 hover:bg-accent/50 hover:w-3'
            }`}
            title="Arrastra para ajustar el ancho del carrito"
          >
            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity ${
              isResizing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}>
              <div className="flex flex-col gap-1.5">
                <div className="w-1 h-5 bg-accent rounded-full"></div>
                <div className="w-1 h-5 bg-accent rounded-full"></div>
                <div className="w-1 h-5 bg-accent rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div className="border-l-2 border-slate-600/30 flex flex-col h-full">
          {/* Header del carrito */}
          <div className="p-6 border-b-2 border-slate-600/30 bg-gradient-to-r from-accent/10 to-blue-500/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center text-xl">
                  🛒
                </div>
                <h3 className="text-xl font-bold text-text">Carrito</h3>
              </div>
              <span className="bg-gradient-to-r from-accent/30 to-blue-500/20 text-accent px-3 py-1.5 rounded-full text-sm font-bold border border-accent/30 shadow-md">
                {getCartItems()} {getCartItems() === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Seleccionar cliente mejorado */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-text flex items-center gap-2">
                  <span className="text-blue-400">👤</span>
                  <span>Cliente (opcional)</span>
                </label>
                <button
                  onClick={() => setShowCustomerForm(true)}
                  className="text-xs px-3 py-1.5 bg-gradient-to-r from-accent/20 to-blue-500/20 hover:from-accent/30 hover:to-blue-500/30 text-accent rounded-lg transition-all flex items-center gap-1.5 border border-accent/30 shadow-sm hover:shadow-md"
                  title="Agregar nuevo cliente"
                >
                  <span className="text-base">➕</span>
                  <span className="font-medium">Nuevo</span>
                </button>
              </div>
              {selectedCustomer ? (
                <div className="mb-3 p-3 bg-gradient-to-r from-accent/10 via-blue-500/5 to-accent/10 border-2 border-accent/30 rounded-xl shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center text-lg flex-shrink-0">
                        👤
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">
                          {selectedCustomer.first_name} {selectedCustomer.last_name}
                        </div>
                        {selectedCustomer.email && (
                          <div className="text-xs text-muted truncate">{selectedCustomer.email}</div>
                        )}
                        {selectedCustomer.phone && (
                          <div className="text-xs text-muted">{selectedCustomer.phone}</div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="ml-2 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all flex-shrink-0"
                      title="Quitar cliente"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : null}
              <select
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const customer = customers.find(c => c.id === e.target.value)
                  setSelectedCustomer(customer || null)
                }}
                className="w-full px-4 py-2.5 bg-slate-800/90 border-2 border-slate-600/50 rounded-lg text-sm text-white focus:ring-2 focus:ring-accent focus:border-accent focus:bg-slate-800 transition-all shadow-sm"
              >
                <option value="">{selectedCustomer ? 'Cambiar cliente...' : 'Seleccionar cliente...'}</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.first_name} {customer.last_name}
                    {customer.email ? ` (${customer.email})` : ''}
                    {customer.phone ? ` - ${customer.phone}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items del carrito mejorados */}
          <div 
            ref={cartScrollRef}
            onScroll={handleCartScroll}
            className="flex-1 overflow-y-auto p-4"
          >
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 animate-bounce-slow">🛒</div>
                <p className="text-lg font-semibold text-muted mb-2">Carrito vacío</p>
                <p className="text-sm text-muted">Agrega productos para comenzar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="bg-gradient-to-br from-surface/60 to-surface/40 border-2 border-slate-600/30 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all hover:border-accent/30">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-white truncate mb-1">{item.name}</h4>
                        {item.brand && (
                          <p className="text-muted text-xs mb-1">{item.brand}</p>
                        )}
                        {item.sku && (
                          <p className="text-muted text-xs font-mono">SKU: {item.sku}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-2 p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all hover:scale-110"
                        title="Eliminar del carrito"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-600/20">
                      <div className="flex items-center gap-2 bg-surface/50 rounded-lg p-1 border border-slate-600/20">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg border border-slate-600/30 flex items-center justify-center text-base font-bold hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all"
                        >
                          −
                        </button>
                        <span className="w-12 text-center text-base font-bold text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg border border-slate-600/30 flex items-center justify-center text-base font-bold hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30 transition-all"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-accent font-bold text-lg">${((item.unit_price || item.price) * item.quantity).toFixed(2)}</div>
                        <div className="text-muted text-xs">${parseFloat(item.unit_price || item.price).toFixed(2)} c/u</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer del carrito mejorado */}
          {cart.length > 0 && (
            <div className="p-6 border-t-2 border-slate-600/30 bg-gradient-to-r from-accent/10 to-blue-500/5">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-4 bg-surface/60 rounded-xl border-2 border-accent/30 shadow-lg">
                  <span className="text-lg font-bold text-white">Total:</span>
                  <span className="text-2xl font-bold text-accent">${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="text-xs text-muted text-center">
                  {getCartItems()} {getCartItems() === 1 ? 'producto' : 'productos'} en el carrito
                </div>
              </div>
              
              <button
                onClick={() => setShowPayment(true)}
                className="w-full bg-gradient-to-r from-accent to-blue-500 hover:from-accent-light hover:to-blue-400 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span>💳</span>
                <span>Procesar Venta</span>
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Modal de pago mejorado */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="card max-w-md w-full animate-slide-up shadow-2xl border-2 border-slate-600/30">
            <div className="relative p-6 mb-6 rounded-t-lg bg-gradient-to-r from-accent/20 via-blue-500/10 to-purple-500/10 border-b-2 border-accent/30">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent/30 to-blue-500/30 border-2 border-accent/40 flex items-center justify-center text-2xl shadow-lg">
                  💳
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text">Procesar Pago</h3>
                  <p className="text-sm text-muted mt-1">Confirma el método de pago</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPayment(false)}
                className="absolute top-4 right-4 text-2xl text-muted hover:text-text transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-accent/20 to-blue-500/10 p-5 rounded-xl border-2 border-accent/30 shadow-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-muted uppercase tracking-wide mb-1">Total a pagar</div>
                    <div className="text-3xl font-bold text-accent">${getCartTotal().toFixed(2)}</div>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-text flex items-center gap-2">
                  <span className="text-blue-400">💳</span>
                  <span>Método de pago</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/90 border-2 border-slate-600/50 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent focus:bg-slate-800 transition-all text-base text-white"
                >
                  <option value="cash">💵 Efectivo</option>
                  <option value="card">💳 Tarjeta</option>
                  <option value="transfer">🏦 Transferencia</option>
                </select>
              </div>

              {paymentMethod === 'cash' && (
                <div>
                  <label className="block text-sm font-semibold mb-3 text-text flex items-center gap-2">
                    <span className="text-green-400">💵</span>
                    <span>Monto recibido</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-slate-800/90 border-2 border-slate-600/50 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent focus:bg-slate-800 transition-all text-lg font-semibold text-white placeholder:text-slate-400"
                    autoFocus
                  />
                  {amountReceived && (
                    <div className={`mt-3 p-4 rounded-xl border-2 ${
                      getChange() >= 0 
                        ? 'bg-green-500/20 border-green-500/30' 
                        : 'bg-red-500/20 border-red-500/30'
                    }`}>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-white">Cambio:</span>
                        <span className={`text-2xl font-bold ${getChange() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${getChange().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={processSale}
                  disabled={paymentMethod === 'cash' && getChange() < 0}
                  className="flex-1 bg-gradient-to-r from-accent to-blue-500 hover:from-accent-light hover:to-blue-400 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>✅</span>
                  <span>Confirmar Venta</span>
                </button>
                <button
                  onClick={() => setShowPayment(false)}
                  className="px-6 py-3 border-2 border-slate-600/30 rounded-lg text-text hover:bg-surface/50 transition-all font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        message={successModal.message}
      />

      {/* Modal para crear nuevo cliente mejorado */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up shadow-2xl border-2 border-slate-600/30">
            <div className="relative p-6 mb-6 rounded-t-lg bg-gradient-to-r from-accent/20 via-blue-500/10 to-purple-500/10 border-b-2 border-accent/30">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent/30 to-blue-500/30 border-2 border-accent/40 flex items-center justify-center text-2xl shadow-lg">
                  👤
                </div>
                <div>
                  <h3 className="text-xl font-bold text-text">Nuevo Cliente</h3>
                  <p className="text-sm text-muted mt-1">Registra un nuevo cliente en el sistema</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowCustomerForm(false)
                  setCustomerFormData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    address: '',
                    birth_date: '',
                    document_type: 'dni',
                    document_number: '',
                    notes: ''
                  })
                  setError('')
                }}
                className="absolute top-4 right-4 text-2xl text-muted hover:text-text transition-colors"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mx-6 mb-4 p-4 bg-gradient-to-r from-red-500/20 to-rose-500/10 border-2 border-red-500/50 rounded-xl text-red-400 text-sm shadow-lg">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-text flex items-center gap-1">
                    <span className="text-accent">Nombre</span> *
                  </label>
                  <input
                    type="text"
                    value={customerFormData.first_name}
                    onChange={(e) => setCustomerFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    required
                    className="w-full px-4 py-2.5 bg-slate-800/90 border-2 border-slate-600/50 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent focus:bg-slate-800 transition-all text-sm text-white placeholder:text-slate-400"
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-text flex items-center gap-1">
                    <span className="text-accent">Apellido</span> *
                  </label>
                  <input
                    type="text"
                    value={customerFormData.last_name}
                    onChange={(e) => setCustomerFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    required
                    className="w-full px-4 py-2.5 bg-slate-800/90 border-2 border-slate-600/50 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent focus:bg-slate-800 transition-all text-sm text-white placeholder:text-slate-400"
                    placeholder="Pérez"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-text flex items-center gap-1">
                  <span className="text-blue-400">📧</span>
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  value={customerFormData.email}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-800/90 border-2 border-slate-600/50 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent focus:bg-slate-800 transition-all text-sm text-white placeholder:text-slate-400"
                  placeholder="juan@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-text flex items-center gap-1">
                  <span className="text-green-400">📞</span>
                  <span>Teléfono</span>
                </label>
                <input
                  type="tel"
                  value={customerFormData.phone}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-800/90 border-2 border-slate-600/50 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent focus:bg-slate-800 transition-all text-sm text-white placeholder:text-slate-400"
                  placeholder="+52 55 1234 5678"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-text flex items-center gap-1">
                  <span className="text-purple-400">📍</span>
                  <span>Dirección</span>
                </label>
                <input
                  type="text"
                  value={customerFormData.address}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-800/90 border-2 border-slate-600/50 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent focus:bg-slate-800 transition-all text-sm text-white placeholder:text-slate-400"
                  placeholder="Calle, número, colonia"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-text flex items-center gap-1">
                    <span className="text-yellow-400">📄</span>
                    <span>Tipo de documento</span>
                  </label>
                  <select
                    value={customerFormData.document_type}
                    onChange={(e) => setCustomerFormData(prev => ({ ...prev, document_type: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-800/90 border-2 border-slate-600/50 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent focus:bg-slate-800 transition-all text-sm text-white"
                  >
                    <option value="dni">DNI</option>
                    <option value="passport">Pasaporte</option>
                    <option value="tax_id">RFC</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-text flex items-center gap-1">
                    <span className="text-cyan-400">🔢</span>
                    <span>Número de documento</span>
                  </label>
                  <input
                    type="text"
                    value={customerFormData.document_number}
                    onChange={(e) => setCustomerFormData(prev => ({ ...prev, document_number: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-800/90 border-2 border-slate-600/50 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent focus:bg-slate-800 transition-all text-sm text-white placeholder:text-slate-400"
                    placeholder="12345678"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={creatingCustomer}
                  className="flex-1 bg-gradient-to-r from-accent to-blue-500 hover:from-accent-light hover:to-blue-400 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creatingCustomer ? (
                    <>
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                      <span>Creando...</span>
                    </>
                  ) : (
                    <>
                      <span>✅</span>
                      <span>Crear Cliente</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomerForm(false)
                    setCustomerFormData({
                      first_name: '',
                      last_name: '',
                      email: '',
                      phone: '',
                      address: '',
                      birth_date: '',
                      document_type: 'dni',
                      document_number: '',
                      notes: ''
                    })
                    setError('')
                  }}
                  className="px-6 py-3 border-2 border-slate-600/30 rounded-lg text-text hover:bg-surface/50 transition-all font-medium"
                  disabled={creatingCustomer}
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