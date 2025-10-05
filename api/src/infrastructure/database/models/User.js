const { DataTypes } = require('sequelize')
const bcrypt = require('bcryptjs')
const { sequelize } = require('../../../config/database')
const crypto = require('crypto')

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    },

    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: [8, 255]
        }
    },

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

    employee_id: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
        validate: {
            len: [3, 20]
        }
    },

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

    hire_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },

    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'branches',
            key: 'id'
        }
    },

    permissions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
    },

    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },

    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },

    reset_token: {
        type: DataTypes.STRING(255),
        allowNull: true
    }

}, {
    tableName: 'users',
    timestamps: true,
    paranoid: true,
    
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',

    scopes: {
        active: { where: { is_active: true } },
        withPassword: { attributes: {} },
        byRole: (role) => ({ where: { role } }),
        byBranch: (branch_id) => ({ where: { branch_id } })
    },

    defaultScope: {
        attributes: { exclude: ['password'] }
    },

    indexes: [
        { fields: ['email'], unique: true },
        { fields: ['employee_id'], unique: true },
        { fields: ['is_active'] },
        { fields: ['role'] },
        { fields: ['branch_id'] },
        { fields: ['role', 'is_active'] }
    ],

    hooks: {
        beforeSave: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 10)
            }
        }
    }
})

// Métodos de instancia
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

// Relaciones 
User.associate = function (models) {
    User.belongsTo(models.Branch, {
        foreignKey: 'branch_id',
        as: 'branch'
    })
    
    User.hasMany(models.Sale, {
        foreignKey: 'user_id',
        as: 'sales'
    })
}

module.exports = User