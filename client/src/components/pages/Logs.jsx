import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { logService } from '../../services/logService'
import { userService } from '../../services/userService'

export default function Logs() {
    const [logs, setLogs] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 })
    
    // Filtros
    const [filters, setFilters] = useState({
        search: '',
        user_id: '',
        action: '',
        service: '',
        startDate: '',
        endDate: ''
    })

    const { hasPermission } = useAuth()

    // Tipos de acciones con iconos
    const actions = [
        { value: '', label: 'Todas las acciones', icon: '📋', color: 'bg-gray-500/20 text-gray-400' },
        { value: 'CREATE', label: 'Crear', icon: '➕', color: 'bg-green-500/20 text-green-400' },
        { value: 'UPDATE', label: 'Actualizar', icon: '✏️', color: 'bg-blue-500/20 text-blue-400' },
        { value: 'DELETE', label: 'Eliminar', icon: '🗑️', color: 'bg-red-500/20 text-red-400' },
        { value: 'LOGIN', label: 'Login', icon: '🔓', color: 'bg-purple-500/20 text-purple-400' },
        { value: 'LOGOUT', label: 'Logout', icon: '🔒', color: 'bg-gray-500/20 text-gray-400' },
        { value: 'VIEW', label: 'Ver', icon: '👁️', color: 'bg-cyan-500/20 text-cyan-400' },
        { value: 'EXPORT', label: 'Exportar', icon: '📤', color: 'bg-yellow-500/20 text-yellow-400' },
        { value: 'APPROVE', label: 'Aprobar', icon: '✅', color: 'bg-green-500/20 text-green-400' },
        { value: 'REJECT', label: 'Rechazar', icon: '❌', color: 'bg-red-500/20 text-red-400' },
        { value: 'ERROR', label: 'Error', icon: '⚠️', color: 'bg-red-600/20 text-red-500' }
    ]

    // Función para obtener el icono de una acción
    const getActionIcon = (action) => {
        const actionObj = actions.find(a => a.value === action)
        return actionObj?.icon || '📋'
    }

    // Debug: verificar que actions tenga las opciones correctas
    if (process.env.NODE_ENV === 'development') {
        console.log('Actions array:', actions)
    }

    // Mapeo de iconos por módulo
    const getServiceIcon = (service) => {
        const iconMap = {
            'auth': '🔐',
            'user': '👤',
            'product': '📦',
            'customer': '👥',
            'sale': '💰',
            'inventory': '📊',
            'purchase': '🛒',
            'return': '↩️',
            'payment': '💳',
            'report': '📈',
            'branch': '🏢',
            'settings': '⚙️'
        }
        return iconMap[service] || '📋'
    }

    // Mapeo de nombres amigables por módulo
    const getServiceLabel = (service) => {
        const labelMap = {
            'auth': 'Autenticación',
            'user': 'Usuarios',
            'product': 'Productos',
            'customer': 'Clientes',
            'sale': 'Ventas',
            'inventory': 'Inventario',
            'purchase': 'Compras',
            'return': 'Devoluciones',
            'payment': 'Pagos',
            'report': 'Reportes',
            'branch': 'Sucursales',
            'settings': 'Configuración'
        }
        return labelMap[service] || service
    }

    // Función para obtener el color según el módulo
    const getServiceColor = (service) => {
        const serviceColors = {
            'auth': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
            'user': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
            'product': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            'customer': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'sale': 'bg-green-500/20 text-green-400 border-green-500/30',
            'inventory': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
            'purchase': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            'return': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
            'payment': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            'report': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
            'branch': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
            'settings': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
        }
        return serviceColors[service] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }

    // Servicios/Módulos (todos en singular para consistencia)
    const services = [
        { value: '', label: 'Todos los módulos', icon: '📋' },
        { value: 'auth', label: 'Autenticación', icon: '🔐' },
        { value: 'user', label: 'Usuarios', icon: '👤' },
        { value: 'product', label: 'Productos', icon: '📦' },
        { value: 'customer', label: 'Clientes', icon: '👥' },
        { value: 'sale', label: 'Ventas', icon: '💰' },
        { value: 'inventory', label: 'Inventario', icon: '📊' },
        { value: 'purchase', label: 'Compras', icon: '🛒' },
        { value: 'return', label: 'Devoluciones', icon: '↩️' },
        { value: 'payment', label: 'Pagos', icon: '💳' },
        { value: 'report', label: 'Reportes', icon: '📈' },
        { value: 'branch', label: 'Sucursales', icon: '🏢' },
        { value: 'settings', label: 'Configuración', icon: '⚙️' }
    ]

    useEffect(() => {
        fetchLogs()
        fetchUsers()
    }, [pagination.page, filters])

    const fetchLogs = async () => {
        try {
            setLoading(true)
            const response = await logService.getAll({
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            })
            
            if (response.success) {
                setLogs(response.data)
                setPagination(prev => ({
                    ...prev,
                    total: response.pagination.total,
                    pages: response.pagination.pages
                }))
            }
        } catch (error) {
            console.error('Error fetching logs:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await userService.getAll()
            if (response.success) {
                setUsers(response.data)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }))
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const handleClearFilters = () => {
        setFilters({
            search: '',
            user_id: '',
            action: '',
            service: '',
            startDate: '',
            endDate: ''
        })
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const getActionColor = (action) => {
        const actionObj = actions.find(a => a.value === action)
        return actionObj?.color || 'bg-gray-500/20 text-gray-400'
    }

    // Función para obtener el color según el rol del usuario
    const getRoleColor = (role) => {
        const roleColors = {
            'owner': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            'admin': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'supervisor': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            'cashier': 'bg-green-500/20 text-green-400 border-green-500/30'
        }
        return roleColors[role] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }

    // Función para obtener el icono según el rol
    const getRoleIcon = (role) => {
        const roleIcons = {
            'owner': '👑',
            'admin': '🛡️',
            'supervisor': '👔',
            'cashier': '💰'
        }
        return roleIcons[role] || '👤'
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date)
    }

    // Verificar permisos
    if (!hasPermission(['owner'])) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-400 mb-2">Acceso Denegado</h2>
                    <p className="text-muted">No tienes permisos para acceder a los logs del sistema.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Logs del Sistema</h1>
                    <p className="text-muted">Auditoría y registro de actividades</p>
                </div>
            </header>

            {/* Filtros */}
            <div className="card p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Filtros</h2>
                    {(filters.search || filters.action || filters.service || filters.user_id) && (
                        <button
                            onClick={handleClearFilters}
                            className="text-sm text-accent hover:opacity-80 transition flex items-center gap-2"
                            title="Limpiar filtros"
                        >
                            🗑️ Limpiar filtros
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Búsqueda */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Buscar en mensaje</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            placeholder="Buscar..."
                            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                    </div>

                    {/* Usuario */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Usuario</label>
                        <select
                            value={filters.user_id}
                            onChange={(e) => handleFilterChange('user_id', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface focus:ring-2 focus:ring-accent focus:border-transparent"
                        >
                            <option value="">Todos los usuarios</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.first_name} {user.last_name} ({user.role})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Acción */}
                    <div>
                        <label htmlFor="action-filter" className="block text-sm font-medium mb-2">Acción</label>
                        <select
                            name="action"
                            id="action-filter"
                            value={filters.action || ''}
                            onChange={(e) => {
                                handleFilterChange('action', e.target.value)
                            }}
                            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface focus:ring-2 focus:ring-accent focus:border-transparent"
                        >
                            {actions.map((action) => (
                                <option key={`action-${action.value}`} value={action.value}>
                                    {action.icon} {action.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Servicio/Módulo */}
                    <div>
                        <label htmlFor="service-filter" className="block text-sm font-medium mb-2">Módulo</label>
                        <select
                            name="service"
                            id="service-filter"
                            value={filters.service || ''}
                            onChange={(e) => handleFilterChange('service', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface focus:ring-2 focus:ring-accent focus:border-transparent"
                        >
                            {services.map(service => (
                                <option key={`service-${service.value}`} value={service.value}>
                                    {service.icon} {service.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Fecha inicio */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Desde</label>
                        <input
                            type="datetime-local"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                    </div>

                    {/* Fecha fin */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Hasta</label>
                        <input
                            type="datetime-local"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Tabla de logs */}
            <div className="card overflow-hidden border border-slate-600/20 shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 border-b border-slate-600/30">
                                <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <span>📅</span>
                                        <span>Fecha</span>
                                    </div>
                                </th>
                                <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <span>👤</span>
                                        <span>Usuario</span>
                                    </div>
                                </th>
                                <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <span>⚡</span>
                                        <span>Acción</span>
                                    </div>
                                </th>
                                <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <span>📋</span>
                                        <span>Módulo</span>
                                    </div>
                                </th>
                                <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                                    <div className="flex items-center gap-2">
                                        <span>💬</span>
                                        <span>Mensaje</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-600/20">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                                            <span className="text-muted">Cargando logs...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <span className="text-4xl">📭</span>
                                            <span className="text-muted font-medium">No se encontraron logs con los filtros aplicados</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log, index) => (
                                    <tr 
                                        key={log.id} 
                                        className="group hover:bg-gradient-to-r hover:from-slate-800/40 hover:to-slate-700/20 transition-all duration-200 border-b border-slate-600/10"
                                    >
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-white">
                                                    {formatDate(log.created_at).split(',')[0]}
                                                </span>
                                                <span className="text-xs text-muted mt-0.5">
                                                    {formatDate(log.created_at).split(',')[1]?.trim()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {log.user ? (
                                                <div className="space-y-2 min-w-[200px]">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{getRoleIcon(log.user.role)}</span>
                                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getRoleColor(log.user.role)}`}>
                                                            {log.user.role?.toUpperCase() || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="font-semibold text-white group-hover:text-accent transition-colors">
                                                        {log.user.first_name} {log.user.last_name}
                                                    </div>
                                                    <div className="text-xs text-muted truncate max-w-[200px]" title={log.user.email}>
                                                        {log.user.email}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted italic">Usuario desconocido</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            {(() => {
                                                const actionKey = log.action?.toUpperCase();
                                                const actionObj = actions.find(a => a.value === actionKey);
                                                return (
                                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 w-fit border shadow-sm ${getActionColor(actionKey)}`}>
                                                        <span className="text-base">{getActionIcon(actionKey)}</span>
                                                        <span>{actionObj ? actionObj.label : log.action}</span>
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 w-fit border shadow-sm ${getServiceColor(log.service)}`}>
                                                <span className="text-base">{getServiceIcon(log.service)}</span>
                                                <span>{getServiceLabel(log.service)}</span>
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 max-w-md">
                                            <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-600/20 group-hover:border-slate-600/40 transition-colors">
                                                <p className="text-sm text-white/90 line-clamp-2 leading-relaxed" title={log.message}>
                                                    {log.message}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {!loading && logs.length > 0 && (
                    <div className="px-6 py-4 bg-surface/30 flex items-center justify-between border-t border-border">
                        <div className="text-sm text-muted">
                            Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} logs
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                disabled={pagination.page === 1}
                                className="px-3 py-1 bg-surface hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                            >
                                Anterior
                            </button>
                            <span className="px-3 py-1 bg-surface/50 rounded">
                                Página {pagination.page} de {pagination.pages}
                            </span>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                disabled={pagination.page >= pagination.pages}
                                className="px-3 py-1 bg-surface hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
