const { DataTypes, Op } = require('sequelize')
const { sequelize } = require('../config/database')
const crypto = require('crypto')

const UserSession = sequelize.define('UserSession', {
    id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false,
    },

    // Usuario propietario de la sesion
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },

    // Sucursal donde se incio la sesion
    branch_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'branches',
            key: 'id'
        }
    },

    // IP desde donde se conecta (seguridad)
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: false,
        validate: {
            isIP: true
        }
    },

    // Terminal POS especifico
    pos_terminal: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [1, 50]
        }
    },

    // Cuando expira la sesion
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isAfter: new Date().toISOString()
        }
    },

    // Ultima actividad del usuario
    last_activity: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'user_sessions',
    timestamps: true,
    paranoid: false,

    // Solo sesiones que no han expirado
    scopes: {
        active: {
            where: {
                expires_at: {
                    [Op.gt]: new Date()
                }
            }
        },

         // Sesiones de usuario especifico
        byUser: (userId) => ({
            where: { user_id: userId}
        }),

        // Sesiones por sucursal
        byBranch: (branchId) => ({
            where: { branch_id: branchId }
        }),

        // Sesiones activas por terminal
        byTerminal: (terminal) => ({
            where: {
                pos_terminal: terminal,
                expires_at: { [Op.gt]: new Date() }
            }
        })
    },

    indexes: [
        { fields: [ 'user_id' ] },
        { fields: [ 'branch_id' ] },
        { fields: [ 'expires_at' ] },
        { fields: [ 'pos_terminal' ] }
    ],

   

    hooks: {
        beforeCreate: (session) => {
            if (!session.id) {
                // Generar un token unico de 64 caracteres
                session.id = crypto.randomBytes(32).toString('hex')
            }

            // Opcional: Establecer expiracion por defecto (24 hrs)
            if (!session.expires_at) {
                const tomorrow = new Date()
                tomorrow.setHours(tomorrow.getHours() + 24)
                session.expires_at = tomorrow
            }
        }
    }

})

module.exports = UserSession