const express = require('express')
const router = express.Router()

// Importar controlador
const customerController = require('../controllers/customerController')


// Listar clientes
router.get('/', customerController.getAllCustomers)

// Obtener cliente por ID
router.get('/:id', customerController.getCustomerById)

// Crear cliente
router.post('/', customerController.createCustomer)

// Actualizar cliente
router.put('/:id', customerController.updateCustomer)

// Eliminar cliente
router.delete('/:id', customerController.deleteCustomer)

module.exports = router