'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      category: {
        type: Sequelize.ENUM('general', 'pos', 'inventory', 'notifications', 'security', 'backup'),
        allowNull: false,
      },
      key: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      type: {
        type: Sequelize.ENUM('string', 'number', 'boolean', 'json'),
        allowNull: false,
        defaultValue: 'string',
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });

    // Agregar índices
    await queryInterface.addIndex('settings', ['category']);
    await queryInterface.addIndex('settings', ['category', 'key'], { unique: true });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('settings');
  }
};
