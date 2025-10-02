const db = require('../infrastructure/database/models')
const { Sale, SaleItem, Product, Customer, User, Branch, Inventory } = db

// Obtener todas las ventas
const getAllSales = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const offset = (page - 1) * limit

        // Filtros opcionales
        const branch_id = req.query.branch_id
        const user_id = req.query.user_id
        const customer_id = req.query.customer_id
        const date_from = req.query.date_from
        const date_to = req.query.date_to

        let whereClause = {}
        if (branch_id) whereClause.branch_id = branch_id
        if (user_id) whereClause.user_id = user_id
        if (customer_id) whereClause.customer_id = customer_id
        
        if (date_from || date_to) {
            whereClause.created_at = {}
            if (date_from) whereClause.created_at[db.Sequelize.Op.gte] = new Date(date_from)
            if (date_to) whereClause.created_at[db.Sequelize.Op.lte] = new Date(date_to)
        }

        const { count, rows } = await Sale.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'email']
                },
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'name']
                },
                {
                    model: SaleItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'sku']
                        }
                    ]
                }
            ]
        })

        res.json({
            success: true,
            message: 'Ventas obtenidas exitosamente',
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit)
            }
        })

    } catch (error) {
        console.error('Error al obtener ventas:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}


// Obtener una venta por ID
const getSaleById = async (req, res) => {
    try {
        const { id } = req.params

        const sale = await Sale.findByPk(id, {
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'name', 'email', 'phone']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'email']
                },
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'name', 'address']
                },
                {
                    model: SaleItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'sku', 'price']
                        }
                    ]
                }
            ]
        })

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Venta no encontrada'
            })
        }

        res.json({
            success: true,
            message: 'Venta obtenida exitosamente',
            data: sale
        })

    } catch (error) {
        console.error('Error al obtener venta:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}


// Crear una nueva venta

const createSale = async (req, res) => {
    const transaction = await db.sequelize.transaction()
    
    try {
        const { customer_id, user_id, branch_id, payment_method, items } = req.body

        // Validaciones básicas
        if (!user_id || !branch_id || !items || !Array.isArray(items) || items.length === 0) {
            await transaction.rollback()
            return res.status(400).json({
                success: false,
                message: 'User ID, Branch ID y items son obligatorios'
            })
        }

        // Verificar que el usuario existe
        const user = await User.findByPk(user_id)
        if (!user) {
            await transaction.rollback()
            return res.status(400).json({
                success: false,
                message: 'El usuario especificado no existe'
            })
        }

        // Verificar que la sucursal existe
        const branch = await Branch.findByPk(branch_id)
        if (!branch) {
            await transaction.rollback()
            return res.status(400).json({
                success: false,
                message: 'La sucursal especificada no existe'
            })
        }

        // Verificar customer si se proporciona
        if (customer_id) {
            const customer = await Customer.findByPk(customer_id)
            if (!customer) {
                await transaction.rollback()
                return res.status(400).json({
                    success: false,
                    message: 'El cliente especificado no existe'
                })
            }
        }

        // Validar y calcular items
        let totalAmount = 0
        const validatedItems = []

        for (const item of items) {
            const { product_id, quantity, unit_price } = item

            if (!product_id || !quantity || quantity <= 0) {
                await transaction.rollback()
                return res.status(400).json({
                    success: false,
                    message: 'Todos los items deben tener product_id y quantity válidos'
                })
            }

            // Verificar que el producto existe
            const product = await Product.findByPk(product_id)
            if (!product) {
                await transaction.rollback()
                return res.status(400).json({
                    success: false,
                    message: `El producto con ID ${product_id} no existe`
                })
            }

            // Verificar inventario disponible
            const inventory = await Inventory.findOne({
                where: { product_id, branch_id }
            })

            if (!inventory || inventory.current_stock < quantity) {
                await transaction.rollback()
                return res.status(400).json({
                    success: false,
                    message: `Stock insuficiente para el producto ${product.name}`
                })
            }

            const finalPrice = unit_price || product.price
            const subtotal = finalPrice * quantity

            validatedItems.push({
                product_id,
                quantity,
                unit_price: finalPrice,
                subtotal
            })

            totalAmount += subtotal
        }

        // Crear la venta
        const newSale = await Sale.create({
            customer_id,
            user_id,
            branch_id,
            total_amount: totalAmount,
            payment_method: payment_method || 'cash'
        }, { transaction })

        // Crear los items de venta y actualizar inventario
        for (const item of validatedItems) {
            // Crear item de venta
            await SaleItem.create({
                sale_id: newSale.id,
                product_id: item.product_id,
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: item.subtotal
            }, { transaction })

            // Actualizar inventario
            await Inventory.decrement('current_stock', {
                by: item.quantity,
                where: {
                    product_id: item.product_id,
                    branch_id
                },
                transaction
            })
        }

        await transaction.commit()

        // Obtener la venta completa con relaciones
        const saleWithRelations = await Sale.findByPk(newSale.id, {
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username']
                },
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'name']
                },
                {
                    model: SaleItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'sku']
                        }
                    ]
                }
            ]
        })

        res.status(201).json({
            success: true,
            message: 'Venta creada exitosamente',
            data: saleWithRelations
        })

    } catch (error) {
        await transaction.rollback()
        console.error('Error al crear venta:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}


// Actualizar una venta (solo campos limitados)

const updateSale = async (req, res) => {
    try {
        const { id } = req.params
        const { customer_id, payment_method } = req.body

        const sale = await Sale.findByPk(id)
        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'Venta no encontrada'
            })
        }

        // Solo permitir actualizar campos específicos
        const updateData = {}
        if (customer_id !== undefined) updateData.customer_id = customer_id
        if (payment_method !== undefined) updateData.payment_method = payment_method

        await sale.update(updateData)

        res.json({
            success: true,
            message: 'Venta actualizada exitosamente',
            data: sale
        })

    } catch (error) {
        console.error('Error al actualizar venta:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}


// Cancelar una venta (restaurar inventario)

const cancelSale = async (req, res) => {
    const transaction = await db.sequelize.transaction()

    try {
        const { id } = req.params

        const sale = await Sale.findByPk(id, {
            include: [
                {
                    model: SaleItem,
                    as: 'items'
                }
            ]
        })

        if (!sale) {
            await transaction.rollback()
            return res.status(404).json({
                success: false,
                message: 'Venta no encontrada'
            })
        }

        // Restaurar inventario
        for (const item of sale.items) {
            await Inventory.increment('current_stock', {
                by: item.quantity,
                where: {
                    product_id: item.product_id,
                    branch_id: sale.branch_id
                },
                transaction
            })
        }

        // Marcar venta como cancelada
        await sale.update({ status: 'cancelled' }, { transaction })

        await transaction.commit()

        res.json({
            success: true,
            message: 'Venta cancelada exitosamente'
        })

    } catch (error) {
        await transaction.rollback()
        console.error('Error al cancelar venta:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

module.exports = {
    getAllSales,
    getSaleById,
    createSale,
    updateSale,
    cancelSale
}