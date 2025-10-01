'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   // Tabla SALE_ITEMS - Basada en modelo SaleItem.js
    await queryInterface.createTable('sale_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      
      sale_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'sales',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },

      product_name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },

      product_sku: {
        type: Sequelize.STRING(50),
        allowNull: true
      },

      quantity: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 1
      },

      unit_price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },

      discount_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
      },

      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      subtotal: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },

      discount_amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },

      total: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
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
    await queryInterface.addIndex('sale_items', ['sale_id', 'product_id']);
    await queryInterface.addIndex('sale_items', ['product_id']);
    await queryInterface.addIndex('sale_items', ['createdAt']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('sale_items');
  }
};
