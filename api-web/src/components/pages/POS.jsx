import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function POS() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [amountReceived, setAmountReceived] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    fetchProducts()
    fetchCustomers()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/products?status=active', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      if (data.success) setProducts(data.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/customers', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      if (data.success) setCustomers(data.data)
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert('Producto sin stock disponible')
      return
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          alert('No hay suficiente stock disponible')
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
    if (newQuantity > product.stock) {
      alert('No hay suficiente stock disponible')
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
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
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
      alert('El carrito está vacío')
      return
    }

    if (paymentMethod === 'cash' && getChange() < 0) {
      alert('El monto recibido es insuficiente')
      return
    }

    try {
      const saleData = {
        customer_id: selectedCustomer?.id || null,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total: item.price * item.quantity
        })),
        subtotal: getCartTotal(),
        total: getCartTotal(),
        payment_method: paymentMethod,
        amount_received: paymentMethod === 'cash' ? parseFloat(amountReceived) : getCartTotal(),
        change: paymentMethod === 'cash' ? getChange() : 0,
        cashier_id: user.id
      }

      const response = await fetch('http://localhost:3000/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(saleData)
      })

      const data = await response.json()
      if (data.success) {
        alert('Venta procesada exitosamente')
        setCart([])
        setSelectedCustomer(null)
        setAmountReceived('')
        setShowPayment(false)
        fetchProducts() // Actualizar stock
      } else {
        alert(data.message || 'Error al procesar la venta')
      }
    } catch (error) {
      console.error('Error processing sale:', error)
      alert('Error al procesar la venta')
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
          <p className="text-muted">Cajero: {user?.first_name} {user?.last_name}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted">Fecha</div>
          <div className="font-medium">{new Date().toLocaleDateString()}</div>
        </div>
      </div>

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
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className={`card cursor-pointer hover:shadow-lg transition-all ${
                    product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
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
                    <span className="text-accent font-semibold">${product.price}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      product.stock <= 0 
                        ? 'bg-red-500/20 text-red-400' 
                        : product.stock <= product.min_stock
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {product.stock}
                    </span>
                  </div>
                </div>
              ))}
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
              <label className="block text-sm font-medium mb-2">Cliente (opcional)</label>
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
                        <div className="text-accent font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                        <div className="text-muted text-xs">${item.price} c/u</div>
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
    </div>
  )
}