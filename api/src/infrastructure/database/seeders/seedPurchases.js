const db = require('../models')
const { Purchase } = db

async function seedPurchases(users, branches) {
    // Obtener usuarios válidos para crear compras
    const owner = users.find(u => u.role === 'owner')
    const admin = users.find(u => u.role === 'admin')
    const supervisors = users.filter(u => u.role === 'supervisor')
    
    // Obtener sucursales
    const cedis = branches.find(b => b.code === 'CEDIS-000') || branches[0]
    const sucursalNorte = branches.find(b => b.code === 'SUC-001') || branches[1]
    const sucursalSur = branches.find(b => b.code === 'SUC-002') || branches[2]

    // Proveedores de ejemplo
    const suppliers = [
        {
            name: "Distribuidora México S.A. de C.V.",
            contact: "Juan Carlos Mendoza",
            phone: "81-1234-5678"
        },
        {
            name: "Comercializadora del Norte",
            contact: "María Elena Vázquez", 
            phone: "81-2345-6789"
        },
        {
            name: "Importaciones y Exportaciones ABC",
            contact: "Roberto Silva",
            phone: "81-3456-7890"
        },
        {
            name: "Mayorista Central",
            contact: "Ana Patricia López",
            phone: "81-4567-8901"
        },
        {
            name: "Proveedora Industrial",
            contact: "Carlos Eduardo Ramírez",
            phone: "81-5678-9012"
        }
    ]

    const purchases = []

    // Generar compras para los últimos 6 meses
    const today = new Date()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(today.getMonth() - 6)

    // Compras para CEDIS (Owner y Admin)
    for (let i = 0; i < 15; i++) {
        const supplier = suppliers[Math.floor(Math.random() * suppliers.length)]
        const randomDate = new Date(sixMonthsAgo.getTime() + Math.random() * (today.getTime() - sixMonthsAgo.getTime()))
        const user = Math.random() > 0.5 ? owner : admin
        
        purchases.push({
            supplier_name: supplier.name,
            supplier_contact: supplier.contact,
            supplier_phone: supplier.phone,
            total_amount: (Math.random() * 45000 + 5000).toFixed(2), // Entre $5,000 y $50,000
            purchase_date: randomDate.toISOString().split('T')[0],
            invoice_number: `FAC-${randomDate.getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`,
            status: Math.random() > 0.8 ? 'pending' : Math.random() > 0.1 ? 'completed' : 'cancelled',
            notes: [
                'Compra de productos para inventario general',
                'Pedido urgente por agotamiento de stock',
                'Compra programada mensual',
                'Productos nuevos para temporada alta',
                'Reabastecimiento de productos populares',
                null
            ][Math.floor(Math.random() * 6)],
            branch_id: cedis.id,
            user_id: user.id
        })
    }

    // Compras para Sucursal Norte
    for (let i = 0; i < 8; i++) {
        const supplier = suppliers[Math.floor(Math.random() * suppliers.length)]
        const randomDate = new Date(sixMonthsAgo.getTime() + Math.random() * (today.getTime() - sixMonthsAgo.getTime()))
        const supervisor = supervisors[0] // Primer supervisor para Norte
        
        purchases.push({
            supplier_name: supplier.name,
            supplier_contact: supplier.contact,
            supplier_phone: supplier.phone,
            total_amount: (Math.random() * 20000 + 2000).toFixed(2), // Entre $2,000 y $22,000
            purchase_date: randomDate.toISOString().split('T')[0],
            invoice_number: `NORTE-${randomDate.getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
            status: Math.random() > 0.7 ? 'pending' : Math.random() > 0.15 ? 'completed' : 'cancelled',
            notes: [
                'Compra para sucursal norte',
                'Productos específicos para zona norte',
                'Reposición de inventario local',
                'Compra de emergencia',
                null
            ][Math.floor(Math.random() * 5)],
            branch_id: sucursalNorte.id,
            user_id: supervisor.id
        })
    }

    // Compras para Sucursal Sur
    if (supervisors.length > 1) {
        for (let i = 0; i < 6; i++) {
            const supplier = suppliers[Math.floor(Math.random() * suppliers.length)]
            const randomDate = new Date(sixMonthsAgo.getTime() + Math.random() * (today.getTime() - sixMonthsAgo.getTime()))
            const supervisor = supervisors[1] // Segundo supervisor para Sur
            
            purchases.push({
                supplier_name: supplier.name,
                supplier_contact: supplier.contact,
                supplier_phone: supplier.phone,
                total_amount: (Math.random() * 18000 + 1500).toFixed(2), // Entre $1,500 y $19,500
                purchase_date: randomDate.toISOString().split('T')[0],
                invoice_number: `SUR-${randomDate.getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`,
                status: Math.random() > 0.75 ? 'pending' : Math.random() > 0.2 ? 'completed' : 'cancelled',
                notes: [
                    'Compra para sucursal sur',
                    'Productos específicos para zona sur',
                    'Reposición de inventario local',
                    'Compra planificada',
                    null
                ][Math.floor(Math.random() * 5)],
                branch_id: sucursalSur.id,
                user_id: supervisor.id
            })
        }
    }

    // Algunas compras más recientes (últimas 2 semanas)
    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(today.getDate() - 14)

    for (let i = 0; i < 5; i++) {
        const supplier = suppliers[Math.floor(Math.random() * suppliers.length)]
        const randomDate = new Date(twoWeeksAgo.getTime() + Math.random() * (today.getTime() - twoWeeksAgo.getTime()))
        const user = [owner, admin, ...supervisors][Math.floor(Math.random() * (2 + supervisors.length))]
        const branch = [cedis, sucursalNorte, sucursalSur][Math.floor(Math.random() * 3)]
        
        purchases.push({
            supplier_name: supplier.name,
            supplier_contact: supplier.contact,
            supplier_phone: supplier.phone,
            total_amount: (Math.random() * 30000 + 3000).toFixed(2),
            purchase_date: randomDate.toISOString().split('T')[0],
            invoice_number: `REC-${randomDate.getFullYear()}-${String(Math.floor(Math.random() * 999) + 100).padStart(3, '0')}`,
            status: Math.random() > 0.6 ? 'pending' : 'completed',
            notes: [
                'Compra reciente de productos',
                'Pedido express',
                'Compra de temporada',
                null
            ][Math.floor(Math.random() * 4)],
            branch_id: branch.id,
            user_id: user.id
        })
    }

    // Crear las compras en la base de datos
    console.log('Creando compras...')
    const createdPurchases = await Purchase.bulkCreate(purchases, {
        validate: true
    })
    
    console.log(`✓ ${createdPurchases.length} compras creadas exitosamente`)
    return createdPurchases
}

module.exports = seedPurchases