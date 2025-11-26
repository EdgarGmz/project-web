import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import deniedImage from '../../assets/img/denied.png'

// Componente para mostrar acceso denegado con redirección
function AccessDeniedPage({ navigate }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            // Intentar redirigir a la página anterior, si no hay, ir al dashboard
            if (window.history.length > 1) {
                navigate(-1)
            } else {
                navigate('/dashboard', { replace: true })
            }
        }, 3000) // 3 segundos

        return () => clearTimeout(timer)
    }, [navigate])

    return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-4">
            <div className="card text-center max-w-md w-full animate-fade-in border-2 border-red-500/20 shadow-2xl">
                <div className="flex justify-center mb-6">
                    <div className="relative animate-bounce-slow">
                        <img 
                            src={deniedImage} 
                            alt="Acceso Denegado" 
                            className="w-48 h-48 object-contain animate-pulse-slow drop-shadow-lg"
                        />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-red-400 mb-3 animate-slide-up">
                    Acceso Denegado
                </h2>
                <p className="text-muted mb-6 text-lg animate-slide-up-delay">
                    No tienes permisos para acceder a esta página
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted animate-fade-in-delay">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></span>
                    <span>Redirigiendo en 3 segundos...</span>
                </div>
            </div>
        </div>
    )
}

export default function ProtectedRoute({ children, roles = [] }) {
    const { user, loading } = useAuth()
    const navigate = useNavigate()

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
        return <AccessDeniedPage navigate={navigate} />
    }

    return children
}