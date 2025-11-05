import { api } from '../services/api'

export const productService = {
    // Obtener todos los productos
    getAlll: async () => {
        return await api.get('/products')
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
    }
}