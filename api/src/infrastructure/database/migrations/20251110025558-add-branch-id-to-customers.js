'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('customers', 'branch_id', {
      type: Sequelize.UUID,
      allowNull: true, // Permitir null inicialmente
      references: {
        model: 'branches',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('customers', 'branch_id');
  }
};
