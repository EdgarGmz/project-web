import { api } from '../services/api'

export const productService = {
    // Obtener todo el inventario
    getAlll: async () => {
        return await api.get('/inventory')
    },

    // Obtener inventario por ID
    getById: async (id) => {
        return await api.get(`/inventory/${id}`)
    },

    // Crear nuevo inventario
    create: async (inventoryData) => {
        return await api.post('/inventory', inventoryData)
    },

    // Actualizar inventario
    update: async (id, inventoryData) => {
        return await api.put(`/inventory/${id}`, inventoryData)
    },

    // Eliminar inventario
    delete: async (id) => {
        return await api.delete(`/inventory/${id}`)
    }
}