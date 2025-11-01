const db = require('../models')

const { Payment } = db

async function seedPayments(sale) {
    const sales = await Payment.bulkCreate([
         {
            customer_id: sale[0].customer_id,
            amount: sale[0].total_amount,
            method: sale[0].payment_method,
            reference: sale[0].transaction_reference || "001",
            status: 'completed',
            notes: `Pago generado automáticamente por la venta ${sale[0].id}`
        },
        {
            customer_id: sale[1].customer_id,
            amount: sale[1].total_amount,
            method: sale[1].payment_method,
            reference: sale[1].transaction_reference || "002",
            status: 'completed',
            notes: `Pago generado automáticamente por la venta ${sale[1].id}`
        }
    ])
    return sales
}

module.exports = seedPayments