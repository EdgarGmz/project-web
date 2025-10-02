const express = require('express')
const router = express.Router()

// Importar controlador
const inventoryController = require('../controllers/inventoryController')

// Listar inventario
router.get('/', inventoryController.getAllInventory)

// Obtener item de inventario por ID
router.get('/:id', inventoryController.getInventoryById)

// Crear item de inventario
router.post('/', inventoryController.createInventory)

// Actualizar item de inventario
router.put('/:id', inventoryController.updateInventory)

// Eliminar item de inventario
router.delete('/:id', inventoryController.deleteInventory)

// Ajustar stock
router.post('/:id/adjust', inventoryController.adjustStock)

module.exports = router