const db = require('../models')
const { Branch } = db

const seedBranches = require('./seedBranches');
const seedUsers = require('./seedUsers');
const seedCustomers = require('./seedCustomers');
const seedProducts = require('./seedProducts');
const seedInventory = require('./seedInventory');

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

    // Ejecutar seeds en orden correcto
    const branches = await seedBranches()
    const users = await seedUsers(branches)
    const customers = await seedCustomers(branches)
    const products = await seedProducts()
    const inventory = await seedInventory(products, branches)
    
    // No crear datos de prueba para ventas, compras, etc.
    const purchases = []
    const sales = []
    const payments = []
    const saleItems = []
    const reports = []

    console.log('✅ Seeders completados exitosamente!')
    console.log('')
    console.log('📊 Datos creados:')
    console.log(`   - ${branches.length} sucursal(es) (CEDIS)`)
    console.log(`   - ${users.length} usuario(s)`)
    console.log(`   - ${customers.length} cliente(s)`)
    console.log(`   - ${products.length} productos`)
    console.log(`   - ${inventory.length} items de inventario en CEDIS`)
    console.log(`   - ${purchases.length} compras`)
    console.log(`   - ${sales.length} ventas`)
    console.log(`   - ${payments.length} pagos`)
    console.log('')
    console.log('👤 Usuarios creados:')
    users.forEach(user => {
        console.log(`   - ${user.email} (${user.role}) - Password: admin123`)
    })
    console.log('')
    console.log('⚠️  IMPORTANTE: Cambia las contraseñas por defecto (admin123) en producción.')
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