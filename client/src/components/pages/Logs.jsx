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

    // Tipos de acciones
    const actions = [
        { value: '', label: 'Todas las acciones' },
        { value: 'CREATE', label: 'Crear', color: 'bg-green-500/20 text-green-400' },
        { value: 'UPDATE', label: 'Actualizar', color: 'bg-blue-500/20 text-blue-400' },
        { value: 'DELETE', label: 'Eliminar', color: 'bg-red-500/20 text-red-400' },
        { value: 'LOGIN', label: 'Login', color: 'bg-purple-500/20 text-purple-400' },
        { value: 'LOGOUT', label: 'Logout', color: 'bg-gray-500/20 text-gray-400' },
        { value: 'VIEW', label: 'Ver', color: 'bg-cyan-500/20 text-cyan-400' },
        { value: 'EXPORT', label: 'Exportar', color: 'bg-yellow-500/20 text-yellow-400' },
        { value: 'APPROVE', label: 'Aprobar', color: 'bg-green-500/20 text-green-400' },
        { value: 'REJECT', label: 'Rechazar', color: 'bg-red-500/20 text-red-400' },
        { value: 'ERROR', label: 'Error', color: 'bg-red-600/20 text-red-500' }
    ]

    // Servicios/Módulos
    const services = [
        { value: '', label: 'Todos los módulos' },
        { value: 'auth', label: 'Autenticación' },
        { value: 'users', label: 'Usuarios' },
        { value: 'products', label: 'Productos' },
        { value: 'customers', label: 'Clientes' },
        { value: 'sales', label: 'Ventas' },
        { value: 'inventory', label: 'Inventario' },
        { value: 'purchases', label: 'Compras' },
        { value: 'returns', label: 'Devoluciones' },
        { value: 'payments', label: 'Pagos' },
        { value: 'reports', label: 'Reportes' },
        { value: 'branches', label: 'Sucursales' },
        { value: 'settings', label: 'Configuración' }
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
                    <button
                        onClick={handleClearFilters}
                        className="text-sm text-accent hover:text-accent/80"
                    >
                        Limpiar filtros
                    </button>
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
                        <label className="block text-sm font-medium mb-2">Acción</label>
                        <select
                            value={filters.action}
                            onChange={(e) => handleFilterChange('action', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface focus:ring-2 focus:ring-accent focus:border-transparent"
                        >
                            {actions.map(action => (
                                <option key={action.value} value={action.value}>
                                    {action.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Servicio */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Módulo</label>
                        <select
                            value={filters.service}
                            onChange={(e) => handleFilterChange('service', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface focus:ring-2 focus:ring-accent focus:border-transparent"
                        >
                            {services.map(service => (
                                <option key={service.value} value={service.value}>
                                    {service.label}
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
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-surface/50">
                            <tr>
                                <th className="text-left py-3 px-4">Fecha</th>
                                <th className="text-left py-3 px-4">Usuario</th>
                                <th className="text-left py-3 px-4">Acción</th>
                                <th className="text-left py-3 px-4">Módulo</th>
                                <th className="text-left py-3 px-4">Mensaje</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
                                            <span>Cargando logs...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-muted">
                                        No se encontraron logs con los filtros aplicados
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-surface/30 transition">
                                        <td className="py-3 px-4 whitespace-nowrap text-sm">
                                            {formatDate(log.created_at)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {log.user ? (
                                                <div>
                                                    <div className="font-medium">
                                                        {log.user.first_name} {log.user.last_name}
                                                    </div>
                                                    <div className="text-sm text-muted">
                                                        {log.user.email}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted">Usuario desconocido</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-1 bg-surface/50 rounded text-xs font-medium">
                                                {log.service}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 max-w-md">
                                            <p className="text-sm line-clamp-2" title={log.message}>
                                                {log.message}
                                            </p>
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
