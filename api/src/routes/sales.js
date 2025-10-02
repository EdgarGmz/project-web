const express = require('express')
const router = express.Router()

// Importar controlador
const saleController = require('../controllers/saleController')

// Listar ventas
router.get('/', saleController.getAllSales)

// Obtener venta por ID
router.get('/:id', saleController.getSaleById)

// Crear venta
router.post('/', saleController.createSale)

// Actualizar venta
router.put('/:id', saleController.updateSale)

// Cancelar venta
router.delete('/:id', saleController.cancelSale)

module.exports = router