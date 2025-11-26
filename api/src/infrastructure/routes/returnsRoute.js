const express = require('express')
const router = express.Router()

const returnController = require('../controllers/returnController')
const { authenticate, authorize } = require('../../middleware/auth')

// Todas las rutas requieren autenticación
router.use(authenticate)

/**
 * @swagger
 * tags:
 *   - name: Returns
 *     description: Gestión de devoluciones
 * components:
 *   schemas:
 *     Return:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         customer_id: { type: integer }
 *         product_id: { type: integer }
 *         quantity: { type: number }
 *         reason: { type: string }
 *         status: { type: string }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *         customer: { $ref: '#/components/schemas/Customer' }
 *         product: { $ref: '#/components/schemas/Product' }
 *     ReturnInput:
 *       type: object
 *       required: [customer_id, product_id, quantity, reason]
 *       properties:
 *         customer_id: { type: integer }
 *         product_id: { type: integer }
 *         quantity: { type: number }
 *         reason: { type: string }
 *         status: { type: string }
 *     ReturnUpdate:
 *       type: object
 *       properties:
 *         quantity: { type: number }
 *         reason: { type: string }
 *         status: { type: string }
 *     Error:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         message: { type: string }
 */

/**
 * @swagger
 * /api/returns:
 *   get:
 *     summary: Listar devoluciones
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de devoluciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Return' }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total: { type: integer }
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     pages: { type: integer }
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/', authorize('owner', 'admin', 'supervisor', 'cashier'), returnController.getAllReturns)

/**
 * @swagger
 * /api/returns/sale:
 *   get:
 *     summary: Buscar venta por referencia de transacción
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: transaction_reference
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Venta encontrada
 *       404:
 *         description: Venta no encontrada
 *       500:
 *         description: Error interno
 */
router.get('/sale', authorize('owner', 'admin', 'supervisor', 'cashier'), returnController.getSaleByReference)

/**
 * @swagger
 * /api/returns/{id}:
 *   get:
 *     summary: Obtener devolución por ID
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Devolución encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Return' }
 *       404:
 *         description: Devolución no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', authorize('owner', 'admin', 'supervisor', 'cashier'), returnController.getReturnById)

/**
 * @swagger
 * /api/returns:
 *   post:
 *     summary: Crear devolución
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ReturnInput' }
 *     responses:
 *       201:
 *         description: Devolución creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Return' }
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', authorize('admin', 'cashier'), returnController.createReturn)

/**
 * @swagger
 * /api/returns/{id}:
 *   put:
 *     summary: Actualizar devolución
 *     tags: [Returns]
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
 *           schema: { $ref: '#/components/schemas/ReturnUpdate' }
 *     responses:
 *       200:
 *         description: Devolución actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Return' }
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: Devolución no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.put('/:id', authorize('admin', 'supervisor'), returnController.updateReturn)

/**
 * @swagger
 * /api/returns/{id}:
 *   delete:
 *     summary: Eliminar devolución
 *     tags: [Returns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Devolución eliminada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *       404:
 *         description: Devolución no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/:id', authorize('admin', 'supervisor'), returnController.deleteReturn)

module.exports = router