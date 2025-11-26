const { parse } = require('dotenv')
const db = require('../database/models')
const { TABLOCK } = require('sequelize/lib/table-hints')
const { Product } = db

// CONTROLADOR DE PRODUCTOS

// Obtener todos los productos
const getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 20
        const offset = (page - 1) * limit

        const search = req.query.search || ''
        const status = req.query.status
        
        let whereClause = {}

        if (search) {
            whereClause[db.Sequelize.Op.or] = [
                { name: { [db.Sequelize.Op.like]: `%${search}%` } },
                { sku: { [db.Sequelize.Op.like]: `%${search}%` } },
                { barcode: { [db.Sequelize.Op.like]: `%${search}%` } }
            ]
        }

        if (status === 'active') {
            whereClause.is_active = true
        } else if (status === 'inactive') {
            whereClause.is_active = false
        }
        // Si no hay filtro de status, mostrar todos los productos (activos e inactivos)

        const { count, rows } = await Product.scope('all').findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            paranoid: true,
            distinct: true,
            include: [
                {
                    model: db.Inventory,
                    as: 'inventories',
                    attributes: ['stock_current', 'branch_id'],
                    where: { is_active: true },
                    required: false 
                }
            ]
        })

        // Calcular stock total para cada producto (suma de todas las sucursales incluyendo CEDIS)
        const productsWithTotalStock = await Promise.all(rows.map(async (product) => {
            const productData = product.toJSON()
            
            // Obtener todos los inventarios activos del producto en todas las sucursales
            const allInventories = await db.Inventory.findAll({
                where: {
                    product_id: product.id,
                    is_active: true
                },
                attributes: ['stock_current'],
                raw: true
            })
            
            // Sumar el stock de todas las sucursales
            const totalStock = allInventories.reduce((sum, inv) => {
                return sum + (parseFloat(inv.stock_current) || 0)
            }, 0)
            
            return {
                ...productData,
                total_stock: totalStock
            }
        }))

        res.json({
            success: true,
            message: 'Productos obtenidos exitosamente',
            data: productsWithTotalStock,
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

// Activar/Desactivar un producto
const toggleProductStatus = async (req, res) => {
    try {
        const { id } = req.params

        const product = await Product.scope('all').findByPk(id)
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            })
        }

        await product.update({ is_active: !product.is_active })
        
        // Registrar en logs
        try {
            await db.Log.create({
                user_id: req.user?.id || null,
                action: product.is_active ? 'activate' : 'deactivate',
                service: 'product',
                message: `Producto ${product.is_active ? 'activado' : 'desactivado'}: ${product.name} (SKU: ${product.sku})`
            });
        } catch (logError) {
            console.error('Error al registrar log de activación/desactivación de producto:', logError);
        }

        res.json({
            success: true,
            message: `Producto ${product.is_active ? 'activado' : 'desactivado'} exitosamente`,
            data: product
        })

    } catch (error) {
        console.error('Error al cambiar estado del producto:', error)
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
    const transaction = await db.sequelize.transaction()
    try {
        const { name, description, sku, barcode, unit_price, cost_price, tax_rate, unit_measure, min_stock, max_stock, is_active, stock_inicial } = req.body

        if (!name || !sku || !unit_price || !cost_price) {
            await transaction.rollback()
            return res.status(400).json({
                success: false,
                message: 'Nombre, SKU, precio de venta y costo son obligatorios'
            })
        }

        // Validar que se proporcione stock inicial (obligatorio y mayor a 0)
        if (stock_inicial === undefined || stock_inicial === null || stock_inicial === '' || isNaN(parseFloat(stock_inicial))) {
            await transaction.rollback()
            return res.status(400).json({
                success: false,
                message: 'El stock inicial en CEDIS es obligatorio para crear un producto.'
            })
        }

        const initialStock = parseFloat(stock_inicial)
        if (initialStock <= 0) {
            await transaction.rollback()
            return res.status(400).json({
                success: false,
                message: 'El stock inicial debe ser mayor a 0.'
            })
        }

        // Validar unicidad
        const existsName = await Product.findOne({ where: { name } })
        if (existsName) {
            await transaction.rollback()
            return res.status(400).json({
                success: false,
                message: 'El nombre ya está registrado'
            })
        }

        const existsSku = await Product.findOne({ where: { sku } })
        if (existsSku) {
            await transaction.rollback()
            return res.status(400).json({
                success: false,
                message: 'El SKU ya está registrado'
            })
        }

        if (barcode) {
            const existsBarcode = await Product.findOne({ where: { barcode } })
            if (existsBarcode) {
                await transaction.rollback()
                return res.status(400).json({
                    success: false,
                    message: 'El código de barras ya está registrado'
                })
            }
        }

        const newProduct = await Product.create({
            name,
            description: description || null,
            sku,
            barcode: barcode || null,
            unit_price: parseFloat(unit_price),
            cost_price: parseFloat(cost_price),
            tax_rate: parseFloat(tax_rate) || 0.16,
            unit_measure: unit_measure || null,
            min_stock: parseInt(min_stock) || 5,
            max_stock: parseInt(max_stock) || 1000,
            is_active: is_active !== false
        }, { transaction });

        // Buscar CEDIS para asignar stock inicial
        const { Branch, Inventory } = db
        let cedis = await Branch.findOne({ where: { code: 'CEDIS-000' } })
        
        if (!cedis) {
            // Si CEDIS no existe, crearlo automáticamente
            console.log('CEDIS no encontrado, creando automáticamente...')
            cedis = await Branch.create({
                name: 'CEDIS - Centro de Distribución',
                code: 'CEDIS-000',
                address: 'Blvd. Industrial #1000, Zona Industrial, Monterrey',
                city: 'Monterrey',
                state: 'Nuevo Leon',
                postal_code: '64000',
                phone: '81-0000-0000',
                email: 'cedis@apexstore.com',
                is_active: true
            }, { transaction })
            console.log('CEDIS creado con ID:', cedis.id)
        }

        // Crear inventario inicial en CEDIS (ya validado que es > 0)
        await Inventory.create({
            product_id: newProduct.id,
            branch_id: cedis.id,
            stock_current: initialStock,
            stock_minimum: parseInt(min_stock) || 5,
            notes: `Stock inicial asignado al crear el producto`
        }, { transaction })

        // Registrar en logs
        try {
            await db.Log.create({
                user_id: req.user?.id || null,
                action: 'create',
                service: 'product',
                message: `Producto creado: ${newProduct.name} (SKU: ${newProduct.sku}) con stock inicial de ${initialStock} unidades en CEDIS`
            }, { transaction });
        } catch (logError) {
            console.error('Error al registrar log de creación de producto:', logError);
        }

        await transaction.commit()

        // Obtener producto con inventario para la respuesta
        const productWithInventory = await Product.findByPk(newProduct.id, {
            include: [{
                model: Inventory,
                as: 'inventories',
                where: { branch_id: cedis.id },
                required: false
            }]
        })

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente con stock inicial en CEDIS',
            data: productWithInventory
        });

    } catch (error) {
        await transaction.rollback()
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

        const product = await Product.scope('all').findByPk(id)
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

        // Registrar en logs
        try {
            await db.Log.create({
                user_id: req.user?.id || null,
                action: 'update',
                service: 'product',
                message: `Producto actualizado: ${product.name} (SKU: ${product.sku})`
            });
        } catch (logError) {
            console.error('Error al registrar log de actualización de producto:', logError);
        }

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

        // Buscar el producto incluyendo activos, inactivos y soft-deleted
        const product = await Product.scope('all').findByPk(id, { paranoid: false })
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            })
        }

        // Verificar si ya está eliminado
        if (product.deleted_at) {
            return res.status(400).json({
                success: false,
                message: 'El producto ya está eliminado'
            })
        }

        // Usar soft delete en lugar de destroy para mantener consistencia con usuarios
        await product.destroy() // Sequelize soft delete (paranoid: true)

        // Registrar en logs
        try {
            await db.Log.create({
                user_id: req.user?.id || null,
                action: 'delete',
                service: 'product',
                message: `Producto eliminado: ${product.name} (SKU: ${product.sku})`
            });
        } catch (logError) {
            console.error('Error al registrar log de eliminación de producto:', logError);
        }

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
    deleteProduct,
    toggleProductStatus
}
