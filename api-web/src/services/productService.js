import { api } from '../services/api'
     
export const productService = {
    // Obtener todos los productos con paginación
    getAll: async (page = 1, limit = 20, search = '', status = '') => {
        const params = new URLSearchParams()
        params.append('page', page)
        params.append('limit', limit)
        if (search) params.append('search', search)
        if (status) params.append('status', status)
        
        return await api.get(`/products?${params.toString()}`)
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