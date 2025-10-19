const { Op } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    const Inventory = sequelize.define('Inventory', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'products',
                key: 'id'
            }
        },
        branch_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'branches', 
                key: 'id'
            }
        },
        stockCurrent: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        stockMinimum: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        reservedStock: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        averageCost: {
            type: DataTypes.FLOAT,
            allowNull: true,
            defaultValue: 0
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    }, {
        tableName: 'inventory',
        timestamps: true,
        paranoid: true,
        defaultScope: {
            where: { is_active: true }
        },
        scopes: {
            all: { where: {} },
            byBranch: (branchId) => ({
                where: { branchId }
            }),
            byProduct: (productId) => ({
                where: { productId }
            }),
            lowStock: {
                where: {
                    stockCurrent: { [Op.lte]: sequelize.col('stockMinimum') }
                }
            }
        },
        indexes: [
            { fields: ['productId', 'branchId'], unique: true },
            { fields: ['is_active'] },
            { fields: ['stockCurrent'] },
            { fields: ['created_at'] }
        ]
    })

    // Métodos de instancia
    Inventory.prototype.checkLowStock = async function () {
        if (parseFloat(this.stockCurrent) <= parseFloat(this.stockMinimum)) {
            console.warn(`⚠️ STOCK BAJO: ${this.Product?.name || 'Producto'} en ${this.Branch?.name || 'Sucursal'}`)
            console.warn(`  Actual: ${this.stockCurrent}, Minimo: ${this.stockMinimum}`)
            return true
        }
        return false
    }

    Inventory.prototype.addStock = async function (quantity, cost = null, notes = null) {
        const oldStock = parseFloat(this.stockCurrent)
        const addQuantity = parseFloat(quantity)
        this.stockCurrent = oldStock + addQuantity
        if (cost !== null) {
            const oldValue = oldStock * parseFloat(this.averageCost)
            const newValue = addQuantity * parseFloat(cost)
            const totalValue = oldValue + newValue
            const totalQuantity = this.stockCurrent
            this.averageCost = totalQuantity > 0 ? totalValue / totalQuantity : 0
        }
        if (notes) {
            this.notes = this.notes ? `${this.notes}\n${notes}` : notes
        }
        await this.save()
        return this
    }

    Inventory.prototype.removeStock = async function (quantity, notes = null) {
        const currentStock = parseFloat(this.stockCurrent)
        const removeQuantity = parseFloat(quantity)
        if (removeQuantity > currentStock) {
            throw new Error(`No hay suficiente stock. Disponible: ${currentStock}, Solicitado: ${removeQuantity}`)
        }
        this.stockCurrent = currentStock - removeQuantity
        if (notes) {
            this.notes = this.notes ? `${this.notes}\n${notes}` : notes
        }
        await this.save()
        return this
    }

    // Asociaciones
    Inventory.associate = function (models) {
        Inventory.belongsTo(models.Product, {
            foreignKey: 'productId',
            as: 'Product',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        })
        Inventory.belongsTo(models.Branch, {
            foreignKey: 'branchId',
            as: 'Branch',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        })
    }

    return Inventory
}