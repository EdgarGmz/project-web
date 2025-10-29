module.exports = (sequelize, DataTypes) => {
    const Return = sequelize.define(
        'Return',
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
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'products',
                key: 'id'
            }
        },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            reason: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            status: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: 'pending',
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: 'returns',
            timestamps: true,
            paranoid: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at',
        }
    );

    Return.associate = models => {
        Return.belongsTo(models.Customer, { foreignKey: 'customer_id' });
        Return.belongsTo(models.Product, { foreignKey: 'product_id' });
    };

    return Return;
};