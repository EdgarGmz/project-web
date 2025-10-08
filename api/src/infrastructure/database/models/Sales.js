const { DataTypes, Op } = require('sequelize')
const { sequelize } = require('../../../config/database')
const crypto = require('crypto')

const Sale = sequelize.define('Sale', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // Relaciones Multiples
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'customers',
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

    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },

    // Campos financieros
    subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
            min: 0.01,
            isDecimal: true
        }
    },
    
    discount_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: 0.00,
            max: 1.00
        }
    },

    discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            min: 0.00
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

    tax_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0.00
        }
    },

    total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
            min: 0.01
        }
    },

    // Fecha y Hora
    sale_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    // Metodo de Pago
    payment_method: {
        type: DataTypes.ENUM('cash', 'card', 'transfer', 'mixed'),
        allowNull: false,
        defaultValue: 'cash'
    },

    // Estado de la transaccion
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'refunded'),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
            isIn: [ ['pending', 'completed', 'cancelled', 'refunded'] ]
        }
    }, 

    // Referencia unica
    transaction_reference: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },

    // Notas adicionales
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: [0, 500]
        }
    }
}, {
    tableName: 'sales',
    timestamps: true,
    paranoid: true,

    defaultScope: {
        where: {
            status: { [Op.ne]: 'cancelled' }
        }
    },

    // Scopes especificos para ventas
    scopes: {
        all: { where: {} },

        // Por estado
        pending: { where: { status: 'pending' } },
        completed: { where: { status: 'completed' } },
        cancelled: { where: { status: 'cancelled' } },
        refunded: { where: { status: 'refunded' } },

        // Por metodo de pago
        cash: { where: { payment_method: 'cash' } },
        card: { where: { payment_method: 'card' } },

        // Por rangos de fechas
        today: {
            where: {
                sale_date: {
                    [Op.gte]: new Date().setHours(0, 0, 0, 0)
                }
            }
        },
        
        thisMonth: {
            where: {
                sale_date: {
                    [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                }
            }
        },

        // Por sucursal
        byBranch: (branchId) => ({
            where: { branch_id: branchId }
        }),

        // Por usuario
        byCashier: (userId) => ({
            where: { user_id: userId }
        }),

        // Ventas grandes
        highValue: {
            where: {
                total_amount: { [Op.gt]: 1000 }
            }
        },

        // Con cliente registrado
        withCustomer: {
            where: {
                customer_id: { [Op.not]: null }
            }
        },

        // Ventas al publico
        anonymous: {
            where: {
                customer_id: { [Op.is]: null }
            }
        }
    },

     // Indices para optimizacion
    indexes: [
        { fields: ['transaction_reference'], unique: true },
        { fields: ['status'] },
        { fields: ['sale_date'] },
        { fields: ['branch_id', 'sale_date'] },
        { fields: ['user_id', 'sale_date'] },
        { fields: ['customer_id'] },
        { fields: ['payment_method'] },
        { fields: ['total_amount'] },
        { fields: ['created_at'] },
    ],

    // Hooks avanzados
    hooks: {
        beforeCreate: (sale) => {
            // Generar transaction_reference unico automaticamente
            if (!sale.transaction_reference) {
                const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
                const random = crypto.randomBytes(4).toString('hex').toUpperCase()
                sale.transaction_reference = `TXN-${date}-${random}`
            }
        },

        beforeUpdate: (sale) => {
            // Recalcular totales si cambian los campos realcionados
            if (sale.changed('subtotal') || sale.changed('discount_rate') || sale.changed('tax_rate')) {
                sale.recalculateAmounts()
            }
        }
    },

    validate: {
        discountLogic() {
            if(this.discount_amount > this.subtotal) {
                throw new Error('El descuento no puede ser mayor al subtotal')
                }
            },

        totalCalculation() {
            const expectedTotal = (this.subtotal - this.discount_amount + this.tax_amount)
            if (Math.abs(this.total_amount - expectedTotal) > 0.01) {
                throw new Error('Error en el calculo de la venta')
            }
        },

        statusTransisition() {
            // Validar transacciones de estado validas
            if (this.changed('status')) {
                const validTransitions = {
                    'pending': ['completed', 'cancelled'],
                    'completed': ['refunded'],
                    'cancelled': [],
                    'refunded': []
                }

                const previousStatus = this._previousDataValues?.status
                const currentStatus = this.status

                if (previousStatus && !validTransitions[previousStatus].includes(currentStatus)) {
                    throw new Error(`Transicion de estado invalida: ${previousStatus} → ${currentStatus}`)
                }
            }
        }
    }
})

// Metodos de instancias utiles
Sale.prototype.recalculateAmounts = function () {
    // Calcular descuento
    if (this.discount_rate > 0) {
        this.discount_amount = (this.subtotal * this.discount_rate)
    }

    // Calcular impuesto
    this.tax_amount = ((this.subtotal - this.discount_amount) * this.tax_rate)

    // Calcular total
    this.total_amount = (this.subtotal - this.discount_amount + this.tax_amount)
}

Sale.prototype.canBeRefunded = function () {
    return this.status === 'completed' && this.payment_method !== 'cash'
}

Sale.prototype.getFormattedReference = function () {
    return this.transaction_reference || 'SIN-REF'
}

Sale.prototype.calculateCommission = function (rate = 0.02) {
    return (this.total_amount * rate).toFixed(2)
}

// Relaciones
Sale.associate = (models) => {
// Una Sale pertenece a un Customer
    Sale.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer'
    });
    
// Un sale pertenece a una Branch
    Sale.belongsTo(models.Branch, {
        foreignKey: 'branch_id',
        as: 'branch'
    });

// Una Sale pertence a un User (cajero)
    Sale.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'cashier'
    });
    
// Una Sale tiene muchos SaleItems
    Sale.hasMany(models.SaleItem, {
        foreignKey: 'sale_id',
        as: 'items'
    });
}

module.exports = Sale