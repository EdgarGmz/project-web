'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    
    // Verificar si la tabla customers existe
    let tableExists = false;
    if (dialect === 'sqlite') {
      const [results] = await queryInterface.sequelize.query(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='customers'
      `).catch(() => [[]]);
      tableExists = results.length > 0;
    } else {
      // Para otros dialectos, intentar una consulta simple
      try {
        await queryInterface.sequelize.query(`SELECT 1 FROM customers LIMIT 1`);
        tableExists = true;
      } catch {
        tableExists = false;
      }
    }

    if (!tableExists) {
      console.log('⚠️  Tabla customers no existe, saltando migración de branch_id');
      return;
    }

    // Verificar si la columna branch_id existe
    let columnExists = false;
    if (dialect === 'sqlite') {
      const [columns] = await queryInterface.sequelize.query(`PRAGMA table_info(customers)`);
      columnExists = columns.some(col => col.name === 'branch_id');
    } else {
      // Para otros dialectos, intentar obtener información de la columna
      try {
        const tableDescription = await queryInterface.describeTable('customers');
        columnExists = 'branch_id' in tableDescription;
      } catch {
        columnExists = false;
      }
    }

    if (!columnExists) {
      console.log('ℹ️  Columna branch_id no existe en customers, saltando migración');
      return;
    }

    // Migrar datos existentes a la tabla intermedia
    try {
      const [existingCustomers] = await queryInterface.sequelize.query(
        `SELECT id, branch_id FROM customers WHERE branch_id IS NOT NULL AND deleted_at IS NULL`
      );

      if (existingCustomers && existingCustomers.length > 0) {
        // Verificar si la tabla customer_branches existe
        let junctionTableExists = false;
        if (dialect === 'sqlite') {
          const [results] = await queryInterface.sequelize.query(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='customer_branches'
          `).catch(() => [[]]);
          junctionTableExists = results.length > 0;
        } else {
          try {
            await queryInterface.sequelize.query(`SELECT 1 FROM customer_branches LIMIT 1`);
            junctionTableExists = true;
          } catch {
            junctionTableExists = false;
          }
        }

        if (junctionTableExists) {
          // Para tablas con clave primaria compuesta, no necesitamos el campo id
          const insertData = existingCustomers.map(customer => ({
            customer_id: customer.id,
            branch_id: customer.branch_id,
            created_at: new Date(),
            updated_at: new Date()
          }));

          await queryInterface.bulkInsert('customer_branches', insertData);
          console.log(`✅ Migrados ${insertData.length} registros a customer_branches`);
        }
      }
    } catch (error) {
      console.log('⚠️  Error al migrar datos a customer_branches:', error.message);
    }

    // Eliminar la columna branch_id
    // En SQLite, si hay foreign keys, necesitamos recrear la tabla
    try {
      await queryInterface.removeColumn('customers', 'branch_id');
      console.log('✅ Columna branch_id eliminada exitosamente');
    } catch (error) {
      if (dialect === 'sqlite' && (error.message.includes('foreign key') || error.message.includes('constraint'))) {
        console.log('ℹ️  Recreando tabla customers sin branch_id (SQLite requiere recrear tabla)');
        
        // Obtener todas las columnas excepto branch_id
        const [columns] = await queryInterface.sequelize.query(`PRAGMA table_info(customers)`);
        const columnsToKeep = columns
          .filter(col => col.name !== 'branch_id')
          .map(col => col.name)
          .join(', ');
        
        // Crear nueva tabla sin branch_id
        await queryInterface.sequelize.query(`
          CREATE TABLE customers_new AS 
          SELECT ${columnsToKeep} FROM customers
        `);
        
        // Eliminar tabla antigua y renombrar nueva
        await queryInterface.sequelize.query(`DROP TABLE customers`);
        await queryInterface.sequelize.query(`ALTER TABLE customers_new RENAME TO customers`);
        
        console.log('✅ Tabla customers recreada sin branch_id');
      } else {
        throw error;
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Restaurar la columna branch_id
    await queryInterface.addColumn('customers', 'branch_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'branches',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Si hay datos en customer_branches, migrar el primer branch_id de vuelta
    // (esto es una simplificación, ya que N:N puede tener múltiples branches)
    await queryInterface.sequelize.query(`
      UPDATE customers c
      SET branch_id = (
        SELECT cb.branch_id 
        FROM customer_branches cb 
        WHERE cb.customer_id = c.id 
        LIMIT 1
      )
      WHERE EXISTS (
        SELECT 1 FROM customer_branches cb WHERE cb.customer_id = c.id
      )
    `);
  }
};

