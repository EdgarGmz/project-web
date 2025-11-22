const express = require('express')
const router = express.Router()

// Importar controlador y middleware
const authController = require('../controllers/authController')
const { authenticate } = require('../../middleware/auth')

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
 *           example: "owner@gamingstore.com"
 *         password:
 *           type: string
 *           example: "owner123"
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
 *     AuthProfileUpdateRequest:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *           example: "Edgar"
 *         last_name:
 *           type: string
 *           example: "Gómez"
 *         email:
 *           type: string
 *           format: email
 *           example: "owner@gamingstore.com"
 *         phone:
 *           type: string
 *           example: "81-1234-5678"
 *     AuthChangePasswordRequest:
 *       type: object
 *       required: [current_password, new_password]
 *       properties:
 *         current_password:
 *           type: string
 *           example: "owner123"
 *         new_password:
 *           type: string
 *           minLength: 6
 *           example: "nuevo_password"
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

// El endpoint de registro se elimina por lógica de negocio.
// El primer usuario (dueño) se crea manualmente y solo usuarios autenticados con permisos pueden crear más usuarios.

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

/**
 * @swagger
 * /auth/verify-password:
 *   post:
 *     summary: Verificar contraseña del usuario actual
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password]
 *             properties:
 *               password:
 *                 type: string
 *                 example: "mypassword123"
 *     responses:
 *       200:
 *         description: Contraseña verificada correctamente
 *       401:
 *         description: Contraseña incorrecta
 */
router.post('/verify-password', authenticate, authController.verifyPassword)

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "usuario@ejemplo.com"
 *     responses:
 *       200:
 *         description: Email de recuperación enviado (si el usuario existe)
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
 *                   example: "Si el email existe, se ha enviado un enlace de recuperación"
 *       400:
 *         description: Datos inválidos
 */
router.post('/forgot-password', authController.forgotPassword)

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña con token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *                 example: "abc123def456..."
 *               newPassword:
 *                 type: string
 *                 example: "newpassword123"
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
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
 *                   example: "Contraseña restablecida exitosamente"
 *       400:
 *         description: Token inválido o expirado
 */
router.post('/reset-password', authController.resetPassword)

module.exports = router
