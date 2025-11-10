'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Hacer branch_id nullable para permitir usuarios sin sucursal asignada
    await queryInterface.changeColumn('users', 'branch_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'branches',
        key: 'id',
      },
    });
  },

  async down (queryInterface, Sequelize) {
    // Revertir: hacer branch_id requerido nuevamente
    await queryInterface.changeColumn('users', 'branch_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'branches',
        key: 'id',
      },
    });
  }
};
