module.exports = (sequelize, DataTypes) => {
    const Log = sequelize.define(
        'Log',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                validate: {
                    notEmpty: true,
                },
            },
            action: {
                type: DataTypes.STRING(100),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [2, 100],
                },
            },
            service: {
                type: DataTypes.STRING(100),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    len: [2, 100],
                },
            },
            message: {
                type: DataTypes.TEXT,
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
            },
        },
        {
            tableName: 'logs',
            timestamps: true,
            paranoid: true,
            deletedAt: 'deleted_at',
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            indexes: [
                { fields: ['user_id'] },
                { fields: ['action'] },
                { fields: ['service'] },
                { fields: ['created_at'] },
            ],
        }
    );

    Log.associate = (models) => {
        Log.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user',
        });
    };

    return Log;
};
