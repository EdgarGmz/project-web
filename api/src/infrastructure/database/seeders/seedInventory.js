const db = require('../models')
const { Inventory } = db;

async function seedInventory(products, branches){
    const inventoryData = []
    products.forEach(product => {
            branches.forEach(branch => {
                inventoryData.push({
                    product_id: product.id,
                    branch_id: branch.id,
                    stock_current: Math.floor(Math.random() * 50) + 10,
                    stock_minimum: 0,
                    reserved_stock: Math.floor(Math.random() * 5)
                })
            })
        })
        const inventory = await Inventory.bulkCreate(inventoryData, { returning: true })
        return inventory
}

module.exports = seedInventory;