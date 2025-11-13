module.exports = (sequelize, DataTypes) => {
    const Purchase = sequelize.define('Purchase', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        supplier_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'El nombre del proveedor es obligatorio'
                },
                len: {
                    args: [2, 255],
                    msg: 'El nombre del proveedor debe tener entre 2 y 255 caracteres'
                }
            }
        },
        supplier_contact: {
            type: DataTypes.STRING(255),
            allowNull: true,
            validate: {
                len: {
                    args: [0, 255],
                    msg: 'El contacto del proveedor no puede exceder 255 caracteres'
                }
            }
        },
        supplier_phone: {
            type: DataTypes.STRING(20),
            allowNull: true,
            validate: {
                is: {
                    args: /^[+]?[\d\s\-().]{0,20}$/,
                    msg: 'Formato de teléfono inválido'
                }
            }
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                isDecimal: {
                    msg: 'El monto total debe ser un número decimal válido'
                },
                min: {
                    args: [0.01],
                    msg: 'El monto total debe ser mayor a 0'
                }
            }
        },
        purchase_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
            validate: {
                isDate: {
                    msg: 'La fecha de compra debe ser válida'
                }
            }
        },
        invoice_number: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: {
                len: {
                    args: [0, 100],
                    msg: 'El número de factura no puede exceder 100 caracteres'
                }
            }
        },
        status: {
            type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
            allowNull: false,
            defaultValue: 'pending',
            validate: {
                isIn: {
                    args: [['pending', 'completed', 'cancelled']],
                    msg: 'El estado debe ser pending, completed o cancelled'
                }
            }
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            validate: {
                len: {
                    args: [0, 1000],
                    msg: 'Las notas no pueden exceder 1000 caracteres'
                }
            }
        },
        branch_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'branches',
                key: 'id'
            },
            validate: {
                notEmpty: {
                    msg: 'La sucursal es obligatoria'
                },
                isUUID: {
                    args: 4,
                    msg: 'El ID de la sucursal debe ser un UUID válido'
                }
            }
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            },
            validate: {
                notEmpty: {
                    msg: 'El usuario es obligatorio'
                },
                isUUID: {
                    args: 4,
                    msg: 'El ID del usuario debe ser un UUID válido'
                }
            }
        }
    }, {
        timestamps: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        tableName: 'purchases',
        indexes: [
            { fields: ['supplier_name'] },
            { fields: ['purchase_date'] },
            { fields: ['status'] },
            { fields: ['branch_id'] },
            { fields: ['user_id'] },
            { fields: ['invoice_number'], unique: true, where: { invoice_number: { $ne: null } } },
            { fields: ['created_at'] }
        ],
        scopes: {
            active: {
                where: {
                    status: ['pending', 'completed']
                }
            },
            byBranch: (branchId) => ({
                where: {
                    branch_id: branchId
                }
            }),
            byStatus: (status) => ({
                where: {
                    status: status
                }
            })
        }
    })

    return Purchase
}