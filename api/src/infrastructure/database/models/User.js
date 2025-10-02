const { DataTypes } = require('sequelize')
const bcrypt = require('bcryptjs')
const { sequelize } = require('../../../config/database')
const crypto = require('crypto')

const User = sequelize.define('User', {
    // AQUI VAN LOS CAMPOS

    // ID - Clave primaria
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    // EMAIL - Unico y valido
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    },

    // PASSWORD - Encriptada
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: [8, 100],
        }
    },

    // Nombre
    first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },

    last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },

    // Fecha de contratacion
    hire_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },

    // Ultimo Loggin (puede ser nulo)
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },

    // ROL - Lista de valores permitidos
    role: {
        type: DataTypes.ENUM('owner', 'supervisor', 'cashier', 'admin', 'auditor'),
        allowNull: false,
        defaultValue: 'cashier',
        validate: {
            isIn: {
                args: [['owner', 'supervisor', 'cashier', 'admin', 'auditor']],
                msg: "El rol debe ser uno de: 'owner', 'supervisor', 'cashier', 'admin', 'auditor'"
            }
        }
    },

    // ID de empleado - unico
    employee_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            isAlphanumeric: true,
            len: [3, 20]
        }
    },

    // Permisos - JSON flexible
    permissions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },

    // Estado activo
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    // Sucursal - Relacion con 'Branch'
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'branches',// <-- nombre de la tabla
            key: 'id' // <-- campo con el que se relaciona
        }
    },

    // Telefono
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            is: {
                args: /^[+]?[\d\s\-().]{10,20}$/,
                msg: "El teléfono solo puede contener números, espacios, guiones, paréntesis y un '+' inicial"
            }
        }
    },

    // Token para resetear password
    reset_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true
    }
}, {
    // AQUI VAN LAS OPCIONES
    tableName: 'users',

    // TIMESTAMPS automaticos
    timestamps: true,

    // BORRADO suave, no borra realmente, solo marca como deleted_at
    paranoid: true,

    scopes: {
        active: { where: { is_active: true } },
        withPassword: { attributes: {} },
        byRole: (role) => ({ where: { role } }),
        withBranch: { include: 'branch' },
        withSessions: { include: 'sessions' }
    },

    defaultScope: {
        attributes: { exclude: ['password', 'reset_token'] }
    },

    indexes: [
        { fields: ['email'], unique: true },
        { fields: ['employee_id'], unique: true },
        { fields: ['branch_id'] },
        { fields: ['is_active'] },
        { fields: ['role'] },
        { fields: ['branch_id', 'is_active'] },
        { fields: ['role', 'is_active'] }
    ],

    hooks: {
        beforeSave: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10)
            }
        }
    },

})

User.prototype.checkPassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

User.prototype.getFullName = function () {
    return `${this.first_name} ${this.last_name}`
}

User.prototype.hasPermission = function (permission) {
    return this.permissions && this.permissions[permission] === true
}

User.prototype.generateResetToken = function () {
    this.reset_token = crypto.randomBytes(32).toString('hex')
    return this.reset_token
}
User.prototype.clearResetToken = function () {
    this.reset_token = null
}

User.associate = function (models) {
    User.belongsTo(models.Branch, {
        foreignKey: 'branch_id',
        as: 'branch'
    })

    User.hasMany(models.UserSession, {
        foreignKey: 'user_id',
        as: 'sessions'
    })
}

module.exports = User