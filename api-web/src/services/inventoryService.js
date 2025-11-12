import { api } from '../services/api'

export const inventoryService = {
    // Obtener todo el inventario con paginación y filtros
    getAll: async (params = {}) => {
        const queryParams = new URLSearchParams()
        if (params.page) queryParams.append('page', params.page)
        if (params.limit) queryParams.append('limit', params.limit)
        if (params.branch_id) queryParams.append('branch_id', params.branch_id)
        if (params.product_id) queryParams.append('product_id', params.product_id)
        if (params.low_stock) queryParams.append('low_stock', params.low_stock)
        
        const queryString = queryParams.toString()
        const url = queryString ? `/inventory?${queryString}` : '/inventory'
        return await api.get(url)
    },

    // Obtener inventario por ID
    getById: async (id) => {
        return await api.get(`/inventory/${id}`)
    },

    // Crear nuevo item de inventario
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
    },

    // Ajustar stock
    adjustStock: async (id, adjustment) => {
        return await api.post(`/inventory/${id}/adjust`, adjustment)
    }
}