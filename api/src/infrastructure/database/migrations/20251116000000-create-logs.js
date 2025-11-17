'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      service: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Agregar índices para mejorar el rendimiento de las consultas
    await queryInterface.addIndex('logs', ['user_id'], {
      name: 'logs_user_id_idx'
    });

    await queryInterface.addIndex('logs', ['action'], {
      name: 'logs_action_idx'
    });

    await queryInterface.addIndex('logs', ['service'], {
      name: 'logs_service_idx'
    });

    await queryInterface.addIndex('logs', ['created_at'], {
      name: 'logs_created_at_idx'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('logs');
  }
};
