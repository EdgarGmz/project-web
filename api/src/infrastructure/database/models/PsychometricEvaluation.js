module.exports = (sequelize, DataTypes) => {
    const PsychometricEvaluation = sequelize.define('PsychometricEvaluation', {
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
        evaluator_id: {
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
        evaluation_date: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                notEmpty: true,
                isDate: true
            }
        },
        test_name: {
            type: DataTypes.STRING(200),
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        test_type: {
            type: DataTypes.STRING(100),
            allowNull: false,
            defaultValue: 'personality',
            validate: {
                isIn: {
                    args: [['personality', 'intelligence', 'aptitude', 'neuropsychological', 'projective', 'clinical', 'vocational', 'other']],
                    msg: "El tipo de prueba debe ser: 'personality', 'intelligence', 'aptitude', 'neuropsychological', 'projective', 'clinical', 'vocational', u 'other'"
                }
            }
        },
        duration_minutes: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 60,
            validate: {
                min: 15,
                max: 480
            }
        },
        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
            defaultValue: 'scheduled',
            validate: {
                isIn: {
                    args: [['scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled']],
                    msg: "El estado debe ser: 'scheduled', 'in_progress', 'completed', 'cancelled', o 'rescheduled'"
                }
            }
        },
        raw_scores: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Puntuaciones brutas de la evaluación'
        },
        scaled_scores: {
            type: DataTypes.JSON,
            allowNull: true,
            comment: 'Puntuaciones escaladas o normalizadas'
        },
        interpretation: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Interpretación clínica de los resultados'
        },
        recommendations: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Recomendaciones basadas en la evaluación'
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Notas adicionales del evaluador'
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
        tableName: 'psychometric_evaluations',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                fields: ['customer_id']
            },
            {
                fields: ['evaluator_id']
            },
            {
                fields: ['branch_id']
            },
            {
                fields: ['evaluation_date']
            },
            {
                fields: ['status']
            },
            {
                fields: ['test_type']
            }
        ]
    });

    PsychometricEvaluation.associate = (models) => {
        // Relación con Customer
        PsychometricEvaluation.belongsTo(models.Customer, {
            foreignKey: 'customer_id',
            as: 'customer'
        });

        // Relación con User (Evaluator)
        PsychometricEvaluation.belongsTo(models.User, {
            foreignKey: 'evaluator_id',
            as: 'evaluator'
        });

        // Relación con Branch
        PsychometricEvaluation.belongsTo(models.Branch, {
            foreignKey: 'branch_id',
            as: 'branch'
        });
    };

    return PsychometricEvaluation;
};
