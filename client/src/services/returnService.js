import { api } from './api'

export const returnService = {
    // Buscar venta por referencia de transacción
    getSaleByReference: async (transactionReference) => {
        return await api.get(`/returns/sale?transaction_reference=${transactionReference}`)
    },

    // Obtener todas las devoluciones con filtros y paginación
    getAll: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString()
        return await api.get(`/returns${queryString ? `?${queryString}` : ''}`)
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