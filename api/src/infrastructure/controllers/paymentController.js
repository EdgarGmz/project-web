const db = require('../database/models')
const { Payment, Customer } = db

// Obtener todos los pagos
const getAllPayments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const offset = (page - 1) * limit

        // Búsqueda opcional por referencia o método (case-insensitive para SQLite)
        const search = req.query.search || ''
        const searchLower = search.toLowerCase()
        const whereClause = search ? {
            [db.Sequelize.Op.or]: [
                db.Sequelize.literal(`LOWER("Payment"."reference") LIKE '%${searchLower}%'`),
                db.Sequelize.literal(`LOWER("Payment"."method") LIKE '%${searchLower}%'`)
            ]
        } : {}

        const { count, rows } = await Payment.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                }
            ]
        })

        res.json({
            success: true,
            message: 'Pagos obtenidos exitosamente',
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit)
            }
        })

    } catch (error) {
        console.error('Error al obtener pagos:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Obtener un pago por ID
const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params

        const payment = await Payment.findByPk(id, {
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                }
            ]
        })

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Pago no encontrado'
            })
        }

        res.json({
            success: true,
            message: 'Pago obtenido exitosamente',
            data: payment
        })

    } catch (error) {
        console.error('Error al obtener pago:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Crear un nuevo pago
const createPayment = async (req, res) => {
    try {
        const { customer_id, amount, method, reference, status, notes } = req.body

        if (!customer_id || !amount || !method) {
            return res.status(400).json({
                success: false,
                message: 'Cliente, monto y método de pago son obligatorios'
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

        // Verificar referencia única si se proporciona
        if (reference) {
            const existingReference = await Payment.findOne({ where: { reference } })
            if (existingReference) {
                return res.status(400).json({
                    success: false,
                    message: 'La referencia de pago ya está registrada'
                })
            }
        }

        const newPayment = await Payment.create({
            customer_id,
            amount,
            method,
            reference,
            status: status || 'pending',
            notes
        })

        res.status(201).json({
            success: true,
            message: 'Pago creado exitosamente',
            data: newPayment
        })

    } catch (error) {
        console.error('Error al crear pago:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Actualizar un pago
const updatePayment = async (req, res) => {
    try {
        const { id } = req.params
        const updateData = req.body

        const payment = await Payment.findByPk(id)
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Pago no encontrado'
            })
        }

        // Verificar referencia única si se actualiza
        if (updateData.reference && updateData.reference !== payment.reference) {
            const existingReference = await Payment.findOne({
                where: {
                    reference: updateData.reference,
                    id: { [db.Sequelize.Op.ne]: id }
                }
            })
            if (existingReference) {
                return res.status(400).json({
                    success: false,
                    message: 'La referencia de pago ya está en uso'
                })
            }
        }

        await payment.update(updateData)

        res.json({
            success: true,
            message: 'Pago actualizado exitosamente',
            data: payment
        })

    } catch (error) {
        console.error('Error al actualizar pago:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Eliminar un pago
const deletePayment = async (req, res) => {
    try {
        const { id } = req.params

        const payment = await Payment.findByPk(id)
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Pago no encontrado'
            })
        }

        await payment.destroy()

        res.json({
            success: true,
            message: 'Pago eliminado exitosamente'
        })

    } catch (error) {
        console.error('Error al eliminar pago:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

module.exports = {
    getAllPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment
}
