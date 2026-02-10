const db = require('../models')
const { User } = db

async function seedUsers(branches) {
    // Buscar CEDIS (debería ser el primero en branches)
    const cedis = branches.find(b => b.code === 'CEDIS-000') || branches[0]
    
    // Crear usuarios básicos para pruebas
    return await User.bulkCreate([
        {
            first_name: 'Edgar',
            last_name: 'Gmz',
            email: 'edgar_gmz@apexstore.com',
            password: 'admin123', 
            role: 'owner',
            employee_id: "EMP001",
            phone: '555-0000-0001',
            hire_date: new Date('2020-01-15'),
            branch_id: cedis.id,
            is_active: true
        },
        {
            first_name: 'Alexis',
            last_name: 'Garcia',
            email: 'alexis@apexstore.com',
            password: 'admin123', 
            role: 'admin',
            employee_id: "EMP002",
            phone: '555-0000-0002',
            hire_date: new Date('2020-02-01'),
            branch_id: cedis.id,
            is_active: true
        },
        {
            first_name: 'Orlando',
            last_name: 'Casas',
            email: 'orlando@apexstore.com',
            password: 'admin123', 
            role: 'supervisor',
            employee_id: "EMP003",
            phone: '555-0000-0003',
            hire_date: new Date('2020-03-01'),
            branch_id: cedis.id,
            is_active: true
        },
        {
            first_name: 'Juan',
            last_name: 'Castillo',
            email: 'juan@apexstore.com',
            password: 'admin123', 
            role: 'cashier',
            employee_id: "EMP004",
            phone: '555-0000-0004',
            hire_date: new Date('2020-04-01'),
            branch_id: cedis.id,
            is_active: true
        },
        {
            first_name: 'Daniela',
            last_name: 'Mayte',
            email: 'daniela@apexstore.com',
            password: 'admin123', 
            role: 'cashier',
            employee_id: "EMP005",
            phone: '555-0000-0005',
            hire_date: new Date('2020-05-01'),
            branch_id: cedis.id,
            is_active: true
        }
    ], { individualHooks: true });
}

module.exports = seedUsers