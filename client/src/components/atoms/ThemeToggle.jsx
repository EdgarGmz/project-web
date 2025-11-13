import { useTheme } from '../../contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'
  
  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-600/30 bg-surface text-text hover:opacity-90 transition"
      title={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
    >
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-accent">
          <path d="M12 3a9 9 0 1 0 9 9a7 7 0 0 1-9-9Z"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-accent">
          <path d="M6.76 4.84l-1.8-1.79-1.79 1.79 1.79 1.8 1.8-1.8zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zM4.84 20.83l1.8-1.79-1.8-1.8-1.67 1.7 1.67 1.89zM20 11V9h-3v2h3zm-2.83-6.17l-1.8 1.8 1.8 1.79 1.89-1.67-1.89-1.92zM13 1h-2v3h2V1zm6.17 15.17l-1.8-1.8-1.79 1.8 1.67 1.89 1.92-1.89z"/>
        </svg>
      )}
      <span className="text-sm">{isDark ? 'Oscuro' : 'Claro'}</span>
    </button>
  )
}