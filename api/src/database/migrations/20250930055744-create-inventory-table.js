'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Tabla INVENTORY - Basada en modelo Inventory.js
    await queryInterface.createTable('inventory', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },

      stock_current: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0
      },

      stock_minimum: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0
      },

      stock_maximum: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true
      },

      stock_reserved: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0
      },

      average_cost: {
        type: Sequelize.DECIMAL(15, 4),
        allowNull: false,
        defaultValue: 0
      },

      total_value: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },

      location: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      zone: {
        type: Sequelize.STRING(50),
        allowNull: true
      },

      status: {
        type: Sequelize.ENUM('active', 'inactive', 'blocked', 'audit'),
        allowNull: false,
        defaultValue: 'active'
      },

      last_count_date: {
        type: Sequelize.DATE,
        allowNull: true
      },

      last_count_quantity: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true
      },

      last_count_difference: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true
      },

      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },

      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Indices basados en el modelo
    await queryInterface.addIndex('inventory', ['product_id', 'branch_id'], { unique: true });
    await queryInterface.addIndex('inventory', ['branch_id', 'status']);
    await queryInterface.addIndex('inventory', ['stock_current', 'stock_minimum']);
    await queryInterface.addIndex('inventory', ['branch_id', 'zone']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('inventory');
  }
};
