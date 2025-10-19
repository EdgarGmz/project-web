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
                type: DataTypes.INTEGER,
                allowNull: false,
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
        }
    );

    Payment.associate = models => {
        Payment.belongsTo(models.Customer, { foreignKey: 'customer_id' });
    };

    return Payment;
};