import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        
        if (token && userData) {
        setUser(JSON.parse(userData))
        }
        setLoading(false)
    }, [])

    const login = async (email, password) => {
        try {
            // TODO: Cambiar URL por variable de entorno
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        
        const data = await response.json()
        
        if (data.success) {
            localStorage.setItem('token', data.data.token)
            localStorage.setItem('user', JSON.stringify(data.data.user))
            setUser(data.data.user)
            return { success: true }
        } else {
            return { success: false, message: data.message }
        }
        } catch (error) {
        return { success: false, message: 'Error de conexión' }
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
    }

    const hasPermission = (requiredRoles) => {
        if (!user) return false
        if (Array.isArray(requiredRoles)) {
        return requiredRoles.includes(user.role)
        }
        return user.role === requiredRoles
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, hasPermission, loading }}>
        {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)