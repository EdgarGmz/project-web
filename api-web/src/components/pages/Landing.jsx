import { Link } from 'react-router-dom'
import ThemeToggle from '../atoms/ThemeToggle'

export default function Landing() {
return (
    <div className="min-h-screen bg-bg text-text">
    <header className="border-b border-slate-600/20 bg-surface/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-accent/20 border border-accent/30 flex items-center justify-center">
            🎮
            </div>
            <span className="font-bold text-xl">Gaming Store</span>
        </div>
        <ThemeToggle />
        </div>
    </header>

    <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center space-y-8">
        <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold">
            Gestión de <span className="text-accent">Gaming Store</span>
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto">
            Plataforma integral para la gestión de franquicias de videojuegos. 
            Control total de inventario, ventas y operaciones.
            </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="btn text-lg px-8 py-3 inline-block text-center">
            Iniciar Sesión
            </Link>
            {/* ❌ Quitar enlace de registro público */}
            <div className="px-8 py-3 border border-slate-600/30 text-muted rounded-md text-lg text-center opacity-50">
            Contacta al administrador para acceso
            </div>
        </div>
        </div>
    </main>
    </div>
)
}