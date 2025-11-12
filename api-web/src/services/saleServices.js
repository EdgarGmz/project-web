import { api } from './api'

export const saleService = {
    // Obtener todos las ventas con parámetros opcionales
    getAll: async (queryParams = '') => {
        const url = queryParams ? `/sales?${queryParams}` : '/sales'
        return await api.get(url)
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

    // Eliminar/cancelar venta
    delete: async (id) => {
        return await api.delete(`/sales/${id}`)
    }
}