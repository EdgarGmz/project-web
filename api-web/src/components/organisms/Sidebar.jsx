import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, hasPermission } = useAuth()
  const location = useLocation()

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', path: '/dashboard', roles: ['owner', 'admin', 'supervisor', 'cashier', 'auditor'] },
    { icon: '👤', label: 'Perfil', path: '/profile', roles: ['owner', 'admin', 'supervisor', 'cashier', 'auditor'] },
    { icon: '⚙️', label: 'Configuración', path: '/settings', roles: ['owner', 'admin'] },
    { icon: '🏢', label: 'Sucursales', path: '/branches', roles: ['owner', 'admin'] },
    { icon: '👥', label: 'Usuarios', path: '/users', roles: ['owner', 'admin'] },
    { icon: '📦', label: 'Productos', path: '/products', roles: ['owner', 'admin', 'supervisor'] },
    { icon: '📊', label: 'Inventario', path: '/inventory', roles: ['owner', 'admin', 'supervisor'] },
    { icon: '🛒', label: 'POS', path: '/pos', roles: ['owner', 'admin', 'supervisor', 'cashier'] },
    { icon: '💰', label: 'Ventas', path: '/sales', roles: ['owner', 'admin', 'supervisor', 'cashier'] },
    { icon: '👤', label: 'Clientes', path: '/customers', roles: ['owner', 'admin', 'supervisor', 'cashier'] },
    { icon: '🏭', label: 'Proveedores', path: '/suppliers', roles: ['owner', 'admin', 'supervisor'] },
    { icon: '📋', label: 'Compras', path: '/purchases', roles: ['owner', 'admin', 'supervisor'] },
    { icon: '📈', label: 'Reportes', path: '/reports', roles: ['owner', 'admin', 'supervisor', 'auditor'] },
    { icon: '🔍', label: 'Auditoría', path: '/audit', roles: ['owner', 'auditor'] },
    { icon: '🔔', label: 'Notificaciones', path: '/notifications', roles: ['owner', 'admin', 'supervisor'] },
    { icon: '💳', label: 'Pagos', path: '/payments', roles: ['owner', 'admin'] },
    { icon: '↩️', label: 'Devoluciones', path: '/returns', roles: ['owner', 'admin', 'supervisor', 'cashier'] }
  ]

  const visibleItems = menuItems.filter(item => hasPermission(item.roles))

  return (
    <aside className={`bg-surface border-r border-slate-600/20 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 border-b border-slate-600/20">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center gap-3 text-text hover:text-accent transition"
        >
          <div className="h-8 w-8 rounded bg-accent/20 border border-accent/30 flex items-center justify-center">
            🎮
          </div>
          {!isCollapsed && <span className="font-semibold">Gaming Store</span>}
        </button>
      </div>
      
      <nav className="p-2">
        {visibleItems.map((item, index) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-md mb-1 transition ${
                isActive ? 'bg-accent/10 text-accent' : 'text-muted hover:text-text hover:bg-surface'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-slate-600/20">
        {!isCollapsed && (
          <div className="text-xs text-muted mb-2">
            {user?.first_name} {user?.last_name}
            <br />
            <span className="text-accent">{user?.role?.toUpperCase()}</span>
          </div>
        )}
        <Link to="/logout" className="flex items-center gap-3 text-muted hover:text-red-400 transition">
          <span>🚪</span>
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </Link>
      </div>
    </aside>
  )
}