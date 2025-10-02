const db = require('../infrastructure/database/models')
const { Branch } = db

// ===========================================
// CONTROLADOR DE SUCURSALES
// ===========================================


 // GET /api/branches
 // Obtener todas las sucursales
 
const getAllBranches = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const offset = (page - 1) * limit

        const search = req.query.search || ''
        const whereClause = search ? {
            name: {
                [db.Sequelize.Op.iLike]: `%${search}%`
            }
        } : {}

        const { count, rows } = await Branch.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']]
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

        const branch = await Branch.findByPk(id)

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
        const { name, address, phone, email, is_active } = req.body

        // Validaciones básicas
        if (!name || !address) {
            return res.status(400).json({
                success: false,
                message: 'Nombre y dirección son obligatorios'
            })
        }

        const newBranch = await Branch.create({
            name,
            address,
            phone,
            email,
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

module.exports = {
    getAllBranches,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch
}