const db = require('../database/models')
const { Log, User } = db
const { Op } = require('sequelize')

// Obtener todos los logs con filtros y paginación
const getAllLogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 50
        const offset = (page - 1) * limit

        // Filtros opcionales
        const { user_id, action, service, startDate, endDate, search } = req.query

        const whereClause = {}

        // Filtro por usuario
        if (user_id) {
            whereClause.user_id = user_id
        }

        // Filtro por acción
        if (action) {
            whereClause.action = action
        }

        // Filtro por servicio
        if (service) {
            whereClause.service = service
        }

        // Filtro por rango de fechas
        if (startDate || endDate) {
            whereClause.created_at = {}
            if (startDate) {
                whereClause.created_at[Op.gte] = new Date(startDate)
            }
            if (endDate) {
                whereClause.created_at[Op.lte] = new Date(endDate)
            }
        }

        // Búsqueda en mensaje
        if (search) {
            whereClause.message = {
                [Op.like]: `%${search}%`
            }
        }

        const { count, rows } = await Log.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'role']
                }
            ]
        })

        res.json({
            success: true,
            message: 'Logs obtenidos exitosamente',
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit)
            }
        })

    } catch (error) {
        console.error('Error al obtener logs:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Obtener un log por ID
const getLogById = async (req, res) => {
    try {
        const { id } = req.params

        const log = await Log.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'role']
                }
            ]
        })

        if (!log) {
            return res.status(404).json({
                success: false,
                message: 'Log no encontrado'
            })
        }

        res.json({
            success: true,
            message: 'Log obtenido exitosamente',
            data: log
        })

    } catch (error) {
        console.error('Error al obtener log:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Crear un nuevo log
const createLog = async (req, res) => {
    try {
        const { user_id, action, service, message } = req.body

        // Validaciones
        if (!user_id || !action || !service || !message) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos: user_id, action, service, message'
            })
        }

        // Verificar que el usuario existe
        const userExists = await User.findByPk(user_id)
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            })
        }

        const log = await Log.create({
            user_id,
            action,
            service,
            message
        })

        const logWithUser = await Log.findByPk(log.id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'role']
                }
            ]
        })

        res.status(201).json({
            success: true,
            message: 'Log creado exitosamente',
            data: logWithUser
        })

    } catch (error) {
        console.error('Error al crear log:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Obtener logs por usuario
const getLogsByUser = async (req, res) => {
    try {
        const { userId } = req.params
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 50
        const offset = (page - 1) * limit

        // Verificar que el usuario existe
        const userExists = await User.findByPk(userId)
        if (!userExists) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            })
        }

        const { count, rows } = await Log.findAndCountAll({
            where: { user_id: userId },
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'role']
                }
            ]
        })

        res.json({
            success: true,
            message: 'Logs del usuario obtenidos exitosamente',
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit)
            }
        })

    } catch (error) {
        console.error('Error al obtener logs del usuario:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Obtener estadísticas de logs
const getLogStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query

        const whereClause = {}
        if (startDate || endDate) {
            whereClause.created_at = {}
            if (startDate) {
                whereClause.created_at[Op.gte] = new Date(startDate)
            }
            if (endDate) {
                whereClause.created_at[Op.lte] = new Date(endDate)
            }
        }

        // Total de logs
        const totalLogs = await Log.count({ where: whereClause })

        // Logs por acción
        const logsByAction = await Log.findAll({
            where: whereClause,
            attributes: [
                'action',
                [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
            ],
            group: ['action'],
            order: [[db.sequelize.fn('COUNT', db.sequelize.col('id')), 'DESC']]
        })

        // Logs por servicio
        const logsByService = await Log.findAll({
            where: whereClause,
            attributes: [
                'service',
                [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
            ],
            group: ['service'],
            order: [[db.sequelize.fn('COUNT', db.sequelize.col('id')), 'DESC']]
        })

        // Usuarios más activos
        const topUsers = await Log.findAll({
            where: whereClause,
            attributes: [
                'user_id',
                [db.sequelize.fn('COUNT', db.sequelize.col('Log.id')), 'count']
            ],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'role']
                }
            ],
            group: ['user_id', 'user.id'],
            order: [[db.sequelize.fn('COUNT', db.sequelize.col('Log.id')), 'DESC']],
            limit: 10
        })

        res.json({
            success: true,
            message: 'Estadísticas obtenidas exitosamente',
            data: {
                totalLogs,
                logsByAction,
                logsByService,
                topUsers
            }
        })

    } catch (error) {
        console.error('Error al obtener estadísticas:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Eliminar logs antiguos (soft delete)
const deleteOldLogs = async (req, res) => {
    try {
        const { days } = req.query

        if (!days || isNaN(days)) {
            return res.status(400).json({
                success: false,
                message: 'Parámetro "days" es requerido y debe ser un número'
            })
        }

        const dateThreshold = new Date()
        dateThreshold.setDate(dateThreshold.getDate() - parseInt(days))

        const deletedCount = await Log.destroy({
            where: {
                created_at: {
                    [Op.lt]: dateThreshold
                }
            }
        })

        res.json({
            success: true,
            message: `Logs antiguos eliminados exitosamente`,
            data: {
                deletedCount,
                threshold: dateThreshold
            }
        })

    } catch (error) {
        console.error('Error al eliminar logs antiguos:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

module.exports = {
    getAllLogs,
    getLogById,
    createLog,
    getLogsByUser,
    getLogStats,
    deleteOldLogs
}
