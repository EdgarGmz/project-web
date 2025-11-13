import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext({ theme: 'dark', toggle: () => {}, setTheme: () => {} })

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    localStorage.setItem('theme', theme)
    if (theme === 'dark') { root.classList.add('dark'); root.classList.remove('light') }
    else { root.classList.remove('dark'); root.classList.add('light') }
  }, [theme])

  const value = useMemo(() => ({ theme, setTheme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') }), [theme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)