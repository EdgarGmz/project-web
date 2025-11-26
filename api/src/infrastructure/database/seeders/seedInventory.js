const db = require('../models')
const { Inventory } = db;

async function seedInventory(products, branches){
    // Crear inventario solo en CEDIS con stock inicial
    const cedis = branches.find(b => b.code === 'CEDIS-000') || branches[0]
    
    if (!cedis) {
        console.log('⚠️  CEDIS no encontrado, no se puede crear inventario')
        return []
    }

    const inventoryData = []
    
    // Crear inventario para cada producto en CEDIS
    products.forEach(product => {
        // Stock inicial basado en el min_stock del producto (al menos 2x el mínimo)
        const initialStock = Math.max(product.min_stock * 2, 10)
        
        inventoryData.push({
            product_id: product.id,
            branch_id: cedis.id,
            stock_current: initialStock,
            stock_minimum: product.min_stock || 5,
            reserved_stock: 0,
            notes: `Stock inicial creado por seeder`
        })
    })
    
    const inventory = await Inventory.bulkCreate(inventoryData, { returning: true })
    console.log(`✅ Inventario creado para ${inventory.length} productos en CEDIS`)
    return inventory
}

module.exports = seedInventory;