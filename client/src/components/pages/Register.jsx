import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import ThemeToggle from '../atoms/ThemeToggle'

export default function Register() {
const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: ''
})
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
const [success, setSuccess] = useState(false)

const { user } = useAuth()

if (user) {
    return <Navigate to="/dashboard" replace />
}

const handleChange = (e) => {
    setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value
    }))
}

const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
    setError('Las contraseñas no coinciden')
    setLoading(false)
    return
    }

    try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password
        })
    })
    
    const data = await response.json()
    
    if (data.success) {
        setSuccess(true)
    } else {
        setError(data.message)
    }
    } catch (error) {
    setError('Error de conexión')
    }
    
    setLoading(false)
}

if (success) {
    return (
    <div className="min-h-screen bg-bg text-text flex items-center justify-center p-8">
        <div className="card text-center max-w-md">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-xl font-semibold mb-2">¡Registro Exitoso!</h2>
        <p className="text-muted mb-4">Tu cuenta ha sido creada correctamente</p>
        <Link to="/login" className="btn inline-block">Iniciar Sesión</Link>
        </div>
    </div>
    )
}

return (
    <div className="min-h-screen bg-bg text-text flex">
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent/20 to-surface p-8 items-center justify-center">
        <div className="text-center space-y-6">
        <div className="h-16 w-16 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center mx-auto">
            <span className="text-3xl">🎮</span>
        </div>
        <h1 className="text-3xl font-bold">Gaming Store</h1>
        <p className="text-muted text-lg">Únete y comienza a gestionar tu franquicia de videojuegos</p>
        </div>
    </div>

    <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
        <div className="flex justify-end">
            <ThemeToggle />
        </div>

        <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Crear Cuenta</h2>
            <p className="text-muted">Completa el formulario para registrarte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium mb-2">Nombre</label>
                <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-surface border border-slate-600/30 rounded-md focus:border-accent transition"
                placeholder="Juan"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-2">Apellido</label>
                <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-surface border border-slate-600/30 rounded-md focus:border-accent transition"
                placeholder="Pérez"
                />
            </div>
            </div>

            <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-surface border border-slate-600/30 rounded-md focus:border-accent transition"
                placeholder="tu@email.com"
            />
            </div>

            <div>
            <label className="block text-sm font-medium mb-2">Contraseña</label>
            <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-surface border border-slate-600/30 rounded-md focus:border-accent transition"
                placeholder="Mínimo 6 caracteres"
            />
            </div>

            <div>
            <label className="block text-sm font-medium mb-2">Confirmar Contraseña</label>
            <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-surface border border-slate-600/30 rounded-md focus:border-accent transition"
                placeholder="Repite tu contraseña"
            />
            </div>

            {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm">
                {error}
            </div>
            )}

            <button type="submit" disabled={loading} className="w-full btn py-3 disabled:opacity-50">
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
        </form>

        <div className="text-center">
            <Link to="/login" className="text-accent hover:opacity-90 transition">
            ¿Ya tienes cuenta? Iniciar sesión
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