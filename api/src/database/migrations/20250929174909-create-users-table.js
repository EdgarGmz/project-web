'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Tabla USERS - Basada en modelo User.js
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },

      full_name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },

      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },

      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },

      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },

      department: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      position: {
        type: Sequelize.STRING(100),
        allowNull: true
      },

      role: {
        type: Sequelize.ENUM('admin', 'manager', 'cashier', 'viewer'),
        allowNull: false,
        defaultValue: 'viewer'
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

      login_attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },

      locked_until: {
        type: Sequelize.DATE,
        allowNull: true
      },

      password_changed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      avatar: {
        type: Sequelize.STRING(255),
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
    await queryInterface.addIndex('users', ['username'], { unique: true });
    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['role']);
    await queryInterface.addIndex('users', ['is_active']);
    await queryInterface.addIndex('users', ['department']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
