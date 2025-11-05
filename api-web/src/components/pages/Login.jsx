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
    <main className="min-h-screen bg-bg text-text flex">
        <aside className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent/20 to-surface p-8 items-center justify-center">
            <section className="text-center space-y-6">
                <figure className="h-16 w-16 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center mx-auto">
                    <span className="text-3xl">🎮</span>
                </figure>
                <h1 className="text-3xl font-bold">Gaming Store</h1>
                <p className="text-muted text-lg">
                    La plataforma más completa para gestionar tu franquicia de videojuegos
                </p>
            </section>
        </aside>

        <section className="w-full lg:w-1/2 flex items-center justify-center p-8">
            <article className="w-full max-w-md space-y-6 backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 shadow-xl">
                

                <header className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Iniciar Sesión</h2>
                    <p className="text-muted">Ingresa a tu cuenta</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <fieldset>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-md focus:border-accent transition"
                            placeholder="tu@email.com"
                        />
                    </fieldset>

                    <fieldset>
                        <label className="block text-sm font-medium mb-2">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-md focus:border-accent transition"
                            placeholder="Tu contraseña"
                        />
                    </fieldset>

                    {error && (
                        <output className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm">
                            {error}
                        </output>
                    )}

                    <button type="submit" disabled={loading} className="w-full btn py-3 disabled:opacity-50">
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <footer className="text-center">
                    <Link to="/" className="text-muted hover:text-text transition text-sm">
                        ← Volver al inicio
                    </Link>
                </footer>
            </article>
        </section>
    </main>
)
}