'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
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
      hire_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('owner', 'admin', 'supervisor', 'cashier', 'auditor'),
        allowNull: false,
        defaultValue: 'cashier'
      },
      employee_id: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
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
      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'branches', key: 'id' }
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      reset_token: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
