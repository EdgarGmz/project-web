const db = require('../infrastructure/database/models')
const { SaleItem, Product, Sale } = db

// Obtener items de una venta específica
const getSaleItemsBySale = async (req, res) => {
    try {
        const { sale_id } = req.params
        
        const items = await SaleItem.findAll({
            where: { sale_id },
            include: [
                {
                    model: Product,
                    as: 'Product',
                    attributes: ['id', 'name', 'sku', 'price']
                }
            ]
        })

        res.json({
            success: true,
            message: 'Items de venta obtenidos exitosamente',
            data: items
        })

    } catch (error) {
        console.error('Error al obtener items de venta:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Obtener item específico
const getSaleItemById = async (req, res) => {
    try {
        const { id } = req.params

        const item = await SaleItem.findByPk(id, {
            include: [
                {
                    model: Product,
                    as: 'Product',
                    attributes: ['id', 'name', 'sku', 'price']
                },
                {
                    model: Sale,
                    as: 'Sale',
                    attributes: ['id', 'sale_number', 'status']
                }
            ]
        })

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item de venta no encontrado'
            })
        }

        res.json({
            success: true,
            message: 'Item de venta obtenido exitosamente',
            data: item
        })

    } catch (error) {
        console.error('Error al obtener item de venta:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

module.exports = {
    getSaleItemsBySale,
    getSaleItemById
}