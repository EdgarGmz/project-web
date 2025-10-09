const db = require('../infrastructure/database/models')
const { UserSession, User } = db

// Obtener sesiones activas de un usuario
const getUserSessions = async (req, res) => {
    try {
        const { user_id } = req.params
        
        const sessions = await UserSession.findAll({
            where: { 
                user_id,
                is_active: true 
            },
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                }
            ],
            order: [['created_at', 'DESC']]
        })

        res.json({
            success: true,
            message: 'Sesiones obtenidas exitosamente',
            data: sessions
        })

    } catch (error) {
        console.error('Error al obtener sesiones:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Cerrar sesión específica
const closeSession = async (req, res) => {
    try {
        const { id } = req.params

        const session = await UserSession.findByPk(id)
        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Sesión no encontrada'
            })
        }

        await session.update({
            is_active: false,
            logout_at: new Date()
        })

        res.json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        })

    } catch (error) {
        console.error('Error al cerrar sesión:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

module.exports = {
    getUserSessions,
    closeSession
}