module.exports = (sequelize, DataTypes) => {
    const Setting = sequelize.define(
        'Setting',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            category: {
                type: DataTypes.ENUM('general', 'pos', 'inventory', 'notifications', 'security', 'backup'),
                allowNull: false,
            },
            key: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            value: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            type: {
                type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
                allowNull: false,
                defaultValue: 'string',
            },
            description: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            tableName: 'settings',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            indexes: [
                { fields: ['category'] },
                { fields: ['category', 'key'], unique: true },
            ],
        }
    );

    return Setting;
};
