const db = require('../database/models')
const { Customer } = db

// Obtener todos los clientes
const getAllCustomers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const offset = (page - 1) * limit

        // Obtener usuario autenticado
        const currentUser = req.user
        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            })
        }

        // Búsqueda opcional por nombre o email (case-insensitive para SQLite)
        const search = req.query.search || ''
        const searchLower = search.toLowerCase()
        let whereClause = search ? {
            [db.Sequelize.Op.or]: [
                db.Sequelize.literal(`LOWER("Customer"."first_name") LIKE '%${searchLower}%'`),
                db.Sequelize.literal(`LOWER("Customer"."last_name") LIKE '%${searchLower}%'`),
                db.Sequelize.literal(`LOWER("Customer"."email") LIKE '%${searchLower}%'`)
            ]
        } : {}

        // Aplicar filtros por sucursal según el rol
        let includeOptions = [
            {
                model: db.Branch,
                as: 'branches',
                attributes: ['id', 'name', 'code'],
                through: { attributes: [] } // No incluir campos de la tabla intermedia
            }
        ]

        if (currentUser.role === 'cashier') {
            // Cajeros solo ven clientes de su sucursal
            includeOptions[0].where = { id: currentUser.branch_id }
        }
        // Supervisor, admin y owner pueden ver todos los clientes (sin filtro adicional)

        const { count, rows } = await Customer.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: includeOptions,
            distinct: true // Importante para contar correctamente con relaciones N:N
        })

        // Obtener los IDs de los clientes
        const customerIds = rows.map(c => c.id)

        // Contar ventas por cliente (solo si hay clientes)
        let salesCounts = []
        if (customerIds.length > 0) {
            salesCounts = await db.Sale.findAll({
                where: {
                    customer_id: { [db.Sequelize.Op.in]: customerIds }
                },
                attributes: [
                    'customer_id',
                    [db.Sequelize.fn('COUNT', db.Sequelize.col('Sale.id')), 'count']
                ],
                group: ['Sale.customer_id'],
                raw: true
            })
        }

        // Crear un mapa de customer_id -> count
        const purchasesMap = {}
        salesCounts.forEach(item => {
            purchasesMap[item.customer_id] = parseInt(item.count) || 0
        })

        // Mapear los resultados para incluir total_purchases
        const customersWithPurchases = rows.map(customer => {
            const customerData = customer.toJSON()
            customerData.total_purchases = purchasesMap[customer.id] || 0
            return customerData
        })

        res.json({
            success: true,
            message: 'Clientes obtenidos exitosamente',
            data: customersWithPurchases,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit)
            }
        })

    } catch (error) {
        console.error('Error al obtener clientes:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Obtener un cliente por ID
const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params

        const customer = await Customer.findByPk(id)

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            })
        }

        res.json({
            success: true,
            message: 'Cliente obtenido exitosamente',
            data: customer
        })

    } catch (error) {
        console.error('Error al obtener cliente:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Obtener detalles completos de un cliente (incluye sucursal)
const getCustomerDetails = async (req, res) => {
    try {
        const { id } = req.params

        // Verificar permisos de visualización
        const currentUser = req.user
        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            })
        }

        const customer = await Customer.findByPk(id, {
            include: [
                {
                    model: db.Branch,
                    as: 'branches',
                    attributes: ['id', 'name', 'code', 'city'],
                    through: { attributes: [] } // No incluir campos de la tabla intermedia
                },
                {
                    model: db.Sale,
                    as: 'sales',
                    attributes: ['id', 'total_amount', 'created_at', 'payment_method'],
                    include: [
                        {
                            model: db.SaleItem,
                            as: 'items',
                            attributes: ['id', 'quantity', 'unit_price'],
                            include: [
                                {
                                    model: db.Product,
                                    as: 'product',
                                    attributes: ['id', 'name', 'sku']
                                }
                            ]
                        }
                    ],
                    order: [['created_at', 'DESC']]
                }
            ]
        })

        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            })
        }

        // Verificar permisos por rol
        if (currentUser.role === 'cashier') {
            // Cajeros solo pueden ver clientes de su sucursal
            const customerBranchIds = customer.branches.map(b => b.id.toString())
            if (!customerBranchIds.includes(currentUser.branch_id.toString())) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver este cliente'
                })
            }
        }
        // Supervisor, admin y owner pueden ver cualquier cliente

        // Calcular estadísticas del cliente
        const customerData = customer.toJSON()
        const sales = customerData.sales || []
        const totalPurchases = sales.length
        const totalSpent = sales.reduce((sum, sale) => sum + parseFloat(sale.total_amount || 0), 0)
        const lastPurchase = sales.length > 0 ? sales[0].created_at : null

        // Agregar estadísticas al objeto del cliente
        customerData.total_purchases = totalPurchases
        customerData.total_spent = totalSpent.toFixed(2)
        customerData.last_purchase = lastPurchase
        customerData.purchases = sales.map(sale => ({
            id: sale.id,
            total: parseFloat(sale.total_amount || 0).toFixed(2),
            total_items: sale.items?.length || 0,
            payment_method: sale.payment_method,
            created_at: sale.created_at
        }))

        res.json({
            success: true,
            message: 'Detalles del cliente obtenidos exitosamente',
            data: customerData
        })

    } catch (error) {
        console.error('Error al obtener detalles del cliente:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Crear un nuevo cliente
const createCustomer = async (req, res) => {
    try {
        const { first_name, last_name, email, phone, address, birth_date, document_type, document_number, notes } = req.body

        // Verificar permisos de creación
        const currentUser = req.user
        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            })
        }

        // Solo cajeros pueden crear clientes
        if (currentUser.role !== 'cashier') {
            return res.status(403).json({
                success: false,
                message: 'Solo cajeros pueden crear clientes'
            })
        }

        // Validaciones básicas
        if (!first_name || !last_name) {
            return res.status(400).json({
                success: false,
                message: 'Nombre y apellido son obligatorios'
            })
        }

        // Verificar si el email ya existe (solo si se proporciona)
        if (email) {
            const existingEmail = await Customer.findOne({ where: { email } })
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está registrado'
                })
            }
        }

        // Verificar si el documento ya existe
        if (document_number) {
            const existingDocument = await Customer.findOne({ where: { document_number } })
            if (existingDocument) {
                return res.status(400).json({
                    success: false,
                    message: 'El número de documento ya está registrado'
                })
            }
        }

        const newCustomer = await Customer.create({
            first_name,
            last_name,
            email,
            phone,
            address,
            birth_date,
            document_type,
            document_number,
            notes
        })

        // Asociar el cliente con la sucursal del usuario que lo crea (relación N:N)
        if (currentUser.branch_id) {
            await newCustomer.addBranch(currentUser.branch_id)
        }

        // Registrar en el log
        await db.Log.create({
            user_id: currentUser.id,
            action: 'create',
            service: 'customer',
            message: `Cliente creado: ${newCustomer.first_name} ${newCustomer.last_name} (${newCustomer.email})`
        });

        res.status(201).json({
            success: true,
            message: 'Cliente creado exitosamente',
            data: newCustomer
        })

    } catch (error) {
        console.error('Error al crear cliente:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Actualizar un cliente
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params
        const updateData = req.body

        // Verificar permisos de actualización
        const currentUser = req.user
        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            })
        }

        // Solo cajeros y supervisores pueden actualizar clientes
        if (!['cashier', 'supervisor'].includes(currentUser.role)) {
            return res.status(403).json({
                success: false,
                message: 'Solo cajeros y supervisores pueden actualizar clientes'
            })
        }

        const customer = await Customer.findByPk(id, {
            include: [{
                model: db.Branch,
                as: 'branches',
                attributes: ['id']
            }]
        })
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            })
        }

        // Verificar que el cliente pertenezca a la sucursal del usuario (solo para cajeros)
        // Los supervisores pueden actualizar cualquier cliente
        if (currentUser.role === 'cashier') {
            const customerBranchIds = customer.branches.map(b => b.id.toString())
            if (!customerBranchIds.includes(currentUser.branch_id.toString())) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes actualizar clientes de tu sucursal'
                })
            }
        }

        // Verificar email duplicado (si se está actualizando)
        if (updateData.email && updateData.email !== customer.email) {
            const existingEmail = await Customer.findOne({
                where: {
                    email: updateData.email,
                    id: { [db.Sequelize.Op.ne]: id }
                }
            })
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está en uso'
                })
            }
        }

        // Verificar documento duplicado (si se está actualizando)
        if (updateData.document_number && updateData.document_number !== customer.document_number) {
            const existingDocument = await Customer.findOne({
                where: {
                    document_number: updateData.document_number,
                    id: { [db.Sequelize.Op.ne]: id }
                }
            })
            if (existingDocument) {
                return res.status(400).json({
                    success: false,
                    message: 'El número de documento ya está en uso'
                })
            }
        }

        await customer.update(updateData)

        res.json({
            success: true,
            message: 'Cliente actualizado exitosamente',
            data: customer
        })

    } catch (error) {
        console.error('Error al actualizar cliente:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Eliminar un cliente (soft delete)
const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params

        // Verificar permisos de eliminación
        const currentUser = req.user
        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            })
        }

        // Solo cajeros y supervisores pueden eliminar clientes
        if (!['cashier', 'supervisor'].includes(currentUser.role)) {
            return res.status(403).json({
                success: false,
                message: 'Solo cajeros y supervisores pueden eliminar clientes'
            })
        }

        const customer = await Customer.findByPk(id, {
            include: [{
                model: db.Branch,
                as: 'branches',
                attributes: ['id']
            }]
        })
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            })
        }

        // Verificar que el cliente pertenezca a la sucursal del usuario (solo para cajeros)
        // Los supervisores pueden eliminar cualquier cliente
        if (currentUser.role === 'cashier') {
            const customerBranchIds = customer.branches.map(b => b.id.toString())
            if (!customerBranchIds.includes(currentUser.branch_id.toString())) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes eliminar clientes de tu sucursal'
                })
            }
        }

        await customer.update({ is_active: false })

        res.json({
            success: true,
            message: 'Cliente eliminado exitosamente'
        })

    } catch (error) {
        console.error('Error al eliminar cliente:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

module.exports = {
    getAllCustomers,
    getCustomerById,
    getCustomerDetails,
    createCustomer,
    updateCustomer,
    deleteCustomer
}
