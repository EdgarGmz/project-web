const { DataTypes, Op } = require('sequelize')
const { sequelize } = require('../../../config/database')

const SaleItem = sequelize.define('SaleItem', {

    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: 'Identificador unico del item de venta'
    },

    // Relacion con Sale
    saleId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'sales',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'ID de la venta a la que pertenece este item'
    },

    // Relacion con Product
    productId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'ID del producto vendido'
    },

    // Datos al momento de la venta
    productName: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: 'Nombre del producto al moemento de la venta'
    },

    productSku: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'SKU del producto al momento de la venta'
    },

    // Cantidad y Precios
    quantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: {
                args: 0.001,
                msg: 'La cantidad debe ser mayor a 0'
            },

            max: {
                args: 999999.999,
                msg: 'La cantidad no puede exceder 999,999.999'
            }
        },
        comment: 'Cantidad de producto vendido'
    },

    unitPrice: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            min: {
                args: 0,
                msg: 'El precio unitario no puede ser negativo'
            },

            max: {
                args: 9999999999999.99,
                msg: 'El precio unitario excede el limite permitido'
            }
        },

        comment: 'Precio unitario del producto al momento de la venta'
    },

    // Descuentos y Totales
    discountPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: 0,
                msg: 'El descuento no puede ser negativo'
            },

            max: {
                args: 100,
                msg: 'El descuento no puede exceder 100%'
            }
        },

        comment: 'Porcentaje de descuento aplicado (0-100)'
    },

    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notas especificas sobre este item de venta'
    },

    // Campos calculados
    subtotal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Subtotal antes de descuento'
    },

    discountAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Monto de descuento aplicado'
    },

    total: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Total final del item'
    }

}, {
    // Configuracion basica
    tableName: 'sale_items',
    timestamps: true,
    paranoid: true,

    // Indices
    indexes: [
        {
            fields: ['saleId', 'productId'],
            name: 'idx_sale_items_sale_product'
        },

        {
            fields: ['productId'],
            name: 'idx_sale_items_product'
        },

        {
            fields: ['createdAt'],
            name: 'idx_sale_items_created_at'
        }
    ],

    // Validaciones personalizadas
    validate: {
        discountAmountConsistency() {
            // Verifica que el monto de descuento coincida con el porcentaje aplicado
            const expectedDiscount = (parseFloat(this.quantity) * parseFloat(this.unitPrice)) * (parseFloat(this.discountPercentage) / 100)
            const actualDiscount = parseFloat(this.discountAmount)
            if (Math.abs(expectedDiscount - actualDiscount) > 0.01) {
                throw new Error('El monto de descuento no coincide con el porcentaje aplicado')
            }
        },
        totalConsistency() {
            // Verifica que el subtotal y total sean consistentes
            const expectedSubtotal = parseFloat(this.quantity) * parseFloat(this.unitPrice)
            const actualSubtotal = parseFloat(this.subtotal)
            if (Math.abs(expectedSubtotal - actualSubtotal) > 0.01) {
                throw new Error('El subtotal no coincide con cantidad * precio unitario')
            }
            const expectedTotal = actualSubtotal - parseFloat(this.discountAmount)
            const actualTotal = parseFloat(this.total)
            if (Math.abs(expectedTotal - actualTotal) > 0.01) {
                throw new Error('El total no coincide con subtotal - descuento')
            }
        }
    },

    // Hooks
    hooks: {
        beforeValidate: (saleItem, options) => {
            // Calcula subtotal, descuento y total antes de validar
            saleItem.subtotal = parseFloat(saleItem.quantity) * parseFloat(saleItem.unitPrice)
            saleItem.discountAmount = saleItem.subtotal * (parseFloat(saleItem.discountPercentage) / 100)
            saleItem.total = saleItem.subtotal - saleItem.discountAmount

            // Redondear a 2 decimales
            saleItem.subtotal = Math.round(saleItem.subtotal * 100) / 100
            saleItem.discountAmount = Math.round(saleItem.discountAmount * 100) / 100
            saleItem.total = Math.round(saleItem.total * 100) / 100
        },

        afterCreate: async (saleItem, options) => {
            const Sale = sequelize.models.Sale
            await Sale.recalculateTotals(saleItem.saleId)
        },

        afterUpdate: async (saleItem, options) => {
            const Sale = sequelize.models.Sale
            await Sale.recalculateTotals(saleItem.saleId)
        },

        afterDestroy: async (saleItem, options) => {
            const Sale = sequelize.models.Sale
            await Sale.recalculateTotals(saleItem.saleId)
        }
    },

    // Scopes para consultas comunes
    scopes: {
        withProduct: {
            include: [{
                model: sequelize.models.Product,
                as: 'Product',
                attributes: ['id', 'name', 'sku', 'currentPrice', 'stockCurrent']
            }]
        },

        withSale: {
            include: [{
                model: sequelize.models.Sale,
                as: 'Sale',
                attributes: ['id', 'invoiceNumber', 'total', 'status']
            }]
        },

        withDiscount: {
            where: {
                discountPercentage: {
                    [Op.gt]: 0
                }
            }
        }
    }
});

// Metodo para calcular totales manualmente
SaleItem.prototype.calculateTotals = function () {
    this.subtotal = parseFloat(this.quantity) * parseFloat(this.unitPrice)
    this.discountAmount = this.subtotal * parseFloat(this.discountPercentage) / 100
    this.total = this.subtotal - this.discountAmount

    // Redondear a 2 decimales
    this.subtotal = Math.round(this.subtotal * 100) / 100
    this.discountAmount = Math.round(this.discountAmount * 100) / 100
    this.total = Math.round(this.total * 100) / 100
}

SaleItem.prototype.checkStock = async function (branchId) {
    const Inventory = sequelize.models.Inventory
    const inventory = await Inventory.findOne({
        where: {
            productId: this.productId,
            branchId: branchId
        }
    })

    if (!inventory) {
        throw new Error(`No hay inventario del producto ${this.productName} en esta sucursal`)
    }

    if (inventory.stockCurrent < this.quantity) {
        throw new Error(`Stock insuficiente. Disponible: ${inventory.stockCurrent}, Solicitado: ${this.quantity}`)
    }

    return true
}

// Metodos estaticos
SaleItem.getTotalsBySale = async function (saleId) {
    const result = await this.findAll({
        where: { saleId },
        attributes: [
            [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
            [sequelize.fn('SUM', sequelize.col('subtotal')), 'totalSubtotal'],
            [sequelize.fn('SUM', sequelize.col('discountAmount')), 'totalDiscount'],
            [sequelize.fn('SUM', sequelize.col('total')), 'totalAmount'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'totalItems']
        ],
        raw: true
    })

    return result[0] || {
        totalQuantity: 0,
        totalSubtotal: 0,
        totalDiscount: 0,
        totalAmount: 0,
        totalItems: 0
    }
}

// Relaciones
SaleItem.associate = function (models) {
    // Un item de venta pertenece a una venta
    SaleItem.belongsTo(models.Sale, {
        foreignKey: 'saleId',
        as: 'Sale',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    })

    // Un item de venta pertenece a un producto
    SaleItem.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'Product',
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    })
}
module.exports = SaleItem