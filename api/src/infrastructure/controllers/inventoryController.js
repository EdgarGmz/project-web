const db = require('../database/models')
const { Inventory, Product, Branch } = db

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

        const { count, rows } = await Inventory.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['updated_at', 'DESC']],
            include: [
                {
                    model: Product,
                    as: 'Product',
                    attributes: ['id', 'name', 'sku', 'min_stock', 'max_stock']
                },
                {
                    model: Branch,
                    as: 'Branch',
                    attributes: ['id', 'name', 'address']
                }
            ]
        })

        // Filtrar por stock bajo si se solicita
        let filteredRows = rows
        if (low_stock) {
            filteredRows = rows.filter(item =>
                item.quantity <= (item.Product?.min_stock || 0)
            )
        }

        res.json({
            success: true,
            message: 'Inventario obtenido exitosamente',
            data: filteredRows,
            pagination: {
                total: low_stock ? filteredRows.length : count,
                page,
                limit,
                pages: Math.ceil((low_stock ? filteredRows.length : count) / limit)
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
                    as: 'Product',
                    attributes: ['id', 'name', 'sku', 'min_stock', 'max_stock']
                },
                {
                    model: Branch,
                    as: 'Branch',
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

        // Verificar que no existe ya un inventario para este producto en esta sucursal
        const existingInventory = await Inventory.findOne({
            where: { product_id, branch_id }
        })
        if (existingInventory) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe inventario para este producto en esta sucursal'
            })
        }

        const newInventory = await Inventory.create({
            product_id,
            branch_id,
            quantity: parseInt(quantity),
            min_stock: parseInt(min_stock) || product.min_stock,
            notes
        })

        // Incluir relaciones en la respuesta
        const inventoryWithRelations = await Inventory.findByPk(newInventory.id, {
            include: [
                {
                    model: Product,
                    as: 'Product',
                    attributes: ['id', 'name', 'sku']
                },
                {
                    model: Branch,
                    as: 'Branch',
                    attributes: ['id', 'name']
                }
            ]
        })

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

        await inventory.update(updateData)

        // Incluir relaciones en la respuesta
        const updatedInventory = await Inventory.findByPk(id, {
            include: [
                {
                    model: Product,
                    as: 'Product',
                    attributes: ['id', 'name', 'sku']
                },
                {
                    model: Branch,
                    as: 'Branch',
                    attributes: ['id', 'name']
                }
            ]
        })

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

        const inventory = await Inventory.findByPk(id)
        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Item de inventario no encontrado'
            })
        }

        await inventory.destroy()

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

        const newQuantity = inventory.quantity + parseInt(adjustment)
        if (newQuantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'El ajuste resultaría en cantidad negativa'
            })
        }

        await inventory.update({
            quantity: newQuantity
        })

        res.json({
            success: true,
            message: 'Stock ajustado exitosamente',
            data: {
                previous_quantity: inventory.quantity,
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