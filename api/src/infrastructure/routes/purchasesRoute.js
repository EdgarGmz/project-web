const express = require('express')
const router = express.Router()

// Importar controlador
const purchaseController = require('../controllers/purchaseController')
const { authenticate, authorize } = require('../../middleware/auth')

// Autenticación para todas las rutas
router.use(authenticate)

// Solo owner y admin pueden acceder a las compras
router.use(authorize('owner', 'admin'))

/**
 * @swagger
 * tags:
 *   - name: Purchases
 *     description: Gestión de compras
 * components:
 *   schemas:
 *     Purchase:
 *       type: object
 *       properties:
 *         id: { type: string, description: ID único de la compra, example: "550e8400-e29b-41d4-a716-446655440000" }
 *         supplier_name: { type: string, description: Nombre del proveedor, example: "Proveedor ABC S.A." }
 *         supplier_contact: { type: string, description: Contacto del proveedor, example: "Juan Pérez" }
 *         supplier_phone: { type: string, description: Teléfono del proveedor, example: "81-1234-5678" }
 *         total_amount: { type: number, description: Monto total, example: 15000.00 }
 *         purchase_date: { type: string, format: date, description: Fecha de compra, example: "2023-10-15" }
 *         invoice_number: { type: string, description: Número de factura, example: "FAC-2023-001" }
 *         status: { type: string, enum: ["pending", "completed", "cancelled"], description: Estado de la compra, example: "pending" }
 *         notes: { type: string, description: Notas adicionales, example: "Compra urgente de productos" }
 *         branch_id: { type: string, description: ID de la sucursal, example: "550e8400-e29b-41d4-a716-446655440000" }
 *         user_id: { type: string, description: ID del usuario que registró la compra, example: "550e8400-e29b-41d4-a716-446655440000" }
 *         created_at: { type: string, format: date-time, description: Fecha de creación }
 *         updated_at: { type: string, format: date-time, description: Fecha de actualización }
 *     PurchaseInput:
 *       type: object
 *       required: [supplier_name, total_amount]
 *       properties:
 *         supplier_name: { type: string, description: Nombre del proveedor, example: "Proveedor ABC S.A." }
 *         supplier_contact: { type: string, description: Contacto del proveedor, example: "Juan Pérez" }
 *         supplier_phone: { type: string, description: Teléfono del proveedor, example: "81-1234-5678" }
 *         total_amount: { type: number, description: Monto total, example: 15000.00 }
 *         purchase_date: { type: string, format: date, description: Fecha de compra, example: "2023-10-15" }
 *         invoice_number: { type: string, description: Número de factura, example: "FAC-2023-001" }
 *         status: { type: string, enum: ["pending", "completed", "cancelled"], description: Estado de la compra, example: "pending" }
 *         notes: { type: string, description: Notas adicionales, example: "Compra urgente de productos" }
 *     Error:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: false }
 *         message: { type: string, example: "Error message" }
 */

/**
 * @swagger
 * /api/purchases:
 *   get:
 *     summary: Obtener todas las compras (Solo Owner y Admin)
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *         description: Número de elementos por página
 *     responses:
 *       200:
 *         description: Lista de compras obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Purchase' }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total: { type: integer }
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     pages: { type: integer }
 *       401:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/', purchaseController.getAllPurchases)

/**
 * @swagger
 * /api/purchases/{id}:
 *   get:
 *     summary: Obtener compra por ID (Solo Owner y Admin)
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID de la compra
 *     responses:
 *       200:
 *         description: Compra obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Purchase' }
 *       404:
 *         description: Compra no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', purchaseController.getPurchaseById)

/**
 * @swagger
 * /api/purchases:
 *   post:
 *     summary: Crear compra (Solo Owner y Admin)
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PurchaseInput' }
 *     responses:
 *       201:
 *         description: Compra creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Purchase' }
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', purchaseController.createPurchase)

/**
 * @swagger
 * /api/purchases/{id}:
 *   put:
 *     summary: Actualizar compra (Solo Owner y Admin)
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID de la compra
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PurchaseInput' }
 *     responses:
 *       200:
 *         description: Compra actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Purchase' }
 *       404:
 *         description: Compra no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.put('/:id', purchaseController.updatePurchase)

/**
 * @swagger
 * /api/purchases/{id}:
 *   delete:
 *     summary: Eliminar compra (Solo Owner y Admin)
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: ID de la compra
 *     responses:
 *       200:
 *         description: Compra eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *       404:
 *         description: Compra no encontrada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/:id', purchaseController.deletePurchase)

module.exports = router