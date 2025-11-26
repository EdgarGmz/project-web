import { api } from '../services/api'
import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token')
            const userData = localStorage.getItem('user')
            
            if (token && userData) {
                // Simplemente limpiar tokens expirados sin hacer peticiones
                console.log('Encontrado token y userData en localStorage')
                
                // Verificar si el token está expirado decodificándolo
                try {
                    const tokenParts = token.split('.')
                    if (tokenParts.length === 3) {
                        const payload = JSON.parse(atob(tokenParts[1]))
                        const currentTime = Math.floor(Date.now() / 1000)
                        
                        if (payload.exp && payload.exp > currentTime) {
                            // Token válido
                            console.log('Token válido, restaurando sesión')
                            setUser(JSON.parse(userData))
                        } else {
                            // Token expirado
                            console.log('Token expirado, limpiando sesión...')
                            localStorage.removeItem('token')
                            localStorage.removeItem('user')
                            setUser(null)
                        }
                    } else {
                        // Token malformado
                        console.log('Token malformado, limpiando sesión...')
                        localStorage.removeItem('token')
                        localStorage.removeItem('user')
                        setUser(null)
                    }
                } catch (error) {
                    // Error al decodificar token
                    console.log('Error decodificando token, limpiando sesión...', error)
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    setUser(null)
                }
            }
            setLoading(false)
        }
        
        initAuth()
    }, [])

    const login = async (email, password) => {
        try {
            // Limpiar cualquier sesión anterior antes de intentar login
            console.log('🧹 Limpiando sesión antes de login...')
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            sessionStorage.clear()
            setUser(null)
            
            console.log('📧 Intentando login con:', email)
            const response = await api.post('/auth/login', {email, password})

            if(response.success){
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('user', JSON.stringify(response.data.user))
                setUser(response.data.user)
                return { success: true }
            } else {
                return { success: false, message: response.message }
            }            
        } catch (error) {
            // Si hay error durante el login, también limpiar
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            setUser(null)
            return { success: false, message: error.message || 'Error de conexion' }
        }
    }

    const updateUser = (userData) => {
        // Actualizar el usuario en el contexto y localStorage sin limpiar la sesión
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData))
            setUser(userData)
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        sessionStorage.clear()
        setUser(null)
    }

    // Función para limpiar completamente la sesión (útil para debugging)
    const clearSession = () => {
        localStorage.clear()
        sessionStorage.clear()
        setUser(null)
        console.log('Sesión completamente limpiada')
    }

    const hasPermission = (requiredRoles) => {
        if (!user) return false
        if (Array.isArray(requiredRoles)) {
        return requiredRoles.includes(user.role)
        }
        return user.role === requiredRoles
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, hasPermission, loading, clearSession }}>
        {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)