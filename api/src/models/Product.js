const { DataTypes, Op } = require('sequelize')
const { sequelize } = require('../config/database')

const Product = sequelize.define('Product', {
    // Campos
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [2, 150]
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
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
        validate: {
            isNumeric: true,
            len: [8, 20]
        }
    },

    unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0.01,
            isDecimal: true
        }
    },

    cost_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0.01,
            isDecimal: true
        }
    },

    tax_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.16,
        validate: {
            min: 0.00,
            max: 1.00
        }
    },

    unit_measure: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'pza',
        validate: {
            isIn: [['pza', 'kg', 'm', 'litro', 'm2', 'm3', 'caja', 'paquete']]
        }
    },

    min_stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
        validate: {
            min: 0
        }
    },

    max_stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1000,
        validate: {
            min: 1
        }
    },

    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

        // Basado en stock
        lowStock: {
            where: sequelize.where(
                sequelize.col('current_stock'),
                Op.lte,
                sequelize.col('min_stock')
            )
        },

        // Basado en precios
        expensive: {
            where: {
                unit_price: { [Op.gt]: 1000 }
            }
        },

        cheap: {
            where: {
                unit_price: { [Op.lte]: 100 }
            }
        },

        // Basado en codigos
        withBarcode: {
            where: {
                barcode: { [Op.not]: null }
            }
        },

        // Busqueda por categoria
        byCategory: (categoryId) => ({
            where: { category_id: categoryId }
        }),

        // Busqueda por nombre/SKU
        search: (term) => ({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: `%${term}%` } },
                    { sku: { [Op.iLike]: `%${term}%` } },
                    { description: { [Op.iLike]: `%${term}%` } }
                ]
            }
        }),
    },

    // Indices
    indexes: [
        { fields: ['name'], unique: true },
        { fields: ['sku'], unique: true },
        { fields: ['barcode'], unique: true },
        { fields: ['is_active'] } ,
        { fields: ['unit_price'] } ,
        { fields: ['min_stock', 'max_stock'] } ,
        { fields: ['created_at'] } ,
    ],
    
    // Validadcion a nivel modelo
    validate: {
        priceGreaterThenCost() {
            if (this.unit_price <= this.cost_price) {
                throw new Error('El precio de venta debe ser mayor al costo')
            }
        },

        stockLogic() {
            if (this.min_stock >= this.max_stock) {
                throw new Error('El stock minimo debe ser menor al maximo')
            }
        }
    }
})

// Metodos de instancias utiles
Product.prototype.calculateMargin = function () {
    return ((this.unit_price - this.cost_price) / this.cost_price * 100).toFixed(2)
}

Product.prototype.isLowStock = function (currentStock) {
    return currentStock < this.min_stock
}

Product.prototype.calculateTotalPrice = function (quantity) {
    const subtotal = this.unit_price * quantity
    const tax = subtotal * this.tax_rate
    return (subtotal + tax).toFixed(2)
}

// Relaciones 
Product.associate = (models) => {
    // Un product puede estar en muchos SalesItem
    Product.hasMany(models.SaleItem, {
        foreignKey: 'product_id',
        as: 'sales_items'
    })

    // Un product puede tener inventario en muchas sucursales
    Product.hasMany(models.Inventory, {
        foreignKey: 'product_id',
        as: 'inventories'
    })

    // Un product puede pertenecer a una Category
    Product.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category'
    })
}

module.exports = Product