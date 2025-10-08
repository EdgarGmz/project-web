'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },

      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },

      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },

      role: {
        type: Sequelize.ENUM('owner', 'supervisor', 'cashier', 'admin', 'auditor'),
        allowNull: false,
        defaultValue: 'cashier'
      },

      employee_id: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },

      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },

      hire_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },

      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'branches',
          key: 'id'
        }
      },

      permissions: {
        type: Sequelize.JSON,
        allowNull: true
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      last_login: {
        type: Sequelize.DATE,
        allowNull: true
      },

      reset_token: {
        type: Sequelize.STRING(255),
        allowNull: true
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
    })

    // Índices
    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['employee_id'], { unique: true });
    await queryInterface.addIndex('users', ['is_active']);
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['branch_id']);
    await queryInterface.addIndex('users', ['role', 'is_active']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};