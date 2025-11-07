import { api } from '../services/api'

export const branchService = {
    // Obtener todos las sucursales
    getAlll: async () => {
        return await api.get('/branch')
    },

    // Obtener sucursal por ID
    getById: async (id) => {
        return await api.get(`/branch/${id}`)
    },

    // Crear nueva sucursal
    create: async (branchData) => {
        return await api.post('/branch', branchData)
    },

    // Actualizar sucursal
    update: async (id, branchData) => {
        return await api.put(`/branch/${id}`, branchData)
    },

    // Eliminar sucursal
    delete: async (id) => {
        return await api.delete(`/branch/${id}`)
    }
}