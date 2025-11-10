import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'

export default function Dashboard() {
  const { user, hasPermission } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    sales: {
      today: 0,
      yesterday: 0,
      thisMonth: 0,
      lastMonth: 0
    },
    products: {
      total: 0,
      lowStock: 0,
      outOfStock: 0
    },
    customers: {
      total: 0,
      new: 0
    },
    revenue: {
      today: 0,
      thisMonth: 0,
      growth: 0
    }
  })
  const [recentSales, setRecentSales] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Quick action cards with navigation
  const quickActions = [
    {
      title: 'Nueva Venta',
      description: 'Iniciar punto de venta',
      icon: '🛒',
      color: 'from-green-500 to-emerald-600',
      route: '/pos',
      permission: ['owner', 'admin', 'supervisor', 'cashier']
    },
    {
      title: 'Agregar Producto',
      description: 'Registrar nuevo producto',
      icon: '📦',
      color: 'from-blue-500 to-cyan-600',
      route: '/products',
      permission: ['owner', 'admin', 'supervisor']
    },
    {
      title: 'Nuevo Cliente',
      description: 'Registrar cliente',
      icon: '👤',
      color: 'from-purple-500 to-violet-600',
      route: '/customers',
      permission: ['owner', 'admin', 'supervisor', 'cashier']
    },
    {
      title: 'Ver Reportes',
      description: 'Análisis y estadísticas',
      icon: '📊',
      color: 'from-orange-500 to-red-600',
      route: '/reports',
      permission: ['owner', 'admin', 'supervisor']
    }
  ]

  // Alert cards with navigation
  const alertCards = [
    {
      title: 'Stock Bajo',
      count: stats.products.lowStock,
      icon: '⚠️',
      color: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
      route: '/inventory',
      permission: ['owner', 'admin', 'supervisor']
    },
    {
      title: 'Sin Stock',
      count: stats.products.outOfStock,
      icon: '🚨',
      color: 'bg-red-500/10 border-red-500/30 text-red-400',
      route: '/inventory',
      permission: ['owner', 'admin', 'supervisor']
    }
  ]

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsData, salesData, productsData, stockData] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/recent-sales'),
        api.get('/dashboard/top-products'),
        api.get('/dashboard/low-stock')
      ])

      if (statsData && statsData.success) setStats(statsData.data)
      if (salesData && salesData.success) setRecentSales(salesData.data)
      if (productsData && productsData.success) setTopProducts(productsData.data)
      if (stockData && stockData.success) setLowStockProducts(stockData.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNavigation = (route) => {
    navigate(route)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount)
  }

  const calculateGrowth = (current, previous) => {
    if (previous === 0) return 0
    return ((current - previous) / previous * 100).toFixed(1)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">
          ¡Bienvenido, {user?.first_name}! 👋
        </h1>
        <p className="text-muted">
          Aquí tienes un resumen de tu Gaming Store el día de hoy
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions
          .filter(action => hasPermission(action.permission))
          .map((action, index) => (
            <div
              key={index}
              onClick={() => handleNavigation(action.route)}
              className={`p-6 rounded-xl bg-gradient-to-br ${action.color} cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg`}
            >
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="font-semibold text-lg">{action.title}</h3>
                  <p className="text-white/80 text-sm">{action.description}</p>
                </div>
                <div className="text-3xl">{action.icon}</div>
              </div>
            </div>
          ))
        }
      </div>

      {/* Alerts */}
      {(stats.products.lowStock > 0 || stats.products.outOfStock > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alertCards
            .filter(alert => alert.count > 0 && hasPermission(alert.permission))
            .map((alert, index) => (
              <div
                key={index}
                onClick={() => handleNavigation(alert.route)}
                className={`p-4 rounded-lg border cursor-pointer hover:scale-105 transition-transform ${alert.color}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{alert.icon}</span>
                  <div>
                    <h4 className="font-semibold">{alert.title}</h4>
                    <p className="text-sm opacity-80">
                      {alert.count} producto{alert.count !== 1 ? 's' : ''} requieren atención
                    </p>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ventas de Hoy */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-accent/20 rounded-lg flex items-center justify-center">
              <span className="text-accent text-xl">💰</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.sales.today}</div>
              <div className="text-sm text-muted">Ventas Hoy</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Ayer: {stats.sales.yesterday}</span>
            <span className={`font-medium ${
              stats.sales.today >= stats.sales.yesterday ? 'text-green-400' : 'text-red-400'
            }`}>
              {stats.sales.today >= stats.sales.yesterday ? '↗' : '↘'} 
              {Math.abs(calculateGrowth(stats.sales.today, stats.sales.yesterday))}%
            </span>
          </div>
        </div>

        {/* Ingresos del Día */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-green-400 text-xl">💵</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatCurrency(stats.revenue.today)}</div>
              <div className="text-sm text-muted">Ingresos Hoy</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Este mes</span>
            <span className="font-medium text-green-400">
              {formatCurrency(stats.revenue.thisMonth)}
            </span>
          </div>
        </div>

        {/* Total Productos */}
        <div 
          className="card cursor-pointer hover:scale-105 transition-transform"
          onClick={() => handleNavigation('/products')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-blue-400 text-xl">📦</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.products.total}</div>
              <div className="text-sm text-muted">Productos</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">En catálogo</span>
            <span className="text-accent hover:underline">Ver todos →</span>
          </div>
        </div>

        {/* Total Clientes */}
        <div 
          className="card cursor-pointer hover:scale-105 transition-transform"
          onClick={() => handleNavigation('/customers')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <span className="text-purple-400 text-xl">👥</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.customers.total}</div>
              <div className="text-sm text-muted">Clientes</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Nuevos: {stats.customers.new}</span>
            <span className="text-accent hover:underline">Ver todos →</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Ventas Recientes</h3>
            <button 
              onClick={() => handleNavigation('/sales')}
              className="text-accent hover:opacity-80 transition text-sm"
            >
              Ver todas →
            </button>
          </div>
          
          {recentSales.length > 0 ? (
            <div className="space-y-4">
              {recentSales.slice(0, 5).map((sale, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-surface/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-accent/20 rounded-lg flex items-center justify-center">
                      <span className="text-accent text-sm font-bold">#{sale.id}</span>
                    </div>
                    <div>
                      <div className="font-medium">{sale.customer_name || 'Cliente general'}</div>
                      <div className="text-sm text-muted">
                        {new Date(sale.created_at).toLocaleTimeString()} • {sale.total_items} items
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(sale.total)}</div>
                    <div className="text-sm text-muted">{sale.payment_method}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🛒</div>
              <p className="text-muted">No hay ventas registradas hoy</p>
              <button 
                onClick={() => handleNavigation('/pos')}
                className="btn mt-4"
              >
                Realizar Primera Venta
              </button>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Productos Top</h3>
            <button 
              onClick={() => handleNavigation('/reports')}
              className="text-accent hover:opacity-80 transition text-sm"
            >
              Ver reporte →
            </button>
          </div>
          
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="text-sm text-muted w-6">#{index + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{product.name}</div>
                    <div className="text-sm text-muted">{product.quantity_sold} vendidos</div>
                  </div>
                  <div className="text-accent font-medium">
                    {formatCurrency(product.revenue)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-muted">Sin datos de productos</p>
            </div>
          )}
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && hasPermission(['owner', 'admin', 'supervisor']) && (
        <div className="card bg-yellow-500/5 border-yellow-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-lg font-semibold text-yellow-400">Productos con Stock Bajo</h3>
                <p className="text-sm text-muted">Requieren reabastecimiento urgente</p>
              </div>
            </div>
            <button 
              onClick={() => handleNavigation('/inventory')}
              className="btn"
            >
              Gestionar Stock
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.slice(0, 6).map((product, index) => (
              <div key={index} className="p-3 bg-surface/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{product.name}</div>
                    <div className="text-sm text-muted">{product.brand}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-semibold">{product.stock}</div>
                    <div className="text-xs text-muted">Min: {product.min_stock}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {lowStockProducts.length > 6 && (
            <div className="text-center mt-4">
              <button 
                onClick={() => handleNavigation('/inventory')}
                className="text-accent hover:opacity-80 transition"
              >
                Ver {lowStockProducts.length - 6} productos más →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          className="card text-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => handleNavigation('/sales')}
        >
          <div className="text-accent font-semibold">{stats.sales.thisMonth}</div>
          <div className="text-muted text-sm">Ventas del Mes</div>
        </div>
        <div 
          className="card text-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => handleNavigation('/inventory')}
        >
          <div className="text-yellow-400 font-semibold">{stats.products.lowStock}</div>
          <div className="text-muted text-sm">Stock Bajo</div>
        </div>
        <div 
          className="card text-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => handleNavigation('/customers')}
        >
          <div className="text-purple-400 font-semibold">{stats.customers.new}</div>
          <div className="text-muted text-sm">Clientes Nuevos</div>
        </div>
        <div 
          className="card text-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => handleNavigation('/reports')}
        >
          <div className="text-green-400 font-semibold">
            {stats.revenue.growth > 0 ? '+' : ''}{stats.revenue.growth}%
          </div>
          <div className="text-muted text-sm">Crecimiento</div>
        </div>
      </div>
    </div>
  )
}