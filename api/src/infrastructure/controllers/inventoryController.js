const db = require('../database/models')
const { Inventory, Product, Branch } = db
const { logInventory } = require('../../services/logService')

// Obtener todo el inventario
const getAllInventory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const offset = (page - 1) * limit

        // Filtros opcionales
        const branch_id = req.query.branch_id
        const product_id = req.query.product_id
        const low_stock = req.query.low_stock === 'true'

        let whereClause = {}
        if (branch_id) whereClause.branch_id = branch_id
        if (product_id) whereClause.product_id = product_id

        // Configurar includes
        let includeOptions = [
            {
                model: Product,
                as: 'product',
                attributes: ['id', 'name', 'sku', 'min_stock', 'max_stock'],
                required: low_stock // Si filtra por low_stock, requiere que exista el producto
            },
            {
                model: Branch,
                as: 'branch',
                attributes: ['id', 'name', 'address']
            }
        ]

        // Si se filtra por stock bajo, agregar condición usando Sequelize.col
        if (low_stock) {
            whereClause[db.Sequelize.Op.and] = [
                db.Sequelize.where(
                    db.Sequelize.col('Inventory.stock_current'),
                    db.Sequelize.Op.lte,
                    db.Sequelize.fn('COALESCE', db.Sequelize.col('product.min_stock'), 0)
                )
            ]
        }

        const { count, rows } = await Inventory.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['updated_at', 'DESC']],
            include: includeOptions,
            distinct: true // Importante para contar correctamente con joins
        })

        // Registrar log de visualización
        if (req.user?.id) {
            await logInventory.view(
                req.user.id,
                `Visualización de lista de inventario (${count} registros)`
            )
        }

        res.json({
            success: true,
            message: 'Inventario obtenido exitosamente',
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit)
            }
        })

    } catch (error) {
        console.error('Error al obtener inventario:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Obtener un item de inventario por ID
const getInventoryById = async (req, res) => {
    try {
        const { id } = req.params

        const inventory = await Inventory.findByPk(id, {
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'sku', 'min_stock', 'max_stock']
                },
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'name', 'address']
                }
            ]
        })

        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Item de inventario no encontrado'
            })
        }

        res.json({
            success: true,
            message: 'Item de inventario obtenido exitosamente',
            data: inventory
        })

    } catch (error) {
        console.error('Error al obtener item de inventario:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Crear un nuevo item de inventario

const createInventory = async (req, res) => {
    try {
        const { product_id, branch_id, quantity, min_stock, notes } = req.body
        const currentUser = req.user

        // Validaciones básicas
        if (!product_id || !branch_id || quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Product ID, Branch ID y cantidad son obligatorios'
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

        // Verificar que la sucursal existe
        const branch = await Branch.findByPk(branch_id)
        if (!branch) {
            return res.status(400).json({
                success: false,
                message: 'La sucursal especificada no existe'
            })
        }

        // Verificar si es CEDIS
        const isCedis = branch.code === 'CEDIS-000'

        // Verificar si ya existe inventario para este producto en esta sucursal
        const existingInventory = await Inventory.findOne({
            where: { product_id, branch_id }
        })

        // Si es admin creando inventario en CEDIS, actualizar o crear stock
        if (currentUser?.role === 'admin' && isCedis) {
            if (existingInventory) {
                // Si ya existe, actualizar stock sumando la cantidad
                const newStock = parseFloat(existingInventory.stock_current) + parseFloat(quantity)
                await existingInventory.update({
                    stock_current: newStock,
                    stock_minimum: min_stock !== undefined ? parseInt(min_stock) : existingInventory.stock_minimum,
                    notes: notes || existingInventory.notes
                })

                const updatedInventory = await Inventory.findByPk(existingInventory.id, {
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'sku']
                        },
                        {
                            model: Branch,
                            as: 'branch',
                            attributes: ['id', 'name']
                        }
                    ]
                })

                // Registrar log de actualización
                if (req.user?.id) {
                    await logInventory.update(
                        req.user.id,
                        `Stock actualizado en CEDIS: ${updatedInventory.product?.name || 'Producto'} - Cantidad agregada: ${quantity} - Stock total: ${newStock}`
                    )
                }

                return res.status(200).json({
                    success: true,
                    message: 'Stock actualizado exitosamente en CEDIS',
                    data: updatedInventory
                })
            } else {
                // Si no existe, crear nuevo inventario en CEDIS
                const newInventory = await Inventory.create({
                    product_id,
                    branch_id,
                    stock_current: parseInt(quantity),
                    stock_minimum: parseInt(min_stock) || product.min_stock,
                    notes: notes || `Inventario creado por admin en CEDIS`
                })

                const inventoryWithRelations = await Inventory.findByPk(newInventory.id, {
                    include: [
                        {
                            model: Product,
                            as: 'product',
                            attributes: ['id', 'name', 'sku']
                        },
                        {
                            model: Branch,
                            as: 'branch',
                            attributes: ['id', 'name']
                        }
                    ]
                })

                // Registrar log de creación
                if (req.user?.id) {
                    await logInventory.create(
                        req.user.id,
                        `Inventario creado en CEDIS: ${inventoryWithRelations.product?.name || 'Producto'} - Stock inicial: ${newInventory.stock_current}`
                    )
                }

                return res.status(201).json({
                    success: true,
                    message: 'Inventario creado exitosamente en CEDIS',
                    data: inventoryWithRelations
                })
            }
        }

        // Si ya existe inventario y no es admin en CEDIS, rechazar
        if (existingInventory) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe inventario para este producto en esta sucursal'
            })
        }

        // Validación para admin: no puede asignar más de lo disponible en CEDIS
        if (currentUser?.role === 'admin' && !isCedis) {
            // Buscar stock disponible en CEDIS
            const cedisBranch = await Branch.findOne({ where: { code: 'CEDIS-000' } })
            if (cedisBranch) {
                const cedisInventory = await Inventory.findOne({
                    where: {
                        product_id,
                        branch_id: cedisBranch.id
                    }
                })

                const availableStock = cedisInventory ? parseFloat(cedisInventory.stock_current) : 0
                const requestedQuantity = parseFloat(quantity) || 0

                if (requestedQuantity > availableStock) {
                    return res.status(400).json({
                        success: false,
                        message: `No puedes asignar más de lo disponible en CEDIS. Stock disponible en CEDIS: ${availableStock} unidades. Intentaste asignar: ${requestedQuantity} unidades.`
                    })
                }
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'No se encontró la sucursal CEDIS. No se puede crear inventario sin stock en CEDIS.'
                })
            }
        }

        // Crear nuevo inventario
        const newInventory = await Inventory.create({
            product_id,
            branch_id,
            stock_current: parseInt(quantity),
            stock_minimum: parseInt(min_stock) || product.min_stock,
            notes
        })

        // Incluir relaciones en la respuesta
        const inventoryWithRelations = await Inventory.findByPk(newInventory.id, {
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'sku']
                },
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'name']
                }
            ]
        })

        // Registrar log de creación
        if (req.user?.id) {
            await logInventory.create(
                req.user.id,
                `Inventario creado: ${inventoryWithRelations.product?.name || 'Producto'} - Sucursal: ${inventoryWithRelations.branch?.name || 'N/A'} - Stock: ${newInventory.stock_current}`
            )
        }

        res.status(201).json({
            success: true,
            message: 'Item de inventario creado exitosamente',
            data: inventoryWithRelations
        })

    } catch (error) {
        console.error('Error al crear item de inventario:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Actualizar un item de inventario
const updateInventory = async (req, res) => {
    try {
        const { id } = req.params
        const updateData = req.body

        const inventory = await Inventory.findByPk(id)
        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Item de inventario no encontrado'
            })
        }

        // Validar que la cantidad no sea negativa
        if (updateData.quantity !== undefined && updateData.quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'La cantidad no puede ser negativa'
            })
        }

        // Mapear quantity a stock_current si está presente
        if (updateData.quantity !== undefined) {
            updateData.stock_current = updateData.quantity;
            delete updateData.quantity;
        }
        // Mapear min_stock a stock_minimum si está presente
        if (updateData.min_stock !== undefined) {
            updateData.stock_minimum = updateData.min_stock;
            delete updateData.min_stock;
        }


        await inventory.update(updateData)

        // Incluir relaciones en la respuesta
        const updatedInventory = await Inventory.findByPk(id, {
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'sku']
                },
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'name']
                }
            ]
        })

        // Registrar log de actualización
        if (req.user?.id) {
            await logInventory.update(
                req.user.id,
                `Inventario actualizado: ${updatedInventory.product?.name || 'Producto'} - Sucursal: ${updatedInventory.branch?.name || 'N/A'} - Stock: ${updatedInventory.stock_current}`
            )
        }

        res.json({
            success: true,
            message: 'Item de inventario actualizado exitosamente',
            data: updatedInventory
        })

    } catch (error) {
        console.error('Error al actualizar item de inventario:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Eliminar un item de inventario
const deleteInventory = async (req, res) => {
    try {
        const { id } = req.params

        const inventory = await Inventory.findByPk(id, {
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'sku']
                },
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'name']
                }
            ]
        })
        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Item de inventario no encontrado'
            })
        }

        const productName = inventory.product?.name || 'Producto'
        const branchName = inventory.branch?.name || 'N/A'

        await inventory.destroy()

        // Registrar log de eliminación
        if (req.user?.id) {
            await logInventory.delete(
                req.user.id,
                `Inventario eliminado: ${productName} - Sucursal: ${branchName} - Stock: ${inventory.stock_current}`
            )
        }

        res.json({
            success: true,
            message: 'Item de inventario eliminado exitosamente'
        })

    } catch (error) {
        console.error('Error al eliminar item de inventario:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Ajustar stock de inventario
const adjustStock = async (req, res) => {
    try {
        const { id } = req.params
        const { adjustment, reason } = req.body

        if (adjustment === undefined || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Ajuste y razón son obligatorios'
            })
        }

        const inventory = await Inventory.findByPk(id)
        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Item de inventario no encontrado'
            })
        }

        const newQuantity = inventory.stock_current + parseInt(adjustment)
        if (newQuantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'El ajuste resultaría en cantidad negativa'
            })
        }

        // Obtener información del producto y sucursal antes de actualizar
        const inventoryWithRelations = await Inventory.findByPk(id, {
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'sku']
                },
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'name']
                }
            ]
        })

        const previousQuantity = inventory.stock_current

        await inventory.update({
            stock_current: newQuantity
        })

        // Registrar log de ajuste de stock
        if (req.user?.id) {
            await logInventory.update(
                req.user.id,
                `Stock ajustado: ${inventoryWithRelations.product?.name || 'Producto'} - Sucursal: ${inventoryWithRelations.branch?.name || 'N/A'} - Anterior: ${previousQuantity}, Nuevo: ${newQuantity}, Ajuste: ${adjustment > 0 ? '+' : ''}${adjustment} - Razón: ${reason}`
            )
        }

        res.json({
            success: true,
            message: 'Stock ajustado exitosamente',
            data: {
                previous_quantity: previousQuantity,
                current_quantity: newQuantity,
                adjustment: parseInt(adjustment),
                reason
            }
        })

    } catch (error) {
        console.error('Error al ajustar stock:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

module.exports = {
    getAllInventory,
    getInventoryById,
    createInventory,
    updateInventory,
    deleteInventory,
    adjustStock
}
