const db = require('../models')
const { SaleItem } = db

async function seedSaleItems(sale, product) {
    return await SaleItem.bulkCreate([
        {
            sale_id: sale[0].id,
            product_id: product[3].id,
            product_name: product[3].name, 
            quantity: 1,
            unit_price: 69.99 
        },
        {
            sale_id: sale[0].id,
            product_id: product[6].id,
            product_name: product[6].name, 
            quantity: 1,
            unit_price: 69.99 
        },
        {
            sale_id: sale[1].id,
            product_id: product[4].id,
            product_name: product[4].name,
            quantity: 1,
            unit_price: 69.99
        }
    ])
}

module.exports = seedSaleItems