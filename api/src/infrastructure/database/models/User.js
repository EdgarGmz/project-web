const bcrypt = require('bcryptjs');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
        {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
            email: {
                type: DataTypes.STRING(255),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                    notEmpty: true,
                },
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false,
                validate: {
                    len: [8, 100],
                },
            },
            first_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [2, 100],
                },
            },
            last_name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [2, 100],
                },
            },
            hire_date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            last_login: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            role: {
                type: DataTypes.ENUM('owner', 'admin', 'supervisor', 'cashier'),
                allowNull: false,
                defaultValue: 'cashier',
                validate: {
                    isIn: {
                        args: [['owner', 'admin', 'supervisor', 'cashier']],
                        msg: "El rol debe ser uno de: 'owner', 'admin', 'supervisor', 'cashier'",
                    },
                },
            },
            employee_id: {
                type: DataTypes.STRING(20),
                allowNull: true, // Mantener opcional
                unique: true,
                validate: {
                    isAlphanumeric: true,
                    len: [3, 20],
                },
            },
            permissions: {
                type: DataTypes.JSON,
                allowNull: true,
                defaultValue: {},
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
            branch_id: {
                type: DataTypes.UUID,
                allowNull: true, // Permitir null para admins/owners sin sucursal
                references: {
                    model: 'branches',
                    key: 'id',
                },
            },
            phone: {
                type: DataTypes.STRING(20),
                allowNull: true,
                validate: {
                    is: {
                        args: /^[+]?[\d\s\-().]{10,20}$/,
                        msg: "El teléfono solo puede contener números, espacios, guiones, paréntesis y un '+' inicial",
                    },
                },
            },
            reset_token: {
                type: DataTypes.STRING(255),
                allowNull: true,
                unique: true,
            },
        },
        {
            tableName: 'users',
            timestamps: true,
            paranoid: true,
            deletedAt: 'deleted_at',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            scopes: {
                active: { where: { is_active: true } },
                withPassword: { attributes: {} },
                byRole: (role) => ({ where: { role } }),
                withBranch: { include: 'branch' },
                withSessions: { include: 'sessions' },
            },
            defaultScope: {
                attributes: { exclude: ['password', 'reset_token'] },
            },
            indexes: [
                { fields: ['email'], unique: true },
                { fields: ['employee_id'], unique: true },
                { fields: ['branch_id'] },
                { fields: ['is_active'] },
                { fields: ['role'] },
                { fields: ['branch_id', 'is_active'] },
                { fields: ['role', 'is_active'] },
            ],
            hooks: {
                beforeCreate: async (user) => {
                    if (user.changed('password')) {
                        user.password = await bcrypt.hash(user.password, 10);
                    }
                },
            },
        }
    );

    // Métodos de instancia
    User.prototype.checkPassword = async function (password) {
        return await bcrypt.compare(password, this.password);
    };

    User.prototype.getFullName = function () {
        return `${this.first_name} ${this.last_name}`;
    };

    User.prototype.hasPermission = function (permission) {
        return this.permissions && this.permissions[permission] === true;
    };

    User.prototype.generateResetToken = function () {
        this.reset_token = crypto.randomBytes(32).toString('hex');
        return this.reset_token;
    };

    User.prototype.clearResetToken = function () {
        this.reset_token = null;
    };

    // Relaciones
    User.associate = function (models) {
        User.belongsTo(models.Branch, {
            foreignKey: 'branch_id',
            as: 'branch',
        });

        User.hasMany(models.UserSession, {
            foreignKey: 'user_id',
            as: 'sessions',
        });
    };

    return User;
};
