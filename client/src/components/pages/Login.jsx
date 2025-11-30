import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import ThemeToggle from '../atoms/ThemeToggle'
import PasswordInput from '../atoms/PasswordInput'
import LoadingModal from '../molecules/LoadingModal'
import logo from '../../assets/img/logo.png'

export default function Login() {
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')


const { login, user, clearSession } = useAuth()

if (user) {
    // Redirigir a cajeros directamente al POS
    const redirectPath = user.role === 'cashier' ? '/pos' : '/dashboard'
    return <Navigate to={redirectPath} replace />
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
    <>
      <LoadingModal isOpen={loading} message="Iniciando sesión..." />
      <main className="min-h-screen bg-gradient-to-br from-bg via-surface/50 to-bg text-text flex relative overflow-hidden">
        {/* Enhanced Background Effects - Mario Bros Yellow Theme */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-yellow-400/25 via-yellow-500/15 to-transparent rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-amber-400/25 via-orange-400/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-r from-yellow-300/15 via-amber-300/10 to-transparent rounded-full blur-3xl"></div>
            {/* Animated grid pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '50px 50px'
            }}></div>
        </div>

        <aside className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-yellow-400/20 via-amber-400/12 to-orange-400/10 p-12 items-center justify-center relative z-10 border-r border-yellow-500/20 dark:border-yellow-500/20">
            <section className="text-center space-y-10 max-w-lg">
                <figure className="relative group mx-auto">
                    {/* Multiple glow effects - Mario Bros Yellow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/60 via-amber-400/50 to-orange-400/40 rounded-full blur-3xl opacity-70 group-hover:opacity-90 transition-opacity duration-700 animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/40 via-amber-300/30 to-yellow-400/30 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>
                    
                    {/* Outer decorative rings */}
                    <div className="absolute -inset-4 rounded-full border-4 border-yellow-400/30 group-hover:border-yellow-400/50 transition-all duration-500"></div>
                    <div className="absolute -inset-8 rounded-full border-2 border-yellow-400/20 group-hover:border-yellow-400/30 transition-all duration-700"></div>
                    
                    {/* Logo container - Perfectly round Mario Bros style */}
                    <div className="relative h-64 w-64 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 via-amber-500 to-orange-400 border-4 border-yellow-300 flex items-center justify-center mx-auto shadow-2xl shadow-yellow-400/60 transition-all duration-700 hover:scale-110 hover:rotate-12 hover:shadow-yellow-400/80 overflow-hidden">
                        {/* Inner shine effect */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-yellow-200/20 to-transparent"></div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-yellow-600/20 via-transparent to-transparent"></div>
                        
                        {/* Pattern overlay for Mario Bros feel */}
                        <div className="absolute inset-0 rounded-full opacity-10" style={{
                            backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 2px, transparent 2px)',
                            backgroundSize: '20px 20px'
                        }}></div>
                        
                        {/* Logo image - larger and centered */}
                        <img 
                            src={logo} 
                            alt="Apex Store Logo" 
                            className="relative h-40 w-40 object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 z-10" 
                        />
                        
                        {/* Inner border for depth */}
                        <div className="absolute inset-2 rounded-full border-2 border-yellow-200/40"></div>
                    </div>
                </figure>
                <div className="space-y-6">
                    <h1 className="text-6xl md:text-7xl font-black leading-tight">
                        <span className="block bg-gradient-to-r from-yellow-400 via-amber-400 via-yellow-500 to-yellow-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                            Apex Store
                        </span>
                    </h1>
                    <p className="text-muted text-xl leading-relaxed font-light max-w-md mx-auto">
                        La plataforma más completa para gestionar tu franquicia de videojuegos
                    </p>
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <div className="h-1 w-12 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
                        <span className="text-yellow-400 text-2xl">✨</span>
                        <div className="h-1 w-12 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
                    </div>
                </div>
            </section>
        </aside>

        <section className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative z-10">
            <article className="w-full max-w-lg space-y-8 backdrop-blur-2xl bg-surface/70 border-2 border-slate-600/40 dark:border-slate-600/40 rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-black/30 relative overflow-hidden group">
                {/* Animated border gradient - Mario Bros Yellow */}
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-r from-yellow-400/25 via-amber-400/25 to-orange-400/25 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
                
                {/* Decorative background effects - Mario Bros Yellow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-400/15 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-amber-400/15 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/8 via-transparent to-amber-400/8"></div>
                
                {/* Shine effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                <div className="relative z-10">
                    <header className="text-center space-y-6 mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12"></div>
                            <ThemeToggle />
                            <div className="w-12"></div>
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-5xl md:text-6xl font-black">
                                <span className="bg-gradient-to-r from-yellow-400 via-amber-400 via-yellow-500 to-yellow-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                                    Iniciar Sesión
                                </span>
                            </h2>
                            <p className="text-muted text-lg font-light">Ingresa a tu cuenta para continuar</p>
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <div className="h-px w-16 bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent"></div>
                            <span className="text-yellow-400/60">●</span>
                            <div className="h-px w-16 bg-gradient-to-r from-transparent via-yellow-400/60 to-transparent"></div>
                        </div>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-7">
                        <fieldset className="space-y-3 group/field">
                            <label className="block text-sm font-bold text-text mb-3 flex items-center gap-2.5">
                                <span className="text-2xl">📧</span>
                                <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">Email</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/25 via-amber-400/25 to-orange-400/25 rounded-2xl blur opacity-0 group-focus-within/field:opacity-100 transition-opacity duration-300"></div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="relative w-full px-5 py-4 bg-bg border-2 border-slate-600/50 dark:border-slate-600/50 rounded-2xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all duration-300 text-text placeholder:text-muted text-base font-medium shadow-lg hover:border-yellow-400/50 hover:shadow-xl"
                                    style={{ color: 'var(--color-text)' }}
                                    placeholder="tu_cuenta@apexstore.com"
                                />
                            </div>
                        </fieldset>

                        <fieldset className="space-y-3 group/field">
                            <label className="block text-sm font-bold text-text mb-3 flex items-center gap-2.5">
                                <span className="text-2xl">🔒</span>
                                <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">Contraseña</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/25 via-amber-400/25 to-orange-400/25 rounded-2xl blur opacity-0 group-focus-within/field:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative">
                                    <PasswordInput
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-5 py-4 pr-12 bg-bg border-2 border-slate-600/50 dark:border-slate-600/50 rounded-2xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all duration-300 text-base font-medium shadow-lg hover:border-yellow-400/50 hover:shadow-xl"
                                        style={{ color: 'var(--color-text)' }}
                                        placeholder="Tu contraseña"
                                        autoComplete="current-password"
                                    />
                                </div>
                            </div>
                        </fieldset>

                        {error && (
                            <output className="p-5 bg-gradient-to-r from-red-500/20 via-red-500/10 to-rose-500/10 border-2 border-red-500/40 rounded-2xl text-red-400 text-sm flex items-center gap-3 shadow-xl backdrop-blur-sm animate-shake">
                                <span className="text-2xl flex-shrink-0">⚠️</span>
                                <span className="font-medium">{error}</span>
                            </output>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="group relative w-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 text-gray-900 font-bold py-5 rounded-2xl shadow-2xl shadow-yellow-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-yellow-400/70 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0 overflow-hidden"
                        >
                            {/* Animated gradient overlay - Mario Bros Yellow */}
                            <span className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                            
                            {/* Shine effect */}
                            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                            
                            {/* Content */}
                            <span className="relative z-10 flex items-center justify-center gap-3 text-lg">
                                {loading ? (
                                    <>
                                        <span className="animate-spin rounded-full h-6 w-6 border-3 border-gray-900 border-t-transparent"></span>
                                        <span>Iniciando sesión...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-2xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">⭐</span>
                                        <span>Iniciar Sesión</span>
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Enlace de recuperación de contraseña */}
                    <div className="text-center pt-4">
                        <Link 
                            to="/forgot-password" 
                            className="inline-flex items-center gap-2.5 text-yellow-400 hover:text-amber-400 text-sm font-semibold transition-all duration-300 group px-4 py-2 rounded-xl hover:bg-yellow-400/10"
                        >
                            <span className="text-lg transform transition-transform duration-300 group-hover:rotate-12">🔑</span>
                            <span className="group-hover:underline">¿Olvidaste tu contraseña?</span>
                        </Link>
                    </div>

                    <footer className="text-center pt-6 border-t-2 border-slate-600/30 dark:border-slate-600/30">
                        <Link 
                            to="/" 
                            className="inline-flex items-center gap-2.5 text-muted hover:text-yellow-400 transition-all duration-300 text-sm font-semibold group px-4 py-2 rounded-xl hover:bg-surface/50"
                        >
                            <span className="text-lg transform transition-transform duration-300 group-hover:-translate-x-2">←</span>
                            <span className="group-hover:underline">Volver al inicio</span>
                        </Link>
                    </footer>
                </div>
            </article>
        </section>
    </main>
    </>
)
}
