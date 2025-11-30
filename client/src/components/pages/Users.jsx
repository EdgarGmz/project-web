import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import UserForm from '../organisms/UserForm'
import { userService } from '../../services/userService'
import { branchService } from '../../services/branchService'
import SuccessModal from '../molecules/SuccessModal'
import CancelledModal from '../molecules/CancelledModal'
import LoadingModal from '../molecules/LoadingModal'
import NotFound from '../molecules/NotFound'

export default function Users() {
const [users, setUsers] = useState([])
const [branches, setBranches] = useState([])
const [loading, setLoading] = useState(true)
const [showForm, setShowForm] = useState(false)
const [editingUser, setEditingUser] = useState(null)
const [searchTerm, setSearchTerm] = useState('')
const [roleFilter, setRoleFilter] = useState('all')
const [statusFilter, setStatusFilter] = useState('all')
const [branchFilter, setBranchFilter] = useState('all')
const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' })
const [cancelledModal, setCancelledModal] = useState({ isOpen: false, message: '' })
const { user, hasPermission } = useAuth()

const roles = [
    { value: 'owner', label: 'Propietario', color: 'text-purple-400' },
    { value: 'admin', label: 'Administrador', color: 'text-red-400' },
    { value: 'supervisor', label: 'Supervisor', color: 'text-yellow-400' },
    { value: 'cashier', label: 'Cajero', color: 'text-green-400' }
]

    useEffect(() => {
        const loadData = async () => {
            // Cargar usuarios primero
            await fetchUsers()
            // Luego cargar sucursales
            await fetchBranches().catch(error => {
                console.log('Branch loading failed, will use fallback later')
            })
        }
        loadData()
    }, [])

    // Efecto para extraer sucursales cuando cambien los usuarios
    useEffect(() => {
        if (users.length > 0 && branches.length === 0) {
            console.log('Users loaded, extracting branches as fallback')
            setTimeout(() => extractBranchesFromUsers(), 100)
        }
    }, [users, branches.length])

    const fetchUsers = async () => {
        try {
            const response = await userService.getAll()
            if (response.success) {
                setUsers(response.data)
                console.log('Users loaded successfully:', response.data.length)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchBranches = async () => {
    try {
        console.log('Fetching branches...')
        const response = await branchService.getAll()
        
        if (response && response.success) {
            setBranches(response.data)
            console.log('✅ Branches loaded successfully:', response.data.length, 'branches')
        } else {
            console.error('Failed to load branches:', response ? response.message : 'No response')
            console.error('Response details:', response)
            
            // Como fallback, extraer sucursales de los usuarios existentes
            console.log('Fallback: extracting branches from users. Users count:', users.length)
            extractBranchesFromUsers()
        }
    } catch (error) {
        console.error('Error fetching branches:', error)
        console.log('Fallback: extracting branches from users due to error. Users count:', users.length)
        // Como fallback, extraer sucursales de los usuarios existentes
        extractBranchesFromUsers()
    }
}

// Función para extraer sucursales únicas de los usuarios
const extractBranchesFromUsers = () => {
    console.log('Extracting branches from users...')
    console.log('Current users:', users)
    
    if (!users || users.length === 0) {
        console.log('No users available to extract branches from')
        return
    }
    
    const uniqueBranches = users
        .filter(user => {
            console.log('User:', user.first_name, 'Branch:', user.branch)
            return user.branch
        }) // Solo usuarios con sucursal
        .reduce((acc, user) => {
            const branch = user.branch
            if (!acc.find(b => b.id === branch.id)) {
                acc.push({
                    id: branch.id,
                    name: branch.name,
                    code: branch.code
                })
            }
            return acc
        }, [])
    
    console.log('Extracted branches from users:', uniqueBranches)
    setBranches(uniqueBranches)
}



// Función para filtrar usuarios
const filteredUsers = users.filter(userItem => {
    const matchesSearch = searchTerm === '' || 
        userItem.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userItem.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userItem.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'all' || userItem.role === roleFilter
    
    const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && userItem.is_active) ||
        (statusFilter === 'inactive' && !userItem.is_active)
    
    const matchesBranch = branchFilter === 'all' || 
        userItem.branch_id?.toString() === branchFilter.toString()
    
    return matchesSearch && matchesRole && matchesStatus && matchesBranch
}).sort((a, b) => {
    // Primero el owner, luego por fecha de creación (más recientes primero)
    if (a.role === 'owner' && b.role !== 'owner') return -1
    if (a.role !== 'owner' && b.role === 'owner') return 1
    return new Date(b.created_at) - new Date(a.created_at)
})

const handleEditUser = (userToEdit) => {
    setEditingUser(userToEdit)
    setShowForm(true)
}

const handleDeleteUser = async (userToDelete) => {
    if (!confirm(`¿Estás seguro de eliminar a ${userToDelete.first_name} ${userToDelete.last_name}?`)) {
        return
    }

    try {
        const response = await userService.delete(userToDelete.id)
        if (response.success) {
            setCancelledModal({ isOpen: true, message: 'Usuario eliminado exitosamente' })
            fetchUsers() // Refresh list
        } else {
            alert(response.message)
        }
    } catch (error) {
        console.error('Error deleting user:', error)
        alert('Error al eliminar el usuario')
    }
}

const canEditRole = (targetUser) => {
    // Solo OWNER puede editar cualquier rol (excepto otros owners)
    if (user.role === 'owner') return targetUser.role !== 'owner'
    
    // ADMIN puede editar solo supervisor, cashier (no otros admin ni owner)
    if (user.role === 'admin') {
        return ['supervisor', 'cashier'].includes(targetUser.role)
    }
    
    // TEMPORAL: Permitir más roles mientras se configura
    if (['supervisor', 'manager'].includes(user.role)) {
        return !['owner'].includes(targetUser.role)
    }
    
    return false
}

const canEditStatus = (targetUser) => {
    // No puede editar su propio estado
    if (targetUser.id === user.id) return false
    
    // OWNER puede editar cualquier estado excepto otros owners
    if (user.role === 'owner') return targetUser.role !== 'owner'
    
    // ADMIN puede editar estado de supervisor, cashier
    if (user.role === 'admin') {
        return !['owner', 'admin'].includes(targetUser.role)
    }
    
    // TEMPORAL: Permitir más roles mientras se configura
    if (['supervisor', 'manager'].includes(user.role)) {
        return !['owner'].includes(targetUser.role)
    }
    
    return false
}

return (
    <>
      <LoadingModal isOpen={loading} message="Cargando usuarios..." />
    <div className="space-y-6">
    <div className="flex items-center justify-between">
        <div>
        <h1 className="text-2xl font-semibold">Gestión de Usuarios</h1>
        <p className="text-muted">Administra los usuarios del sistema</p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Tu rol actual: <strong>{user?.role || 'Sin rol'}</strong> | ID: {user?.id}
        </p>
        </div>
        {hasPermission(['owner', 'admin']) && (
        <button 
            onClick={() => setShowForm(true)}
            className="btn flex items-center gap-2"
        >
            <span>➕</span>
            Nuevo Usuario
        </button>
        )}
    </div>

    {/* Filtros y búsqueda */}
    <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Filtros</h2>
            {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all' || branchFilter !== 'all') && (
                <button
                    onClick={() => {
                        setSearchTerm('')
                        setRoleFilter('all')
                        setStatusFilter('all')
                        setBranchFilter('all')
                    }}
                    className="text-sm text-accent hover:opacity-80 transition flex items-center gap-2"
                    title="Limpiar filtros"
                >
                    🗑️ Limpiar filtros
                </button>
            )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Búsqueda por nombre/email */}
            <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">
                    🔍 Buscar usuario
                </label>
                <input
                    type="text"
                    placeholder="Buscar por nombre, apellido o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface focus:ring-2 focus:ring-accent focus:border-transparent"
                />
            </div>

            {/* Filtro por rol */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    👤 Filtrar por rol
                </label>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                    <option value="all">Todos los roles</option>
                    {roles.map(role => (
                        <option key={role.value} value={role.value}>
                            {role.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Filtro por estado */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    🚦 Filtrar por estado
                </label>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                    <option value="all">Todos</option>
                    <option value="active">🟢 Solo activos</option>
                    <option value="inactive">🔴 Solo inactivos</option>
                </select>
            </div>

            {/* Filtro por sucursal */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    🏢 Filtrar por sucursal
                </label>
                <select
                    value={branchFilter}
                    onChange={(e) => setBranchFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-600/30 rounded-md bg-surface focus:ring-2 focus:ring-accent focus:border-transparent"
                    disabled={branches.length === 0}
                >
                    <option value="all">
                        {branches.length === 0 ? 'Cargando sucursales...' : 'Todas las sucursales'}
                    </option>
                    {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>
                            {branch.name}
                        </option>
                    ))}
                </select>
                {branches.length === 0 && (
                    <p className="text-xs text-red-400 mt-1">
                        ⚠️ No se pudieron cargar las sucursales
                    </p>
                )}
            </div>
        </div>

        {/* Información de resultados */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-600/20">
            <div className="text-sm text-muted">
                Mostrando {filteredUsers.length} de {users.length} usuarios
                {searchTerm && (
                    <span className="ml-2 px-2 py-1 bg-accent/20 text-accent rounded-md text-xs">
                        Buscar: "{searchTerm}"
                    </span>
                )}
                {roleFilter !== 'all' && (
                    <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md text-xs">
                        Rol: {roles.find(r => r.value === roleFilter)?.label}
                    </span>
                )}
                {statusFilter !== 'all' && (
                    <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-400 rounded-md text-xs">
                        Estado: {statusFilter === 'active' ? 'Activos' : 'Inactivos'}
                    </span>
                )}
                {branchFilter !== 'all' && (
                    <span className="ml-2 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-md text-xs">
                        Sucursal: {branches.find(b => b.id.toString() === branchFilter.toString())?.name}
                    </span>
                )}
            </div>
            
            {/* Botón para limpiar filtros */}
            {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all' || branchFilter !== 'all') && (
                <button
                    onClick={() => {
                        setSearchTerm('')
                        setRoleFilter('all')
                        setStatusFilter('all')
                        setBranchFilter('all')
                    }}
                    className="text-sm px-3 py-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                >
                    🗑️ Limpiar filtros
                </button>
            )}
        </div>
    </div>

    {/* Estadísticas rápidas */}
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {roles.map(role => {
        const totalCount = users.filter(u => u.role === role.value).length
        const filteredCount = filteredUsers.filter(u => u.role === role.value).length
        return (
            <div key={role.value} className="card text-center">
            <div className={`text-2xl font-semibold ${role.color}`}>
                {filteredCount}
                {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && 
                 filteredCount !== totalCount && (
                    <span className="text-sm text-muted ml-1">/{totalCount}</span>
                )}
            </div>
            <div className="text-sm text-muted">{role.label}s</div>
            </div>
        )
        })}
    </div>

    {/* Tabla de usuarios */}
    <div className="card overflow-hidden border border-slate-600/20 shadow-xl">
        {filteredUsers.length === 0 && users.length > 0 ? (
        <NotFound 
          message="No se encontraron usuarios"
          subtitle="Intenta ajustar los filtros de búsqueda"
        />
        ) : users.length === 0 ? (
        <NotFound 
          message="No hay usuarios"
          subtitle="Crea el primer usuario del sistema"
        />
        ) : (
        <div className="overflow-x-auto">
            <table className="w-full">
            <thead>
                <tr className="bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 border-b border-slate-600/30">
                <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                        <span>👤</span>
                        <span>Usuario</span>
                    </div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                        <span>📧</span>
                        <span>Email</span>
                    </div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                        <span>🎭</span>
                        <span>Rol</span>
                    </div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                        <span>🏢</span>
                        <span>Sucursal</span>
                    </div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                        <span>🚦</span>
                        <span>Estado</span>
                    </div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>Registrado</span>
                    </div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                        <span>⚙️</span>
                        <span>Acciones</span>
                    </div>
                </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-600/20">
                {filteredUsers.map((userItem) => (
                <tr key={userItem.id} className="group hover:bg-gradient-to-r hover:from-slate-800/40 hover:to-slate-700/20 transition-all duration-200 border-b border-slate-600/10">
                    <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-500/30 to-cyan-500/10 border-2 border-cyan-500/40 flex items-center justify-center shadow-sm">
                            <span className="text-sm font-bold text-white">
                                {userItem.first_name?.[0]}{userItem.last_name?.[0]}
                            </span>
                            </div>
                            {/* Indicador de estado en el avatar */}
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-800 ${
                                userItem.is_active ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                        </div>
                        <div>
                        <div className="font-semibold text-white group-hover:text-accent transition-colors">
                            {userItem.first_name} {userItem.last_name}
                        </div>
                        {userItem.id === user.id && (
                            <span className="text-xs text-accent font-medium">(Tú)</span>
                        )}
                        </div>
                    </div>
                    </td>
                    <td className="py-4 px-6">
                        <div className="text-sm text-white flex items-center gap-1">
                            <span>📧</span>
                            <span className="truncate max-w-[200px]" title={userItem.email}>{userItem.email}</span>
                        </div>
                    </td>
                    <td className="py-4 px-6">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-sm ${roles.find(r => r.value === userItem.role)?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
                        {roles.find(r => r.value === userItem.role)?.label || userItem.role}
                        </span>
                    </td>
                    <td className="py-4 px-6">
                        {userItem.branch ? (
                            <div className="flex items-center gap-2 bg-slate-800/30 rounded-lg px-2 py-1 border border-slate-600/20">
                                <span className="text-blue-400">🏢</span>
                                <span className="text-sm text-white">{userItem.branch.name}</span>
                            </div>
                        ) : (
                            <span className="text-muted text-sm italic">Sin asignar</span>
                        )}
                    </td>
                    <td className="py-4 px-6">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border shadow-sm ${
                            userItem.is_active
                            ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        }`}>
                            {userItem.is_active ? '✓ Activo' : '✗ Inactivo'}
                            </span>
                    </td>
                    <td className="py-4 px-6">
                        <div className="text-sm text-white">
                            {userItem.created_at ? new Date(userItem.created_at).toLocaleDateString('es-MX', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                            }) : 'N/A'}
                        </div>
                    </td>
                    <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                        {(canEditRole(userItem) || canEditStatus(userItem)) && (
                        <>
                            <button
                            onClick={() => handleEditUser(userItem)}
                            className="p-2 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent hover:text-accent/80 transition-all hover:scale-110"
                            title="Editar usuario"
                            >
                            ✏️
                            </button>
                            {userItem.id !== user.id && (
                            <button
                            onClick={() => handleDeleteUser(userItem)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all hover:scale-110"
                            title="Eliminar usuario"
                            >
                            🗑️
                            </button>
                            )}
                        </>
                        )}
                        {!canEditRole(userItem) && !canEditStatus(userItem) && (
                            <span className="text-muted text-sm italic">Sin permisos</span>
                        )}
                    </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        )}
    </div>

    {/* Información del sistema */}
    <div className="card bg-accent/5 border border-accent/20">
        <div className="flex items-start gap-3">
        <div className="text-accent text-xl">ℹ️</div>
        <div>
            <h3 className="font-semibold text-accent mb-2">Información del Sistema</h3>
            <ul className="text-sm text-muted space-y-1">
            <li>• El primer usuario registrado es automáticamente el <strong className="text-purple-400">Propietario</strong></li>
            <li>• Solo puede haber un Propietario por sistema</li>
            <li>• Los nuevos usuarios son creados por <strong className="text-red-400">Administradores</strong> o el <strong className="text-purple-400">Propietario</strong></li>
            <li>• Los usuarios pueden tener estado activo o inactivo</li>
            <li>• Solo usuarios con permisos pueden cambiar roles y estados</li>
            </ul>
        </div>
        </div>
    </div>

    {/* Modal de formulario */}
    {showForm && (
        <UserForm
        user={editingUser}
        onSuccess={() => {
            setSuccessModal({ 
              isOpen: true, 
              message: editingUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente' 
            })
            setShowForm(false)
            setEditingUser(null)
            fetchUsers() // Refresh la lista
        }}
        onCancel={() => {
            setShowForm(false)
            setEditingUser(null)
        }}
        />
    )}

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        message={successModal.message}
      />

      {/* Modal de cancelación */}
      <CancelledModal
        isOpen={cancelledModal.isOpen}
        onClose={() => setCancelledModal({ isOpen: false, message: '' })}
        message={cancelledModal.message}
      />
    </div>
    </>
)
}