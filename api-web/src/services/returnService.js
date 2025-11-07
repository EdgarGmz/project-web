import { api } from '../services/api'

export const returnService = {
    // Obtener todos las devoluciones
    getAll: async () => {
        return await api.get('/returns')
    },

    // Obtener devolución por ID
    getById: async (id) => {
        return await api.get(`/returns/${id}`)
    },

    // Crear nueva devolución
    create: async (returnData) => {
        return await api.post('/returns', returnData)
    },

    // Actualizar devolución
    update: async (id, returnData) => {
        return await api.put(`/returns/${id}`, returnData)
    },

    // Eliminar devolución
    delete: async (id) => {
        return await api.delete(`/returns/${id}`)
    }
}