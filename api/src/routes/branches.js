const express = require('express')
const router = express.Router()

const branchController = require('../controllers/branchController')
const { authenticate, authorize } = require('../middleware/auth')

// Todas las rutas requieren autenticación
router.use(authenticate)

/**
 * @swagger
 * tags:
 *   - name: Branches
 *     description: Gestión de sucursales
 * components:
 *   schemas:
 *     Branch:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Sucursal Centro"
 *         code:
 *           type: string
 *           example: "CTR-001"
 *           description: "Código único de la sucursal"
 *         address:
 *           type: string
 *           example: "Av. Juárez #123, Centro, Ciudad de Monterrey"
 *         city:
 *           type: string
 *           example: "Monterrey"
 *         state:
 *           type: string
 *           example: "Nuevo León"
 *         postal_code:
 *           type: string
 *           example: "64000"
 *         phone:
 *           type: string
 *           example: "81-1234-5678"
 *         email:
 *           type: string
 *           example: "sucursal_centro@empresa.com"
 *         is_active:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-01T08:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-10T10:00:00Z"
 *     BranchInput:
 *       type: object
 *       required:
 *         - name
 *         - code
 *       properties:
 *         name:
 *           type: string
 *           example: "Sucursal Norte"
 *         code:
 *           type: string
 *           example: "NTE-002"
 *           description: "Código único de la sucursal"
 *         address:
 *           type: string
 *           example: "Av. Constitución #456, Centro, Ciudad de Guadalupe"
 *         city:
 *           type: string
 *           example: "Guadalupe"
 *         state:
 *           type: string
 *           example: "Nuevo León"
 *         postal_code:
 *           type: string
 *           example: "67000"
 *         phone:
 *           type: string
 *           example: "81-2468-1357"
 *         email:
 *           type: string
 *           example: "sucursal_norte@empresa.com"
 *         is_active:
 *           type: boolean
 *           default: true
 *     BranchUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Sucursal Norte"
 *         address:
 *           type: string
 *           example: "Calle Secundaria 456, Monterrey"
 *         phone:
 *           type: string
 *           example: "81-9876-5432"
 *         is_active:
 *           type: boolean
 *           example: false
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Error interno del servidor"
 *   responses:
 *     UnauthorizedError:
 *       description: Token inválido o no proporcionado
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/branches:
 *   get:
 *     summary: Obtener todas las sucursales
 *     tags: [Branches]
 *     responses:
 *       200:
 *         description: Lista de sucursales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Branch'
 *             example:
 *               success: true
 *               data:
 *                 - id: 1
 *                   name: "Sucursal Centro"
 *                   code: "CTR-001"
 *                   address: "Av. Juárez #123, Centro, Ciudad de Monterrey"
 *                   city: "Monterrey"
 *                   state: "Nuevo León"
 *                   postal_code: "64000"
 *                   phone: "81-1234-5678"
 *                   email: "sucursal_centro@empresa.com"
 *                   is_active: true
 *                 - id: 2
 *                   name: "Sucursal Norte"
 *                   code: "NTE-002"
 *                   address: "Av. Constitución #123, Centro, Ciudad de Guadalupe"
 *                   city: "Guadalupe"
 *                   state: "Nuevo León"
 *                   postal_code: "64000"
 *                   phone: "81-2468-1357"
 *                   email: "sucursal_norte@empresa.com"
 *                   is_active: true
 *       500:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', branchController.getAllBranches)

/**
 * @swagger
 * /api/branches/{id}:
 *   get:
 *     summary: Obtener una sucursal por ID
 *     tags: [Branches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Sucursal encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Branch'
 *       404:
 *         description: Sucursal no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id', branchController.getBranchById)

/**
 * @swagger
 * /api/branches:
 *   post:
 *     summary: Crear una nueva sucursal
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BranchInput'
 *     responses:
 *       201:
 *         description: Sucursal creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Branch'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', authorize('admin'), branchController.createBranch)

/**
 * @swagger
 * /api/branches/{id}:
 *   put:
 *     summary: Actualizar una sucursal
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BranchUpdate'
 *     responses:
 *       200:
 *         description: Sucursal actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Branch'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Sucursal no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/:id', authorize('admin'), branchController.updateBranch)

/**
 * @swagger
 * /api/branches/{id}:
 *   delete:
 *     summary: Eliminar una sucursal (soft delete)
 *     tags: [Branches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Sucursal eliminada exitosamente
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
 *                   example: "Sucursal eliminada exitosamente"
 *       404:
 *         description: Sucursal no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete('/:id', authorize('admin'), branchController.deleteBranch)

module.exports = router
