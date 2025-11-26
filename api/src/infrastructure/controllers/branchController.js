const db = require('../database/models')
const { Branch, User } = db

// Obtener todas las sucursales con paginación y búsqueda
const getAllBranches = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const offset = (page - 1) * limit

        const search = req.query.search || ''
        const searchLower = search.toLowerCase()
        const whereClause = search ? {
            [db.Sequelize.Op.and]: [
                db.Sequelize.literal(`LOWER("Branch"."name") LIKE '%${searchLower}%'`)
            ]
        } : {}

        const { count, rows } = await Branch.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            attributes: { exclude: ['deleted_at'] },
            include: [{
                model: User,
                as: 'users',
                attributes: ['id', 'first_name', 'last_name', 'email', 'role'],
                where: { is_active: true },
                required: false
            }]
        })

        res.json({
            success: true,
            message: 'Sucursales obtenidas exitosamente',
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit)
            }
        })

    } catch (error) {
        console.error('Error al obtener sucursales:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

 // Obtener una sucursal por ID
const getBranchById = async (req, res) => {
    try {
        const { id } = req.params

        const branch = await Branch.findByPk(id, {
            include: [{
                model: User,
                as: 'users',
                attributes: ['id', 'first_name', 'last_name', 'email', 'role'],
                where: { is_active: true },
                required: false
            }]
        })

        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Sucursal no encontrada'
            })
        }

        res.json({
            success: true,
            message: 'Sucursal obtenida exitosamente',
            data: branch
        })

    } catch (error) {
        console.error('Error al obtener sucursal:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

 // Crear una nueva sucursal
const createBranch = async (req, res) => {
    try {
        const {
            name, code, address, city, state, postal_code, phone, email, manager_id, is_active
        } = req.body

        // Validaciones completas
        if (!name || !code || !address || !city || !state || !postal_code || !email) {
            return res.status(400).json({
                success: false,
                message: 'Los campos name, code, address, city, state, postal_code y email son obligatorios'
            })
        }

        const newBranch = await Branch.create({
            name,
            code,
            address,
            city,
            state,
            postal_code,
            phone,
            email,
            manager_id,
            is_active: is_active !== false
        })

        res.status(201).json({
            success: true,
            message: 'Sucursal creada exitosamente',
            data: newBranch
        })

    } catch (error) {
        console.error('Error al crear sucursal:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

 // Actualizar una sucursal
const updateBranch = async (req, res) => {
    try {
        const { id } = req.params
        const updateData = req.body

        const branch = await Branch.findByPk(id)
        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Sucursal no encontrada'
            })
        }

        await branch.update(updateData)

        res.json({
            success: true,
            message: 'Sucursal actualizada exitosamente',
            data: branch
        })

    } catch (error) {
        console.error('Error al actualizar sucursal:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

 // Eliminar una sucursal (soft delete)
const deleteBranch = async (req, res) => {
    try {
        const { id } = req.params

        const branch = await Branch.findByPk(id)
        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Sucursal no encontrada'
            })
        }

        await branch.update({ is_active: false })

        res.json({
            success: true,
            message: 'Sucursal eliminada exitosamente'
        })

    } catch (error) {
        console.error('Error al eliminar sucursal:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Asignar usuarios a una sucursal
const assignUsersToBranch = async (req, res) => {
    try {
        const { id } = req.params
        const { userIds } = req.body

        // Verificar que la sucursal existe
        const branch = await Branch.findByPk(id)
        if (!branch) {
            return res.status(404).json({
                success: false,
                message: 'Sucursal no encontrada'
            })
        }

        // Verificar que los usuarios existen y son supervisores o cajeros
        if (userIds && userIds.length > 0) {
            const users = await User.findAll({
                where: {
                    id: userIds,
                    role: ['supervisor', 'cashier'],
                    is_active: true
                }
            })

            if (users.length !== userIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Uno o más usuarios no son válidos o no tienen el rol apropiado'
                })
            }

            // Desasignar todos los usuarios actuales de esta sucursal
            await User.update(
                { branch_id: null },
                { where: { branch_id: id } }
            )

            // Asignar los nuevos usuarios a la sucursal
            await User.update(
                { branch_id: id },
                { where: { id: userIds } }
            )
        } else {
            // Si no se proporcionan usuarios, desasignar todos
            await User.update(
                { branch_id: null },
                { where: { branch_id: id } }
            )
        }

        // Obtener la sucursal actualizada con sus usuarios
        const updatedBranch = await Branch.findByPk(id, {
            include: [{
                model: User,
                as: 'users',
                attributes: ['id', 'first_name', 'last_name', 'email', 'role'],
                where: { is_active: true },
                required: false
            }]
        })

        res.json({
            success: true,
            message: 'Usuarios asignados exitosamente',
            data: updatedBranch
        })

    } catch (error) {
        console.error('Error al asignar usuarios:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

module.exports = {
    getAllBranches,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch,
    assignUsersToBranch
}
