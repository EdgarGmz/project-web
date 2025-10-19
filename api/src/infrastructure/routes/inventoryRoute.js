const express = require('express')
const router = express.Router()

// Importar controlador
const inventoryController = require('../controllers/inventoryController')
const { authenticate, authorize, checkBranchAccess } = require('../../middleware/auth')

// Todas las rutas requieren autenticación
router.use(authenticate)

/**
 * @swagger
 * tags:
 *   - name: Inventory
 *     description: Gestión de inventario por sucursal y producto
 * components:
 *   schemas:
 *     Inventory:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         product_id: { type: integer }
 *         branch_id: { type: integer }
 *         quantity: { type: number }
 *         min_stock: { type: number }
 *         notes: { type: string }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Listar inventario
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: branch_id
 *         schema: { type: integer }
 *       - in: query
 *         name: product_id
 *         schema: { type: integer }
 *       - in: query
 *         name: low_stock
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Lista de inventario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Inventory' }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total: { type: integer }
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     pages: { type: integer }
 */
router.get('/', checkBranchAccess, inventoryController.getAllInventory)

/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     summary: Obtener item de inventario por ID
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Item de inventario obtenido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Inventory' }
 *       404:
 *         description: No encontrado
 */
router.get('/:id', checkBranchAccess, inventoryController.getInventoryById)

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Crear item de inventario
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [product_id, branch_id, quantity]
 *             properties:
 *               product_id: { type: integer }
 *               branch_id: { type: integer }
 *               quantity: { type: number }
 *               min_stock: { type: number }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Item de inventario creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Inventory' }
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno
 */
router.post('/', authorize('admin', 'manager', 'owner'), checkBranchAccess, inventoryController.createInventory)

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: Actualizar item de inventario
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity: { type: number }
 *               min_stock: { type: number }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Item de inventario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Inventory' }
 *       400:
 *         description: Error de validación
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error interno
 */
router.put('/:id', authorize('admin', 'manager', 'owner'), checkBranchAccess, inventoryController.updateInventory)

/**
 * @swagger
 * /api/inventory/{id}:
 *   delete:
 *     summary: Eliminar item de inventario
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Item de inventario eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error interno
 */
router.delete('/:id', authorize('admin', 'manager', 'owner'), checkBranchAccess, inventoryController.deleteInventory)

/**
 * @swagger
 * /api/inventory/{id}/adjust:
 *   put:
 *     summary: Ajustar stock de inventario
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [adjustment, reason]
 *             properties:
 *               adjustment: { type: number }
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Stock ajustado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: object
 *                   properties:
 *                     previous_quantity: { type: number }
 *                     current_quantity: { type: number }
 *                     adjustment: { type: number }
 *                     reason: { type: string }
 *       400:
 *         description: Error de validación
 *       404:
 *         description: No encontrado
 *       500:
 *         description: Error interno
 */
router.put('/:id/adjust', authorize('admin', 'manager', 'owner'), checkBranchAccess, inventoryController.adjustStock)

module.exports = router