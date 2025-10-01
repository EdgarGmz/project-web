'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Tabla SALES - Basada en modelo Sales.js

    await queryInterface.createTable('sales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      subtotal: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },

      discount_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
      },

      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },

      tax_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.16
      },

      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },

      total_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },

      sale_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },

      payment_method: {
        type: Sequelize.ENUM('cash', 'card', 'transfer', 'mixed'),
        allowNull: false,
        defaultValue: 'cash'
      },

      status: {
        type: Sequelize.ENUM('pending', 'completed', 'cancelled', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
      },

      transaction_reference: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
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
    await queryInterface.addIndex('sales', ['transaction_reference'], { unique: true });
    await queryInterface.addIndex('sales', ['status']);
    await queryInterface.addIndex('sales', ['sale_date']);
    await queryInterface.addIndex('sales', ['branch_id', 'sale_date']);
    await queryInterface.addIndex('sales', ['user_id', 'sale_date']);
    await queryInterface.addIndex('sales', ['customer_id']);
    await queryInterface.addIndex('sales', ['payment_method']);
    await queryInterface.addIndex('sales', ['total_amount']);
    await queryInterface.addIndex('sales', ['createdAt']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('sales');
  }
};
