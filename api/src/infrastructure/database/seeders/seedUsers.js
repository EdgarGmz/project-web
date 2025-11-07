const db = require('../models')
const { User } = db

async function seedUsers(branches) {
    return await User.bulkCreate([
        // Crear usuarios        
        {
            first_name: 'Edgar',
            last_name: 'Tiburcio',
            email: 'edgar_gmz@apexstore.com',
            password: 'edgar1234',
            role: 'owner',
            employee_id: "EMP001",
            phone: '555-1234-567',
            hire: new Date('2020-01-15'),
            branch_id: branches[0].id,
            is_active: true
        },
        {
            first_name: 'Alexis',
            last_name: 'García',
            email: 'alexis_gz@apexstore.com',
            password: 'alexis1234',
            role: 'admin',
            employee_id: "EMP002",
            phone: '555-2345-678',
            hire: new Date('2020-02-20'),
            branch_id: branches[1].id,
            is_active: true
        },
        {
            first_name: 'Orlando',
            last_name: 'Casas',
            email: 'orlando_casas@apexstore.com',
            password: 'orlando1234',
            role: 'supervisor',
            employee_id: "EMP003",
            phone: '555-3456-789',
            hire: new Date('2020-03-25'),
            branch_id: branches[2].id,
            is_active: true,          
        },
        {
            first_name: 'Juan',
            last_name: 'Castillo',
            email: 'juan_castillo@apexstore.com',
            password: 'juan1234',
            role: 'supervisor',
            employee_id: "EMP004",
            phone: '555-3456-789',
            hire: new Date('2020-03-25'),
            branch_id: branches[3].id,
            is_active: true,           
        },
        {
            first_name: 'Alan',
            last_name: 'Perez',
            email: 'alan_perez@apexstore.com',
            password: 'alan1234',
            role: 'cashier',
            employee_id: "EMP005",
            phone: '555-3456-789',
            hire: new Date('2020-03-25'),
            branch_id: branches[4].id,
            is_active: true,            
        },
        {
            first_name: 'Daniela',
            last_name: 'Mayte',
            email: 'daniela_mayte@apexstore.com',
            password: 'daniela1234',
            role: 'cashier',
            employee_id: "EMP006",
            phone: '555-3456-789',
            hire: new Date('2020-03-25'),
            branch_id: branches[5].id,
            is_active: true           
        },


    ],{ individualHooks: true});
}

module.exports = seedUsers