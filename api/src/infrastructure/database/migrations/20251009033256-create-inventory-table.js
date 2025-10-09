'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
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
      current_stock: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0.000
      },
      minimum_stock: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0.000
      },
      maximum_stock: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true
      },
      reserved_stock: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0.000
      },
      available_stock: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: false,
        defaultValue: 0.000
      },
      last_purchase_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_sale_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Crear índices
    await queryInterface.addIndex('inventory', ['product_id'], {
      name: 'inventory_product_id_index'
    });
    
    await queryInterface.addIndex('inventory', ['branch_id'], {
      name: 'inventory_branch_id_index'
    });

    await queryInterface.addIndex('inventory', ['product_id', 'branch_id'], {
      unique: true,
      name: 'inventory_product_branch_unique'
    });

    await queryInterface.addIndex('inventory', ['current_stock'], {
      name: 'inventory_current_stock_index'
    });

    await queryInterface.addIndex('inventory', ['minimum_stock'], {
      name: 'inventory_minimum_stock_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inventory');
  }
};