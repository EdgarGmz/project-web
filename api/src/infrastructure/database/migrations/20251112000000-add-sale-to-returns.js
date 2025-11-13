'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar columna sale_id
    await queryInterface.addColumn('returns', 'sale_id', {
      type: Sequelize.UUID,
      allowNull: true, // Permitir null para devoluciones antiguas
      references: {
        model: 'sales',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Agregar columna sale_item_id
    await queryInterface.addColumn('returns', 'sale_item_id', {
      type: Sequelize.UUID,
      allowNull: true, // Permitir null para devoluciones antiguas
      references: {
        model: 'sale_items',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('returns', 'sale_id');
    await queryInterface.removeColumn('returns', 'sale_item_id');
  }
};
