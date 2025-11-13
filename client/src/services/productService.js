import { api } from './api'
     
export const productService = {
    // Obtener todos los productos con paginación y filtros
    getAll: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString()
        return await api.get(`/products${queryString ? `?${queryString}` : ''}`)
    },

    // Obtener producto por ID
    getById: async (id) => {
        return await api.get(`/products/${id}`)
    },

    // Crear nuevo producto
    create: async (productData) => {
        return await api.post('/products', productData)
    },

    // Actualizar producto
    update: async (id, productData) => {
        return await api.put(`/products/${id}`, productData)
    },

    // Eliminar producto
    delete: async (id) => {
        return await api.delete(`/products/${id}`)
    },

    // Cambiar estado activo/inactivo del producto
    toggleStatus: async (id) => {
        return await api.patch(`/products/${id}/toggle-status`)
    }
}