module.exports = (sequelize, DataTypes) => {
    const TherapySession = sequelize.define('TherapySession', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        customer_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'customers',
                key: 'id'
            }
        },
        therapist_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        branch_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'branches',
                key: 'id'
            }
        },
        session_date: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notEmpty: true,
                isDate: true
            }
        },
        duration_minutes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 60,
            validate: {
                min: 15,
                max: 300
            }
        },
        session_type: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'individual',
            validate: {
                isIn: {
                    args: [['individual', 'group', 'couple', 'family', 'online', 'assessment']],
                    msg: "El tipo de sesión debe ser: 'individual', 'group', 'couple', 'family', 'online', o 'assessment'"
                }
            }
        },
        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'scheduled',
            validate: {
                isIn: {
                    args: [['scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled']],
                    msg: "El estado debe ser: 'scheduled', 'completed', 'cancelled', 'no_show', o 'rescheduled'"
                }
            }
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        diagnosis: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        treatment_plan: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            validate: {
                min: 0
            }
        },
        payment_status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'pending',
            validate: {
                isIn: {
                    args: [['pending', 'paid', 'partially_paid', 'cancelled']],
                    msg: "El estado de pago debe ser: 'pending', 'paid', 'partially_paid', o 'cancelled'"
                }
            }
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    }, {
        tableName: 'therapy_sessions',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['customer_id']
            },
            {
                fields: ['therapist_id']
            },
            {
                fields: ['branch_id']
            },
            {
                fields: ['session_date']
            },
            {
                fields: ['status']
            }
        ]
    });

    TherapySession.associate = (models) => {
        // Relación con Customer
        TherapySession.belongsTo(models.Customer, {
            foreignKey: 'customer_id',
            as: 'customer'
        });

        // Relación con User (Therapist)
        TherapySession.belongsTo(models.User, {
            foreignKey: 'therapist_id',
            as: 'therapist'
        });

        // Relación con Branch
        TherapySession.belongsTo(models.Branch, {
            foreignKey: 'branch_id',
            as: 'branch'
        });
    };

    return TherapySession;
};
