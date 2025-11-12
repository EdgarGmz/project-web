module.exports = (sequelize, DataTypes) => {
    const Branch = sequelize.define('Branch', {
        // ID - Clave primaria
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },

        // Nombre - Unico y requerido
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
                len: [2, 100]
            }
        },

        // Codigo Interno - para identificacion rapida
        code: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
                isUppercase: true,
                len: [3, 20]
            }
        },

        // Direccion completa
        address: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [10, 255]
            }
        },

        // Ciudad
        city: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 100]
            }
        },

        // Estado
        state: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 100]
            }
        },

        // Codigo Postal
        postal_code: {
            type: DataTypes.STRING(10),
            allowNull: false,
            validate: {
                is: /^\d{5}(-\d{4})?$/
            }
        },

        // Telefono
        phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
            validate: {
                is: {
                    args: /^[+]?[\d\s\-().]{10,20}$/,
                    msg: "Formato de telefono invalido"
                }
            }
        },

        // Correo electronico
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
                notEmpty: true
            }
        }, 

        // Gerente
        manager_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },

        // Estado activo
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    }, {
        tableName: 'branches',
        timestamps: true,
        paranoid: true,
        deletedAt: 'deleted_at',
        createdAt: 'created_at',
        updatedAt: 'updated_at',

        defaultScope: {
            where: { is_active: true }
        }, 

        scopes: {
            all: { where: {} },
            active: { where: { is_active: true } },
            withManager: { include: 'manager' },
            withEmployees: { include: 'employees' }
        },

        indexes: [
            { fields: ['name'], unique: true },
            { fields: ['code'], unique: true },
            { fields: ['email'], unique: true },
            { fields: ['manager_id'] },
            { fields: ['is_active'] },
            { fields: ['city', 'state'] }
        ]
    })

    Branch.associate = (models) => {
        // Un Branch tiene muchos Users (empleados)
        Branch.hasMany(models.User, {
            foreignKey: 'branch_id',
            as: 'employees'
        })

        // Un Branch tiene un manager (User)
        Branch.belongsTo(models.User, {
            foreignKey: 'manager_id',
            as: 'manager'
        })

        // Un Branch tiene muchos UserSessions (sesiones activas)
        Branch.hasMany(models.UserSession, {
            foreignKey: 'branch_id',
            as: 'sessions'
        })

        // Un Branch tiene muchos registros de Inventario
        Branch.hasMany(models.Inventory, {
            foreignKey: 'branch_id',
            as: 'inventory'
        })
    }

    return Branch
}