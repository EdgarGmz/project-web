'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('therapy_sessions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      customer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      therapist_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      branch_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      session_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 60
      },
      session_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'individual'
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'scheduled'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      diagnosis: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      treatment_plan: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      payment_status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'pending'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('therapy_sessions', ['customer_id']);
    await queryInterface.addIndex('therapy_sessions', ['therapist_id']);
    await queryInterface.addIndex('therapy_sessions', ['branch_id']);
    await queryInterface.addIndex('therapy_sessions', ['session_date']);
    await queryInterface.addIndex('therapy_sessions', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('therapy_sessions');
  }
};
