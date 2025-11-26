const db = require('../models')
const { User } = db

async function seedUsers(branches) {
    // Buscar CEDIS (debería ser el primero en branches)
    const cedis = branches.find(b => b.code === 'CEDIS-000') || branches[0]
    
    // Solo crear un usuario owner para deploy
    return await User.bulkCreate([
        {
            first_name: 'Edgar',
            last_name: 'Gmz',
            email: 'edgar_gmz@apexstore.com',
            password: 'edgar1234', // Cambiar en producción
            role: 'owner',
            employee_id: "EMP001",
            phone: '555-0000-0000',
            hire_date: new Date(),
            branch_id: cedis.id,
            is_active: true
        },
        {
            first_name: 'Alexis',
            last_name: 'Garcia',
            email: 'alexis@apexstore.com',
            password: 'alexis1234', // Cambiar en producción
            role: 'admin',
            employee_id: "EMP002",
            phone: '555-1111-0000',
            hire_date: new Date(),
            branch_id: cedis.id,
            is_active: true
        }
    ], { individualHooks: true });
}

module.exports = seedUsers