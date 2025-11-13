module.exports = (sequelize, DataTypes) => {
    const Payment = sequelize.define(
        'Payment',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
        customer_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'customers',
                key: 'id'
            }
        },
            amount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            method: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            reference: {
                type: DataTypes.STRING(100),
                allowNull: true,
            },
            status: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: 'pending',
            },
            notes: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            tableName: 'payments',
            timestamps: true,
            paranoid: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at',
        }
    );

    Payment.associate = models => {
        Payment.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
    };

    return Payment;
};