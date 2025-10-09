const db = require('../models')
const bcrypt = require('bcrypt')

const { Branch, Product, Customer, User, Inventory } = db

// Función para limpiar base de datos usando SQL directo
const cleanDatabase = async () => {
    try {
        console.log('Limpiando base de datos...')
        
        // Deshabilitar foreign keys temporalmente
        await db.sequelize.query('PRAGMA foreign_keys = OFF')
        
        // Limpiar tablas usando SQL directo
        await db.sequelize.query('DELETE FROM inventory')
        await db.sequelize.query('DELETE FROM user_sessions')
        await db.sequelize.query('DELETE FROM sale_items')
        await db.sequelize.query('DELETE FROM sales')
        await db.sequelize.query('DELETE FROM users')
        await db.sequelize.query('DELETE FROM customers')
        await db.sequelize.query('DELETE FROM products')
        await db.sequelize.query('DELETE FROM branches')
        
        // Reactivar foreign keys
        await db.sequelize.query('PRAGMA foreign_keys = ON')
        
        console.log('Base de datos limpiada exitosamente')
    } catch (error) {
        console.error('Error al limpiar base de datos:', error)
        // Reactivar foreign keys en caso de error
        await db.sequelize.query('PRAGMA foreign_keys = ON')
        throw error
    }
}

