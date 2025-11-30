import notFoundImage from '../../assets/img/not_found.png'

/**
 * Componente NotFound que se muestra cuando no se encuentran datos o recursos
 * @param {Object} props
 * @param {string} props.message - Mensaje personalizado a mostrar (opcional)
 * @param {string} props.subtitle - Subtítulo adicional (opcional)
 * @param {React.ReactNode} props.children - Contenido adicional opcional (botones, enlaces, etc.)
 * @param {string} props.size - Tamaño de la imagen (sm, md, lg) - default: 'md'
 */
export default function NotFound({
  message = 'No se encontraron resultados',
  subtitle = 'Intenta ajustar los filtros de búsqueda o verifica la información',
  children,
  size = 'md'
}) {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 animate-fade-in">
      {/* Imagen de no encontrado */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <img 
            src={notFoundImage} 
            alt="No encontrado" 
            className={`${sizeClasses[size]} object-contain animate-bounce-slow drop-shadow-lg transition-transform duration-300 hover:scale-110`}
          />
        </div>
      </div>

      {/* Mensaje principal */}
      <h3 className="text-xl font-semibold text-text mb-2 text-center animate-slide-up">
        {message}
      </h3>

      {/* Subtítulo */}
      {subtitle && (
        <p className="text-muted text-center mb-6 max-w-md animate-slide-up-delay">
          {subtitle}
        </p>
      )}

      {/* Contenido adicional (botones, enlaces, etc.) */}
      {children && (
        <div className="flex flex-col items-center gap-3 mt-4 animate-fade-in-delay">
          {children}
        </div>
      )}
    </div>
  )
}

