'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
    // CREANDO LA TABLA BRANCHES
    
    await queryInterface.createTable('branches', {
      
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      
      code: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      
      address: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      
      city: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
    
      state: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      
      postal_code: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },

      // 👤 MANAGER - LO AGREGAREMOS DESPUÉS en otra migración
      // manager_id: {
      //   type: Sequelize.INTEGER,
      //   allowNull: true,
      //   references: {
      //     model: 'users',
      //     key: 'id'
      //   }
      // },
      
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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

    // ÍNDICES 
    await queryInterface.addIndex('branches', ['name'], { unique: true });
    await queryInterface.addIndex('branches', ['code'], { unique: true });
    await queryInterface.addIndex('branches', ['email'], { unique: true });
    await queryInterface.addIndex('branches', ['city', 'state']);
    await queryInterface.addIndex('branches', ['is_active']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('branches');
  }
};
