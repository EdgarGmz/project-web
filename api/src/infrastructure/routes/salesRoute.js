const express = require('express')
const router = express.Router()

const saleController = require('../controllers/saleController')
const { authenticate, authorize } = require('../../middleware/auth')
const {
    createSaleValidator,
    updateSaleValidator,
    cancelSaleValidator,
    getSaleValidator,
    listSalesValidator,
    handleValidationErrors
} = require('../../validators')

router.use(authenticate)

/**
 * @swagger
 * tags:
 *   - name: Sales
 *     description: Operaciones sobre ventas
 * components:
 *   schemas:
 *     Sale:
 *       type: object
 *       properties:
 *         id: { type: string, format: 'uuid' }
 *         customer_id: { type: string, format: 'uuid' }
 *         user_id: { type: string, format: 'uuid' }
 *         branch_id: { type: string, format: 'uuid' }
 *         payment_method: { type: string }
 *         status: { type: string }
 *         total: { type: number }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *         items:
 *           type: array
 *           items: { $ref: '#/components/schemas/SaleItem' }
 *     SaleItem:
 *       type: object
 *       properties:
 *         id: { type: string, format: 'uuid' }
 *         sale_id: { type: string, format: 'uuid' }
 *         product_id: { type: string, format: 'uuid' }
 *         quantity: { type: number }
 *         price: { type: number }
 *     SaleInput:
 *       type: object
 *       required: [user_id, branch_id, payment_method, items]
 *       properties:
 *         customer_id: { type: string, format: 'uuid' }
 *         user_id: { type: string, format: 'uuid' }
 *         branch_id: { type: string, format: 'uuid' }
 *         payment_method: { type: string }
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             required: [product_id, quantity]
 *             properties:
 *               product_id: { type: string, format: 'uuid' }
 *               quantity: { type: number }
 *               unit_price: { type: number, description: "Precio unitario opcional. Si no se envía, se usa el precio del producto." }
 *     Error:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: false }
 *         message: { type: string }
 *     Pagination:
 *       type: object
 *       properties:
 *         page: { type: integer }
 *         limit: { type: integer }
 *         total: { type: integer }
 *         pages: { type: integer }
 */

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Listar ventas
 *     tags: [Sales]
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
 *         name: branch_id
 *         schema: { type: string, format: 'uuid' }
 *       - in: query
 *         name: user_id
 *         schema: { type: integer }
 *       - in: query
 *         name: customer_id
 *         schema: { type: string, format: 'uuid' }
 *       - in: query
 *         name: date_from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: date_to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Lista de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Sale' }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/', authorize('supervisor', 'cashier'), listSalesValidator, handleValidationErrors, saleController.getAllSales)

/**
 * @swagger
 * /api/sales/{id}:
 *   get:
 *     summary: Obtener venta por ID
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: 'uuid' }
 *     responses:
 *       200:
 *         description: Venta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/Sale' }
 *       404:
 *         description: Venta no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', authorize('supervisor', 'cashier'), getSaleValidator, handleValidationErrors, saleController.getSaleById)

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Crear venta
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SaleInput' }
 *     responses:
 *       201:
 *         description: Venta creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Sale' }
 *       400:
 *         description: Datos inválidos o stock insuficiente
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', authorize('cashier'), createSaleValidator, handleValidationErrors, saleController.createSale)

/**
 * @swagger
 * /api/sales/{id}:
 *   put:
 *     summary: Actualizar venta
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: 'uuid' }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customer_id: { type: integer }
 *               payment_method: { type: string }
 *               status: { type: string }
 *     responses:
 *       200:
 *         description: Venta actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Sale' }
 *       403:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.put('/:id', authorize('cashier'), updateSaleValidator, handleValidationErrors, saleController.updateSale)

/**
 * @swagger
 * /api/sales/{id}:
 *   delete:
 *     summary: Cancelar venta
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: 'uuid' }
 *     responses:
 *       200:
 *         description: Venta cancelada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *       403:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: No se puede cancelar la venta
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/:id', authorize('cashier'), cancelSaleValidator, handleValidationErrors, saleController.cancelSale)

module.exports = router
