const { DataTypes, Op } = require('sequelize')
const { sequelize } = require('../../../config/database')

const Customer = sequelize.define('Customer', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    first_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            len: [2, 100]
        }
    },

    last_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            len: [2, 100]
        }
    },

    email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
        validate: {
            isEmail: true
        }
    },

    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            is: {
                args: /^[+]?[\d\s\-().]{10,20}$/,
                msg: 'Formato de telefono invalido'
            }
        }

    },

    address: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            len: [5, 255]
        }
    },

    city: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            len: [2, 100]
        }
    },

    state: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            len: [2, 100]
        }
    },

    postal_code: {
        type: DataTypes.STRING(10),
        allowNull: true,
        validate: {
            is: /^\d{5}(-\d{4})?$/
        }
    },

    // Datos Empresariales
    company_name: {
        type: DataTypes.STRING(150),
        allowNull: true,
        validate: {
            len: [2, 150]
        }
    },

    tax_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
        validate: {
            len: [10, 20],
            isAlphanumeric: true
        }
    },

    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    
    tableName: 'customers',
    timestamps: true,
    paranoid: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',

    defaultScope: {
        where: { is_active: true },
    },

    scopes: {
        all: {
            where: {}
        },

        // Clientes de ventas al publico en general
        anonymous: {
            where: {
                [Op.and]: [
                { first_name: { [Op.is]: null } },
                { company_name: { [Op.is]: null } },
            ]
            }
        },

        // Cliente con datos completos
        registered: {
            where: {
                [Op.or]: [
                { email: { [Op.not]: null } },
                { first_name: { [Op.not]: null } },
            ]
            }
        },

        // Clientes empresariales (mayoreo)
        companies: {
            where: {
                company_name: { [Op.not]: null}
            }
        },

        // Clientes con RFC/NIT para facturacion
        withTaxId: {
            where: {
                tax_id: { [Op.not]: null }
            }
        },

        byCity: (city) => ({
            where: {
                city: { [Op.like]: `%${city}%` }
            }
        })
    },

    indexes: [
            { fields: ['email'], unique: true},
            { fields: ['tax_id'], unique: true},
            { fields: ['company_name'] },
            { fields: ['is_active']},
            { fields: ['city', 'state']},
        ],
})
    
    // RELACIONES (si las hay)
Customer.associate = function (models) {
    // Un Customer puede tener muchos Sales
    Customer.hasMany(models.Sale, {
        foreignKey: 'customer_id',
        as: 'sales'
    });
};
module.exports = Customer