import { api } from '../services/api'

export const salesService = {
    // Obtener todos las ventas
    getAll: async () => {
        return await api.get('/sales')
    },

    // Obtener venta por ID
    getById: async (id) => {
        return await api.get(`/sales/${id}`)
    },

    // Crear nueva venta
    create: async (salesData) => {
        return await api.post('/sales', salesData)
    },

    // Actualizar venta
    update: async (id, salesData) => {
        return await api.put(`/sales/${id}`, salesData)
    },

    // Eliminar venta
    delete: async (id) => {
        return await api.delete(`/sales/${id}`)
    }
}