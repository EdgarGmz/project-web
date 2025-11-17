import { api } from './api'

export const logService = {
    // Obtener todos los logs con filtros
    getAll: async (params = {}) => {
        const queryParams = new URLSearchParams()
        
        if (params.page) queryParams.append('page', params.page)
        if (params.limit) queryParams.append('limit', params.limit)
        if (params.user_id) queryParams.append('user_id', params.user_id)
        if (params.action) queryParams.append('action', params.action)
        if (params.service) queryParams.append('service', params.service)
        if (params.startDate) queryParams.append('startDate', params.startDate)
        if (params.endDate) queryParams.append('endDate', params.endDate)
        if (params.search) queryParams.append('search', params.search)
        
        const queryString = queryParams.toString()
        return await api.get(`/logs${queryString ? `?${queryString}` : ''}`)
    },

    // Obtener log por ID
    getById: async (id) => {
        return await api.get(`/logs/${id}`)
    },

    // Obtener logs de un usuario
    getByUser: async (userId, params = {}) => {
        const queryParams = new URLSearchParams()
        
        if (params.page) queryParams.append('page', params.page)
        if (params.limit) queryParams.append('limit', params.limit)
        
        const queryString = queryParams.toString()
        return await api.get(`/logs/user/${userId}${queryString ? `?${queryString}` : ''}`)
    },

    // Obtener estadísticas
    getStats: async (startDate, endDate) => {
        const queryParams = new URLSearchParams()
        
        if (startDate) queryParams.append('startDate', startDate)
        if (endDate) queryParams.append('endDate', endDate)
        
        const queryString = queryParams.toString()
        return await api.get(`/logs/stats${queryString ? `?${queryString}` : ''}`)
    },

    // Crear log manualmente
    create: async (logData) => {
        return await api.post('/logs', logData)
    },

    // Limpiar logs antiguos
    cleanup: async (days) => {
        return await api.delete(`/logs/cleanup?days=${days}`)
    }
}
