const db = require('../infrastructure/database/models')
const { Product } = db

// CONTROLADOR DE PRODUCTOS

// Obtener todos los productos
const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const offset = (page - 1) * limit

        // Busqueda Opcional
        const search = req.query.search || ''
        const whereClause = search ? {
            name: {
                [db.Sequelize.Op.like]: `%${search}%`
            }
        } : {}

        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['createdAt', 'DESC']],

            // Incluir asociaciones si las tienes
            // include: [
            //     { model: Category, as: 'category' }
            // ]

        })

        res.json({
            succes: true,
            message: 'Productos obtenidos exitosamente',
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                page: Math.ceil(count / limit)
            }
        })
    } catch (error) {
        console.error('Error al obtener productos:', error)
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos',
            error: error.message
        })
    }
}

// Obtener un producto por ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params

        const product = await Product.findByPk(id, {
            // include: [
            //     { model: Category, as: 'category' },
            //     { model: Inventory, as: 'inventories' }
            // ]
        })

        if (product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            })
        }

        res.json({
            succes: true,
            message: 'Producto obtenido exitosamente',
            data: product
        })
        
    } catch (error) {
        console.error('Error al obtener producto:', error)
        res.status(500).json({
            success: false,
            message: 'Error al obtener producto',
            error: error.message
        })
    }
}

// Crear un nuevo producto
const createProduct = async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            cost,
            sku,
            barcode,
            category_id,
            unit_of_measure,
            minimum_stock,
            maximum_stock,
            is_active
        } = req.body

        // Validaciones basicas
        if (!name || !price) {
            return res.status(400).json({
                success: false,
                message: 'Nombre y precio son obligatorios'
            })
        }

        // Verificar si el SKU ya existe
        if (sku) {
            const existingSku = await Product.findOne({ where: { sku } })
            if (existingSku) {
                return res.status(400).json({
                    success: false,
                    message: 'El SKU ya esta en uso'
                })
            }
        }

        const newProduct = await Product.create({
            name,
            description,
            price: parseFloat(price),
            cost: cost ? parseFloat(cost) : null,
            sku,
            barcode,
            category_id,
            unit_of_measure: unit_of_measure || 'unit',
            minimum_stock: minimum_stock || 0,
            maximum_stock: maximum_stock || null,
            is_active: is_active !== false
        })

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: newProduct
        })

        
    } catch (error) {
        console.error('Error al crear producto: ', error)
        res.status(500).json({
            success: false,
            message: 'Error al crear producto',
            error: error.message
        })
    }
}

// Actualizar un producto existente
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params
        const updateData = req.body

        // Buscar el producto 
        const product = await Product.findByPk(id)
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            })
        }

        // Verificar SKU duplicado (si se esta actualizando)
        if (updateData.sku && updateData.sku !== product.sku) {
            const existingSku = await Product.findOne({
                where: {
                    sku: updateData.sku,
                    id: { [db.Sequelize.Op.ne]: id }
                }
            })

            if (existingSku) {
                return res.status(400).json({
                    success: false,
                    message: 'El SKU ya esta en uso'
                })
            }
        }

        // Actualizar producto
        await product.update(updateData)

        res.json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: product
        })

    } catch (error) {
        console.error('Error al actualizar producto:', error)
        res.status(500).json({
            success: false,
            message: 'Error al actualizar producto',
            error: error.message
        })
    }
}

// Eliminar producto (soft delete)
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params

        const product = await Product.findByPk(id)
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            })
        }

        // Soft delete - marcar como inactivo
        await product.update({ is_active: false })

        res.json({
            success: true,
            message: 'Producto eliminado exitosamente'
        })

    } catch (error) {
        console.error('Error al eliminar producto:', error)
        res.status(500).json({
            success: false,
            message: 'Error al eliminar producto',
            error: error.message
        })
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}