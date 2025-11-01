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

// Función para limpiar base de datos usando SQL directo
const cleanDatabase = async () => {
    try {
        console.log('Limpiando base de datos...')
        await db.sequelize.query('PRAGMA foreign_keys = OFF')
        await db.sequelize.query('DELETE FROM inventory')
        await db.sequelize.query('DELETE FROM user_sessions')
        await db.sequelize.query('DELETE FROM sale_items')
        await db.sequelize.query('DELETE FROM sales')
        await db.sequelize.query('DELETE FROM users')
        await db.sequelize.query('DELETE FROM customers')
        await db.sequelize.query('DELETE FROM products')
        await db.sequelize.query('DELETE FROM branches')
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
    const customers = await seedCustomers()
    const users = await seedUsers(branches)
    const sales = await seedSales(customers, users, branches)
    const payments = await seedPayments(sales)
    const saleItems = await seedSaleItems(sales, products)
    const inventory = await seedInventory(products, branches)
    const reports = await seedReports()

    console.log('Sucursales creadas: ', branches.length)
    console.log('Productos creados: ', products.length)
    console.log('Clientes creados: ', customers.length)
    console.log('Usuarios creados: ', users.length)
    console.log('Ventas creadas: ', sales.length)
    console.log('Items de venta creados: ', saleItems.length)
    console.log('Pagos creados: ', payments.length)
    console.log('Inventario creado: ', inventory.length)
    console.log('Reportes creados: ', reports.length)

    console.log('Seeders completados exitosamente!')
        console.log('')
        console.log('Datos de prueba disponibles:')
        console.log(`   - ${branches.length} sucursales`)
        console.log(`   - ${products.length} productos`)
        console.log(`   - ${customers.length} clientes`)
        console.log(`   - ${users.length} usuarios (owner, admin, manager, cashier)`)
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