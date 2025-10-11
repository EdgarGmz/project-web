export default function Dashboard() {
  const stats = [
    { label: 'Ventas Hoy', value: '$2,450', change: '+12%', icon: '💰' },
    { label: 'Productos', value: '156', change: '+3', icon: '📦' },
    { label: 'Clientes', value: '89', change: '+8', icon: '👥' },
    { label: 'Stock Bajo', value: '12', change: '-2', icon: '⚠️' }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">{stat.label}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                <p className="text-accent text-sm mt-1">{stat.change}</p>
              </div>
              <div className="text-3xl opacity-80">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Ventas Recientes</h3>
          <div className="space-y-3">
            {[
              { product: 'PlayStation 5', customer: 'Juan Pérez', amount: '$599.99' },
              { product: 'Xbox Series X', customer: 'María García', amount: '$499.99' },
              { product: 'Nintendo Switch', customer: 'Carlos López', amount: '$349.99' }
            ].map((sale, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-slate-600/10 last:border-0">
                <div>
                  <p className="font-medium">{sale.product}</p>
                  <p className="text-muted text-sm">{sale.customer}</p>
                </div>
                <span className="text-accent font-semibold">{sale.amount}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Productos Populares</h3>
          <div className="space-y-3">
            {[
              { name: 'PlayStation 5', sales: 45, percentage: 85 },
              { name: 'Xbox Series X', sales: 32, percentage: 60 },
              { name: 'Nintendo Switch OLED', sales: 28, percentage: 50 }
            ].map((product, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{product.name}</span>
                  <span className="text-muted">{product.sales} ventas</span>
                </div>
                <div className="bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-accent h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${product.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}