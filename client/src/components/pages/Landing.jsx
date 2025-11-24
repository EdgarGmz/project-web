import { Link } from 'react-router-dom'
import ThemeToggle from '../atoms/ThemeToggle'

// Logo image
import aStoreImg from '../../assets/img/a_store.png'

// Technology Icons
import { 
    SiReact, 
    SiVite, 
    SiTailwindcss, 
    SiNodedotjs, 
    SiExpress, 
    SiSequelize, 
    SiSqlite, 
    SiJavascript,
    SiReactrouter
} from 'react-icons/si'

export default function Landing() {
return (
    <div className="min-h-screen bg-bg text-text">
    <header className="border-b border-slate-600/20 bg-surface/80 backdrop-blur sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <figure className="h-14 w-14 rounded-xl bg-gradient-to-br from-accent/30 to-accent/10 border-2 border-accent/40 flex items-center justify-center shadow-lg shadow-accent/20 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-accent/30">
                <img src={aStoreImg} alt="Apex Store Logo" className="h-10 w-10 object-contain drop-shadow-lg" />
            </figure>
            <span className="text-xl font-bold text-accent hidden sm:block">Apex Store</span>
        </div>
        <ThemeToggle />
        </nav>
    </header>

    <main className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <section className="text-center py-12 md:py-20 space-y-12">
            {/* Hero Image Section */}
            <div className="relative flex justify-center items-center">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 md:w-80 md:h-80 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
                </div>
                <figure className="relative z-10 group">
                    <div className="relative inline-block p-6 rounded-2xl bg-gradient-to-br from-surface via-surface/80 to-surface/60 backdrop-blur-xl border-2 border-accent/30 shadow-2xl shadow-accent/20 transition-all duration-500 hover:scale-105 hover:shadow-accent/30 hover:border-accent/50">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-accent/20 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative">
                            <img 
                                src={aStoreImg} 
                                alt="Apex Store - Sistema de Gestión" 
                                className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl filter brightness-110 contrast-110 transition-all duration-500 group-hover:brightness-120 group-hover:scale-105" 
                            />
                        </div>
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-3/4 h-2 bg-accent/30 rounded-full blur-xl"></div>
                    </div>
                </figure>
            </div>

            <header className="space-y-6 relative z-10">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                    Bienvenidos a <span className="text-accent bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">Apex Store</span>
                </h1>
                <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto leading-relaxed">
                    Plataforma integral para la gestión de venta al por mayor de productos relacionados con el mundo de los videojuegos. 
                    Control total de inventario, ventas y operaciones con seguridad de nivel empresarial.
                </p>
            </header>

            <nav className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <Link 
                    to="/login" 
                    className="btn text-lg px-8 py-3 inline-block text-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/30"
                >
                    Iniciar Sesión
                </Link>
            </nav>
        </section>

        {/* Funcionalidades Section */}
        <section className="py-16 md:py-24 border-t border-slate-600/20">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    ✨ <span className="text-accent">Funcionalidades Principales</span>
                </h2>
                <p className="text-muted text-lg max-w-2xl mx-auto">
                    Un sistema completo diseñado para optimizar todas las operaciones de tu negocio
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                {/* Feature Cards */}
                {[
                    {
                        icon: '🏢',
                        title: 'Gestión Multi-sucursal',
                        description: 'Control independiente de inventario y ventas por sucursal, permitiendo administrar múltiples ubicaciones desde una sola plataforma.'
                    },
                    {
                        icon: '👥',
                        title: 'Sistema de Usuarios y Roles',
                        description: 'Roles específicos (Owner, Admin, Supervisor, Cajero) con permisos granulares para garantizar seguridad y control de acceso.'
                    },
                    {
                        icon: '📦',
                        title: 'Control de Inventario',
                        description: 'Gestión completa de productos, stock en tiempo real, alertas de inventario bajo y control de ubicaciones en almacén.'
                    },
                    {
                        icon: '🛒',
                        title: 'Punto de Venta (POS)',
                        description: 'Sistema completo de ventas con múltiples métodos de pago, gestión de clientes y generación automática de facturas.'
                    },
                    {
                        icon: '📊',
                        title: 'Reportes y Analytics',
                        description: 'Informes detallados de ventas, inventario y rendimiento por sucursal con visualizaciones en tiempo real.'
                    },
                    {
                        icon: '🔐',
                        title: 'Autenticación JWT',
                        description: 'Sistema seguro de autenticación con gestión de sesiones y tokens JWT para acceso protegido a la plataforma.'
                    },
                    {
                        icon: '🔑',
                        title: 'Recuperación de Contraseña',
                        description: 'Sistema de recuperación de contraseña mediante enlace seguro enviado por correo electrónico con tokens temporales.'
                    },
                    {
                        icon: '🌓',
                        title: 'Tema Claro/Oscuro',
                        description: 'Interfaz adaptable con cambio dinámico de tema para una experiencia de usuario personalizada.'
                    },
                    {
                        icon: '📱',
                        title: 'Diseño Responsivo',
                        description: 'Optimizado para desktop, tablet y móvil, garantizando una experiencia consistente en todos los dispositivos.'
                    },
                    {
                        icon: '⏰',
                        title: 'Dashboard Dinámico',
                        description: 'Header con fecha/hora en tiempo real, información meteorológica y ubicación contextual por sucursal.'
                    }
                ].map((feature, index) => (
                    <div 
                        key={index}
                        className="p-6 rounded-xl bg-surface/50 border border-slate-600/20 hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1"
                    >
                        <div className="text-4xl mb-4">{feature.icon}</div>
                        <h3 className="text-xl font-bold mb-2 text-accent">{feature.title}</h3>
                        <p className="text-muted leading-relaxed">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>

        {/* Arquitectura y Metodologías Section */}
        <section className="py-16 md:py-24 border-t border-slate-600/20">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    🏗️ <span className="text-accent">Arquitectura y Metodologías</span>
                </h2>
                <p className="text-muted text-lg max-w-2xl mx-auto">
                    Construido con las mejores prácticas y metodologías de desarrollo seguro
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                {/* Arquitectura Frontend */}
                <div className="p-8 rounded-xl bg-surface/50 border border-slate-600/20">
                    <h3 className="text-2xl font-bold mb-6 text-accent flex items-center gap-2">
                        🖥️ Frontend
                    </h3>
                    <ul className="space-y-4 text-muted">
                        <li className="flex items-start gap-3">
                            <div className="flex items-center gap-2 mt-1 flex-shrink-0">
                                <SiReact className="text-3xl text-[#61DAFB]" />
                                <SiVite className="text-2xl text-[#646CFF]" />
                            </div>
                            <div className="flex-1">
                                <strong className="text-text">React 18</strong> con <strong className="text-text">Vite</strong> para desarrollo rápido y HMR
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <SiTailwindcss className="text-3xl text-[#06B6D4] mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <strong className="text-text">Tailwind CSS</strong> para estilos utilitarios y diseño responsivo
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-10 h-10 flex items-center justify-center mt-1 flex-shrink-0">
                                <span className="text-xl">🧩</span>
                            </div>
                            <div className="flex-1">
                                <strong className="text-text">Atomic Design</strong> para organización de componentes reutilizables
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <SiReact className="text-3xl text-[#61DAFB] mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <strong className="text-text">Context API</strong> para gestión de estado global (Auth, Theme, Sidebar)
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <SiReactrouter className="text-3xl text-[#CA4245] mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <strong className="text-text">React Router</strong> para navegación SPA y rutas protegidas
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Arquitectura Backend */}
                <div className="p-8 rounded-xl bg-surface/50 border border-slate-600/20">
                    <h3 className="text-2xl font-bold mb-6 text-accent flex items-center gap-2">
                        🖲️ Backend
                    </h3>
                    <ul className="space-y-4 text-muted">
                        <li className="flex items-start gap-3">
                            <div className="flex items-center gap-2 mt-1 flex-shrink-0">
                                <SiNodedotjs className="text-3xl text-[#339933]" />
                                <SiExpress className="text-3xl text-[#000000] dark:text-[#FFFFFF]" />
                            </div>
                            <div className="flex-1">
                                <strong className="text-text">Node.js</strong> con <strong className="text-text">Express</strong> para API REST escalable
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="flex items-center gap-2 mt-1 flex-shrink-0">
                                <SiSequelize className="text-3xl text-[#52B0E7]" />
                                <SiSqlite className="text-3xl text-[#003B57]" />
                            </div>
                            <div className="flex-1">
                                <strong className="text-text">Sequelize ORM</strong> con <strong className="text-text">SQLite</strong> (migrable a PostgreSQL)
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-10 h-10 flex items-center justify-center mt-1 flex-shrink-0">
                                <span className="text-xl">🏗️</span>
                            </div>
                            <div className="flex-1">
                                <strong className="text-text">Arquitectura por capas</strong> (Controllers, Services, Models)
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <SiJavascript className="text-3xl text-[#F7DF1E] mt-1 flex-shrink-0" />
                            <div className="flex-1">
                                <strong className="text-text">JWT</strong> para autenticación y autorización segura
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-10 h-10 flex items-center justify-center mt-1 flex-shrink-0">
                                <span className="text-xl">⚙️</span>
                            </div>
                            <div className="flex-1">
                                <strong className="text-text">Middleware</strong> personalizado para autenticación y validación
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Metodología S-SDLC */}
                <div className="p-8 rounded-xl bg-surface/50 border border-slate-600/20 lg:col-span-2">
                    <h3 className="text-2xl font-bold mb-6 text-accent flex items-center gap-2">
                        🛡️ Metodología: S-SDLC (Secure Software Development Life Cycle)
                    </h3>
                    <p className="text-muted mb-6">
                        El proyecto sigue el ciclo de vida de desarrollo de software seguro, garantizando la protección de la información en cada etapa:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                phase: '1️⃣ Planificación',
                                description: 'Análisis de riesgos, definición de requerimientos de seguridad y consideración de regulaciones (ISO 27001, GDPR, OWASP SAMM)'
                            },
                            {
                                phase: '2️⃣ Diseño',
                                description: 'Modelado de amenazas (STRIDE), selección de arquitecturas seguras y definición de controles de seguridad'
                            },
                            {
                                phase: '3️⃣ Desarrollo',
                                description: 'Aplicación de guías de codificación segura (OWASP), revisiones de código y escaneo estático (SAST)'
                            },
                            {
                                phase: '4️⃣ Pruebas',
                                description: 'Pruebas dinámicas de seguridad (DAST), análisis de dependencias (SCA) y validación de autenticación'
                            },
                            {
                                phase: '5️⃣ Despliegue',
                                description: 'Configuración segura del entorno, aplicación de parches y revisión de accesos y roles'
                            },
                            {
                                phase: '6️⃣ Mantenimiento',
                                description: 'Monitoreo continuo, aplicación de parches de seguridad y auditorías periódicas'
                            }
                        ].map((item, index) => (
                            <div key={index} className="p-4 rounded-lg bg-bg/50 border border-slate-600/10">
                                <h4 className="font-bold text-accent mb-2">{item.phase}</h4>
                                <p className="text-sm text-muted">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* Equipo Section */}
        <section className="py-16 md:py-24 border-t border-slate-600/20">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    👥 <span className="text-accent">Nuestro Equipo</span>
                </h2>
                <p className="text-muted text-lg max-w-2xl mx-auto mb-8">
                    Un equipo comprometido con la excelencia y la innovación en desarrollo de software seguro
                </p>
                <div className="max-w-3xl mx-auto p-6 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                    <p className="text-lg text-text leading-relaxed">
                        <span className="text-accent font-bold">¡Bienvenidos!</span> Somos un equipo de desarrolladores apasionados por crear soluciones tecnológicas 
                        que transformen la manera en que las PYMES gestionan sus operaciones. Nuestro compromiso es entregar un sistema 
                        robusto, seguro y escalable que impulse el crecimiento de tu negocio.
                    </p>
                </div>
            </div>

            <div className="space-y-8 mt-12">
                {/* Líder del Proyecto - Destacado */}
                <div className="flex justify-center">
                    <div className="p-8 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 border-2 border-accent/40 text-center hover:border-accent/60 transition-all duration-300 hover:shadow-xl hover:shadow-accent/20 hover:-translate-y-1 max-w-sm w-full">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/40 to-accent/20 border-4 border-accent/60 flex items-center justify-center text-4xl font-bold text-accent shadow-lg">
                            EG
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-text">Edgar Gómez</h3>
                        <p className="text-accent font-semibold mb-1">Líder del Proyecto</p>
                        <p className="text-muted text-sm">Project Leader</p>
                    </div>
                </div>

                {/* Equipo de Desarrollo */}
                <div>
                    <h3 className="text-xl font-semibold text-center mb-6 text-muted">Equipo de Desarrollo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: 'Alexis García', role: 'Desarrollador/Tester', initials: 'AG' },
                            { name: 'Juan Castillo', role: 'Desarrollador/Tester', initials: 'JC' },
                            { name: 'Daniela Mayte', role: 'Desarrolladora/Tester', initials: 'DM' },
                            { name: 'Orlando Casas', role: 'Desarrollador/Tester', initials: 'OC' }
                        ].map((member, index) => (
                            <div 
                                key={index}
                                className="p-6 rounded-xl bg-surface/50 border border-slate-600/20 text-center hover:border-accent/40 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10 hover:-translate-y-1"
                            >
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 border-2 border-accent/40 flex items-center justify-center text-3xl font-bold text-accent">
                                    {member.initials}
                                </div>
                                <h3 className="text-xl font-bold mb-1 text-text">{member.name}</h3>
                                <p className="text-muted text-sm">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 border-t border-slate-600/20 text-center">
            <div className="max-w-2xl mx-auto space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                    ¿Listo para comenzar?
                </h2>
                <p className="text-lg text-muted">
                    Accede a la plataforma y descubre todas las herramientas que tenemos para ti
                </p>
                <Link 
                    to="/login" 
                    className="btn text-lg px-8 py-3 inline-block transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/30"
                >
                    Iniciar Sesión
                </Link>
            </div>
        </section>
    </main>

    {/* Footer */}
    <footer className="border-t border-slate-600/20 bg-surface/30 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Información del Proyecto */}
                <div className="text-center md:text-left">
                    <h3 className="text-lg font-bold text-text mb-4">Apex Store</h3>
                    <p className="text-muted text-sm mb-2">
                        Sistema de Gestión de Inventario, Ventas y Facturación para PYMES.
                    </p>
                    <p className="text-muted text-sm">
                        Desarrollado con ❤️ siguiendo metodologías de desarrollo seguro (S-SDLC)
                    </p>
                </div>

                {/* Información de la Universidad */}
                <div className="text-center md:text-right">
                    <h3 className="text-lg font-bold text-text mb-4">Universidad Tecnológica Santa Catarina</h3>
                    <div className="space-y-2 text-muted text-sm">
                        <p className="flex items-center justify-center md:justify-end gap-2">
                            <span>📍</span>
                            <span>Carretera Saltillo-Monterrey Km. 61.5<br className="md:hidden" /> C.P. 66359, Santa Catarina, N.L.</span>
                        </p>
                        <p className="flex items-center justify-center md:justify-end gap-2">
                            <span>📞</span>
                            <a href="tel:8181248400" className="hover:text-accent transition-colors">
                                81 8124 8400
                            </a>
                        </p>
                        <p className="flex items-center justify-center md:justify-end gap-2">
                            <span>✉️</span>
                            <a href="mailto:contacto@utsc.edu.mx" className="hover:text-accent transition-colors">
                                contacto@utsc.edu.mx
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-slate-600/20 pt-6 text-center">
                <p className="text-muted text-sm">
                    © 2025 Apex Store. Todos los derechos reservados.
                </p>
            </div>
        </div>
    </footer>
    </div>
)
}