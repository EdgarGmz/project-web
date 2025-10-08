'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      first_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      last_name: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      },

      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },

      address: {
        type: Sequelize.STRING(255),
        allowNull: true
      },

      city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      state: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      postal_code: {
        type: Sequelize.STRING(10),
        allowNull: true
      },

      company_name: {
        type: Sequelize.STRING(150),
        allowNull: true
      },

      tax_id: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },

      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Indices basados en el modelo
    await queryInterface.addIndex('customers', ['email'], { unique: true });
    await queryInterface.addIndex('customers', ['tax_id'], { unique: true });
    await queryInterface.addIndex('customers', ['company_name']);
    await queryInterface.addIndex('customers', ['is_active']);
    await queryInterface.addIndex('customers', ['city', 'state']);
    await queryInterface.addIndex('customers', ['created_at']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('customers');
  }
};
