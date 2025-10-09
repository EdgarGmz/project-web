const express = require('express')
const router = express.Router()

// Importar controlador y middleware
const authController = require('../controllers/authController')
const { authenticate, authorize } = require('../middleware/auth')

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: Autenticación y autorización de usuarios
 *
 * components:
 *   schemas:
 *     AuthLoginRequest:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "admin@empresa.com"
 *         password:
 *           type: string
 *           example: "password123"
 *     AuthLoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Login exitoso"
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             token:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             expires_in:
 *               type: string
 *               example: "24h"
 *     AuthRegisterRequest:
 *       type: object
 *       required: [first_name, last_name, email, password, role]
 *       properties:
 *         first_name:
 *           type: string
 *           example: "Juan"
 *         last_name:
 *           type: string
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
 *           example: "cashier"
 *         employee_id:
 *           type: string
 *           example: "EMP001"
 *         phone:
 *           type: string
 *           example: "81-1234-5678"
 *         branch_id:
 *           type: integer
 *           example: 1
 *     AuthProfileUpdateRequest:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *           example: "Juan"
 *         last_name:
 *           type: string
 *           example: "Pérez"
 *         email:
 *           type: string
 *           format: email
 *           example: "juan.perez@empresa.com"
 *         phone:
 *           type: string
 *           example: "81-1234-5678"
 *     AuthChangePasswordRequest:
 *       type: object
 *       required: [current_password, new_password]
 *       properties:
 *         current_password:
 *           type: string
 *           example: "password123"
 *         new_password:
 *           type: string
 *           minLength: 6
 *           example: "newpassword456"
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthLoginResponse'
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', authController.login)

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRegisterRequest'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       409:
 *         description: Email o employee_id ya existe
 */
router.post('/register', authenticate, authorize('admin'), authController.register)

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido exitosamente
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
 *                   example: "Perfil obtenido exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 */
router.get('/profile', authenticate, authController.getProfile)

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Actualizar perfil
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthProfileUpdateRequest'
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 */
router.put('/profile', authenticate, authController.updateProfile)

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Cambiar contraseña
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 */
router.put('/change-password', authenticate, authController.changePassword)

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 */
router.post('/logout', authenticate, authController.logout)

module.exports = router
