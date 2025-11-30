import { Link } from 'react-router-dom'
import ThemeToggle from '../atoms/ThemeToggle'

// Logo image
import aStoreImg from '../../assets/img/a_store.png'
import logo from '../../assets/img/logo.png'

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
    <div className="min-h-screen bg-gradient-to-br from-bg via-surface/50 to-bg text-text relative overflow-hidden">
    {/* Background Effects - Mario Bros Yellow Theme */}
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-400/8 rounded-full blur-3xl"></div>
    </div>

    <header className="border-b border-slate-600/30 dark:border-slate-600/30 bg-surface/80 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-black/20">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 group">
            <figure className="h-14 w-14 rounded-xl bg-gradient-to-br from-yellow-400/50 via-yellow-500/40 to-amber-500/30 border-2 border-yellow-400/60 flex items-center justify-center shadow-lg shadow-yellow-400/40 transition-all duration-500 hover:scale-110 hover:shadow-xl hover:shadow-yellow-400/60 hover:rotate-3 group-hover:border-yellow-400">
                <img src={aStoreImg} alt="Apex Store Logo" className="h-10 w-10 object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-110" />
            </figure>
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent hidden sm:block animate-gradient">Apex Store</span>
        </div>
        <ThemeToggle />
        </nav>
    </header>

    <main className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Hero Section */}
        <section className="text-center py-16 md:py-24 lg:py-32 space-y-16 relative">
            {/* Hero Image Section */}
            <div className="relative flex justify-center items-center">
                <figure className="relative z-10 group mx-auto">
                    {/* Multiple glow effects - Mario Bros Yellow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/60 via-amber-400/50 to-orange-400/40 rounded-full blur-3xl opacity-70 group-hover:opacity-90 transition-opacity duration-700 animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/40 via-amber-300/30 to-yellow-400/30 rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>
                    
                    {/* Outer decorative rings */}
                    <div className="absolute -inset-4 md:-inset-6 rounded-full border-4 border-yellow-400/30 group-hover:border-yellow-400/50 transition-all duration-500"></div>
                    <div className="absolute -inset-8 md:-inset-12 rounded-full border-2 border-yellow-400/20 group-hover:border-yellow-400/30 transition-all duration-700"></div>
                    
                    {/* Logo container - Perfectly round Mario Bros style */}
                    <div className="relative h-64 w-64 md:h-80 md:w-80 lg:h-96 lg:w-96 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 via-amber-500 to-orange-400 border-4 border-yellow-300 flex items-center justify-center mx-auto shadow-2xl shadow-yellow-400/60 transition-all duration-700 hover:scale-110 hover:rotate-12 hover:shadow-yellow-400/80 overflow-hidden">
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
                            alt="Apex Store - Sistema de Gestión" 
                            className="relative h-40 w-40 md:h-52 md:w-52 lg:h-64 lg:w-64 object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 z-10" 
                        />
                        
                        {/* Inner border for depth */}
                        <div className="absolute inset-2 md:inset-3 lg:inset-4 rounded-full border-2 border-yellow-200/40"></div>
                    </div>
                </figure>
            </div>

            <header className="space-y-8 relative z-10">
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold leading-tight">
                    <span className="block mb-2">Bienvenidos a</span>
                    <span className="block bg-gradient-to-r from-yellow-400 via-amber-400 via-yellow-500 to-yellow-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                        Apex Store
                    </span>
                </h1>
                <p className="text-xl md:text-2xl text-muted max-w-4xl mx-auto leading-relaxed font-light">
                    Plataforma integral para la gestión de venta al por mayor de productos relacionados con el mundo de los videojuegos. 
                    <span className="block mt-2 text-yellow-400 font-medium">Control total de inventario, ventas y operaciones con seguridad de nivel empresarial.</span>
                </p>
            </header>

            <nav className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
                <Link 
                    to="/login" 
                    className="group relative inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-gray-900 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 rounded-xl shadow-lg shadow-yellow-400/40 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-yellow-400/60 hover:-translate-y-1 overflow-hidden"
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-yellow-500/90 via-amber-500/90 to-orange-500/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative z-10 flex items-center gap-2">
                        <span>⭐</span>
                        <span>Iniciar Sesión</span>
                    </span>
                </Link>
            </nav>
        </section>

        {/* Funcionalidades Section */}
        <section className="py-20 md:py-28 border-t border-slate-600/30 relative">
            <div className="text-center mb-16">
                <div className="inline-block mb-4">
                    <span className="text-5xl animate-bounce">✨</span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
                    <span className="bg-gradient-to-r from-yellow-400 via-amber-400 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                        Funcionalidades Principales
                    </span>
                </h2>
                <p className="text-muted text-xl max-w-3xl mx-auto font-light">
                    Un sistema completo diseñado para optimizar todas las operaciones de tu negocio
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
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
                        className="group relative p-8 rounded-2xl bg-surface/60 backdrop-blur-sm border border-slate-600/30 dark:border-slate-600/30 hover:border-accent/50 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-2 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <div className="text-5xl mb-6 transform transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12">{feature.icon}</div>
                            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">{feature.title}</h3>
                            <p className="text-muted leading-relaxed text-base">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* Arquitectura y Metodologías Section */}
        <section className="py-20 md:py-28 border-t border-slate-600/30 relative">
            <div className="text-center mb-16">
                <div className="inline-block mb-4">
                    <span className="text-5xl">🏗️</span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
                    <span className="bg-gradient-to-r from-yellow-400 via-amber-400 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                        Arquitectura y Metodologías
                    </span>
                </h2>
                <p className="text-muted text-xl max-w-3xl mx-auto font-light">
                    Construido con las mejores prácticas y metodologías de desarrollo seguro
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                {/* Arquitectura Frontend */}
                <div className="group p-8 rounded-2xl bg-surface/60 backdrop-blur-sm border border-slate-600/30 dark:border-slate-600/30 hover:border-accent/50 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-1">
                    <h3 className="text-3xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent flex items-center gap-3">
                        <span className="text-4xl">🖥️</span>
                        <span>Frontend</span>
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
                <div className="group p-8 rounded-2xl bg-surface/60 backdrop-blur-sm border border-slate-600/30 dark:border-slate-600/30 hover:border-accent/50 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-1">
                    <h3 className="text-3xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent flex items-center gap-3">
                        <span className="text-4xl">🖲️</span>
                        <span>Backend</span>
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
                <div className="group p-10 rounded-2xl bg-surface/60 backdrop-blur-sm border border-slate-600/30 dark:border-slate-600/30 hover:border-accent/50 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/20 lg:col-span-2">
                    <h3 className="text-3xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent flex items-center gap-3">
                        <span className="text-4xl">🛡️</span>
                        <span>Metodología: S-SDLC (Secure Software Development Life Cycle)</span>
                    </h3>
                    <p className="text-muted mb-8 text-lg leading-relaxed">
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
                            <div key={index} className="group/item p-6 rounded-xl bg-surface/40 border border-slate-600/20 dark:border-slate-600/20 hover:border-yellow-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/10 hover:-translate-y-1">
                                <h4 className="font-bold text-lg mb-3 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">{item.phase}</h4>
                                <p className="text-sm text-muted leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* Equipo Section */}
        <section className="py-20 md:py-28 border-t border-slate-600/30 relative">
            <div className="text-center mb-16">
                <div className="inline-block mb-4">
                    <span className="text-5xl">👥</span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6">
                    <span className="bg-gradient-to-r from-yellow-400 via-amber-400 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                        Nuestro Equipo
                    </span>
                </h2>
                <p className="text-muted text-xl max-w-3xl mx-auto mb-10 font-light">
                    Un equipo comprometido con la excelencia y la innovación en desarrollo de software seguro
                </p>
                <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-yellow-400/25 via-amber-400/15 to-orange-400/10 border-2 border-yellow-400/40 shadow-xl shadow-yellow-400/30">
                    <p className="text-xl text-text leading-relaxed">
                        <span className="text-yellow-400 font-bold text-2xl">¡Bienvenidos!</span> Somos un equipo de desarrolladores apasionados por crear soluciones tecnológicas 
                        que transformen la manera en que las PYMES gestionan sus operaciones. Nuestro compromiso es entregar un sistema 
                        robusto, seguro y escalable que impulse el crecimiento de tu negocio.
                    </p>
                </div>
            </div>

            <div className="space-y-12 mt-12">
                {/* Líder del Proyecto - Destacado */}
                <div className="flex justify-center">
                    <div className="group relative p-10 rounded-2xl bg-gradient-to-br from-yellow-400/35 via-amber-400/25 to-orange-400/20 border-2 border-yellow-400/60 text-center hover:border-yellow-400 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-400/40 hover:-translate-y-2 max-w-sm w-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/15 via-transparent to-amber-400/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative z-10">
                            <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 border-4 border-yellow-300 flex items-center justify-center text-5xl font-bold text-gray-900 shadow-xl shadow-yellow-400/50 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                                EG
                            </div>
                            <h3 className="text-3xl font-bold mb-3 text-text">Edgar Gómez</h3>
                            <p className="text-yellow-400 font-semibold text-lg mb-1">Líder del Proyecto</p>
                            <p className="text-muted text-sm">Project Leader</p>
                        </div>
                    </div>
                </div>

                {/* Equipo de Desarrollo */}
                <div>
                    <h3 className="text-2xl font-bold text-center mb-10 bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">Equipo de Desarrollo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { name: 'Alexis García', role: 'Desarrollador/Tester', initials: 'AG' },
                            { name: 'Juan Castillo', role: 'Desarrollador/Tester', initials: 'JC' },
                            { name: 'Daniela Mayte', role: 'Desarrolladora/Tester', initials: 'DM' },
                            { name: 'Orlando Casas', role: 'Desarrollador/Tester', initials: 'OC' }
                        ].map((member, index) => (
                            <div 
                                key={index}
                                className="group relative p-8 rounded-2xl bg-surface/60 backdrop-blur-sm border border-slate-600/30 dark:border-slate-600/30 text-center hover:border-yellow-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-400/20 hover:-translate-y-2 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/8 via-transparent to-amber-400/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative z-10">
                                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 border-3 border-yellow-300 flex items-center justify-center text-4xl font-bold text-gray-900 shadow-lg transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                                        {member.initials}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-text">{member.name}</h3>
                                    <p className="text-muted text-sm">{member.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 border-t border-slate-600/30 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-blue-500/5"></div>
            <div className="max-w-3xl mx-auto space-y-8 relative z-10">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold">
                    <span className="bg-gradient-to-r from-yellow-400 via-amber-400 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                        ¿Listo para comenzar?
                    </span>
                </h2>
                <p className="text-xl md:text-2xl text-muted font-light">
                    Accede a la plataforma y descubre todas las herramientas que tenemos para ti
                </p>
                <Link 
                    to="/login" 
                    className="group relative inline-flex items-center justify-center px-12 py-5 text-xl font-bold text-gray-900 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 rounded-xl shadow-2xl shadow-yellow-400/40 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-yellow-400/60 hover:-translate-y-1 overflow-hidden"
                >
                    <span className="absolute inset-0 bg-gradient-to-r from-yellow-500/90 via-amber-500/90 to-orange-500/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative z-10 flex items-center gap-3">
                        <span className="text-2xl">⭐</span>
                        <span>Iniciar Sesión</span>
                    </span>
                </Link>
            </div>
        </section>
    </main>

    {/* Footer */}
    <footer className="border-t border-slate-600/30 dark:border-slate-600/30 bg-surface/90 backdrop-blur-xl py-16 mt-20 relative">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                {/* Información del Proyecto */}
                <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent mb-6">Apex Store</h3>
                    <p className="text-muted text-base mb-3 leading-relaxed">
                        Sistema de Gestión de Inventario, Ventas y Facturación para PYMES.
                    </p>
                    <p className="text-muted text-sm">
                        Desarrollado con <span className="text-red-500 text-lg">❤️</span> siguiendo metodologías de desarrollo seguro (S-SDLC)
                    </p>
                </div>

                {/* Información de la Universidad */}
                <div className="text-center md:text-right">
                    <h3 className="text-2xl font-bold text-text mb-6">Universidad Tecnológica Santa Catarina</h3>
                    <div className="space-y-3 text-muted text-base">
                        <p className="flex items-center justify-center md:justify-end gap-3">
                            <span className="text-xl">📍</span>
                            <span>Carretera Saltillo-Monterrey Km. 61.5<br className="md:hidden" /> C.P. 66359, Santa Catarina, N.L.</span>
                        </p>
                        <p className="flex items-center justify-center md:justify-end gap-3">
                            <span className="text-xl">📞</span>
                            <a href="tel:8181248400" className="hover:text-accent transition-colors font-medium">
                                81 8124 8400
                            </a>
                        </p>
                        <p className="flex items-center justify-center md:justify-end gap-3">
                            <span className="text-xl">✉️</span>
                            <a href="mailto:contacto@utsc.edu.mx" className="hover:text-accent transition-colors font-medium">
                                contacto@utsc.edu.mx
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-slate-600/30 pt-8 text-center">
                <p className="text-muted text-sm">
                    © 2025 Apex Store. Todos los derechos reservados.
                </p>
            </div>
        </div>
    </footer>
    </div>
)
}