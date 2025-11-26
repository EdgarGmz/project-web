import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { productService } from '../../services/productService'
import { customerService } from '../../services/customerService'
import { saleService } from '../../services/saleServices'
import { inventoryService } from '../../services/inventoryService'
import SuccessModal from '../molecules/SuccessModal'

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
        console.log('Inventario final cargado:', inventoryMap)
      }
    } catch (error) {
      console.error('Error fetching inventory:', error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getAll({ page: 1, limit: 1000 })
      if (response.success) {
        setCustomers(response.data)
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
    console.log(`Stock para producto ${productId} en sucursal ${user?.branch_id}: ${stock}`)
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
        setSuccessModal({ 
          isOpen: true, 
          message: `Venta procesada exitosamente. Total: $${getCartTotal().toFixed(2)}` 
        })
        setCart([])
        setSelectedCustomer(null)
        setAmountReceived('')
        setShowPayment(false)
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.barcode?.includes(searchTerm)
  )

  if (loading) {
    return <div className="card text-center py-8">Cargando productos...</div>
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-600/20">
        <div>
          <h1 className="text-2xl font-semibold">Punto de Venta</h1>
          <p className="text-muted">Cajero: {user?.first_name} {user?.last_name} | Sucursal: {user?.branch?.name || 'N/A'}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted">Fecha</div>
          <div className="font-medium">{new Date().toLocaleDateString('es-MX', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</div>
        </div>
      </div>

      {/* Mensajes de éxito y error */}
      {successMessage && (
        <div className="mx-4 mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Panel de productos */}
        <div className="flex-1 flex flex-col p-4">
          {/* Búsqueda */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar productos por nombre, marca o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-surface border border-slate-600/30 rounded-lg text-lg"
            />
          </div>

          {/* Grid de productos */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const stock = getProductStock(product.id)
                return (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className={`card cursor-pointer hover:shadow-lg transition-all ${
                      stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                  >
                    <div className="h-24 bg-surface/50 rounded mb-3 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-muted text-xs mb-2">{product.brand}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-accent font-semibold">${parseFloat(product.unit_price || product.price).toFixed(2)}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        stock <= 0 
                          ? 'bg-red-500/20 text-red-400' 
                          : stock <= (product.min_stock || 10)
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        Stock: {stock}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Panel de carrito */}
        <div className="w-96 border-l border-slate-600/20 flex flex-col">
          {/* Header del carrito */}
          <div className="p-4 border-b border-slate-600/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Carrito</h3>
              <span className="bg-accent/20 text-accent px-2 py-1 rounded text-sm">
                {getCartItems()} items
              </span>
            </div>

            {/* Seleccionar cliente */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Cliente (opcional)</label>
                <button
                  onClick={() => setShowCustomerForm(true)}
                  className="text-xs px-2 py-1 bg-accent/20 hover:bg-accent/30 text-accent rounded transition-colors flex items-center gap-1"
                  title="Agregar nuevo cliente"
                >
                  <span>➕</span>
                  <span>Nuevo</span>
                </button>
              </div>
              <select
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const customer = customers.find(c => c.id === e.target.value)
                  setSelectedCustomer(customer || null)
                }}
                className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md text-sm"
              >
                <option value="">Cliente general</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.first_name} {customer.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items del carrito */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🛒</div>
                <p className="text-muted">Carrito vacío</p>
                <p className="text-muted text-sm">Agrega productos para comenzar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="border border-slate-600/20 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        <p className="text-muted text-xs">{item.brand}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded border border-slate-600/30 flex items-center justify-center text-sm hover:bg-surface"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded border border-slate-600/30 flex items-center justify-center text-sm hover:bg-surface"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-accent font-medium">${((item.unit_price || item.price) * item.quantity).toFixed(2)}</div>
                        <div className="text-muted text-xs">${parseFloat(item.unit_price || item.price).toFixed(2)} c/u</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer del carrito */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-600/20">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-accent">${getCartTotal().toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowPayment(true)}
                className="w-full btn text-lg py-3"
              >
                Procesar Venta
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de pago */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Procesar Pago</h3>
              <button onClick={() => setShowPayment(false)}>✕</button>
            </div>

            <div className="space-y-4">
              <div className="bg-surface/50 p-4 rounded-lg">
                <div className="flex justify-between items-center text-lg">
                  <span>Total a pagar:</span>
                  <span className="text-accent font-semibold">${getCartTotal().toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Método de pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                >
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="transfer">Transferencia</option>
                </select>
              </div>

              {paymentMethod === 'cash' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Monto recibido</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                  {amountReceived && (
                    <div className="mt-2 p-2 bg-accent/10 rounded">
                      <div className="flex justify-between">
                        <span>Cambio:</span>
                        <span className={`font-semibold ${getChange() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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
                  className="btn flex-1 disabled:opacity-50"
                >
                  Confirmar Venta
                </button>
                <button
                  onClick={() => setShowPayment(false)}
                  className="px-4 py-2 border border-slate-600/30 rounded-md"
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

      {/* Modal para crear nuevo cliente */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Nuevo Cliente</h3>
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
                className="text-muted hover:text-text transition-colors"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={customerFormData.first_name}
                    onChange={(e) => setCustomerFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md text-sm"
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Apellido *</label>
                  <input
                    type="text"
                    value={customerFormData.last_name}
                    onChange={(e) => setCustomerFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md text-sm"
                    placeholder="Pérez"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={customerFormData.email}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md text-sm"
                  placeholder="juan@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={customerFormData.phone}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md text-sm"
                  placeholder="+52 55 1234 5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Dirección</label>
                <input
                  type="text"
                  value={customerFormData.address}
                  onChange={(e) => setCustomerFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md text-sm"
                  placeholder="Calle, número, colonia"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de documento</label>
                  <select
                    value={customerFormData.document_type}
                    onChange={(e) => setCustomerFormData(prev => ({ ...prev, document_type: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md text-sm"
                  >
                    <option value="dni">DNI</option>
                    <option value="passport">Pasaporte</option>
                    <option value="tax_id">RFC</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Número de documento</label>
                  <input
                    type="text"
                    value={customerFormData.document_number}
                    onChange={(e) => setCustomerFormData(prev => ({ ...prev, document_number: e.target.value }))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md text-sm"
                    placeholder="12345678"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={creatingCustomer}
                  className="btn flex-1 disabled:opacity-50"
                >
                  {creatingCustomer ? 'Creando...' : 'Crear Cliente'}
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
                  className="px-4 py-2 border border-slate-600/30 rounded-md"
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