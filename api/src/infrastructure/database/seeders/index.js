const db = require('../models')
const { Branch } = db

const seedBranches = require('./seedBranches');
const seedProducts = require('./seedProducts');
const seedCustomers = require('./seedCustomers');
const seedUsers = require('./seedUsers');
const seedSales = require('./seedSales');
const seedSaleItems = require('./seedSaleItems');
const seedPayments = require('./seedPayments');
const seedInventory = require('./seedInventory');
const seedReports = require('./seedReports');
const seedPurchases = require('./seedPurchases');
const seedLogs = require('./seedLogs');

// Función para limpiar base de datos usando SQL directo
const cleanDatabase = async () => {
    try {
        console.log('Limpiando base de datos...')
        await db.sequelize.query('PRAGMA foreign_keys = OFF')
        
        // Limpiar tablas que existen, ignorar errores si no existen
        const tables = ['logs', 'purchases', 'inventory', 'sale_items', 'sales', 'users', 'customers', 'products', 'branches']
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
    const products = await seedProducts()
    const customers = await seedCustomers(branches)
    const users = await seedUsers(branches)
    const purchases = await seedPurchases(users, branches)
    const sales = await seedSales(customers, users, branches)
    const payments = await seedPayments(sales)
    const saleItems = await seedSaleItems(sales, products)
    const inventory = await seedInventory(products, branches)
    const reports = await seedReports()
    const logs = await seedLogs(db)

    console.log('Sucursales creadas: ', branches.length)
    console.log('Productos creados: ', products.length)
    console.log('Clientes creados: ', customers.length)
    console.log('Usuarios creados: ', users.length)
    console.log('Compras creadas: ', purchases.length)
    console.log('Ventas creadas: ', sales.length)
    console.log('Items de venta creados: ', saleItems.length)
    console.log('Pagos creados: ', payments.length)
    console.log('Inventario creado: ', inventory.length)
    console.log('Reportes creados: ', reports.length)
    console.log('Logs creados: 6 logs de ejemplo')

    console.log('Seeders completados exitosamente!')
        console.log('')
        console.log('Datos de prueba disponibles:')
        console.log(`   - ${branches.length} sucursales`)
        console.log(`   - ${products.length} productos`)
        console.log(`   - ${customers.length} clientes`)
        console.log(`   - ${users.length} usuarios (owner, admin, manager, cashier)`)
        console.log(`   - ${purchases.length} compras`)
        console.log(`   - ${sales.length} ventas`)
        console.log(`   - ${inventory.length} items de inventario`)
        console.log('')
        console.log('Endpoints para probar:')
        console.log('   - GET /branches')
        console.log('   - GET /products')
        console.log('   - GET /customers')
        console.log('   - GET /users')
        console.log('   - GET /inventory')

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