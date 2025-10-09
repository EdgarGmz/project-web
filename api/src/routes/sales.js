const express = require('express')
const router = express.Router()

const saleController = require('../controllers/saleController')
const { authenticate, authorize } = require('../middleware/auth')

/**
 * @swagger
 * components:
 *   schemas:
 *     Sale:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         sale_number: { type: string, example: "VTA-2025-001", description: "Número único de venta" }
 *         customer_id: { type: integer, example: 1 }
 *         customer: { $ref: '#/components/schemas/Customer' }
 *         user_id: { type: integer, example: 1 }
 *         user: { $ref: '#/components/schemas/User' }
 *         branch_id: { type: integer, example: 1 }
 *         branch: { $ref: '#/components/schemas/Branch' }
 *         sale_date: { type: string, format: date-time, example: "2025-10-09T10:30:00Z" }
 *         status: { type: string, enum: [pending, completed, cancelled, refunded], example: "completed" }
 *         payment_method: { type: string, enum: [cash, card, transfer, mixed], example: "card" }
 *         subtotal: { type: number, format: decimal, example: 1199.98 }
 *         tax_amount: { type: number, format: decimal, example: 192.00 }
 *         discount_amount: { type: number, format: decimal, example: 0.00 }
 *         total_amount: { type: number, format: decimal, example: 1391.98 }
 *         notes: { type: string, example: "Venta promocional Black Friday" }
 *         sale_items:
 *           type: array
 *           items: { $ref: '#/components/schemas/SaleItem' }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *     SaleItem:
 *       type: object
 *       properties:
 *         id: { type: integer, example: 1 }
 *         sale_id: { type: integer, example: 1 }
 *         product_id: { type: integer, example: 1 }
 *         product: { $ref: '#/components/schemas/Product' }
 *         quantity: { type: number, format: decimal, example: 2.000 }
 *         unit_price: { type: number, format: decimal, example: 599.99 }
 *         discount_percentage: { type: number, format: decimal, example: 0.00 }
 *         discount_amount: { type: number, format: decimal, example: 0.00 }
 *         subtotal: { type: number, format: decimal, example: 1199.98 }
 *         tax_rate: { type: number, format: decimal, example: 0.16 }
 *         tax_amount: { type: number, format: decimal, example: 192.00 }
 *         total: { type: number, format: decimal, example: 1391.98 }
 *     SaleInput:
 *       type: object
 *       required: [customer_id, branch_id, payment_method, sale_items]
 *       properties:
 *         customer_id: { type: integer, example: 1 }
 *         branch_id: { type: integer, example: 1 }
 *         payment_method: { type: string, enum: [cash, card, transfer, mixed], example: "card" }
 *         notes: { type: string, example: "Venta con descuento especial" }
 *         sale_items:
 *           type: array
 *           items:
 *             type: object
 *             required: [product_id, quantity, unit_price]
 *             properties:
 *               product_id: { type: integer, example: 1 }
 *               quantity: { type: number, format: decimal, example: 2.000 }
 *               unit_price: { type: number, format: decimal, example: 599.99 }
 *               discount_percentage: { type: number, format: decimal, example: 0.00, default: 0.00 }
 *     Error:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: false }
 *         message: { type: string, example: "Error message" }
 *         code: { type: string, example: "ERROR_CODE" }
 *     Pagination:
 *       type: object
 *       properties:
 *         page: { type: integer, example: 1 }
 *         limit: { type: integer, example: 10 }
 *         total: { type: integer, example: 50 }
 *         pages: { type: integer, example: 5 }
 */

/**
 * @swagger
 * tags:
 *   - name: Sales
 *     description: Operaciones sobre ventas
 */

// Todas las rutas requieren autenticación
router.use(authenticate)

/**
 * @swagger
 * /api/sales:
 *   get:
 *     summary: Listar ventas
 *     tags: [Sales]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Página
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Elementos por página
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, completed, cancelled, refunded] }
 *         description: Estado de venta
 *       - in: query
 *         name: payment_method
 *         schema: { type: string, enum: [cash, card, transfer, mixed] }
 *         description: Método de pago
 *       - in: query
 *         name: date_from
 *         schema: { type: string, format: date }
 *         description: Fecha inicio (YYYY-MM-DD)
 *       - in: query
 *         name: date_to
 *         schema: { type: string, format: date }
 *         description: Fecha fin (YYYY-MM-DD)
 *       - in: query
 *         name: customer_id
 *         schema: { type: integer }
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Lista de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
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
router.get('/', saleController.getAllSales)

/**
 * @swagger
 * /api/sales/{id}:
 *   get:
 *     summary: Obtener venta por ID
 *     tags: [Sales]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la venta
 *     responses:
 *       200:
 *         description: Venta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Sale' }
 *       404:
 *         description: Venta no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', saleController.getSaleById)

/**
 * @swagger
 * /api/sales:
 *   post:
 *     summary: Crear venta
 *     tags: [Sales]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/SaleInput' }
 *           example:
 *             customer_id: 1
 *             branch_id: 1
 *             payment_method: "card"
 *             notes: "Venta Black Friday"
 *             sale_items:
 *               - product_id: 1
 *                 quantity: 1
 *                 unit_price: 599.99
 *                 discount_percentage: 10.00
 *               - product_id: 4
 *                 quantity: 2
 *                 unit_price: 69.99
 *                 discount_percentage: 0.00
 *     responses:
 *       201:
 *         description: Venta creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Venta creada exitosamente" }
 *                 data: { $ref: '#/components/schemas/Sale' }
 *       400:
 *         description: Datos inválidos o stock insuficiente
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', saleController.createSale)

/**
 * @swagger
 * /api/sales/{id}:
 *   put:
 *     summary: Actualizar venta
 *     tags: [Sales]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la venta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [pending, completed, cancelled, refunded] }
 *               payment_method: { type: string, enum: [cash, card, transfer, mixed] }
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Venta actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Venta actualizada exitosamente" }
 *                 data: { $ref: '#/components/schemas/Sale' }
 *       403:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.put('/:id', authorize('admin', 'manager'), saleController.updateSale)

/**
 * @swagger
 * /api/sales/{id}:
 *   delete:
 *     summary: Cancelar venta
 *     tags: [Sales]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID de la venta
 *     responses:
 *       200:
 *         description: Venta cancelada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Venta cancelada exitosamente. Inventario restaurado." }
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
router.delete('/:id', authorize('admin', 'manager'), saleController.cancelSale)

module.exports = router
