const db = require('../database/models')
const { Return, Customer, Product, Sale, SaleItem, Inventory, Branch } = db
const { Op } = require('sequelize')

// Obtener todas las devoluciones con filtros, paginación y estadísticas
const getAllReturns = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const offset = (page - 1) * limit

        // Obtener usuario autenticado
        const currentUser = req.user
        
        // Filtros
        const search = req.query.search || ''
        const status = req.query.status || ''
        const startDate = req.query.startDate
        const endDate = req.query.endDate

        const whereClause = {}
        
        // Regla de negocio: Supervisores y admins ven todas las devoluciones
        // (sin filtro por sucursal para facilitar devoluciones desde cualquier sucursal)
        let saleWhereClause = {}

        // Filtro por estado
        if (status) {
            whereClause.status = status
        }

        // Filtro por rango de fechas
        if (startDate && endDate) {
            const start = new Date(startDate)
            start.setHours(0, 0, 0, 0)
            
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)
            
            whereClause.created_at = {
                [Op.between]: [start, end]
            }
        }

        // Construir include con filtros opcionales
        const includeClause = [
            {
                model: Customer,
                as: 'customer',
                attributes: ['id', 'first_name', 'last_name', 'email'],
                required: false
            },
            {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'sku'],
                required: false
            },
            {
                model: Sale,
                as: 'sale',
                attributes: ['id', 'branch_id', 'transaction_reference'],
                where: saleWhereClause,
                required: false, // No requerido para mostrar todas las devoluciones
                include: [
                    {
                        model: Branch,
                        as: 'branch',
                        attributes: ['id', 'name', 'code']
                    }
                ]
            },
            {
                model: db.User,
                as: 'approvedBy',
                attributes: ['id', 'first_name', 'last_name', 'email'],
                required: false
            },
            {
                model: db.User,
                as: 'rejectedBy',
                attributes: ['id', 'first_name', 'last_name', 'email'],
                required: false
            }
        ]

        // Si hay búsqueda, primero obtener IDs que coincidan
        let returnIds = null
        if (search) {
            // Buscar en reason directamente
            const reasonMatches = await Return.findAll({
                where: {
                    reason: { [Op.like]: `%${search}%` }
                },
                attributes: ['id']
            })

            // Buscar en customers
            const customerMatches = await Customer.findAll({
                where: {
                    [Op.or]: [
                        { first_name: { [Op.like]: `%${search}%` } },
                        { last_name: { [Op.like]: `%${search}%` } },
                        { email: { [Op.like]: `%${search}%` } }
                    ]
                },
                attributes: ['id']
            })

            // Buscar returns por customer_id
            const returnsByCustomer = customerMatches.length > 0 ? await Return.findAll({
                where: {
                    customer_id: { [Op.in]: customerMatches.map(c => c.id) }
                },
                attributes: ['id']
            }) : []

            // Buscar en products
            const productMatches = await Product.findAll({
                where: {
                    [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { sku: { [Op.like]: `%${search}%` } }
                    ]
                },
                attributes: ['id']
            })

            // Buscar returns por product_id
            const returnsByProduct = productMatches.length > 0 ? await Return.findAll({
                where: {
                    product_id: { [Op.in]: productMatches.map(p => p.id) }
                },
                attributes: ['id']
            }) : []

            // Combinar todos los IDs
            const allIds = new Set([
                ...reasonMatches.map(r => r.id),
                ...returnsByCustomer.map(r => r.id),
                ...returnsByProduct.map(r => r.id)
            ])

            returnIds = Array.from(allIds)

            // Si hay búsqueda pero no hay resultados, no hacer la query principal
            if (returnIds.length === 0) {
                return res.json({
                    success: true,
                    message: 'Devoluciones obtenidas exitosamente',
                    data: [],
                    statistics: {
                        total: 0,
                        pending: 0,
                        approved: 0,
                        rejected: 0,
                        totalItems: 0
                    },
                    pagination: {
                        total: 0,
                        page,
                        limit,
                        pages: 0
                    }
                })
            }

            // Agregar filtro de IDs al whereClause
            whereClause.id = { [Op.in]: returnIds }
        }

        const { count, rows } = await Return.findAndCountAll({
            where: whereClause,
            include: includeClause,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            distinct: true
        })

        // Calcular estadísticas
        const allReturns = await Return.findAll({
            where: whereClause,
            attributes: ['status', 'quantity']
        })

        const statistics = {
            total: allReturns.length,
            pending: allReturns.filter(r => r.status === 'pending').length,
            approved: allReturns.filter(r => r.status === 'approved').length,
            rejected: allReturns.filter(r => r.status === 'rejected').length,
            totalItems: allReturns.reduce((sum, r) => sum + (r.quantity || 0), 0)
        }

        res.json({
            success: true,
            message: 'Devoluciones obtenidas exitosamente',
            data: rows,
            statistics,
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
        const currentUser = req.user

        const returnItem = await Return.findByPk(id, {
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'sku']
                },
                {
                    model: Sale,
                    as: 'sale',
                    attributes: ['id', 'branch_id'],
                    include: [
                        {
                            model: Branch,
                            as: 'branch',
                            attributes: ['id', 'name', 'code']
                        }
                    ]
                },
                {
                    model: db.User,
                    as: 'approvedBy',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                },
                {
                    model: db.User,
                    as: 'rejectedBy',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                }
            ]
        })

        if (!returnItem) {
            return res.status(404).json({
                success: false,
                message: 'Devolución no encontrada'
            })
        }

        // Regla de negocio: Supervisores y admins pueden ver todas las devoluciones
        // (sin restricción por sucursal para facilitar devoluciones desde cualquier sucursal)

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

