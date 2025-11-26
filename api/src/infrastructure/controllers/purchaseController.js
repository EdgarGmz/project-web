const db = require('../database/models')
const { Purchase } = db
const { logPurchase } = require('../../services/logService')

// Obtener todas las compras
const getAllPurchases = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const offset = (page - 1) * limit

        // El middleware ya verificó que es owner o admin
        let whereClause = {}

        // Filtros opcionales
        const { branch_id, user_id, status } = req.query
        if (branch_id) whereClause.branch_id = branch_id
        if (user_id) whereClause.user_id = user_id
        if (status) whereClause.status = status

        const { count, rows } = await Purchase.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: db.Branch,
                    as: 'Branch',
                    attributes: ['id', 'name', 'code']
                },
                {
                    model: db.User,
                    as: 'User',
                    attributes: ['id', 'first_name', 'last_name']
                }
            ]
        })

        // Registrar log de visualización
        if (req.user?.id) {
            await logPurchase.view(req.user.id, `Visualización de lista de compras (${count} registros)`)
        }

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
                    as: 'Branch',
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

        // Registrar log de visualización
        if (req.user?.id) {
            await logPurchase.view(req.user.id, `Visualización de compra: ${purchase.supplier_name} - ${purchase.invoice_number || 'Sin factura'}`)
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
        const { 
            supplier_name, 
            supplier_contact, 
            supplier_phone, 
            total_amount, 
            purchase_date, 
            invoice_number,
            notes,
            status 
        } = req.body
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
            supplier_contact: supplier_contact || null,
            supplier_phone: supplier_phone || null,
            total_amount,
            purchase_date: purchase_date || new Date(),
            invoice_number: invoice_number || null,
            notes: notes || null,
            branch_id: currentUser.branch_id,
            user_id: currentUser.id,
            status: status || 'pending'
        })

        // Registrar log de creación
        await logPurchase.create(
            currentUser.id,
            `Compra creada: ${supplier_name} - Monto: $${total_amount} - Factura: ${invoice_number || 'Sin factura'}`
        )

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

        const oldStatus = purchase.status
        const oldSupplier = purchase.supplier_name
        const oldAmount = purchase.total_amount
        
        await purchase.update(updateData)
        await purchase.reload()

        // Registrar log de actualización
        const changes = []
        if (updateData.supplier_name && updateData.supplier_name !== oldSupplier) {
            changes.push(`Proveedor: ${oldSupplier} → ${updateData.supplier_name}`)
        }
        if (updateData.total_amount && Number(updateData.total_amount) !== Number(oldAmount)) {
            changes.push(`Monto: $${oldAmount} → $${updateData.total_amount}`)
        }
        if (updateData.status && updateData.status !== oldStatus) {
            changes.push(`Estado: ${oldStatus} → ${updateData.status}`)
        }
        
        await logPurchase.update(
            currentUser.id,
            `Compra actualizada: ${purchase.supplier_name} - ${changes.length > 0 ? changes.join(', ') : 'Datos modificados'}`
        )

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

        const purchaseInfo = `${purchase.supplier_name} - ${purchase.invoice_number || 'Sin factura'} - Monto: $${purchase.total_amount}`
        await purchase.destroy()

        // Registrar log de eliminación
        await logPurchase.delete(
            req.user?.id || null,
            `Compra eliminada: ${purchaseInfo}`
        )

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
