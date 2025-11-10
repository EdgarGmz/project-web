const db = require('../database/models')
const { Return, Customer, Product } = db

// Obtener todas las devoluciones
const getAllReturns = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const offset = (page - 1) * limit

        // Búsqueda opcional por razón o estado
        const search = req.query.search || ''
        const whereClause = search ? {
            [db.Sequelize.Op.or]: [
                { reason: { [db.Sequelize.Op.iLike]: `%${search}%` } },
                { status: { [db.Sequelize.Op.iLike]: `%${search}%` } }
            ]
        } : {}

        const { count, rows } = await Return.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Customer,
                    as: 'Customer',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                },
                {
                    model: Product,
                    as: 'Product',
                    attributes: ['id', 'name', 'sku']
                }
            ]
        })

        res.json({
            success: true,
            message: 'Devoluciones obtenidas exitosamente',
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit)
            }
        })

    } catch (error) {
        console.error('Error al obtener devoluciones:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Obtener una devolución por ID
const getReturnById = async (req, res) => {
    try {
        const { id } = req.params

        const returnItem = await Return.findByPk(id, {
            include: [
                {
                    model: Customer,
                    as: 'Customer',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                },
                {
                    model: Product,
                    as: 'Product',
                    attributes: ['id', 'name', 'sku']
                }
            ]
        })

        if (!returnItem) {
            return res.status(404).json({
                success: false,
                message: 'Devolución no encontrada'
            })
        }

        res.json({
            success: true,
            message: 'Devolución obtenida exitosamente',
            data: returnItem
        })

    } catch (error) {
        console.error('Error al obtener devolución:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Crear una nueva devolución
const createReturn = async (req, res) => {
    try {
        const { customer_id, product_id, quantity, reason, status } = req.body

        if (!customer_id || !product_id || !quantity || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Cliente, producto, cantidad y razón son obligatorios'
            })
        }

        // Verificar que el cliente existe
        const customer = await Customer.findByPk(customer_id)
        if (!customer) {
            return res.status(400).json({
                success: false,
                message: 'El cliente especificado no existe'
            })
        }

        // Verificar que el producto existe
        const product = await Product.findByPk(product_id)
        if (!product) {
            return res.status(400).json({
                success: false,
                message: 'El producto especificado no existe'
            })
        }

        const newReturn = await Return.create({
            customer_id,
            product_id,
            quantity,
            reason,
            status: status || 'pending'
        })

        res.status(201).json({
            success: true,
            message: 'Devolución creada exitosamente',
            data: newReturn
        })

    } catch (error) {
        console.error('Error al crear devolución:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Actualizar una devolución
const updateReturn = async (req, res) => {
    try {
        const { id } = req.params
        const updateData = req.body

        const returnItem = await Return.findByPk(id)
        if (!returnItem) {
            return res.status(404).json({
                success: false,
                message: 'Devolución no encontrada'
            })
        }

        await returnItem.update(updateData)

        res.json({
            success: true,
            message: 'Devolución actualizada exitosamente',
            data: returnItem
        })

    } catch (error) {
        console.error('Error al actualizar devolución:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Eliminar una devolución
const deleteReturn = async (req, res) => {
    try {
        const { id } = req.params

        const returnItem = await Return.findByPk(id)
        if (!returnItem) {
            return res.status(404).json({
                success: false,
                message: 'Devolución no encontrada'
            })
        }

        await returnItem.destroy()

        res.json({
            success: true,
            message: 'Devolución eliminada exitosamente'
        })

    } catch (error) {
        console.error('Error al eliminar devolución:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

module.exports = {
    getAllReturns,
    getReturnById,
    createReturn,
    updateReturn,
    deleteReturn
}
