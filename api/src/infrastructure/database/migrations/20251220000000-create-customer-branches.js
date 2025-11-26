'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    
    // Verificar si la tabla ya existe
    let tableExists = false;
    if (dialect === 'sqlite') {
      const [results] = await queryInterface.sequelize.query(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name='customer_branches'
      `).catch(() => [[]]);
      tableExists = results.length > 0;
    } else {
      try {
        await queryInterface.sequelize.query(`SELECT 1 FROM customer_branches LIMIT 1`);
        tableExists = true;
      } catch {
        tableExists = false;
      }
    }

    if (tableExists) {
      // Verificar si la tabla tiene el campo 'id' (estructura antigua)
      let hasIdField = false;
      if (dialect === 'sqlite') {
        const [columns] = await queryInterface.sequelize.query(`PRAGMA table_info(customer_branches)`);
        hasIdField = columns.some(col => col.name === 'id');
      } else {
        try {
          const tableDescription = await queryInterface.describeTable('customer_branches');
          hasIdField = 'id' in tableDescription;
        } catch {
          hasIdField = false;
        }
      }

      if (hasIdField) {
        console.log('⚠️  Tabla customer_branches tiene estructura antigua (con id), recreando...');
        await queryInterface.dropTable('customer_branches');
        tableExists = false;
      } else {
        console.log('ℹ️  Tabla customer_branches ya existe con estructura correcta');
      }
    }

    if (!tableExists) {
      await queryInterface.createTable('customer_branches', {
        customer_id: {
          type: Sequelize.UUID,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'customers',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        branch_id: {
          type: Sequelize.UUID,
          allowNull: false,
          primaryKey: true,
          references: {
            model: 'branches',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW
        }
      });
      console.log('✅ Tabla customer_branches creada');
    }

    // Verificar y crear índices solo si no existen
    if (dialect === 'sqlite') {
      // Verificar si el índice único ya existe
      const [indexes] = await queryInterface.sequelize.query(`
        SELECT name FROM sqlite_master 
        WHERE type='index' AND name='customer_branches_unique'
      `).catch(() => [[]]);
      
      if (indexes.length === 0) {
        await queryInterface.sequelize.query(`
          CREATE UNIQUE INDEX customer_branches_unique 
          ON customer_branches(customer_id, branch_id)
        `);
        console.log('✅ Índice único customer_branches_unique creado');
      } else {
        console.log('ℹ️  Índice customer_branches_unique ya existe');
      }

      // Crear índices individuales (IF NOT EXISTS previene errores si ya existen)
      await queryInterface.sequelize.query(`
        CREATE INDEX IF NOT EXISTS customer_branches_customer_id 
        ON customer_branches(customer_id)
      `).catch(() => {});
      
      await queryInterface.sequelize.query(`
        CREATE INDEX IF NOT EXISTS customer_branches_branch_id 
        ON customer_branches(branch_id)
      `).catch(() => {});
    } else {
      // Para otros dialectos, usar addIndex con verificación
      try {
        await queryInterface.addIndex('customer_branches', {
          fields: ['customer_id', 'branch_id'],
          unique: true,
          name: 'customer_branches_unique'
        });
      } catch (error) {
        if (!error.message.includes('already exists')) {
          throw error;
        }
        console.log('ℹ️  Índice customer_branches_unique ya existe');
      }

      try {
        await queryInterface.addIndex('customer_branches', ['customer_id']);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }

      try {
        await queryInterface.addIndex('customer_branches', ['branch_id']);
      } catch (error) {
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('customer_branches');
  }
};

