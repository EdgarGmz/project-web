const { Op } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    const Inventory = sequelize.define('Inventory', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'products',
                key: 'id'
            }
        },
        branch_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'branches', 
                key: 'id'
            }
        },
        stock_current: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        stock_minimum: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        reserved_stock: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 0
        },
        average_cost: {
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
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        defaultScope: {
            where: { is_active: true }
        },
        scopes: {
            all: { where: {} },
            byBranch: (branch_id) => ({
                where: { branch_id }
            }),
            byProduct: (product_id) => ({
                where: { product_id }
            }),
            lowStock: {
                where: {
                    stock_current: { [Op.lte]: sequelize.col('stock_minimum') }
                }
            }
        },
        indexes: [
            { fields: ['product_id', 'branch_id'], unique: true },
            { fields: ['is_active'] },
            { fields: ['stock_current'] },
            { fields: ['created_at'] }
        ]
    })

    // Métodos de instancia
    Inventory.prototype.checkLowStock = async function () {
        if (parseFloat(this.stock_current) <= parseFloat(this.stock_minimum)) {
            console.warn(`⚠️ STOCK BAJO: ${this.Product?.name || 'Producto'} en ${this.Branch?.name || 'Sucursal'}`)
            console.warn(`  Actual: ${this.stock_current}, Minimo: ${this.stock_minimum}`)
            return true
        }
        return false
    }

    Inventory.prototype.addStock = async function (quantity, cost = null, notes = null) {
        const oldStock = parseFloat(this.stock_current)
        const addQuantity = parseFloat(quantity)
        this.stock_current = oldStock + addQuantity
        if (cost !== null) {
            const oldValue = oldStock * parseFloat(this.average_cost)
            const newValue = addQuantity * parseFloat(cost)
            const totalValue = oldValue + newValue
            const totalQuantity = this.stock_current
            this.average_cost = totalQuantity > 0 ? totalValue / totalQuantity : 0
        }
        if (notes) {
            this.notes = this.notes ? `${this.notes}\n${notes}` : notes
        }
        await this.save()
        return this
    }

    Inventory.prototype.removeStock = async function (quantity, notes = null) {
        const currentStock = parseFloat(this.stock_current)
        const removeQuantity = parseFloat(quantity)
        if (removeQuantity > currentStock) {
            throw new Error(`No hay suficiente stock. Disponible: ${currentStock}, Solicitado: ${removeQuantity}`)
        }
        this.stock_current = currentStock - removeQuantity
        if (notes) {
            this.notes = this.notes ? `${this.notes}\n${notes}` : notes
        }
        await this.save()
        return this
    }

    // Asociaciones
    Inventory.associate = function (models) {
        Inventory.belongsTo(models.Product, {
            foreignKey: 'product_id',
            as: 'Product',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        })
        Inventory.belongsTo(models.Branch, {
            foreignKey: 'branch_id',
            as: 'Branch',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        })
    }

    return Inventory
}