const crypto = require('crypto')
const { Op } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    const Sale = sequelize.define('Sale', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        customer_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'customers',
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
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
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
        sale_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        payment_method: {
            type: DataTypes.ENUM('cash', 'card', 'transfer', 'mixed'),
            allowNull: false,
            defaultValue: 'cash'
        },
        status: {
            type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'refunded'),
            allowNull: false,
            defaultValue: 'pending',
            validate: {
                isIn: [['pending', 'completed', 'cancelled', 'refunded']]
            }
        },
        transaction_reference: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
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
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        defaultScope: {
            where: {
                status: { [Op.ne]: 'cancelled' }
            }
        },
        scopes: {
            all: { where: {} },
            pending: { where: { status: 'pending' } },
            completed: { where: { status: 'completed' } },
            cancelled: { where: { status: 'cancelled' } },
            refunded: { where: { status: 'refunded' } },
            cash: { where: { payment_method: 'cash' } },
            card: { where: { payment_method: 'card' } },
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
            byBranch: (branchId) => ({
                where: { branch_id: branchId }
            }),
            byCashier: (userId) => ({
                where: { user_id: userId }
            }),
            highValue: {
                where: {
                    total_amount: { [Op.gt]: 1000 }
                }
            },
            withCustomer: {
                where: {
                    customer_id: { [Op.not]: null }
                }
            },
            anonymous: {
                where: {
                    customer_id: { [Op.is]: null }
                }
            }
        },
        indexes: [
            { fields: ['transaction_reference'], unique: true },
            { fields: ['status'] },
            { fields: ['sale_date'] },
            { fields: ['branch_id', 'sale_date'] },
            { fields: ['user_id', 'sale_date'] },
            { fields: ['customer_id'] },
            { fields: ['payment_method'] },
            { fields: ['total_amount'] },
            { fields: ['created_at'] }
        ],
        hooks: {
            
            beforeUpdate: (sale) => {
                if (sale.changed('subtotal') || sale.changed('discount_rate') || sale.changed('tax_rate')) {
                    sale.recalculateAmounts()
                }
            }
        },
        validate: {
            discountLogic() {
                if (this.discount_amount > this.subtotal) {
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

    // Métodos de instancia
    Sale.prototype.recalculateAmounts = function () {
        if (this.discount_rate > 0) {
            this.discount_amount = (this.subtotal * this.discount_rate)
        }
        this.tax_amount = ((this.subtotal - this.discount_amount) * this.tax_rate)
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
        Sale.belongsTo(models.Customer, {
            foreignKey: 'customer_id',
            as: 'Customer'
        })
        Sale.belongsTo(models.Branch, {
            foreignKey: 'branch_id',
            as: 'branch'
        })
        Sale.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'User'
        })
        Sale.hasMany(models.SaleItem, {
            foreignKey: 'sale_id',
            as: 'SaleItems'
        })
    }

    return Sale
}