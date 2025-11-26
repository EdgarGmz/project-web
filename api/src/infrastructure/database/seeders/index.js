const db = require('../models')
const { Branch } = db

const seedBranches = require('./seedBranches');
const seedUsers = require('./seedUsers');

// Función para limpiar base de datos usando SQL directo
const cleanDatabase = async () => {
    try {
        console.log('Limpiando base de datos...')
        await db.sequelize.query('PRAGMA foreign_keys = OFF')
        
        // Limpiar tablas que existen, ignorar errores si no existen
        const tables = ['purchases', 'inventory', 'sale_items', 'sales', 'users', 'customers', 'products', 'branches']
        for (const table of tables) {
            try {
                await db.sequelize.query(`DELETE FROM ${table}`)
                console.log(`✓ Tabla ${table} limpiada`)
            } catch (err) {
                console.log(`⚠ Tabla ${table} no existe o no se pudo limpiar`)
            }
        }
        
        await db.sequelize.query('PRAGMA foreign_keys = ON')
        console.log('Base de datos limpiada exitosamente')
    } catch (error) {
        console.error('Error al limpiar base de datos:', error)
        await db.sequelize.query('PRAGMA foreign_keys = ON')
        throw error
    }
}

// Función para poblar la base de datos
const seedDatabase = async (force = false) => {
    try {
        console.log('Iniciando seeders...')
        const branchCount = await Branch.count({ where: { is_active: true } })
        if (branchCount > 0 && !force) {
            console.log('Ya existen datos en la base de datos')
            console.log('Usa: npm run seed:force para recrear todos los datos')
            return
        }  

    // Ejecutar seeds en orden correcto - Solo datos mínimos para deploy
    const branches = await seedBranches()
    const users = await seedUsers(branches)
    
    // No crear datos de prueba (cero productos, clientes, ventas, compras, etc.)
    const products = []
    const customers = []
    const purchases = []
    const sales = []
    const payments = []
    const saleItems = []
    const inventory = []
    const reports = []

    console.log('✅ Seeders completados exitosamente!')
    console.log('')
    console.log('📊 Datos creados para deploy:')
    console.log(`   - ${branches.length} sucursal(es) (CEDIS)`)
    console.log(`   - ${users.length} usuario(s) (owner)`)
    console.log(`   - ${products.length} productos`)
    console.log(`   - ${customers.length} clientes`)
    console.log(`   - ${purchases.length} compras`)
    console.log(`   - ${sales.length} ventas`)
    console.log(`   - ${payments.length} pagos`)
    console.log(`   - ${inventory.length} items de inventario`)
    console.log('')
    console.log('')
    console.log('📡 Endpoints disponibles:')
    console.log('   - GET /branches')
    console.log('   - GET /users')

    } catch (error) {
        console.error('Error en seeders:', error)
        throw error
    }
}

// Función para forzar recreación de datos
const seedDatabaseForce = async () => {
    await cleanDatabase()
    await seedDatabase(true)
}

module.exports = {
    seedDatabase,
    seedDatabaseForce,
    cleanDatabase
}