const express = require('express')
const router = express.Router()

// Importar controlador
const userController = require('../controllers/userController')

// ===========================================
// DOCUMENTACIÓN SWAGGER - USUARIOS
// ===========================================

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del usuario
 *           example: 1
 *         email:
 *           type: string
 *           format: email
 *           description: Email único del usuario
 *           example: "juan.perez@empresa.com"
 *         first_name:
 *           type: string
 *           description: Nombre del usuario
 *           example: "Juan"
 *         last_name:
 *           type: string
 *           description: Apellido del usuario
 *           example: "Pérez"
 *         role:
 *           type: string
 *           enum: [admin, manager, cashier]
 *           description: Rol del usuario en el sistema
 *           example: "cashier"
 *         employee_id:
 *           type: string
 *           description: ID único del empleado
 *           example: "EMP001"
 *         phone:
 *           type: string
 *           description: Teléfono del usuario
 *           example: "81-1234-5678"
 *         hire_date:
 *           type: string
 *           format: date
 *           description: Fecha de contratación
 *           example: "2024-01-15"
 *         branch_id:
 *           type: integer
 *           description: ID de la sucursal asignada
 *           example: 1
 *         is_active:
 *           type: boolean
 *           description: Estado activo del usuario
 *           example: true
 *         last_login:
 *           type: string
 *           format: date-time
 *           description: Última fecha de login
 *           example: "2024-10-06T10:30:00Z"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *           example: "2024-10-01T08:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *           example: "2024-10-06T10:30:00Z"
 *         branch:
 *           $ref: '#/components/schemas/Branch'
 *     
 *     UserInput:
 *       type: object
 *       required:
 *         - first_name
 *         - last_name
 *         - email
 *         - password
 *       properties:
 *         first_name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "Juan"
 *         last_name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           example: "Pérez"
 *         email:
 *           type: string
 *           format: email
 *           example: "juan.perez@empresa.com"
 *         password:
 *           type: string
 *           minLength: 6
 *           example: "password123"
 *         role:
 *           type: string
 *           enum: [admin, manager, cashier]
 *           default: "cashier"
 *           example: "cashier"
 *         employee_id:
 *           type: string
 *           maxLength: 20
 *           example: "EMP001"
 *         phone:
 *           type: string
 *           maxLength: 20
 *           example: "81-1234-5678"
 *         hire_date:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         branch_id:
 *           type: integer
 *           example: 1
 *         is_active:
 *           type: boolean
 *           default: true
 *           example: true
 *     
 *     UserUpdate:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *           example: "Juan Carlos"
 *         last_name:
 *           type: string
 *           example: "Pérez González"
 *         email:
 *           type: string
 *           format: email
 *           example: "juan.carlos@empresa.com"
 *         role:
 *           type: string
 *           enum: [admin, manager, cashier]
 *           example: "manager"
 *         employee_id:
 *           type: string
 *           example: "EMP001"
 *         phone:
 *           type: string
 *           example: "81-9876-5432"
 *         hire_date:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         branch_id:
 *           type: integer
 *           example: 2
 *         is_active:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     description: Retorna una lista paginada de todos los usuarios del sistema
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Cantidad de elementos por página
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre, apellido o email
 *         example: "juan"
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, manager, cashier]
 *         description: Filtrar por rol
 *         example: "cashier"
 *       - in: query
 *         name: branch_id
 *         schema:
 *           type: integer
 *         description: Filtrar por sucursal
 *         example: 1
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *         example: true
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuarios obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     pages:
 *                       type: integer
 *                       example: 3
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', userController.getAllUsers)

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     description: Retorna los detalles de un usuario específico
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del usuario
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario encontrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario obtenido exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', userController.getUserById)

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     description: Crea un nuevo usuario en el sistema
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *           examples:
 *             admin:
 *               summary: Ejemplo de usuario administrador
 *               value:
 *                 first_name: "María"
 *                 last_name: "García"
 *                 email: "maria.garcia@empresa.com"
 *                 password: "admin123"
 *                 role: "admin"
 *                 employee_id: "ADM001"
 *                 phone: "81-1111-2222"
 *                 hire_date: "2024-01-01"
 *                 branch_id: 1
 *             cashier:
 *               summary: Ejemplo de cajero
 *               value:
 *                 first_name: "Pedro"
 *                 last_name: "López"
 *                 email: "pedro.lopez@empresa.com"
 *                 password: "cashier123"
 *                 role: "cashier"
 *                 employee_id: "CAS001"
 *                 phone: "81-3333-4444"
 *                 branch_id: 2
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error de validación"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: "email"
 *                       message:
 *                         type: string
 *                         example: "El email ya está registrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', userController.createUser)

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar un usuario
 *     description: Actualiza los datos de un usuario existente
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del usuario
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *           examples:
 *             promotion:
 *               summary: Promoción a manager
 *               value:
 *                 role: "manager"
 *                 branch_id: 3
 *             contact_update:
 *               summary: Actualizar contacto
 *               value:
 *                 phone: "81-5555-6666"
 *                 email: "nuevo.email@empresa.com"
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', userController.updateUser)

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar un usuario (soft delete)
 *     description: Marca un usuario como eliminado (soft delete)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del usuario
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario eliminado exitosamente"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', userController.deleteUser)

module.exports = router