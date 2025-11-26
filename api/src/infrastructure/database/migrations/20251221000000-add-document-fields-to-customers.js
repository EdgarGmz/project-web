'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    
    // Verificar si las columnas ya existen
    let columnsToAdd = [];
    
    if (dialect === 'sqlite') {
      const [tableInfo] = await queryInterface.sequelize.query(`PRAGMA table_info(customers);`);
      const existingColumns = tableInfo.map(col => col.name);
      
      if (!existingColumns.includes('document_type')) {
        columnsToAdd.push({
          name: 'document_type',
          definition: {
            type: Sequelize.STRING(20),
            allowNull: true,
            defaultValue: 'dni'
          }
        });
      }
      
      if (!existingColumns.includes('document_number')) {
        columnsToAdd.push({
          name: 'document_number',
          definition: {
            type: Sequelize.STRING(50),
            allowNull: true
          }
        });
      }
      
      if (!existingColumns.includes('birth_date')) {
        columnsToAdd.push({
          name: 'birth_date',
          definition: {
            type: Sequelize.DATE,
            allowNull: true
          }
        });
      }
      
      if (!existingColumns.includes('notes')) {
        columnsToAdd.push({
          name: 'notes',
          definition: {
            type: Sequelize.TEXT,
            allowNull: true
          }
        });
      }
      
      // SQLite no soporta ALTER TABLE ADD COLUMN múltiple, así que agregamos una por una
      for (const column of columnsToAdd) {
        await queryInterface.addColumn('customers', column.name, column.definition);
        console.log(`✅ Columna ${column.name} agregada a customers`);
      }
    } else {
      // Para otros dialectos (PostgreSQL, MySQL, etc.)
      const [results] = await queryInterface.sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'customers'
      `).catch(() => [[]]);
      
      const existingColumns = results.map(r => r.column_name);
      
      if (!existingColumns.includes('document_type')) {
        await queryInterface.addColumn('customers', 'document_type', {
          type: Sequelize.STRING(20),
          allowNull: true,
          defaultValue: 'dni'
        });
        console.log('✅ Columna document_type agregada a customers');
      }
      
      if (!existingColumns.includes('document_number')) {
        await queryInterface.addColumn('customers', 'document_number', {
          type: Sequelize.STRING(50),
          allowNull: true
        });
        console.log('✅ Columna document_number agregada a customers');
      }
      
      if (!existingColumns.includes('birth_date')) {
        await queryInterface.addColumn('customers', 'birth_date', {
          type: Sequelize.DATE,
          allowNull: true
        });
        console.log('✅ Columna birth_date agregada a customers');
      }
      
      if (!existingColumns.includes('notes')) {
        await queryInterface.addColumn('customers', 'notes', {
          type: Sequelize.TEXT,
          allowNull: true
        });
        console.log('✅ Columna notes agregada a customers');
      }
    }
    
    // Crear índice único para document_number si no existe
    // Nota: SQLite no soporta índices únicos parciales, así que creamos un índice único simple
    try {
      if (dialect === 'sqlite') {
        // Para SQLite, verificar si el índice ya existe
        const [indexes] = await queryInterface.sequelize.query(`
          SELECT name FROM sqlite_master 
          WHERE type='index' AND name='customers_document_number_unique'
        `);
        
        if (indexes.length === 0) {
          await queryInterface.sequelize.query(`
            CREATE UNIQUE INDEX customers_document_number_unique 
            ON customers(document_number) 
            WHERE document_number IS NOT NULL
          `).catch(() => {
            // Si falla (SQLite antiguo), crear índice sin WHERE
            return queryInterface.sequelize.query(`
              CREATE UNIQUE INDEX customers_document_number_unique 
              ON customers(document_number)
            `);
          });
          console.log('✅ Índice único para document_number creado');
        } else {
          console.log('ℹ️  Índice para document_number ya existe');
        }
      } else {
        await queryInterface.addIndex('customers', ['document_number'], {
          unique: true,
          name: 'customers_document_number_unique',
          where: {
            document_number: { [Sequelize.Op.ne]: null }
          }
        });
        console.log('✅ Índice único para document_number creado');
      }
    } catch (error) {
      // El índice ya existe o no se puede crear
      console.log('ℹ️  Índice para document_number ya existe o no se pudo crear:', error.message);
    }
  },

  async down(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    
    // Eliminar índices primero
    try {
      await queryInterface.removeIndex('customers', 'customers_document_number_unique');
    } catch (error) {
      console.log('ℹ️  Índice no existe o no se pudo eliminar');
    }
    
    // Eliminar columnas
    const columnsToRemove = ['notes', 'birth_date', 'document_number', 'document_type'];
    
    for (const columnName of columnsToRemove) {
      try {
        await queryInterface.removeColumn('customers', columnName);
        console.log(`✅ Columna ${columnName} eliminada de customers`);
      } catch (error) {
        console.log(`ℹ️  Columna ${columnName} no existe o no se pudo eliminar`);
      }
    }
  }
};

