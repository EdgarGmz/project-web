import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import UserForm from '../organisms/UserForm'

export default function Users() {
const [users, setUsers] = useState([])
const [loading, setLoading] = useState(true)
const [showForm, setShowForm] = useState(false)
const { user, hasPermission } = useAuth()

const roles = [
    { value: 'owner', label: 'Propietario', color: 'text-purple-400' },
    { value: 'admin', label: 'Administrador', color: 'text-red-400' },
    { value: 'supervisor', label: 'Supervisor', color: 'text-yellow-400' },
    { value: 'cashier', label: 'Cajero', color: 'text-green-400' },
    { value: 'auditor', label: 'Auditor', color: 'text-blue-400' }
]

useEffect(() => {
    fetchUsers()
}, [])

const fetchUsers = async () => {
    try {
    const response = await fetch('http://localhost:3000/api/users', {
        headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    const data = await response.json()
    if (data.success) {
        setUsers(data.data)
    }
    } catch (error) {
    console.error('Error fetching users:', error)
    } finally {
    setLoading(false)
    }
}

const updateUserRole = async (userId, newRole) => {
    try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role: newRole })
    })
    
    const data = await response.json()
    if (data.success) {
        fetchUsers() // Refresh list
    } else {
        alert(data.message)
    }
    } catch (error) {
    alert('Error updating user role')
    }
}

const updateUserStatus = async (userId, newStatus) => {
    try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}/status`, {
        method: 'PUT',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
    })
    
    const data = await response.json()
    if (data.success) {
        fetchUsers() // Refresh list
    } else {
        alert(data.message)
    }
    } catch (error) {
    alert('Error updating user status')
    }
}

const canEditRole = (targetUser) => {
    // Solo OWNER puede editar cualquier rol
    if (user.role === 'owner') return true
    
    // ADMIN puede editar solo supervisor, cashier, auditor
    if (user.role === 'admin') {
    return !['owner', 'admin'].includes(targetUser.role)
    }
    
    return false
}

const canEditStatus = (targetUser) => {
    // No puede editar su propio estado
    if (targetUser.id === user.id) return false
    
    // OWNER puede editar cualquier estado excepto otros owners
    if (user.role === 'owner') return targetUser.role !== 'owner'
    
    // ADMIN puede editar estado de supervisor, cashier, auditor
    if (user.role === 'admin') {
    return !['owner', 'admin'].includes(targetUser.role)
    }
    
    return false
}

if (loading) {
    return (
    <div className="card">
        <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
        <div className="text-accent">Cargando usuarios...</div>
        </div>
    </div>
    )
}

return (
    <div className="space-y-6">
    <div className="flex items-center justify-between">
        <div>
        <h1 className="text-2xl font-semibold">Gestión de Usuarios</h1>
        <p className="text-muted">Administra los usuarios del sistema</p>
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

    {/* Estadísticas rápidas */}
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {roles.map(role => {
        const count = users.filter(u => u.role === role.value).length
        return (
            <div key={role.value} className="card text-center">
            <div className={`text-2xl font-semibold ${role.color}`}>{count}</div>
            <div className="text-sm text-muted">{role.label}s</div>
            </div>
        )
        })}
    </div>

    {/* Tabla de usuarios */}
    <div className="card overflow-hidden">
        {users.length === 0 ? (
        <div className="text-center py-8">
            <div className="text-4xl mb-4">👤</div>
            <h3 className="font-semibold mb-2">No hay usuarios</h3>
            <p className="text-muted">Crea el primer usuario del sistema</p>
        </div>
        ) : (
        <div className="overflow-x-auto">
            <table className="w-full">
            <thead>
                <tr className="border-b border-slate-600/20">
                <th className="text-left py-3 px-4">Usuario</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Rol</th>
                <th className="text-left py-3 px-4">Estado</th>
                <th className="text-left py-3 px-4">Registrado</th>
                <th className="text-left py-3 px-4">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {users.map((userItem) => (
                <tr key={userItem.id} className="border-b border-slate-600/10 last:border-0 hover:bg-surface/50 transition">
                    <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                        <span className="text-sm font-semibold">
                            {userItem.first_name?.[0]}{userItem.last_name?.[0]}
                        </span>
                        </div>
                        <div>
                        <div className="font-medium">
                            {userItem.first_name} {userItem.last_name}
                        </div>
                        {userItem.id === user.id && (
                            <span className="text-xs text-accent">(Tú)</span>
                        )}
                        </div>
                    </div>
                    </td>
                    <td className="py-3 px-4 text-muted">{userItem.email}</td>
                    <td className="py-3 px-4">
                    {canEditRole(userItem) && userItem.id !== user.id ? (
                        <select
                        value={userItem.role}
                        onChange={(e) => updateUserRole(userItem.id, e.target.value)}
                        className="bg-surface border border-slate-600/30 rounded px-2 py-1 text-sm min-w-[120px]"
                        >
                        {roles
                            .filter(role => {
                            // OWNER puede asignar cualquier rol excepto owner
                            if (user.role === 'owner') return role.value !== 'owner'
                            // ADMIN solo puede asignar supervisor, cashier, auditor
                            if (user.role === 'admin') return ['supervisor', 'cashier', 'auditor'].includes(role.value)
                            return false
                            })
                            .map(role => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                            ))
                        }
                        </select>
                    ) : (
                        <span className={`${roles.find(r => r.value === userItem.role)?.color || 'text-text'} font-medium`}>
                        {roles.find(r => r.value === userItem.role)?.label || userItem.role}
                        </span>
                    )}
                    </td>
                    <td className="py-3 px-4">
                    {canEditStatus(userItem) ? (
                        <select
                        value={userItem.status}
                        onChange={(e) => updateUserStatus(userItem.id, e.target.value)}
                        className={`px-2 py-1 rounded text-xs border-0 ${
                            userItem.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}
                        >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                        </select>
                    ) : (
                        <span className={`px-2 py-1 rounded text-xs ${
                        userItem.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                        {userItem.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                    )}
                    </td>
                    <td className="py-3 px-4 text-muted text-sm">
                    {userItem.created_at ? new Date(userItem.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                        {hasPermission(['owner', 'admin']) && userItem.id !== user.id && (
                        <>
                            <button
                            onClick={() => console.log('Edit user', userItem.id)}
                            className="text-accent hover:opacity-80 transition text-sm"
                            title="Editar usuario"
                            >
                            ✏️
                            </button>
                            <button
                            onClick={() => {
                                if (confirm(`¿Estás seguro de eliminar a ${userItem.first_name} ${userItem.last_name}?`)) {
                                console.log('Delete user', userItem.id)
                                }
                            }}
                            className="text-red-400 hover:opacity-80 transition text-sm"
                            title="Eliminar usuario"
                            >
                            🗑️
                            </button>
                        </>
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
        onSuccess={() => {
            setShowForm(false)
            fetchUsers() // Refresh la lista
        }}
        onCancel={() => setShowForm(false)}
        />
    )}
    </div>
)
}