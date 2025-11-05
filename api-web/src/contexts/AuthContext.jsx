import { api } from '../services/api'
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
            return { success: false, message: error.message || 'Error de conexion' }
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