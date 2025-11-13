import { api } from './api'

export const purchaseService = {
    // Obtener todas las compras con parámetros opcionales
    getAll: async (queryParams = '') => {
        const url = queryParams ? `/purchases?${queryParams}` : '/purchases'
        return await api.get(url)
    },

    // Obtener compra por ID
    getById: async (id) => {
        return await api.get(`/purchases/${id}`)
    },

    // Crear nueva compra
    create: async (purchaseData) => {
        return await api.post('/purchases', purchaseData)
    },

    // Actualizar compra
    update: async (id, purchaseData) => {
        return await api.put(`/purchases/${id}`, purchaseData)
    },

    // Eliminar compra
    delete: async (id) => {
        return await api.delete(`/purchases/${id}`)
    }
}