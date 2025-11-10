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

        // Búsqueda opcional por nombre o email
        const search = req.query.search || ''
        let whereClause = search ? {
            [db.Sequelize.Op.or]: [
                { first_name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
                { last_name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
                { email: { [db.Sequelize.Op.iLike]: `%${search}%` } }
            ]
        } : {}

        // Aplicar filtros por sucursal según el rol
        if (currentUser.role === 'cashier' || currentUser.role === 'supervisor') {
            // Cajeros y supervisores solo ven clientes de su sucursal
            whereClause.branch_id = currentUser.branch_id
        }
        // Admin y owner pueden ver todos los clientes (sin filtro adicional)

        const { count, rows } = await Customer.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: db.Branch,
                    as: 'Branch',
                    attributes: ['id', 'name', 'code']
                }
            ]
        })

        res.json({
            success: true,
            message: 'Clientes obtenidos exitosamente',
            data: rows,
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
                    as: 'Branch',
                    attributes: ['id', 'name', 'code', 'city']
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
        if (['cashier', 'supervisor'].includes(currentUser.role)) {
            // Cajeros y supervisores solo pueden ver clientes de su sucursal
            if (customer.branch_id !== currentUser.branch_id) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver este cliente'
                })
            }
        }
        // Admin y owner pueden ver cualquier cliente

        res.json({
            success: true,
            message: 'Detalles del cliente obtenidos exitosamente',
            data: customer
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

        // Solo cajeros y supervisores pueden crear clientes
        if (!['cashier', 'supervisor'].includes(currentUser.role)) {
            return res.status(403).json({
                success: false,
                message: 'Solo cajeros y supervisores pueden crear clientes'
            })
        }

        // Validaciones básicas
        if (!first_name || !last_name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, apellido y email son obligatorios'
            })
        }

        // Verificar si el email ya existe
        const existingEmail = await Customer.findOne({ where: { email } })
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            })
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
            notes,
            branch_id: currentUser.branch_id // Asignar la sucursal del usuario que crea
        })

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

        const customer = await Customer.findByPk(id)
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            })
        }

        // Verificar que el cliente pertenezca a la sucursal del usuario
        if (customer.branch_id !== currentUser.branch_id) {
            return res.status(403).json({
                success: false,
                message: 'Solo puedes actualizar clientes de tu sucursal'
            })
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

        const customer = await Customer.findByPk(id)
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            })
        }

        // Verificar que el cliente pertenezca a la sucursal del usuario
        if (customer.branch_id !== currentUser.branch_id) {
            return res.status(403).json({
                success: false,
                message: 'Solo puedes eliminar clientes de tu sucursal'
            })
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