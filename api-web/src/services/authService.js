import { api } from '../services/api'

export const authService = {
    // Iniciar sesion
    login: async (email, password) => {
        return await api.post('/auth/login', { email, password })
    },

    // Registrarse 
    register: async (userData) => {
        return await api.post('/auth/register', userData)
    },

    // Verificar token
    verify: async () => {
        return await api.get('/auth/verify')
    },

    // Cerrar sesion
    logout: async () => {
        return await api.post('/auth/logout')
    }
}