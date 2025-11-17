const { v4: uuidv4 } = require('uuid');

async function seedLogs(db) {
    try {
        const logsCount = await db.Log.count();
        
        if (logsCount > 0) {
            console.log('⚠️  Logs ya tienen datos, omitiendo seeding...');
            return;
        }

        // Obtener algunos usuarios para asociar logs
        const users = await db.User.findAll({ limit: 3 });
        
        if (users.length === 0) {
            console.log('⚠️  No hay usuarios disponibles para crear logs de ejemplo');
            return;
        }

        const logsData = [
            {
                id: uuidv4(),
                user_id: users[0].id,
                action: 'CREATE',
                service: 'products',
                message: 'Usuario creó un nuevo producto: Producto de ejemplo',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                user_id: users[0].id,
                action: 'UPDATE',
                service: 'inventory',
                message: 'Usuario actualizó el inventario: Ajuste de stock',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                user_id: users[1] ? users[1].id : users[0].id,
                action: 'CREATE',
                service: 'sales',
                message: 'Usuario registró una nueva venta por $150.00',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                user_id: users[1] ? users[1].id : users[0].id,
                action: 'DELETE',
                service: 'customers',
                message: 'Usuario eliminó un cliente: Cliente de prueba',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                user_id: users[2] ? users[2].id : users[0].id,
                action: 'LOGIN',
                service: 'auth',
                message: 'Usuario inició sesión exitosamente',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                user_id: users[2] ? users[2].id : users[0].id,
                action: 'VIEW',
                service: 'reports',
                message: 'Usuario consultó reporte de ventas mensuales',
                created_at: new Date(),
                updated_at: new Date()
            }
        ];

        await db.Log.bulkCreate(logsData);
        
        console.log('✅ Logs de ejemplo creados exitosamente');
    } catch (error) {
        console.error('❌ Error al crear logs de ejemplo:', error.message);
        throw error;
    }
}

module.exports = seedLogs;
