import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function SessionExpiredModal() {
    const [show, setShow] = useState(false)
    const [message, setMessage] = useState('')
    const [countdown, setCountdown] = useState(3)
    const navigate = useNavigate()
    const { logout } = useAuth()

    const handleLogout = () => {
        logout() // Limpiar el contexto de autenticación
        navigate('/login', { replace: true }) // Redirigir al login
    }

    useEffect(() => {
        const handleSessionExpired = (event) => {
            setMessage(event.detail.message)
            setShow(true)
            
            // Countdown automático
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval)
                        handleLogout() // Redirigir automáticamente cuando llegue a 0
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            return () => clearInterval(interval)
        }

        window.addEventListener('sessionExpired', handleSessionExpired)

        return () => {
            window.removeEventListener('sessionExpired', handleSessionExpired)
        }
    }, [navigate, logout])

    if (!show) return null

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="card max-w-md w-full mx-4 text-center animate-bounce-in">
                <div className="mb-4">
                    <div className="h-16 w-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center mx-auto">
                        <span className="text-3xl">⏱️</span>
                    </div>
                </div>
                
                <h2 className="text-xl font-semibold mb-2">Sesión Expirada</h2>
                
                <p className="text-muted mb-4">
                    {message || 'Tu sesión ha expirado por inactividad o token inválido.'}
                </p>
                
                <p className="text-sm text-muted mb-4">
                    Serás redirigido al inicio de sesión en <span className="text-accent font-semibold">{countdown}</span> segundos...
                </p>
                
                <button 
                    onClick={handleLogout}
                    className="btn w-full"
                >
                    Iniciar Sesión Ahora
                </button>
            </div>
        </div>
    )
}