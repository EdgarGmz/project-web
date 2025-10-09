'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sku: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      barcode: {
        type: Sequelize.STRING(50),
        allowNull: true,
        unique: true
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      subcategory: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      unit_measure: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'unit'
      },
      weight: {
        type: Sequelize.DECIMAL(8, 3),
        allowNull: true
      },
      dimensions: {
        type: Sequelize.JSON,
        allowNull: true
      },
      tax_rate: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false,
        defaultValue: 0.0000
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Crear índices
    await queryInterface.addIndex('products', ['sku'], {
      unique: true,
      name: 'products_sku_unique'
    });
    
    await queryInterface.addIndex('products', ['barcode'], {
      unique: true,
      name: 'products_barcode_unique'
    });

    await queryInterface.addIndex('products', ['category'], {
      name: 'products_category_index'
    });

    await queryInterface.addIndex('products', ['subcategory'], {
      name: 'products_subcategory_index'
    });

    await queryInterface.addIndex('products', ['is_active'], {
      name: 'products_is_active_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};