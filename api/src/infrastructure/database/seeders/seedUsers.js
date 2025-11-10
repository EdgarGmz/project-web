const db = require('../models')
const { User } = db

async function seedUsers(branches) {
    // Buscar CEDIS (debería ser el primero en branches)
    const cedis = branches.find(b => b.code === 'CEDIS-000') || branches[0]
    
    return await User.bulkCreate([
        // OWNER - Propietario único del sistema (asignado a CEDIS)
        {
            first_name: 'Edgar',
            last_name: 'Tiburcio',
            email: 'edgar_gmz@apexstore.com',
            password: 'edgar1234',
            role: 'owner',
            employee_id: "EMP001",
            phone: '555-1234-567',
            hire_date: new Date('2020-01-15'),
            branch_id: cedis.id, // Owner va a CEDIS
            is_active: true
        },
        // ADMIN - Administrador del sistema (asignado a CEDIS)
        {
            first_name: 'Alexis',
            last_name: 'García',
            email: 'alexis_gz@apexstore.com',
            password: 'alexis1234',
            role: 'admin',
            employee_id: "EMP002",
            phone: '555-2345-678',
            hire_date: new Date('2020-02-20'),
            branch_id: cedis.id, // Admin va a CEDIS
            is_active: true
        },
        // SUPERVISOR - Sucursal Norte
        {
            first_name: 'Orlando',
            last_name: 'Casas',
            email: 'orlando_casas@apexstore.com',
            password: 'orlando1234',
            role: 'supervisor',
            employee_id: "EMP003",
            phone: '555-3456-789',
            hire_date: new Date('2020-03-25'),
            branch_id: branches[1].id, // Sucursal Norte (índice 1)
            is_active: true
        },
        // SUPERVISOR - Sucursal Sur  
        {
            first_name: 'Juan',
            last_name: 'Castillo',
            email: 'juan_castillo@apexstore.com',
            password: 'juan1234',
            role: 'supervisor',
            employee_id: "EMP004",
            phone: '555-4567-890',
            hire_date: new Date('2020-04-30'),
            branch_id: branches[2].id, // Sucursal Sur (índice 2)
            is_active: true
        },
        // CAJERO - Sucursal Norte
        {
            first_name: 'Alan',
            last_name: 'Perez',
            email: 'alan_perez@apexstore.com',
            password: 'alan1234',
            role: 'cashier',
            employee_id: "EMP005",
            phone: '555-5678-901',
            hire_date: new Date('2020-05-10'),
            branch_id: branches[1].id, // Sucursal Norte (índice 1)
            is_active: true
        },
        // CAJERO - Sucursal Sur
        {
            first_name: 'Daniela',
            last_name: 'Mayte',
            email: 'daniela_mayte@apexstore.com',
            password: 'daniela1234',
            role: 'cashier',
            employee_id: "EMP006",
            phone: '555-6789-012',
            hire_date: new Date('2020-06-15'),
            branch_id: branches[2].id, // Sucursal Sur (índice 2)
            is_active: true
        },


    ],{ individualHooks: true});
}

module.exports = seedUsers