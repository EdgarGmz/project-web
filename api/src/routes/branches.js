const express = require('express')
const router = express.Router()

// Importar controlador
const branchController = require('../controllers/branchController')

// Listar sucursales
router.get('/', branchController.getAllBranches)

// Obtener sucursal por ID
router.get('/:id', branchController.getBranchById)

// Crear sucursal
router.post('/', branchController.createBranch)

// Actualizar sucursal
router.put('/:id', branchController.updateBranch)

// Eliminar sucursal
router.delete('/:id', branchController.deleteBranch)

module.exports = router