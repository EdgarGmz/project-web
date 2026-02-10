'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('psychometric_evaluations', {
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
      evaluator_id: {
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
      evaluation_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      test_name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      test_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'personality'
      },
      duration_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 60
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'scheduled'
      },
      raw_scores: {
        type: Sequelize.JSON,
        allowNull: true
      },
      scaled_scores: {
        type: Sequelize.JSON,
        allowNull: true
      },
      interpretation: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      recommendations: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      notes: {
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
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indexes
    await queryInterface.addIndex('psychometric_evaluations', ['customer_id']);
    await queryInterface.addIndex('psychometric_evaluations', ['evaluator_id']);
    await queryInterface.addIndex('psychometric_evaluations', ['branch_id']);
    await queryInterface.addIndex('psychometric_evaluations', ['evaluation_date']);
    await queryInterface.addIndex('psychometric_evaluations', ['status']);
    await queryInterface.addIndex('psychometric_evaluations', ['test_type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('psychometric_evaluations');
  }
};
