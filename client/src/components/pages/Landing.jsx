import { Link } from 'react-router-dom'
import ThemeToggle from '../atoms/ThemeToggle'

// Logo image
import aStoreImg from '../../assets/img/a_store.png'

export default function Landing() {
return (
    <div className="min-h-screen bg-bg text-text">
    <header className="border-b border-slate-600/20 bg-surface/80 backdrop-blur">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <figure className="h-12 w-12 rounded-md bg-accent/20 border border-accent/30 flex items-center justify-center">
                <img src={aStoreImg} alt="apex" className="h-10 w-10" />
            </figure>
        </div>
        <ThemeToggle />
        </nav>
    </header>

    <main className="max-w-6xl mx-auto px-6 py-16">
        <section className="text-center space-y-8">
        <header className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold">
                Bienvenidos a <span className="text-accent">Apex Store</span>
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto">
            Plataforma integral para la gestión de venta al por mayor de productos relacionados con el mundo de los videojuegos. 
            Control total de inventario, ventas y operaciones.
            </p>
        </header>

        <nav className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="btn text-lg px-8 py-3 inline-block text-center">
            Iniciar Sesión
            </Link>
        </nav>
        </section>
    </main>
    </div>
)
}