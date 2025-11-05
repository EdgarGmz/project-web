import { api } from '../services/api'

export const customerService = {
    // Obtener todos los clientes
    getAlll: async () => {
        return await api.get('/customers')
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