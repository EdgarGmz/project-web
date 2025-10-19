const db = require('../database/models')
const { Product } = db

// CONTROLADOR DE PRODUCTOS

// Obtener todos los productos
const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const offset = (page - 1) * limit

        const search = req.query.search || ''
        const whereClause = search ? {
            [db.Sequelize.Op.or]: [
                { name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
                { sku: { [db.Sequelize.Op.iLike]: `%${search}%` } },
                { barcode: { [db.Sequelize.Op.iLike]: `%${search}%` } }
            ]
        } : {}

        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']]
        })

        res.json({
            success: true,
            message: 'Productos obtenidos exitosamente',
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit)
            }
        })

    } catch (error) {
        console.error('Error al obtener productos:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Obtener un producto por ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params

        const product = await Product.findByPk(id)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            })
        }

        res.json({
            success: true,
            message: 'Producto obtenido exitosamente',
            data: product
        })

    } catch (error) {
        console.error('Error al obtener producto:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Crear un nuevo producto
const createProduct = async (req, res) => {
    try {
        const { name, description, sku, barcode, unit_price, cost_price, tax_rate, unit_measure, min_stock, max_stock, is_active } = req.body

        if (!name || !sku || !unit_price || !cost_price) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, SKU, precio de venta y costo son obligatorios'
            })
        }

        // Validar unicidad
        const existsName = await Product.findOne({ where: { name } })
        if (existsName) {
            return res.status(400).json({
                success: false,
                message: 'El nombre ya está registrado'
            })
        }
        const existsSku = await Product.findOne({ where: { sku } })
        if (existsSku) {
            return res.status(400).json({
                success: false,
                message: 'El SKU ya está registrado'
            })
        }
        if (barcode) {
            const existsBarcode = await Product.findOne({ where: { barcode } })
            if (existsBarcode) {
                return res.status(400).json({
                    success: false,
                    message: 'El código de barras ya está registrado'
                })
            }
        }

        const newProduct = await Product.create({
            name,
            description,
            sku,
            barcode,
            unit_price,
            cost_price,
            tax_rate,
            unit_measure,
            min_stock,
            max_stock,
            is_active: is_active !== false
        })

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: newProduct
        })

    } catch (error) {
        console.error('Error al crear producto:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Actualizar un producto
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params
        const updateData = req.body

        const product = await Product.findByPk(id)
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            })
        }

        // Validar unicidad en actualización
        if (updateData.name && updateData.name !== product.name) {
            const existsName = await Product.findOne({
                where: { name: updateData.name, id: { [db.Sequelize.Op.ne]: id } }
            })
            if (existsName) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre ya está en uso'
                })
            }
        }
        if (updateData.sku && updateData.sku !== product.sku) {
            const existsSku = await Product.findOne({
                where: { sku: updateData.sku, id: { [db.Sequelize.Op.ne]: id } }
            })
            if (existsSku) {
                return res.status(400).json({
                    success: false,
                    message: 'El SKU ya está en uso'
                })
            }
        }
        if (updateData.barcode && updateData.barcode !== product.barcode) {
            const existsBarcode = await Product.findOne({
                where: { barcode: updateData.barcode, id: { [db.Sequelize.Op.ne]: id } }
            })
            if (existsBarcode) {
                return res.status(400).json({
                    success: false,
                    message: 'El código de barras ya está en uso'
                })
            }
        }

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
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Eliminar un producto (soft delete)
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

        await product.update({ is_active: false })

        res.json({
            success: true,
            message: 'Producto eliminado exitosamente'
        })

    } catch (error) {
        console.error('Error al eliminar producto:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
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