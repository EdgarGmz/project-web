import { api } from '../services/api'

export const reportService = {
    // Obtener todos los reportes
    getAll: async () => {
        return await api.get('/reports')
    },

    // Obtener reporte por ID
    getById: async (id) => {
        return await api.get(`/reports/${id}`)
    },

    // Crear nuevo reporte
    create: async (reportData) => {
        return await api.post('/reports', reportData)
    },

    // Actualizar reporte
    update: async (id, reportData) => {
        return await api.put(`/reports/${id}`, reportData)
    },

    // Eliminar reporte
    delete: async (id) => {
        return await api.delete(`/reports/${id}`)
    }
}