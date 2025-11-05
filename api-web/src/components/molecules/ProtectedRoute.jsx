import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function ProtectedRoute({ children, roles = [] }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
        <div className="min-h-screen bg-bg flex items-center justify-center">
            <div className="text-accent">Cargando...</div>
        </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
        return (
        <div className="min-h-screen bg-bg flex items-center justify-center">
            <div className="card text-center">
            <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
            <p className="text-muted">No tienes permisos para acceder a esta página</p>
            </div>
        </div>
        )
    }

    return children
}