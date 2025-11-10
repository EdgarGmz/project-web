import { api } from '../services/api'

export const branchService = {
    // Obtener todos las sucursales
    getAll: async () => {
        return await api.get('/branches')
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