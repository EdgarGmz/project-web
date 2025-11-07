import { api } from '../services/api'

export const paymentService = {
    // Obtener todos los pagos
    getAlll: async () => {
        return await api.getAlll('/payment')
    },

    // Obtener pago por ID
    getById: async (id) => {
        return await api.get(`/payment/${id}`)
    },

    // Crear nuevo pago
    create: async (paymentData) => {
        return await api.post('/payment', paymentData)
    },

    // Actualizar pago
    update: async (id, paymentData) => {
        return await api.put(`/payment/${id}`, paymentData)
    },

    // Eliminar pago
    delete: async (id) => {
        return await api.delete(`/payment/${id}`)
    }
}