// Función para poblar la base de datos
const seedDatabase = async (force = false) => {
    try {
        console.log('Iniciando seeders...')
        
        // Verificar si ya existen datos
        const branchCount = await Branch.count({ where: { is_active: true } })
        
        if (branchCount > 0 && !force) {
            console.log('Ya existen datos en la base de datos')
            console.log('Usa: npm run seed:force para recrear todos los datos')
            return
        }

        // Crear sucursales
        const branches = await Branch.bulkCreate([
            {
                name: 'Sucursal Centro',
                code: 'CTR-001',
                address: 'Av. Juarez #123, Centro, Ciudad de Monterrey',
                city: 'Monterrey',
                state: 'Nuevo Leon',
                postal_code: '64000',
                phone: '81-1234-5678',
                email: 'sucursal_centro@empresa.com',
                is_active: true
            },
            {
                name: 'Sucursal Norte',
                code: 'NTE-002',
                address: 'Av. Constitucion #123, Centro, Ciudad de Guadalupe',
                city: 'Guadalupe',
                state: 'Nuevo Leon',
                postal_code: '64000',
                phone: '81-2468-1357',
                email: 'sucursal_norte@empresa.com',
                is_active: true
            },
            {
                name: 'Sucursal Sur',
                code: 'SUR-003',
                address: 'Av. Almazan #123, Centro, Ciudad de San Nicolas',
                city: 'San Nicolas',
                state: 'Nuevo Leon',
                postal_code: '64000',
                phone: '81-9876-5432',
                email: 'sucursal_sur@empresa.com',
                is_active: true
            }
        ])
        console.log('Sucursales creadas: ', branches.length)

        // Crear productos
        const products = await Product.bulkCreate([
            {
                name: 'PlayStation 5',
                description: 'Consola de nueva generación con SSD ultra rápido y gráficos 4K',
                sku: 'PS5-CONSOLE-001',
                barcode: '711719541028',
                category: 'Consola',
                subcategory: 'PlayStation',
                cost: 450.00,
                price: 599.99,
                unit_measure: 'unit',
                weight: 4.5,
                dimensions: JSON.stringify({ length: 39, width: 26, height: 10.4 }),
                tax_rate: 0.16,
                is_active: true,
                metadata: JSON.stringify({ platform: 'PlayStation', generation: 5, storage: '825GB SSD' }),
                tags: JSON.stringify(['PS5', 'Sony', 'Nueva Generación', '4K'])
            },
            {
                name: 'Xbox Series X',
                description: 'La consola Xbox más potente de todos los tiempos con 12 TFLOPS',
                sku: 'XBOX-SX-001',
                barcode: '889842640649',
                category: 'Consola',
                subcategory: 'Xbox',
                cost: 450.00,
                price: 599.99,
                unit_measure: 'unit',
                weight: 4.45,
                dimensions: JSON.stringify({ length: 30.1, width: 15.1, height: 15.1 }),
                tax_rate: 0.16,
                is_active: true,
                metadata: JSON.stringify({ platform: 'Xbox', generation: 'Series X', storage: '1TB SSD' }),
                tags: JSON.stringify(['Xbox', 'Microsoft', 'Series X', '12 TFLOPS'])
            },
            {
                name: 'Nintendo Switch OLED',
                description: 'Nintendo Switch con pantalla OLED de 7 pulgadas',
                sku: 'NSW-OLED-001',
                barcode: '045496882068',
                category: 'Consola',
                subcategory: 'Nintendo',
                cost: 280.00,
                price: 349.99,
                unit_measure: 'unit',
                weight: 0.42,
                dimensions: JSON.stringify({ length: 24.2, width: 10.4, height: 1.4 }),
                tax_rate: 0.16,
                is_active: true,
                metadata: JSON.stringify({ platform: 'Nintendo', type: 'Hybrid', storage: '64GB' }),
                tags: JSON.stringify(['Nintendo', 'Switch', 'OLED', 'Portátil'])
            },
            {
                name: 'The Legend of Zelda: Tears of the Kingdom',
                description: 'La épica continuación de Breath of the Wild',
                sku: 'ZELDA-TOTK-NSW',
                barcode: '045496596899',
                category: 'Videojuego',
                subcategory: 'Aventura',
                cost: 42.00,
                price: 69.99,
                unit_measure: 'unit',
                weight: 0.1,
                tax_rate: 0.16,
                is_active: true,
                metadata: JSON.stringify({ platform: 'Nintendo Switch', genre: 'Aventura', rating: 'E10+' }),
                tags: JSON.stringify(['Zelda', 'Nintendo', 'Aventura', 'Open World'])
            },
            {
                name: 'God of War Ragnarök',
                description: 'La conclusión de la saga nórdica de Kratos y Atreus',
                sku: 'GOW-RAGNAROK-PS5',
                barcode: '711719543294',
                category: 'Videojuego',
                subcategory: 'Acción',
                cost: 42.00,
                price: 69.99,
                unit_measure: 'unit',
                weight: 0.1,
                tax_rate: 0.16,
                is_active: true,
                metadata: JSON.stringify({ platform: 'PlayStation 5', genre: 'Acción', rating: 'M' }),
                tags: JSON.stringify(['God of War', 'PlayStation', 'Acción', 'Aventura'])
            },
            {
                name: 'Halo Infinite',
                description: 'El regreso del Master Chief en una nueva aventura',
                sku: 'HALO-INF-XBOX',
                barcode: '889842640632',
                category: 'Videojuego',
                subcategory: 'Shooter',
                cost: 35.00,
                price: 59.99,
                unit_measure: 'unit',
                weight: 0.1,
                tax_rate: 0.16,
                is_active: true,
                metadata: JSON.stringify({ platform: 'Xbox Series X/S', genre: 'FPS', rating: 'T' }),
                tags: JSON.stringify(['Halo', 'Xbox', 'FPS', 'Multijugador'])
            },
            {
                name: 'DualSense Wireless Controller',
                description: 'Control inalámbrico para PS5 con retroalimentación háptica',
                sku: 'DS-CTRL-WHITE',
                barcode: '711719541172',
                category: 'Accesorio',
                subcategory: 'Control',
                cost: 45.00,
                price: 69.99,
                unit_measure: 'unit',
                weight: 0.28,
                tax_rate: 0.16,
                is_active: true,
                metadata: JSON.stringify({ platform: 'PlayStation 5', type: 'Controller', wireless: true }),
                tags: JSON.stringify(['DualSense', 'PlayStation', 'Control', 'Háptico'])
            },
            {
                name: 'Xbox Wireless Controller',
                description: 'Control inalámbrico para Xbox Series X/S',
                sku: 'XBOX-CTRL-BLACK',
                barcode: '889842640656',
                category: 'Accesorio',
                subcategory: 'Control',
                cost: 40.00,
                price: 59.99,
                unit_measure: 'unit',
                weight: 0.29,
                tax_rate: 0.16,
                is_active: true,
                metadata: JSON.stringify({ platform: 'Xbox Series X/S', type: 'Controller', wireless: true }),
                tags: JSON.stringify(['Xbox', 'Control', 'Inalámbrico'])
            },
            {
                name: 'Steam Deck 64GB',
                description: 'Consola portátil para juegos de Steam',
                sku: 'STEAM-DECK-64',
                barcode: '814585021547',
                category: 'PC Gaming',
                subcategory: 'Portátil',
                cost: 320.00,
                price: 399.99,
                unit_measure: 'unit',
                weight: 0.67,
                dimensions: JSON.stringify({ length: 29.8, width: 11.7, height: 4.9 }),
                tax_rate: 0.16,
                is_active: true,
                metadata: JSON.stringify({ platform: 'PC', type: 'Handheld', storage: '64GB eMMC' }),
                tags: JSON.stringify(['Steam', 'Valve', 'PC Gaming', 'Portátil'])
            },
            {
                name: 'PlayStation Store $50',
                description: 'Tarjeta de regalo para PlayStation Store',
                sku: 'PSN-CARD-50',
                barcode: '711719513637',
                category: 'Tarjeta de regalo',
                subcategory: 'PlayStation',
                cost: 45.00,
                price: 50.00,
                unit_measure: 'unit',
                weight: 0.01,
                tax_rate: 0.00,
                is_active: true,
                metadata: JSON.stringify({ platform: 'PlayStation', value: 50, currency: 'USD' }),
                tags: JSON.stringify(['PlayStation', 'PSN', 'Tarjeta Regalo'])
            }
        ])
        console.log('Productos creados: ', products.length)

        // Crear clientes
        const customers = await Customer.bulkCreate([
            {
                first_name: 'Juan',
                last_name: 'Perez Garcia',
                email: 'juan.perez@example.com',
                phone: '555-0001-001',
                address: 'Calle Falsa 123, Ciudad de Mexico',
                city: 'Ciudad de Mexico',
                postal_code: '01000',
                company_name: 'Empresa S.A. de C.V.',
                tax_id: 'RFC123456789',
                is_active: true
            },
            {
                first_name: 'Maria',
                last_name: 'Lopez Martinez',
                email: 'maria.lopez@example.com',
                phone: '555-0002-002',
                address: 'Av. Reforma 456, Ciudad de Mexico',
                city: 'Ciudad de Mexico',
                postal_code: '01100',
                company_name: 'Comercializadora Lopez',
                tax_id: 'RFC987654321',
                is_active: true
            },
            {
                first_name: 'Carlos',
                last_name: 'Ramirez Torres',
                email: 'carlos.ramirez@example.com',
                phone: '555-0003-003',
                address: 'Calle Hidalgo 789, Monterrey',
                city: 'Monterrey',
                postal_code: '64000',
                company_name: 'Ramirez y Asociados',
                tax_id: 'RFC112233445',
                is_active: true
            },
            {
                first_name: 'Ana',
                last_name: 'Gonzalez Ruiz',
                email: 'ana.gonzalez@example.com',
                phone: '555-0004-004',
                address: 'Av. Juarez 321, Guadalajara',
                city: 'Guadalajara',
                postal_code: '44100',
                company_name: 'Gonzalez Consultores',
                tax_id: 'RFC556677889',
                is_active: true
            },
            {
                first_name: 'Luis',
                last_name: 'Fernandez Soto',
                email: 'luis.fernandez@example.com',
                phone: '555-0005-005',
                address: 'Calle Morelos 654, Puebla',
                city: 'Puebla',
                postal_code: '72000',
                company_name: 'Fernandez Servicios',
                tax_id: 'RFC998877665',
                is_active: true
            },
            {
                first_name: 'Sofia',
                last_name: 'Diaz Castro',
                email: 'sofia.diaz@example.com',
                phone: '555-0006-006',
                address: 'Av. Universidad 987, Toluca',
                city: 'Toluca',
                postal_code: '50000',
                company_name: 'Diaz y Cia',
                tax_id: 'RFC223344556',
                is_active: true
            },
            {
                first_name: 'Miguel',
                last_name: 'Hernandez Vargas',
                email: 'miguel.hernandez@example.com',
                phone: '555-0007-007',
                address: 'Calle Independencia 111, Leon',
                city: 'Leon',
                postal_code: '37000',
                company_name: 'Hernandez Distribuciones',
                tax_id: 'RFC334455667',
                is_active: true
            },
            {
                first_name: 'Laura',
                last_name: 'Martinez Flores',
                email: 'laura.martinez@example.com',
                phone: '555-0008-008',
                address: 'Av. Insurgentes 222, Queretaro',
                city: 'Queretaro',
                postal_code: '76000',
                company_name: 'Martinez Flores S.A.',
                tax_id: 'RFC445566778',
                is_active: true
            },
            {
                first_name: 'Jorge',
                last_name: 'Castillo Morales',
                email: 'jorge.castillo@example.com',
                phone: '555-0009-009',
                address: 'Calle Zaragoza 333, Cancun',
                city: 'Cancun',
                postal_code: '77500',
                company_name: 'Castillo Morales',
                tax_id: 'RFC556677880',
                is_active: true
            },
            {
                first_name: 'Patricia',
                last_name: 'Sanchez Gomez',
                email: 'patricia.sanchez@example.com',
                phone: '555-0010-010',
                address: 'Av. Constituyentes 444, Merida',
                city: 'Merida',
                postal_code: '97000',
                company_name: 'Sanchez Gomez S.A.',
                tax_id: 'RFC667788990',
                is_active: true
            },
            {
                first_name: 'Ricardo',
                last_name: 'Vega Luna',
                email: 'ricardo.vega@example.com',
                phone: '555-0011-020',
                address: 'Calle 5 de Mayo 555, Tijuana',
                city: 'Tijuana',
                postal_code: '22000',
                company_name: 'Vega Luna',
                tax_id: 'RFC778899001',
                is_active: true
            }
        ])
        console.log('Clientes creados: ', customers.length)

        // Crear usuarios con contraseñas hasheadas
        const hashedPasswords = {
            owner: await bcrypt.hash('owner123', 10),
            supervisor: await bcrypt.hash('super123', 10),
            cashier: await bcrypt.hash('cashier123', 10),
            admin: await bcrypt.hash('admin123', 10)
        }

        const users = await User.bulkCreate([
            {
                email: 'owner@gamingstore.com',
                password: hashedPasswords.owner,
                first_name: 'Edgar',
                last_name: 'Propietario',
                role: 'owner',
                employee_id: 'EMP001',
                phone: '+52 81 1234 5678',
                hire_date: '2023-01-01',
                branch_id: branches[0].id,
                permissions: JSON.stringify({ all: true }),
                is_active: true
            },
            {
                email: 'supervisor@gamingstore.com',
                password: hashedPasswords.supervisor,
                first_name: 'María',
                last_name: 'Supervisora',
                role: 'supervisor',
                employee_id: 'EMP002',
                phone: '+52 81 2468 1357',
                hire_date: '2023-02-01',
                branch_id: branches[0].id,
                permissions: JSON.stringify({ 
                    manage_inventory: true, 
                    view_reports: true, 
                    manage_sales: true 
                }),
                is_active: true
            },
            {
                email: 'cashier1@gamingstore.com',
                password: hashedPasswords.cashier,
                first_name: 'Carlos',
                last_name: 'Cajero',
                role: 'cashier',
                employee_id: 'EMP003',
                phone: '+52 81 9876 5432',
                hire_date: '2023-03-01',
                branch_id: branches[1].id,
                permissions: JSON.stringify({ 
                    process_sales: true, 
                    view_inventory: true 
                }),
                is_active: true
            },
            {
                email: 'admin@gamingstore.com',
                password: hashedPasswords.admin,
                first_name: 'Ana',
                last_name: 'Administradora',
                role: 'admin',
                employee_id: 'EMP004',
                phone: '+52 81 5555 6666',
                hire_date: '2023-04-01',
                branch_id: branches[2].id,
                permissions: JSON.stringify({ 
                    manage_users: true, 
                    view_reports: true, 
                    system_config: true 
                }),
                is_active: true
            }
        ])
        console.log('Usuarios creados: ', users.length)

        // Crear inventario
        const inventoryData = []
        products.forEach(product => {
            branches.forEach(branch => {
                inventoryData.push({
                    product_id: product.id,
                    branch_id: branch.id,
                    current_stock: Math.floor(Math.random() * 50) + 10,
                    minimum_stock: 0,
                    reserved_stock: Math.floor(Math.random() * 5)
                })
            })
        })

        const inventory = await Inventory.bulkCreate(inventoryData)
        console.log('Inventario creado: ', inventory.length)

        console.log('Seeders completados exitosamente!')
        console.log('')
        console.log('Datos de prueba disponibles:')
        console.log(`   - ${branches.length} sucursales`)
        console.log(`   - ${products.length} productos`)
        console.log(`   - ${customers.length} clientes`)
        console.log(`   - ${users.length} usuarios`)
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