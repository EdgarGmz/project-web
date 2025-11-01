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
        sale_id: {
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
        product_id: {
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
        product_name: {
            type: DataTypes.STRING(200),
            allowNull: false,
            comment: 'Nombre del producto al momento de la venta'
        },
        product_sku: {
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
        unit_price: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            validate: {
                min: 0,
                max: 9999999999999.99
            },
            comment: 'Precio unitario del producto al momento de la venta'
        },
        discount_percentage: {
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
        discount_amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            comment: 'Monto de descuento aplicado'
        },
        total_amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0,
            comment: 'Total final del item'
        }
    }, {
        tableName: 'sale_items',
        timestamps: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        indexes: [
            { fields: ['sale_id', 'product_id'], name: 'idx_sale_items_sale_product' },
            { fields: ['product_id'], name: 'idx_sale_items_product' },
            { fields: ['created_at'], name: 'idx_sale_items_created_at' }
        ],
        validate: {
            discountAmountConsistency() {
                const expectedDiscount = (parseFloat(this.quantity) * parseFloat(this.unit_price)) * (parseFloat(this.discount_percentage) / 100);
                const actualDiscount = parseFloat(this.discount_amount);
                if (Math.abs(expectedDiscount - actualDiscount) > 0.01) {
                    throw new Error('El monto de descuento no coincide con el porcentaje aplicado');
                }
            },
            totalConsistency() {
                const expectedSubtotal = parseFloat(this.quantity) * parseFloat(this.unit_price);
                const actualSubtotal = parseFloat(this.subtotal);
                if (Math.abs(expectedSubtotal - actualSubtotal) > 0.01) {
                    throw new Error('El subtotal no coincide con cantidad * precio unitario');
                }
                const expectedTotal = actualSubtotal - parseFloat(this.discount_amount);
                const actualTotal = parseFloat(this.total_amount);
                if (Math.abs(expectedTotal - actualTotal) > 0.01) {
                    throw new Error('El total no coincide con subtotal - descuento');
                }
            }
        },
        hooks: {
            beforeValidate: (saleItem) => {
                saleItem.subtotal = parseFloat(saleItem.quantity) * parseFloat(saleItem.unit_price);
                saleItem.discount_amount = saleItem.subtotal * (parseFloat(saleItem.discount_percentage) / 100);
                saleItem.total_amount = saleItem.subtotal - saleItem.discount_amount;
                saleItem.subtotal = Math.round(saleItem.subtotal * 100) / 100;
                saleItem.discount_amount = Math.round(saleItem.discount_amount * 100) / 100;
                saleItem.total_amount = Math.round(saleItem.total_amount * 100) / 100;
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
                    discount_percentage: { [Op.gt]: 0 }
                }
            }
        }
    });

    // Métodos de instancia
    SaleItem.prototype.calculateTotals = function () {
        this.subtotal = parseFloat(this.quantity) * parseFloat(this.unit_price);
        this.discount_amount = this.subtotal * parseFloat(this.discount_percentage) / 100;
        this.total_amount = this.subtotal - this.discount_amount;
        this.subtotal = Math.round(this.subtotal * 100) / 100;
        this.discount_amount = Math.round(this.discount_amount * 100) / 100;
        this.total_amount = Math.round(this.total_amount * 100) / 100;
    };

    SaleItem.prototype.checkStock = async function (branchId) {
        const Inventory = sequelize.models.Inventory;
        const inventory = await Inventory.findOne({
            where: {
                product_id: this.product_id,
                branch_id: branchId
            }
        });
        if (!inventory) {
            throw new Error(`No hay inventario del producto ${this.product_name} en esta sucursal`);
        }
        if (inventory.stock_current < this.quantity) {
            throw new Error(`Stock insuficiente. Disponible: ${inventory.stock_current}, Solicitado: ${this.quantity}`);
        }
        return true;
    };

    // Métodos estáticos
    SaleItem.getTotalsBySale = async function (saleId) {
        const result = await this.findAll({
            where: { sale_id: saleId },
            attributes: [
                [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity'],
                [sequelize.fn('SUM', sequelize.col('subtotal')), 'totalSubtotal'],
                [sequelize.fn('SUM', sequelize.col('discount_amount')), 'totalDiscount'],
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalAmount'],
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
            foreignKey: 'sale_id',
            as: 'Sale',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        });
        SaleItem.belongsTo(models.Product, {
            foreignKey: 'product_id',
            as: 'Product',
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        });
    };

    return SaleItem;
};