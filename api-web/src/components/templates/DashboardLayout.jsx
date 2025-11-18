import Sidebar from '../organisms/Sidebar'
import { useSidebar } from '../../contexts/SidebarContext'
import { useAuth } from '../../contexts/AuthContext'
import { useState, useEffect } from 'react'

export default function DashboardLayout({ children }) {
  const { isCollapsed } = useSidebar()
  const { user, logout } = useAuth()
  
  const [currentTime, setCurrentTime] = useState(new Date())
  const [weather, setWeather] = useState(null)
  const [location, setLocation] = useState('Cargando ubicación...')

  // Actualizar la hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Obtener ubicación de la sucursal del usuario y simular clima
  useEffect(() => {
    const getBranchLocationAndWeather = () => {
      try {
        // Obtener ubicación de la sucursal del usuario
        if (user?.branch) {
          const branchLocation = `${user.branch.city || 'Ciudad'}, ${user.branch.state || 'Estado'}`
          setLocation(branchLocation)
        } else if (user && !user.branch) {
          setLocation('Sucursal no asignada')
        } else {
          setLocation('Cargando ubicación...')
        }
        
        // Simular datos de clima basados en la hora del día
        const hour = new Date().getHours()
        const isDayTime = hour >= 6 && hour < 20
        
        // Generar temperatura basada en la hora
        let temp = isDayTime ? 
          Math.floor(Math.random() * (28 - 18 + 1)) + 18 : // 18-28°C día
          Math.floor(Math.random() * (20 - 12 + 1)) + 12   // 12-20°C noche
        
        const descriptions = isDayTime ? 
          ['Soleado', 'Parcialmente nublado', 'Despejado'] :
          ['Despejado', 'Nublado', 'Cielo estrellado']
        
        setWeather({
          temp: temp,
          description: descriptions[Math.floor(Math.random() * descriptions.length)],
          icon: isDayTime ? '01d' : '01n'
        })
      } catch (error) {
        console.log('Error:', error)
        setLocation('Error obteniendo ubicación')
        setWeather({ temp: '--', description: 'No disponible', icon: null })
      }
    }

    getBranchLocationAndWeather()
  }, [user])

  // Formatear fecha y hora
  const formatDateTime = (date) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }
    return date.toLocaleDateString('es-ES', options)
  }

  // Determinar si es día o noche
  const isDaytime = () => {
    const hour = currentTime.getHours()
    return hour >= 6 && hour < 20
  }
  
  return (
    <div className="min-h-screen bg-bg text-text flex">
      <Sidebar />
      
      <main className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <header className="bg-surface/80 backdrop-blur border-b border-slate-600/20 px-6 py-4 flex-shrink-0">
          <nav className="flex items-center justify-between">
            {/* Información de fecha, hora y clima */}
            <div className="flex items-center gap-4">
              {/* Icono de día/noche */}
              <div className="text-2xl">
                {isDaytime() ? '☀️' : '🌙'}
              </div>
              
              {/* Fecha y hora */}
              <div className="text-left">
                <p className="text-lg font-semibold">
                  {formatDateTime(currentTime)}
                </p>
                <div className="flex items-center gap-3 text-sm text-text/70">
                  {/* Ubicación */}
                  <span className="flex items-center gap-1">
                    📍 {location}
                  </span>
                  
                  {/* Clima */}
                  {weather && (
                    <span className="flex items-center gap-1">
                      🌡️ {weather.temp}°C - {weather.description}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <section className="flex items-center gap-4">
              {/* Información del usuario */}
              <div className="text-sm text-right">
                <p className="font-medium">{user?.first_name} {user?.last_name}</p>
                <p className="text-text/60 capitalize">{user?.role}</p>
              </div>
              
              {/* Avatar y menú del usuario */}
              <div className="relative group">
                <figure className="h-8 w-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center cursor-pointer hover:bg-accent/30 transition-colors">
                  <span className="text-sm font-medium text-accent">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </figure>
                
                {/* Menú desplegable del usuario */}
                <div className="absolute right-0 mt-2 w-48 bg-surface border border-slate-600/30 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1">
                    <a 
                      href="/profile" 
                      className="block px-4 py-2 text-sm hover:bg-surface-hover transition-colors"
                    >
                      Mi Perfil
                    </a>
                    <a 
                      href="/settings" 
                      className="block px-4 py-2 text-sm hover:bg-surface-hover transition-colors"
                    >
                      Configuración
                    </a>
                    <hr className="my-1 border-slate-600/30" />
                    <button 
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-surface-hover transition-colors text-red-400"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </nav>
        </header>
        
        <section className="flex-1 p-6 overflow-y-auto">
          {children}
        </section>
      </main>
    </div>
  )
}