import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [movements, setMovements] = useState([])
  const [showMovementForm, setShowMovementForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('stock')
  const { hasPermission } = useAuth()

  const [movementData, setMovementData] = useState({
    product_id: '',
    type: 'entry',
    quantity: '',
    reason: '',
    notes: ''
  })

  useEffect(() => {
    fetchProducts()
    fetchMovements()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/products', {
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

  const fetchMovements = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/inventory/movements', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      if (data.success) setMovements(data.data)
    } catch (error) {
      console.error('Error fetching movements:', error)
    }
  }

  const handleMovementSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('http://localhost:3000/api/inventory/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(movementData)
      })
      
      if (response.ok) {
        fetchProducts()
        fetchMovements()
        setShowMovementForm(false)
        setMovementData({ product_id: '', type: 'entry', quantity: '', reason: '', notes: '' })
      }
    } catch (error) {
      console.error('Error creating movement:', error)
    }
  }

  const getStockStatus = (product) => {
    if (product.stock <= 0) return { color: 'bg-red-500/20 text-red-400', label: 'Agotado' }
    if (product.stock <= product.min_stock) return { color: 'bg-yellow-500/20 text-yellow-400', label: 'Stock Bajo' }
    return { color: 'bg-green-500/20 text-green-400', label: 'En Stock' }
  }

  const lowStockProducts = products.filter(p => p.stock <= p.min_stock)
  const outOfStockProducts = products.filter(p => p.stock <= 0)

  if (loading) {
    return <div className="card text-center py-8">Cargando inventario...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Inventario</h1>
          <p className="text-muted">Control de stock y movimientos</p>
        </div>
        {hasPermission(['owner', 'admin', 'supervisor']) && (
          <button onClick={() => setShowMovementForm(true)} className="btn">
            + Movimiento de Stock
          </button>
        )}
      </div>

      {/* Alertas */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="space-y-3">
          {outOfStockProducts.length > 0 && (
            <div className="card bg-red-500/10 border-red-500/30">
              <div className="flex items-center gap-3">
                <span className="text-red-400 text-xl">🚨</span>
                <div>
                  <h3 className="font-semibold text-red-400">Productos Agotados</h3>
                  <p className="text-sm text-muted">
                    {outOfStockProducts.length} productos sin stock disponible
                  </p>
                </div>
              </div>
            </div>
          )}
          {lowStockProducts.length > 0 && (
            <div className="card bg-yellow-500/10 border-yellow-500/30">
              <div className="flex items-center gap-3">
                <span className="text-yellow-400 text-xl">⚠️</span>
                <div>
                  <h3 className="font-semibold text-yellow-400">Stock Bajo</h3>
                  <p className="text-sm text-muted">
                    {lowStockProducts.length} productos necesitan reabastecimiento
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-semibold text-accent">
            {products.reduce((acc, p) => acc + p.stock, 0)}
          </div>
          <div className="text-muted">Unidades Totales</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-green-400">
            {products.filter(p => p.stock > p.min_stock).length}
          </div>
          <div className="text-muted">En Stock</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-yellow-400">
            {lowStockProducts.length}
          </div>
          <div className="text-muted">Stock Bajo</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-semibold text-red-400">
            {outOfStockProducts.length}
          </div>
          <div className="text-muted">Agotados</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-surface/50 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex-1 py-2 px-4 rounded-md transition ${
            activeTab === 'stock' ? 'bg-accent text-black' : 'text-muted hover:text-text'
          }`}
        >
          Stock Actual
        </button>
        <button
          onClick={() => setActiveTab('movements')}
          className={`flex-1 py-2 px-4 rounded-md transition ${
            activeTab === 'movements' ? 'bg-accent text-black' : 'text-muted hover:text-text'
          }`}
        >
          Movimientos
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'stock' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-600/20">
                  <th className="text-left py-3 px-4">Producto</th>
                  <th className="text-left py-3 px-4">Stock Actual</th>
                  <th className="text-left py-3 px-4">Stock Mínimo</th>
                  <th className="text-left py-3 px-4">Estado</th>
                  <th className="text-left py-3 px-4">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const stockStatus = getStockStatus(product)
                  const totalValue = product.stock * product.cost
                  
                  return (
                    <tr key={product.id} className="border-b border-slate-600/10 last:border-0">
                      <td className="py-3 px-4">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-muted text-sm">{product.brand} {product.model}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xl font-semibold">{product.stock}</div>
                        <div className="text-muted text-sm">unidades</div>
                      </td>
                      <td className="py-3 px-4 text-muted">{product.min_stock}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">${totalValue.toFixed(2)}</div>
                        <div className="text-muted text-sm">${product.cost} c/u</div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'movements' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-600/20">
                  <th className="text-left py-3 px-4">Fecha</th>
                  <th className="text-left py-3 px-4">Producto</th>
                  <th className="text-left py-3 px-4">Tipo</th>
                  <th className="text-left py-3 px-4">Cantidad</th>
                  <th className="text-left py-3 px-4">Motivo</th>
                  <th className="text-left py-3 px-4">Usuario</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((movement) => (
                  <tr key={movement.id} className="border-b border-slate-600/10 last:border-0">
                    <td className="py-3 px-4 text-muted text-sm">
                      {new Date(movement.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{movement.product_name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        movement.type === 'entry' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {movement.type === 'entry' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={movement.type === 'entry' ? 'text-green-400' : 'text-red-400'}>
                        {movement.type === 'entry' ? '+' : '-'}{movement.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted">{movement.reason}</td>
                    <td className="py-3 px-4 text-muted">{movement.user_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal movimiento */}
      {showMovementForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Nuevo Movimiento de Stock</h3>
              <button onClick={() => setShowMovementForm(false)}>✕</button>
            </div>

            <form onSubmit={handleMovementSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Producto *</label>
                <select
                  value={movementData.product_id}
                  onChange={(e) => setMovementData(prev => ({ ...prev, product_id: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                >
                  <option value="">Seleccionar producto</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Stock: {product.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Movimiento *</label>
                <select
                  value={movementData.type}
                  onChange={(e) => setMovementData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                >
                  <option value="entry">Entrada (Agregar stock)</option>
                  <option value="exit">Salida (Reducir stock)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cantidad *</label>
                <input
                  type="number"
                  min="1"
                  value={movementData.quantity}
                  onChange={(e) => setMovementData(prev => ({ ...prev, quantity: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Motivo *</label>
                <select
                  value={movementData.reason}
                  onChange={(e) => setMovementData(prev => ({ ...prev, reason: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                >
                  <option value="">Seleccionar motivo</option>
                  <option value="purchase">Compra a proveedor</option>
                  <option value="return">Devolución de cliente</option>
                  <option value="adjustment">Ajuste de inventario</option>
                  <option value="damage">Producto dañado</option>
                  <option value="loss">Pérdida/Robo</option>
                  <option value="transfer">Transferencia entre sucursales</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notas</label>
                <textarea
                  value={movementData.notes}
                  onChange={(e) => setMovementData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  rows="3"
                  placeholder="Detalles adicionales..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn flex-1">
                  Registrar Movimiento
                </button>
                <button
                  type="button"
                  onClick={() => setShowMovementForm(false)}
                  className="px-4 py-2 border border-slate-600/30 rounded-md"
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