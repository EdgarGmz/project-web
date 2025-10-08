const { DataTypes, Op } = require('sequelize')
const { sequelize } = require('../../../config/database')

const Inventory = sequelize.define('Inventory', {
    // === SEGÚN DOCUMENTACIÓN OFICIAL ===
    
    // 🆔 id - INT PRIMARY KEY
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        comment: 'Identificador único'
    },

    // 📦 product_id - INT FOREIGN KEY
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID del producto'
    },

    // 🏬 branch_id - INT FOREIGN KEY
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'branches',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID de la sucursal'
    },

    // 📈 current_stock - INT
    current_stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: 0,
                msg: 'El stock actual no puede ser negativo'
            }
        },
        comment: 'Stock actual'
    },
    
    // 📉 minimum_stock - INT
    minimum_stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: 0,
                msg: 'El stock mínimo no puede ser negativo'
            }
        },
        comment: 'Stock mínimo'
    },

    // 📈 maximum_stock - INT
    maximum_stock: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: {
                args: 0,
                msg: 'El stock máximo no puede ser negativo'
            },
            isGreaterThanMinimum(value) {
                if (value !== null && parseInt(value) <= parseInt(this.minimum_stock)) {
                    throw new Error('El stock máximo debe ser mayor al stock mínimo')
                }
            }
        },
        comment: 'Stock máximo'
    },

    // 📦 reserved_stock - INT
    reserved_stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: {
                args: 0,
                msg: 'El stock reservado no puede ser negativo'
            },
            isLessThanCurrent(value) {
                if (parseInt(value) > parseInt(this.current_stock)) {
                    throw new Error('El stock reservado no puede ser mayor al stock actual')
                }
            }
        },
        comment: 'Stock reservado'
    },

    // 📅 last_restock_date - DATE
    last_restock_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha último restock'
    },

    // 📍 location - VARCHAR(100)
    location: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            len: {
                args: [0, 100],
                msg: 'La ubicación no puede exceder 100 caracteres'
            }
        },
        comment: 'Ubicación en almacén'
    },

    // 📅 last_count_date - DATE
    last_count_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha último conteo'
    },

    // === CAMPOS CALCULADOS (NO EN DOCUMENTACIÓN) ===
    
    // Stock disponible (calculado automáticamente)
    available_stock: {
        type: DataTypes.VIRTUAL,
        get() {
            const current = parseInt(this.current_stock) || 0
            const reserved = parseInt(this.reserved_stock) || 0
            return Math.max(0, current - reserved)
        },
        comment: 'Stock disponible para venta (current_stock - reserved_stock)'
    },

    // Alerta de stock bajo
    stock_alert: {
        type: DataTypes.VIRTUAL,
        get() {
            const current = parseInt(this.current_stock) || 0
            const minimum = parseInt(this.minimum_stock) || 0
            return current <= minimum
        },
        comment: 'Indica si el producto necesita restock urgente'
    },

    // Días desde último restock
    days_since_restock: {
        type: DataTypes.VIRTUAL,
        get() {
            if (!this.last_restock_date) return null
            const today = new Date()
            const restock = new Date(this.last_restock_date)
            const diffTime = today - restock
            return Math.floor(diffTime / (1000 * 60 * 60 * 24))
        },
        comment: 'Días transcurridos desde el último restock'
    }
        
}, {
    // === CONFIGURACIÓN ===
    tableName: 'inventory',
    timestamps: true,
    paranoid: true,

    // === ÍNDICES SEGÚN DOCUMENTACIÓN ===
    indexes: [
        // ÚNICO: Un producto por sucursal
        {
            unique: true,
            fields: ['product_id', 'branch_id'],
            name: 'idx_inventory_product_branch_unique'
        },
        // Por sucursal
        {
            fields: ['branch_id'],
            name: 'idx_inventory_branch'
        },
        // Alertas de stock
        {
            fields: ['current_stock', 'minimum_stock'],
            name: 'idx_inventory_stock_alerts'
        },
        // Por ubicación
        {
            fields: ['location'],
            name: 'idx_inventory_location'
        },
        // Por fecha de restock
        {
            fields: ['last_restock_date'],
            name: 'idx_inventory_last_restock'
        },
        // Por fecha de conteo
        {
            fields: ['last_count_date'],
            name: 'idx_inventory_last_count'
        }
    ],

    // === VALIDACIONES A NIVEL MODELO ===
    validate: {
        stockConsistency() {
            if (parseInt(this.reserved_stock) > parseInt(this.current_stock)) {
                throw new Error('El stock reservado no puede ser mayor al stock actual')
            }
        },

        maximumStockValidation() {
            if (this.maximum_stock && parseInt(this.maximum_stock) <= parseInt(this.minimum_stock)) {
                throw new Error('El stock máximo debe ser mayor al stock mínimo')
            }
        }
    },

    // === HOOKS ===
    hooks: {
        beforeValidate: async (inventory, options) => {
            // Validaciones automáticas antes de guardar
            if (parseInt(inventory.current_stock) < 0) {
                inventory.current_stock = 0
            }
            if (parseInt(inventory.reserved_stock) < 0) {
                inventory.reserved_stock = 0
            }
        },

        afterUpdate: async (inventory, options) => {
            // Verificar alertas después de actualizar
            if (inventory.changed('current_stock')) {
                await inventory.checkLowStock()
            }

            // Log de cambios importantes
            if (inventory.changed(['current_stock', 'reserved_stock'])) {
                console.log(`📦 INVENTARIO ACTUALIZADO: Producto ${inventory.product_id} en sucursal ${inventory.branch_id}`)
                console.log(`   Stock actual: ${inventory.current_stock}, Reservado: ${inventory.reserved_stock}`)
            }
        }
    },

    // === SCOPES ===
    scopes: {
        // Stock activo
        active: {
            where: { 
                current_stock: { [Op.gt]: 0 } 
            }
        },

        // Stock bajo
        lowStock: {
            where: {
                [Op.and]: [
                    sequelize.where(
                        sequelize.col('current_stock'),
                        Op.lte,
                        sequelize.col('minimum_stock')
                    )
                ]
            }
        },

        // Sin stock
        outOfStock: {
            where: {
                current_stock: 0
            }
        },

        // Con stock reservado
        withReservedStock: {
            where: {
                reserved_stock: { [Op.gt]: 0 }
            }
        },

        // Por sucursal
        byBranch: (branchId) => ({
            where: {
                branch_id: branchId
            }
        }),

        // Por ubicación
        byLocation: (location) => ({
            where: {
                location: {
                    [Op.iLike]: `%${location}%`
                }
            }
        }),

        // Restock reciente (últimos 30 días)
        recentRestock: {
            where: {
                last_restock_date: {
                    [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            }
        },

        // Con detalles completos
        withDetails: {
            include: [
                {
                    model: sequelize.models.Product,
                    as: 'Product',
                    attributes: ['id', 'name', 'sku', 'category', 'price']
                },
                {
                    model: sequelize.models.Branch,
                    as: 'Branch',
                    attributes: ['id', 'name', 'code', 'city']
                }
            ]
        }
    }
})

// === MÉTODOS DE INSTANCIA ===

// Verificar stock bajo
Inventory.prototype.checkLowStock = async function () {
    const isLowStock = parseInt(this.current_stock) <= parseInt(this.minimum_stock)
    
    if (isLowStock) {
        console.warn(`🚨 STOCK BAJO: Producto ${this.product_id} en sucursal ${this.branch_id}`)
        console.warn(`   Stock actual: ${this.current_stock}, Mínimo: ${this.minimum_stock}`)
        console.warn(`   Stock disponible: ${this.available_stock}`)
        return true
    }
    return false
}

// Agregar stock
Inventory.prototype.addStock = async function (quantity, restockDate = null) {
    const oldStock = parseInt(this.current_stock) || 0
    const addQuantity = parseInt(quantity)

    if (addQuantity <= 0) {
        throw new Error('La cantidad a agregar debe ser positiva')
    }

    this.current_stock = oldStock + addQuantity
    this.last_restock_date = restockDate || new Date()

    await this.save()
    console.log(`📦 ✅ STOCK AGREGADO: +${addQuantity} al producto ${this.product_id}`)
    return this
}

// Quitar stock
Inventory.prototype.removeStock = async function (quantity, reason = 'venta') {
    const currentStock = parseInt(this.current_stock) || 0
    const removeQuantity = parseInt(quantity)
    const availableStock = this.available_stock

    if (removeQuantity <= 0) {
        throw new Error('La cantidad a quitar debe ser positiva')
    }

    if (removeQuantity > availableStock) {
        throw new Error(`Stock insuficiente. Disponible: ${availableStock}, Solicitado: ${removeQuantity}`)
    }

    this.current_stock = currentStock - removeQuantity

    await this.save()
    console.log(`📦 ➖ STOCK REDUCIDO: -${removeQuantity} del producto ${this.product_id} (${reason})`)
    
    // Verificar si quedó en stock bajo
    await this.checkLowStock()
    
    return this
}

// Reservar stock
Inventory.prototype.reserveStock = async function (quantity) {
    const reserveQuantity = parseInt(quantity)
    const availableStock = this.available_stock

    if (reserveQuantity <= 0) {
        throw new Error('La cantidad a reservar debe ser positiva')
    }

    if (reserveQuantity > availableStock) {
        throw new Error(`No hay suficiente stock disponible para reservar. Disponible: ${availableStock}`)
    }

    this.reserved_stock = parseInt(this.reserved_stock) + reserveQuantity

    await this.save()
    console.log(`🔒 STOCK RESERVADO: ${reserveQuantity} del producto ${this.product_id}`)
    return this
}

// Liberar stock reservado
Inventory.prototype.releaseReservedStock = async function (quantity) {
    const releaseQuantity = parseInt(quantity)
    const currentReserved = parseInt(this.reserved_stock) || 0

    if (releaseQuantity <= 0) {
        throw new Error('La cantidad a liberar debe ser positiva')
    }

    if (releaseQuantity > currentReserved) {
        throw new Error(`No se puede liberar más stock del reservado. Reservado: ${currentReserved}`)
    }

    this.reserved_stock = currentReserved - releaseQuantity

    await this.save()
    console.log(`🔓 STOCK LIBERADO: ${releaseQuantity} del producto ${this.product_id}`)
    return this
}

// Realizar conteo físico
Inventory.prototype.performPhysicalCount = async function (countedQuantity) {
    const counted = parseInt(countedQuantity)
    const currentStock = parseInt(this.current_stock) || 0
    const difference = counted - currentStock

    if (counted < 0) {
        throw new Error('La cantidad contada no puede ser negativa')
    }

    this.last_count_date = new Date()
    this.current_stock = counted

    await this.save()
    
    if (difference !== 0) {
        const diffText = difference > 0 ? `+${difference}` : `${difference}`
        console.warn(`📊 CONTEO FÍSICO: Diferencia de ${diffText} en producto ${this.product_id}`)
        console.warn(`   Anterior: ${currentStock}, Contado: ${counted}`)
    } else {
        console.log(`📊 ✅ CONTEO FÍSICO: Sin diferencias en producto ${this.product_id}`)
    }

    // Verificar stock bajo después del conteo
    await this.checkLowStock()

    return { difference, previous: currentStock, counted }
}

// === MÉTODOS ESTÁTICOS ===

// Obtener productos con stock bajo
Inventory.getLowStockProducts = async function (branchId = null) {
    const whereClause = branchId ? { branch_id: branchId } : {}
    
    return await this.scope('lowStock').findAll({
        where: whereClause,
        include: [
            {
                model: sequelize.models.Product,
                as: 'Product',
                attributes: ['id', 'name', 'sku', 'category']
            },
            {
                model: sequelize.models.Branch,
                as: 'Branch',
                attributes: ['id', 'name', 'code']
            }
        ]
    })
}

// Obtener productos sin stock
Inventory.getOutOfStockProducts = async function (branchId = null) {
    const whereClause = branchId ? { branch_id: branchId } : {}
    
    return await this.scope('outOfStock').findAll({
        where: whereClause,
        include: [
            {
                model: sequelize.models.Product,
                as: 'Product',
                attributes: ['id', 'name', 'sku', 'category']
            },
            {
                model: sequelize.models.Branch,
                as: 'Branch',
                attributes: ['id', 'name', 'code']
            }
        ]
    })
}

// === ASOCIACIONES ===
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

module.exports = Inventory