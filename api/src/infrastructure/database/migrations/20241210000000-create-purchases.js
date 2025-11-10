'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Purchases', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      supplier_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      supplier_contact: {
        type: Sequelize.STRING,
        allowNull: true
      },
      supplier_phone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      purchase_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      invoice_number: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'cancelled'),
        defaultValue: 'pending'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      branch_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
        allowNull: true,
        type: Sequelize.DATE
      }
    });

    // Crear índices para optimizar consultas
    await queryInterface.addIndex('Purchases', ['branch_id']);
    await queryInterface.addIndex('Purchases', ['user_id']);
    await queryInterface.addIndex('Purchases', ['status']);
    await queryInterface.addIndex('Purchases', ['purchase_date']);
    await queryInterface.addIndex('Purchases', ['supplier_name']);
  },

  async down(queryInterface, Sequelize) {
    // Eliminar índices primero
    await queryInterface.removeIndex('Purchases', ['supplier_name']);
    await queryInterface.removeIndex('Purchases', ['purchase_date']);
    await queryInterface.removeIndex('Purchases', ['status']);
    await queryInterface.removeIndex('Purchases', ['user_id']);
    await queryInterface.removeIndex('Purchases', ['branch_id']);
    
    // Eliminar tabla
    await queryInterface.dropTable('Purchases');
  }
};