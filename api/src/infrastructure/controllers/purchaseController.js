const db = require('../database/models')
const { Purchase } = db

// Obtener todas las compras
const getAllPurchases = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const offset = (page - 1) * limit

        // El middleware ya verificó que es owner o admin
        let whereClause = {}

        const { count, rows } = await Purchase.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: db.Branch,
                    as: 'branch',
                    attributes: ['id', 'name', 'code']
                },
                {
                    model: db.User,
                    as: 'User',
                    attributes: ['id', 'first_name', 'last_name']
                }
            ]
        })

        res.json({
            success: true,
            message: 'Compras obtenidas exitosamente',
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit)
            }
        })

    } catch (error) {
        console.error('Error al obtener compras:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Obtener una compra por ID
const getPurchaseById = async (req, res) => {
    try {
        const { id } = req.params
        // El middleware ya verificó que es owner o admin

        const purchase = await Purchase.findByPk(id, {
            include: [
                {
                    model: db.Branch,
                    as: 'branch',
                    attributes: ['id', 'name', 'code']
                },
                {
                    model: db.User,
                    as: 'User',
                    attributes: ['id', 'first_name', 'last_name']
                }
            ]
        })

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Compra no encontrada'
            })
        }

        res.json({
            success: true,
            message: 'Compra obtenida exitosamente',
            data: purchase
        })

    } catch (error) {
        console.error('Error al obtener compra:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Crear una nueva compra
const createPurchase = async (req, res) => {
    try {
        const { supplier_name, total_amount, purchase_date, notes } = req.body
        const currentUser = req.user
        // El middleware ya verificó que es owner o admin

        // Validaciones básicas
        if (!supplier_name || !total_amount) {
            return res.status(400).json({
                success: false,
                message: 'Proveedor y monto total son obligatorios'
            })
        }

        const newPurchase = await Purchase.create({
            supplier_name,
            total_amount,
            purchase_date: purchase_date || new Date(),
            notes,
            branch_id: currentUser.branch_id,
            user_id: currentUser.id,
            status: 'pending'
        })

        res.status(201).json({
            success: true,
            message: 'Compra creada exitosamente',
            data: newPurchase
        })

    } catch (error) {
        console.error('Error al crear compra:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Actualizar una compra
const updatePurchase = async (req, res) => {
    try {
        const { id } = req.params
        const updateData = req.body

        const currentUser = req.user
        // El middleware ya verificó que es owner o admin

        const purchase = await Purchase.findByPk(id)
        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Compra no encontrada'
            })
        }

        await purchase.update(updateData)

        res.json({
            success: true,
            message: 'Compra actualizada exitosamente',
            data: purchase
        })

    } catch (error) {
        console.error('Error al actualizar compra:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Eliminar una compra (soft delete)
const deletePurchase = async (req, res) => {
    try {
        const { id } = req.params

        // El middleware ya verificó que es owner o admin
        const purchase = await Purchase.findByPk(id)
        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Compra no encontrada'
            })
        }

        await purchase.destroy()

        res.json({
            success: true,
            message: 'Compra eliminada exitosamente'
        })

    } catch (error) {
        console.error('Error al eliminar compra:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

module.exports = {
    getAllPurchases,
    getPurchaseById,
    createPurchase,
    updatePurchase,
    deletePurchase
}
