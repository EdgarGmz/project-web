import { api } from '../services/api'

export const branchService = {
    // Obtener todos las sucursales con paginación y búsqueda
    getAll: async (params = {}) => {
        const queryParams = new URLSearchParams()
        if (params.page) queryParams.append('page', params.page)
        if (params.limit) queryParams.append('limit', params.limit)
        if (params.search) queryParams.append('search', params.search)
        
        const queryString = queryParams.toString()
        const url = queryString ? `/branches?${queryString}` : '/branches'
        return await api.get(url)
    },

    // Obtener sucursal por ID
    getById: async (id) => {
        return await api.get(`/branches/${id}`)
    },

    // Crear nueva sucursal
    create: async (branchData) => {
        return await api.post('/branches', branchData)
    },

    // Actualizar sucursal
    update: async (id, branchData) => {
        return await api.put(`/branches/${id}`, branchData)
    },

    // Eliminar sucursal
    delete: async (id) => {
        return await api.delete(`/branches/${id}`)
    },

    // Asignar usuarios a sucursal
    assignUsers: async (id, userIds) => {
        return await api.put(`/branches/${id}/assign-users`, { userIds })
    }
}