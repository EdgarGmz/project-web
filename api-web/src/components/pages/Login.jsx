import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import ThemeToggle from '../atoms/ThemeToggle'

export default function Login() {
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')

const { login, user } = useAuth()

if (user) {
    return <Navigate to="/dashboard" replace />
}

const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(email, password)
    
    if (!result.success) {
    setError(result.message)
    }
    
    setLoading(false)
}

return (
    <div className="min-h-screen bg-bg text-text flex">
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent/20 to-surface p-8 items-center justify-center">
        <div className="text-center space-y-6">
        <div className="h-16 w-16 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center mx-auto">
            <span className="text-3xl">🎮</span>
        </div>
        <h1 className="text-3xl font-bold">Gaming Store</h1>
        <p className="text-muted text-lg">
            La plataforma más completa para gestionar tu franquicia de videojuegos
        </p>
        </div>
    </div>

    <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
        <div className="flex justify-end">
            <ThemeToggle />
        </div>

        <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Iniciar Sesión</h2>
            <p className="text-muted">Ingresa a tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-surface border border-slate-600/30 rounded-md focus:border-accent transition"
                placeholder="tu@email.com"
            />
            </div>

            <div>
            <label className="block text-sm font-medium mb-2">Contraseña</label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-surface border border-slate-600/30 rounded-md focus:border-accent transition"
                placeholder="Tu contraseña"
            />
            </div>

            {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm">
                {error}
            </div>
            )}

            <button type="submit" disabled={loading} className="w-full btn py-3 disabled:opacity-50">
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
        </form>

        <div className="text-center">
            <Link to="/register" className="text-accent hover:opacity-90 transition">
            ¿No tienes cuenta? Crear una
            </Link>
        </div>

        <div className="text-center">
            <Link to="/" className="text-muted hover:text-text transition text-sm">
            ← Volver al inicio
            </Link>
        </div>
        </div>
    </div>
    </div>
)
}