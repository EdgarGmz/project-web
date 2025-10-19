const { Op } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const SaleItem = sequelize.define('SaleItem', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            comment: 'Identificador unico del item de venta'
        },
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
        productName: {
            type: DataTypes.STRING(200),
            allowNull: false,
            comment: 'Nombre del producto al momento de la venta'
        },
        productSku: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'SKU del producto al momento de la venta'
        },
        quantity: {
            type: DataTypes.DECIMAL(10, 3),
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 0.001,
                max: 999999.999
            },
            comment: 'Cantidad de producto vendido'
        },
        unitPrice: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            validate: {
                min: 0,
                max: 9999999999999.99
            },
            comment: 'Precio unitario del producto al momento de la venta'
        },
        discountPercentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 100
            },
            comment: 'Porcentaje de descuento aplicado (0-100)'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Notas especificas sobre este item de venta'
        },
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
        tableName: 'sale_items',
        timestamps: true,
        paranoid: true,
        indexes: [
            { fields: ['saleId', 'productId'], name: 'idx_sale_items_sale_product' },
            { fields: ['productId'], name: 'idx_sale_items_product' },
            { fields: ['createdAt'], name: 'idx_sale_items_created_at' }
        ],
        validate: {
            discountAmountConsistency() {
                const expectedDiscount = (parseFloat(this.quantity) * parseFloat(this.unitPrice)) * (parseFloat(this.discountPercentage) / 100);
                const actualDiscount = parseFloat(this.discountAmount);
                if (Math.abs(expectedDiscount - actualDiscount) > 0.01) {
                    throw new Error('El monto de descuento no coincide con el porcentaje aplicado');
                }
            },
            totalConsistency() {
                const expectedSubtotal = parseFloat(this.quantity) * parseFloat(this.unitPrice);
                const actualSubtotal = parseFloat(this.subtotal);
                if (Math.abs(expectedSubtotal - actualSubtotal) > 0.01) {
                    throw new Error('El subtotal no coincide con cantidad * precio unitario');
                }
                const expectedTotal = actualSubtotal - parseFloat(this.discountAmount);
                const actualTotal = parseFloat(this.total);
                if (Math.abs(expectedTotal - actualTotal) > 0.01) {
                    throw new Error('El total no coincide con subtotal - descuento');
                }
            }
        },
        hooks: {
            beforeValidate: (saleItem) => {
                saleItem.subtotal = parseFloat(saleItem.quantity) * parseFloat(saleItem.unitPrice);
                saleItem.discountAmount = saleItem.subtotal * (parseFloat(saleItem.discountPercentage) / 100);
                saleItem.total = saleItem.subtotal - saleItem.discountAmount;
                saleItem.subtotal = Math.round(saleItem.subtotal * 100) / 100;
                saleItem.discountAmount = Math.round(saleItem.discountAmount * 100) / 100;
                saleItem.total = Math.round(saleItem.total * 100) / 100;
            }
        },
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
                    discountPercentage: { [Op.gt]: 0 }
                }
            }
        }
    });

    // Métodos de instancia
    SaleItem.prototype.calculateTotals = function () {
        this.subtotal = parseFloat(this.quantity) * parseFloat(this.unitPrice);
        this.discountAmount = this.subtotal * parseFloat(this.discountPercentage) / 100;
        this.total = this.subtotal - this.discountAmount;
        this.subtotal = Math.round(this.subtotal * 100) / 100;
        this.discountAmount = Math.round(this.discountAmount * 100) / 100;
        this.total = Math.round(this.total * 100) / 100;
    };

    SaleItem.prototype.checkStock = async function (branchId) {
        const Inventory = sequelize.models.Inventory;
        const inventory = await Inventory.findOne({
            where: {
                productId: this.productId,
                branchId: branchId
            }
        });
        if (!inventory) {
            throw new Error(`No hay inventario del producto ${this.productName} en esta sucursal`);
        }
        if (inventory.stockCurrent < this.quantity) {
            throw new Error(`Stock insuficiente. Disponible: ${inventory.stockCurrent}, Solicitado: ${this.quantity}`);
        }
        return true;
    };

    // Métodos estáticos
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
        });
        return result[0] || {
            totalQuantity: 0,
            totalSubtotal: 0,
            totalDiscount: 0,
            totalAmount: 0,
            totalItems: 0
        };
    };

    // Relaciones
    SaleItem.associate = function (models) {
        SaleItem.belongsTo(models.Sale, {
            foreignKey: 'saleId',
            as: 'Sale',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });
        SaleItem.belongsTo(models.Product, {
            foreignKey: 'productId',
            as: 'Product',
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        });
    };

    return SaleItem;
};