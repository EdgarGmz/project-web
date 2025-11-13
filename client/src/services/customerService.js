import { api } from './api'

export const customerService = {
    // Obtener todos los clientes con paginación y filtros
    getAll: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString()
        return await api.get(`/customers${queryString ? `?${queryString}` : ''}`)
    },

    // Obtener cliente por ID
    getById: async (id) => {
        return await api.get(`/customers/${id}`)
    },

    // Crear nuevo cliente
    create: async (customerData) => {
        return await api.post('/customers', customerData)
    },

    // Actualizar cliente
    update: async (id, customerData) => {
        return await api.put(`/customers/${id}`, customerData)
    },

    // Eliminar cliente
    delete: async (id) => {
        return await api.delete(`/customers/${id}`)
    }
}