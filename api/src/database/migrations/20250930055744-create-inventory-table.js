'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('inventory', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: 'Identificador único'
      },

      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID del producto'
      },

      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID de la sucursal'
      },

      current_stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Stock actual'
      },

      minimum_stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Stock mínimo'
      },

      maximum_stock: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Stock máximo'
      },

      reserved_stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Stock reservado'
      },

      last_restock_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha último restock'
      },

      location: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Ubicación en almacén'
      },

      last_count_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha último conteo'
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

    await queryInterface.addIndex('inventory', ['product_id', 'branch_id'], { 
      unique: true,
      name: 'idx_inventory_product_branch_unique'
    });

    await queryInterface.addIndex('inventory', ['branch_id'], {
      name: 'idx_inventory_branch'
    });

    await queryInterface.addIndex('inventory', ['current_stock', 'minimum_stock'], {
      name: 'idx_inventory_stock_alerts'
    });

    await queryInterface.addIndex('inventory', ['location'], {
      name: 'idx_inventory_location'
    });

    await queryInterface.addIndex('inventory', ['last_restock_date'], {
      name: 'idx_inventory_last_restock'
    });

    await queryInterface.addIndex('inventory', ['last_count_date'], {
      name: 'idx_inventory_last_count'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('inventory');
  }
};
