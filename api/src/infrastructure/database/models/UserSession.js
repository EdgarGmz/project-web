const crypto = require('crypto')
const { Op } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    const UserSession = sequelize.define('UserSession', {
        id: {
            type: DataTypes.STRING(255),
            primaryKey: true,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
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
        ip_address: {
            type: DataTypes.STRING(45),
            allowNull: false,
            validate: {
                isIP: true
            }
        },
        pos_terminal: {
            type: DataTypes.STRING(50),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [1, 50]
            }
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isAfter: new Date().toISOString()
            }
        },
        last_activity: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'user_sessions',
        timestamps: true,
        paranoid: false,
        scopes: {
            active: {
                where: {
                    expires_at: {
                        [Op.gt]: new Date()
                    }
                }
            },
            byUser: (userId) => ({
                where: { user_id: userId }
            }),
            byBranch: (branchId) => ({
                where: { branch_id: branchId }
            }),
            byTerminal: (terminal) => ({
                where: {
                    pos_terminal: terminal,
                    expires_at: { [Op.gt]: new Date() }
                }
            })
        },
        indexes: [
            { fields: ['user_id'] },
            { fields: ['branch_id'] },
            { fields: ['expires_at'] },
            { fields: ['pos_terminal'] }
        ],
        hooks: {
            beforeCreate: (session) => {
                if (!session.id) {
                    session.id = crypto.randomBytes(32).toString('hex')
                }
                if (!session.expires_at) {
                    const tomorrow = new Date()
                    tomorrow.setHours(tomorrow.getHours() + 24)
                    session.expires_at = tomorrow
                }
            }
        }
    })

    UserSession.associate = function (models) {
        UserSession.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        })
        UserSession.belongsTo(models.Branch, {
            foreignKey: 'branch_id',
            as: 'branch'
        })
    }

    return UserSession
}