// Buscar ventas por referencia de transacción (ticket)
const getSaleByReference = async (req, res) => {
    try {
        const { transaction_reference } = req.query

        if (!transaction_reference) {
            return res.status(400).json({
                success: false,
                message: 'La referencia de transacción es obligatoria'
            })
        }

        const sale = await Sale.findOne({
            where: { transaction_reference },
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                },
                {
                    model: SaleItem,
                    as: 'items',
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'sku', 'unit_price']
                        }
                    ]
                }
            ]
        })

        if (!sale) {
            return res.status(404).json({
                success: false,
                message: 'No se encontró una venta con esa referencia'
            })
        }

        res.json({
            success: true,
            message: 'Venta encontrada',
            data: sale
        })

    } catch (error) {
        console.error('Error al buscar venta:', error)
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
        const { sale_id, sale_item_id, customer_id, product_id, quantity, reason, status } = req.body

        if (!sale_id || !sale_item_id || !customer_id || !product_id || !quantity || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Venta, item de venta, cliente, producto, cantidad y razón son obligatorios'
            })
        }

        // Verificar que la venta existe
        const sale = await Sale.findByPk(sale_id)
        if (!sale) {
            return res.status(400).json({
                success: false,
                message: 'La venta especificada no existe'
            })
        }

        // Verificar que el item de venta existe y pertenece a la venta
        const saleItem = await SaleItem.findOne({
            where: {
                id: sale_item_id,
                sale_id: sale_id,
                product_id: product_id
            }
        })

        if (!saleItem) {
            return res.status(400).json({
                success: false,
                message: 'El producto no se encontró en esta venta'
            })
        }

        // Verificar que la cantidad no exceda la cantidad comprada
        if (quantity > saleItem.quantity) {
            return res.status(400).json({
                success: false,
                message: `La cantidad a devolver (${quantity}) no puede ser mayor a la cantidad comprada (${saleItem.quantity})`
            })
        }

        // Verificar que el cliente de la venta coincida
        if (sale.customer_id !== customer_id) {
            return res.status(400).json({
                success: false,
                message: 'El cliente no coincide con el de la venta'
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
            sale_id,
            sale_item_id,
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
    const transaction = await db.sequelize.transaction()
    
    try {
        const { id } = req.params
        const updateData = req.body

        const returnItem = await Return.findByPk(id, {
            include: [
                { model: Sale, as: 'sale' }
            ]
        })
        
        if (!returnItem) {
            await transaction.rollback()
            return res.status(404).json({
                success: false,
                message: 'Devolución no encontrada'
            })
        }

        const previousStatus = returnItem.status
        const newStatus = updateData.status

        // Validar que no se puede modificar una devolución aprobada
        if (previousStatus === 'approved' && newStatus !== 'approved') {
            await transaction.rollback()
            return res.status(400).json({
                success: false,
                message: 'No se puede modificar una devolución que ya ha sido aprobada. Los cambios en el inventario no se pueden revertir.',
                cannotRevert: true
            })
        }

        // Si se está aprobando la devolución (cambio a 'approved')
        if (previousStatus !== 'approved' && newStatus === 'approved') {
            // Obtener información de la venta para obtener el branch_id
            const sale = await Sale.findByPk(returnItem.sale_id)
            
            if (!sale) {
                await transaction.rollback()
                return res.status(400).json({
                    success: false,
                    message: 'No se encontró la venta asociada'
                })
            }

            // Buscar el inventario del producto en la sucursal
            const inventory = await Inventory.findOne({
                where: {
                    product_id: returnItem.product_id,
                    branch_id: sale.branch_id
                }
            })

            if (!inventory) {
                await transaction.rollback()
                return res.status(400).json({
                    success: false,
                    message: 'No se encontró el inventario del producto en esta sucursal'
                })
            }

            // Incrementar el stock
            const newStock = parseInt(inventory.stock_current) + parseInt(returnItem.quantity)
            await inventory.update({
                stock_current: newStock,
                updated_at: new Date()
            }, { transaction })

            console.log(`Inventario actualizado: Producto ${returnItem.product_id} - Stock anterior: ${inventory.stock_current} - Stock nuevo: ${newStock}`)
            
            // Registrar quién aprobó la devolución
            updateData.approved_by = req.user.id
        }

        // Si se está rechazando la devolución (cambio a 'rejected')
        if (previousStatus !== 'rejected' && newStatus === 'rejected') {
            // Registrar quién rechazó la devolución
            updateData.rejected_by = req.user.id
            // rejection_reason debe venir en updateData desde el frontend
        }

        // Actualizar la devolución
        await returnItem.update(updateData, { transaction })

        await transaction.commit()

        res.json({
            success: true,
            message: 'Devolución actualizada exitosamente' + 
                     (newStatus === 'approved' && previousStatus !== 'approved' ? ' e inventario actualizado' : ''),
            data: returnItem
        })

    } catch (error) {
        await transaction.rollback()
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
    getSaleByReference,
    createReturn,
    updateReturn,
    deleteReturn
}
