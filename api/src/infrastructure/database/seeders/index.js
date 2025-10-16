const db = require('../models')
const bcrypt = require('bcrypt')

const { Branch, Product, Customer, User, Inventory } = db

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
            },
            {
            name: 'Sucursal Cumbres',
            code: 'CMB-004',
            address: 'Av. Paseo de los Leones #456, Cumbres, Monterrey',
            city: 'Monterrey',
            state: 'Nuevo Leon',
            postal_code: '64610',
            phone: '81-1122-3344',
            email: 'sucursal_cumbres@empresa.com',
            is_active: true
            },
            {
            name: 'Sucursal San Pedro',
            code: 'SPD-005',
            address: 'Av. Vasconcelos #789, San Pedro Garza Garcia',
            city: 'San Pedro',
            state: 'Nuevo Leon',
            postal_code: '66220',
            phone: '81-2233-4455',
            email: 'sucursal_sanpedro@empresa.com',
            is_active: true
            },
            {
            name: 'Sucursal Apodaca',
            code: 'APD-006',
            address: 'Av. Miguel Aleman #321, Apodaca',
            city: 'Apodaca',
            state: 'Nuevo Leon',
            postal_code: '66600',
            phone: '81-3344-5566',
            email: 'sucursal_apodaca@empresa.com',
            is_active: true
            },
            {
            name: 'Sucursal Escobedo',
            code: 'ESC-007',
            address: 'Av. Sendero #654, Escobedo',
            city: 'Escobedo',
            state: 'Nuevo Leon',
            postal_code: '66050',
            phone: '81-4455-6677',
            email: 'sucursal_escobedo@empresa.com',
            is_active: true
            },
            {
            name: 'Sucursal Santa Catarina',
            code: 'STC-008',
            address: 'Av. Manuel Ordoñez #987, Santa Catarina',
            city: 'Santa Catarina',
            state: 'Nuevo Leon',
            postal_code: '66100',
            phone: '81-5566-7788',
            email: 'sucursal_santacatarina@empresa.com',
            is_active: true
            },
            {
            name: 'Sucursal Linares',
            code: 'LIN-009',
            address: 'Calle Hidalgo #159, Centro, Linares',
            city: 'Linares',
            state: 'Nuevo Leon',
            postal_code: '67700',
            phone: '821-123-4567',
            email: 'sucursal_linares@empresa.com',
            is_active: true
            },
            {
            name: 'Sucursal Saltillo',
            code: 'SLT-010',
            address: 'Blvd. Venustiano Carranza #321, Saltillo',
            city: 'Saltillo',
            state: 'Coahuila',
            postal_code: '25280',
            phone: '844-234-5678',
            email: 'sucursal_saltillo@empresa.com',
            is_active: true
            },
            {
            name: 'Sucursal Torreon',
            code: 'TRN-011',
            address: 'Av. Juarez #456, Centro, Torreon',
            city: 'Torreon',
            state: 'Coahuila',
            postal_code: '27000',
            phone: '871-345-6789',
            email: 'sucursal_torreon@empresa.com',
            is_active: true
            },
            {
            name: 'Sucursal San Luis',
            code: 'SLS-012',
            address: 'Av. Carranza #789, Centro, San Luis Potosi',
            city: 'San Luis Potosi',
            state: 'San Luis Potosi',
            postal_code: '78000',
            phone: '444-456-7890',
            email: 'sucursal_sanluis@empresa.com',
            is_active: true
            },
            {
            name: 'Sucursal Queretaro',
            code: 'QRO-013',
            address: 'Av. 5 de Febrero #101, Queretaro',
            city: 'Queretaro',
            state: 'Queretaro',
            postal_code: '76100',
            phone: '442-567-8901',
            email: 'sucursal_queretaro@empresa.com',
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
                cost_price: 450.00,
                unit_price: 599.99,
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
                cost_price: 450.00,
                unit_price: 599.99,
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
                cost_price: 280.00,
                unit_price: 349.99,
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
                cost_price: 42.00,
                unit_price: 69.99,
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
                cost_price: 42.00,
                unit_price: 69.99,
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
                cost_price: 35.00,
                unit_price: 59.99,
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
                cost_price: 45.00,
                unit_price: 69.99,
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
                cost_price: 40.00,
                unit_price: 59.99,
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
                cost_price: 320.00,
                unit_price: 399.99,
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
                cost_price: 45.00,
                unit_price: 50.00,
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

        // Crear usuario owner por default
        const ownerPassword = await bcrypt.hash('owner123', 10)
        const ownerUser = await User.create({
            email: 'owner@gamingstore.com',
            password: ownerPassword,
            first_name: 'Edgar',
            last_name: 'Propietario',
            role: 'owner',
            employee_id: 'EMP001',
            phone: '+52 81 1234 5678',
            hire_date: '2023-01-01',
            branch_id: branches[0].id,
            permissions: JSON.stringify({ all: true }),
            is_active: true
        })
        console.log('Usuario owner creado')

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
        console.log(`   - 1 usuario owner`)
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