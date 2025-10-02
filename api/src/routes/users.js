const express = require('express')
const router = express.Router()

// Importar controlador
const userController = require('../controllers/userController')

// Listar usuarios
router.get('/', userController.getAllUsers)

// Obtener usuario por ID
router.get('/:id', userController.getUserById)

// Crear usuario
router.post('/', userController.createUser)

// Actualizar usuario
router.put('/:id', userController.updateUser)

// Eliminar usuario
router.delete('/:id', userController.deleteUser)

module.exports = router