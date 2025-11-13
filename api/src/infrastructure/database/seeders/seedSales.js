const db = require('../models')
const crypto = require('crypto')

const { Sale, Branch } = db

async function seedSales(customer, user, branch) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    
    return await Sale.bulkCreate([
        {
            customer_id: customer[0].id,
            user_id: user[0].id,
            branch_id: branch[0].id,
            payment_method: 'cash',
            status: 'completed',
            subtotal: 120.67,
            tax_amount: 19.31,
            total_amount: 139.98,
            transaction_reference: `TXN-${date}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            notes: 'Venta de prueba 1'
        },
        {
            customer_id: customer[1].id,
            user_id: user[1].id,
            branch_id: branch[1].id,
            payment_method: 'card',
            status: 'completed',
            subtotal: 60.34,
            tax_amount: 9.65,
            total_amount: 69.99,
            transaction_reference: `TXN-${date}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            notes: 'Venta de prueba 2'
        },
        {
            customer_id: customer[2].id,
            user_id: user[2].id,
            branch_id: branch[2].id,
            payment_method: 'mixed',
            status: 'completed',
            subtotal: 60.34,
            tax_amount: 9.65,
            total_amount: 69.99,
            transaction_reference: `TXN-${date}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            notes: 'Venta de prueba 3'
        },
        {
            customer_id: customer[3].id,
            user_id: user[3].id,
            branch_id: branch[3].id,
            payment_method: 'transfer',
            status: 'completed',
            subtotal: 60.34,
            tax_amount: 9.65,
            total_amount: 69.99,
            transaction_reference: `TXN-${date}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            notes: 'Venta de prueba 4'
        },
        {
            customer_id: customer[4].id,
            user_id: user[4].id,
            branch_id: branch[0].id,
            payment_method: 'cash',
            status: 'completed',
            subtotal: 60.34,
            tax_amount: 9.65,
            total_amount: 69.99,
            transaction_reference: `TXN-${date}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            notes: 'Venta de prueba 5'
        }

    ])
}

module.exports = seedSales