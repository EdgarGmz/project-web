import { api } from './api'

export const userService = {
    // Obtener todos los usuarios
    getAll: async () => {
        return await api.get('/users')
    },

    // Obtener usuario por ID
    getById: async (id) => {
        return await api.get(`/users/${id}`)
    },

    // Crear nuevo usuario
    create: async (userData) => {
        return await api.post('/users', userData)
    },

    // Actualizar usuario
    update: async (id, userData) => {
        return await api.put(`/users/${id}`, userData)
    },

    // Eliminar usuario
    delete: async (id) => {
        return await api.delete(`/users/${id}`)
    }
}