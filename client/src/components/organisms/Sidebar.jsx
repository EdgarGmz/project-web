import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useSidebar } from '../../contexts/SidebarContext'

export default function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const { user, hasPermission, logout } = useAuth()
  const location = useLocation()

  const menuItems = [
    { icon: '🏠', label: 'Dashboard', path: '/dashboard', roles: ['owner', 'admin', 'supervisor', 'cashier'] },
    { icon: '📦', label: 'Productos', path: '/products', roles: ['owner', 'admin', 'supervisor', 'cashier'] },
    { icon: '👥', label: 'Usuarios', path: '/users', roles: ['owner', 'admin'] },
    { icon: '👤', label: 'Clientes', path: '/customers', roles: ['owner', 'admin', 'supervisor', 'cashier'] },
    { icon: '🏢', label: 'Sucursales', path: '/branches', roles: ['owner', 'admin'] },
    { icon: '📊', label: 'Inventario', path: '/inventory', roles: ['owner', 'admin', 'supervisor'] },
    { icon: '📋', label: 'Compras', path: '/purchases', roles: ['owner', 'admin'] },
    { icon: '💰', label: 'Ventas', path: '/sales', roles: ['owner', 'admin', 'supervisor', 'cashier'] },    
    { icon: '🛒', label: 'POS', path: '/pos', roles: ['supervisor', 'cashier'] },
    { icon: '📈', label: 'Reportes', path: '/reports', roles: ['owner', 'admin'] },
    { icon: '💳', label: 'Pagos', path: '/payments', roles: ['owner', 'admin'] },
    { icon: '↩️', label: 'Devoluciones', path: '/returns', roles: ['owner', 'admin', 'supervisor'] },
    { icon: '👤', label: 'Perfil', path: '/profile', roles: ['owner', 'admin', 'supervisor', 'cashier'] },
    { icon: '⚙️', label: 'Configuración', path: '/settings', roles: ['owner', 'admin', 'supervisor', 'cashier'] },
  ]

  const visibleItems = menuItems.filter(item => hasPermission(item.roles))

  return (
    <aside className={`bg-surface border-r border-slate-600/20 transition-all duration-300 flex flex-col h-screen fixed left-0 top-0 z-10 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-600/20 flex-shrink-0">
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center gap-3 text-text hover:text-accent transition"
        >
          <div className="h-8 w-8 rounded bg-accent/20 border border-accent/30 flex items-center justify-center">
            🎮
          </div>
          {!isCollapsed && <span className="font-semibold">Apex Store</span>}
        </button>
      </div>
      
      {/* Menu Items - Con scroll */}
      <nav className="p-2 flex-1 overflow-y-auto">
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

      {/* Footer - Usuario y Cerrar Sesión */}
      <div className="p-4 border-t border-slate-600/20 flex-shrink-0">
        {!isCollapsed && user && (
          <div className="text-xs text-muted mb-2">
            {user?.first_name} {user?.last_name}
            <br />
            <span className="text-accent">{user?.role?.toUpperCase()}</span>
          </div>
        )}
        {user ? (
          <button
            onClick={logout}
            className="flex items-center gap-3 text-muted hover:text-red-400 transition w-full"
          >
            <span>🚪</span>
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>
        ) : (
          <Link to="/login" className="btn text-lg px-8 py-3 inline-block text-center w-full">
            Iniciar Sesión
          </Link>
        )}
      </div>
    </aside>
  )
}