const { DataTypes, Op } = require('sequelize')
const { sequelize } = require('../../../config/database')

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [2, 200]
        }
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: [10, 1000]
        }
    },

    sku: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [3, 50],
            is: /^[A-Z0-9\-]+$/
        }
    },

    barcode: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
        validate: {
            len: [8, 100]
        }
        },

        category: {
        type: DataTypes.ENUM(
            'Consola',
            'Videojuego',
            'Accesorio',
            'Tarjeta de regalo',
            'Coleccionable',
            'Merchandising',
            'PC Gaming',
            'Realidad Virtual',
            'Suscripción',
            'Juguete'
        ),
        allowNull: false
        },

        subcategory: {
        type: DataTypes.STRING(100),
        allowNull: true
    },

    cost: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0.01,
            isDecimal: true
        }
    },

    price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0.01,
            isDecimal: true
        }
    },

    unit_measure: {
        type: DataTypes.STRING(50),
        defaultValue: 'unit',
        validate: {
            isIn: [[
                [
                    'unit',         // Unidad individual
                    'caja',         // Caja
                    'paquete',      // Paquete
                    'set',          // Set
                    'pieza',        // Pieza
                    'bundle',       // Bundle (consola + juego)
                    'digital',      // Producto digital (descarga)
                    'tarjeta',      // Tarjeta (gift card)
                    'edición',      // Edición especial/coleccionista
                    'accesorio',    // Accesorio
                    'juego',        // Videojuego físico
                    'suscripción'   // Suscripción digital
                ]
            ]]
        }
    },

    weight: {
        type: DataTypes.DECIMAL(8, 3),
        allowNull: true
    },

    dimensions: {
        type: DataTypes.JSON,
        allowNull: true
    },

    tax_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0.00,
            max: 1.00
        }
    },

    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    metadata: {
        type: DataTypes.JSON,
        allowNull: true
    },

    tags: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'products',
    timestamps: true,
    paranoid: true,
    defaultScope: {
        where: { is_active: true }
    },

    scopes: {
        all: { where: {} },

        // Scopes para videojuegos
        byPlatform: (platform) => ({
            where: {
                category: platform
            }
        }),

        expensive: {
            where: {
                price: { [Op.gt]: 1000 }
            }
        },

        newReleases: {
            where: {
                created_at: {
                    [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
                }
            }
        },

        search: (term) => ({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${term}%` } },
                    { sku: { [Op.iLike]: `%${term}%` } },
                    { description: { [Op.iLike]: `%${term}%` } }
                ]
            }
        })
    },

    // Validación a nivel modelo - CORREGIDA
    validate: {
        priceGreaterThenCost() {
            if (this.price <= this.cost) {  // ← CORREGIDO: nombres coinciden con migración
                throw new Error('El precio de venta debe ser mayor al costo')
            }
        }
    }
})

// Métodos de instancia - CORREGIDOS
Product.prototype.calculateMargin = function () {
    return ((this.price - this.cost) / this.cost * 100).toFixed(2)  // ← CORREGIDO
}

Product.prototype.calculateTotalPrice = function (quantity) {
    const subtotal = this.price * quantity  // ← CORREGIDO
    const tax = subtotal * this.tax_rate
    return (subtotal + tax).toFixed(2)
}

// Relaciones
Product.associate = (models) => {
    Product.hasMany(models.SaleItem, {
        foreignKey: 'product_id',
        as: 'sales_items'
    })

    Product.hasMany(models.Inventory, {
        foreignKey: 'product_id',
        as: 'inventories'
    })
}

module.exports = Product