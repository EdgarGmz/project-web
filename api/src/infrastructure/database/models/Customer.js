const { Op } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    const Customer = sequelize.define('Customer', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: { len: [2, 100] }
        },
        last_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: { len: [2, 100] }
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true,
            validate: { isEmail: true }
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
            validate: { len: [5, 255] }
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: { len: [2, 100] }
        },
        state: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: { len: [2, 100] }
        },
        postal_code: {
            type: DataTypes.STRING(10),
            allowNull: true,
            validate: { is: /^\d{5}(-\d{4})?$/ }
        },
        company_name: {
            type: DataTypes.STRING(150),
            allowNull: true,
            validate: { len: [2, 150] }
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
        document_type: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: 'dni'
        },
        document_number: {
            type: DataTypes.STRING(50),
            allowNull: true,
            unique: true
        },
        birth_date: {
            type: DataTypes.DATE,
            allowNull: true
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
        tableName: 'customers',
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
            anonymous: {
                where: {
                    [Op.and]: [
                        { first_name: { [Op.is]: null } },
                        { company_name: { [Op.is]: null } }
                    ]
                }
            },
            registered: {
                where: {
                    [Op.or]: [
                        { email: { [Op.not]: null } },
                        { first_name: { [Op.not]: null } }
                    ]
                }
            },
            companies: {
                where: { company_name: { [Op.not]: null } }
            },
            withTaxId: {
                where: { tax_id: { [Op.not]: null } }
            },
            byCity: (city) => ({
                where: { city: { [Op.like]: `%${city}%` } }
            })
        },
        indexes: [
            { fields: ['email'], unique: true },
            { fields: ['tax_id'], unique: true },
            { fields: ['company_name'] },
            { fields: ['is_active'] },
            { fields: ['city', 'state'] },
            { fields: ['created_at'] }
        ]
    })

    // RELACIONES
    Customer.associate = function (models) {
        Customer.hasMany(models.Sale, {
            foreignKey: 'customer_id',
            as: 'sales'
        })
        
        // Relación N:N con Branch a través de la tabla intermedia customer_branches
        Customer.belongsToMany(models.Branch, {
            through: 'customer_branches',
            foreignKey: 'customer_id',
            otherKey: 'branch_id',
            as: 'branches'
        })
    }

    return Customer
}