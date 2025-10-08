'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      name: {
        type: Sequelize.STRING(200),
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
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true
      },

      category: {
        type: Sequelize.ENUM(
            'Consola',
            'Videojuego',
            'Accesorio',
            'Tarjeta de regalo',
            'Coleccionable',
            'Merchandising',
            'PC Gaming',
            'Realidad Virtual',
            'Suscripción',
            'Juguete'),
        allowNull: false
      },

      subcategory: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      cost: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },

      price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },

      unit_measure: {
        type: Sequelize.STRING(50),
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
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
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
    await queryInterface.addIndex('products', ['sku'], { unique: true });
    await queryInterface.addIndex('products', ['barcode'], { unique: true });
    await queryInterface.addIndex('products', ['category']);
    await queryInterface.addIndex('products', ['name']);
    await queryInterface.addIndex('products', ['is_active']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};