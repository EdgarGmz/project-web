import { api } from './api'

export const reportService = {
    // Generar reporte con parámetros
    generate: async (params) => {
        const queryParams = new URLSearchParams(params).toString()
        return await api.get(`/reports?${queryParams}`)
    },

    // Exportar reporte
    export: async (params) => {
        const queryParams = new URLSearchParams(params).toString()
        return await api.get(`/reports/export?${queryParams}`, { responseType: 'blob' })
    },

    // Obtener todos los reportes guardados
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