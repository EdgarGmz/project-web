const { DataTypes, Op } = require('sequelize')
const { sequelize } = require('../config/database')

const Inventory = sequelize.define('Inventory', {
    // Campos aqui
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
        comment: 'Identificador unico del registro de inventario'
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
        onDelete: 'CASCADE',
        comment: 'ID del producto en inventario'
    },

    // Relacion con Sucursal
    branchId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'branches',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID de la sucursal donde se encuentra el inventario'
    },

    // Stock actual
    stockCurrent: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: 0,
                msg: 'El stock actual no puede ser negativo'
            }
        },
        comment: 'Cantidad actual en stock'
    },
    
    // Stock minimo (para alertas)
    stockMinimum: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: 0,
                msg: 'El stock minimo no puede ser negativo'
            }
        },
        comment: 'Stock minimo antes de generar alerta'
    },

    // Stock maximo
    stockMaximum: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: true,
        validate: {
            min: {
                args: 0,
                msg: 'El stock maximo no puede ser negativo'
            },
            isGreaterThanMinimum(value) {
                if (value !== null && parseFloat(value) <= parseFloat(this.stockMinimum)) {
                    throw new Error('El stock maximo debe ser mayor al stock minimo')
                }
            }
        },
        comment: 'Stock máximo recomendado'
    },

    // Stock reservado (por pedidos pendientes)
    stockReserved: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: 0,
                msg: 'El stock reservado no puede ser negativo'
            },
            isLessThanCurrent(value) {
                if (parseFloat(value) > parseFloat(this.stockCurrent)) {
                    throw new Error('El stock reservado no puede ser mayor al stock actual')
                }
            }
        },
        comment: 'Stock reservado para pedidos pendientes'
    },

    // Stock disponible (calculado automaticamente)
    stockAvailable: {
        type: DataTypes.VIRTUAL,
        get() {
            return parseFloat(this.stockCurrent) - parseFloat(this.stockReserved)
        },
        comment: 'Stock disponible para venta (actual - reservado)'
    },

    // Costo promedio del inventario
    averageCost: {
        type: DataTypes.DECIMAL(15, 4),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: 0,
                msg: 'El costo promedio no puede ser negativo'
            }
        },
        comment: 'Costo promedio ponderado del inventario'
    },

    // Valor total del inventario
    totalValue: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: 0,
                msg: 'El valor total no puede ser negativo'
            }
        },
        comment: 'Valor total del inventario (stock actual * costo promedio)'
    },

    // Ubicacion fisica en el almacen
    location: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Ubicacion fisica en el almacen (ej: A1-B2, Estante 3)'
    },

    // Zona del almacen
    zone: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Zona del almacen (ej: Refrigerados, Secos, Limpieza)'
    },

    // Estado del inventario
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'blocked', 'audit'),
        allowNull: false,
        defaultValue: 'active',
        comment: 'Estado del inventario en la sucursal'
    },

    // Fecha del ultimo conteo fisico
    lastCountDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha del ultimo conteo fisico realizado'
    },

    // Cantidad en el ultimo conteo fisico
    lastCountQuantity: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: true,
        comment: 'Cantidad registrada en el ultimo conteo fisico'
    },

    // Diferencia encontrada en el ultimo conteo
    lastCountDifference: {
        type: DataTypes.DECIMAL(10, 3),
        allowNull: true,
        comment: 'Diferencia encontrada en el último conteo (+ o -)'
    },

    // Notas sobre el inventario
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notas adicionales sobre el inventario'
    }
        
    
}, {
    // Configuracion aqui
    tableName: 'inventory',
    timestamps: true,
    paranoid: true,

    // Indices
    indexes: [
        // IMPORTANTE: Un producto solo puede aparecer UNA vez por sucursal
        {
            unique: true,
            fields: ['productId', 'branchId'],
            name: 'idx_inventory_product_branch_unique'
        },

        {
            fields: ['branchId', 'status'],
            name: 'idx_inventory_branch_status'
        },

        {
            fields: ['stockCurrent', 'stockMinimum'],
            name: 'idx_inventory_stock_alerts'
        },

        {
            fields: ['branchId', 'zone'],
            name: 'idx_inventory_branch_zone'
        }
    ],

    // Validacion a nivel modelo
    validate: {
        // Validar coherencia de stock
        stockConsistency() {
            if (parseFloat(this.stockReserved) > parseFloat(this.stockCurrent)) {
                throw new Error('El stock reservado no puede ser mayor al stock actual')
            }
        },

        // Validar calculo del valor total
        totalValueConsistency() {
            const expectedValue = parseFloat(this.stockCurrent) * parseFloat(this.averageCost)
            const actualValue = parseFloat(this.totalValue)

            if (Math.abs(expectedValue - actualValue) > 0.01) {
                throw new Error('El valor total no coincide con stock * costo promedio')
            }
        }
    },

    // Hooks para calculos automaticos
    hooks: {
        beforeValidate: async (inventory, options) => {
            // Calcular el valor del inventario automaticamente
            inventory.totalValue = parseFloat(inventory.stockCurrent) * parseFloat(inventory.averageCost)

            // Redondear a dos decimales
            inventory.totalValue = Math.round(inventory.totalValue * 100) / 100
        },

        afterUpdate: async (inventory, options) => {
            if (inventory.changed('stockCurrent')) {
                await inventory.checkLowStock()
            }
        }
    },

    // Scopes para consultas comunes
    scopes: {
        active: {
            where: { status: 'active' }
        },

        lowStock: {
            where: {
                [Op.and]: [
                    sequelize.where(
                        sequelize.col('stockCurrent'),
                        Op.lte,
                        sequelize.col('stockMinimum')
                    ),
                    { status: 'active' }
                ]
            }
        },

        withProduct: {
            include: [{
                model: sequelize.models.Product,
                as: 'Product',
                attributes: ['id', 'name', 'sku', 'category', 'currentPrice']
            }]
        },

        withBranch: {
            include: [{
                model: sequelize.models.Branch,
                as: 'Branch',
                attributes: ['id', 'name', 'code', 'city']
            }]
        }
    }
})

// Metodos aqui
Inventory.prototype.checkLowStock = async function () {
    if (parseFloat(this.stockCurrent) <= parseFloat(this.stockMinimum)) {
        console.warn(`⚠️ STOCK BAJO: ${this.Product?.name || 'Producto'} en ${this.Branch?.name || 'Sucursal'}`)
        console.warn(`  Actual: ${this.stockCurrent}, Minimo: ${this.stockMinimum}`)
        return true
    }
    return false
}

// Metodo para agregar stock (calculo de costo promedio)
Inventory.prototype.addStock = async function (quantity, cost = null, notes = null) {
    const oldStock = parseFloat(this.stockCurrent)
    const addQuantity = parseFloat(quantity)

    // Actualizar stock
    this.stockCurrent = oldStock + addQuantity

    // Actualizar costo promedio si se proporciona nuevo costo
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

// Metodo para quitar stock
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

module.exports = Inventory