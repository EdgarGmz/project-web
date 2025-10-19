const express = require('express')
const router = express.Router()

const paymentController = require('../controllers/paymentController')
const { authenticate } = require('../../middleware/auth')

/**
 * @swagger
 * tags:
 *   - name: Payments
 *     description: Gestión de pagos de clientes
 *
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         customer_id:
 *           type: integer
 *         amount:
 *           type: number
 *           format: decimal
 *         method:
 *           type: string
 *         reference:
 *           type: string
 *         status:
 *           type: string
 *         notes:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/payment:
 *   get:
 *     summary: Obtener todos los pagos
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pagos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 */
router.get('/', authenticate, paymentController.getAllPayments)

/**
 * @swagger
 * /api/payment/{id}:
 *   get:
 *     summary: Obtener un pago por ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pago obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       404:
 *         description: Pago no encontrado
 */
router.get('/:id', authenticate, paymentController.getPaymentById)

/**
 * @swagger
 * /api/payment:
 *   post:
 *     summary: Crear un nuevo pago
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer_id, amount, method]
 *             properties:
 *               customer_id:
 *                 type: integer
 *               amount:
 *                 type: number
 *                 format: decimal
 *               method:
 *                 type: string
 *               reference:
 *                 type: string
 *               status:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pago creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 */
router.post('/', authenticate, paymentController.createPayment)

/**
 * @swagger
 * /api/payment/{id}:
 *   put:
 *     summary: Actualizar un pago
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 format: decimal
 *               method:
 *                 type: string
 *               reference:
 *                 type: string
 *               status:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pago actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       404:
 *         description: Pago no encontrado
 */
router.put('/:id', authenticate, paymentController.updatePayment)

/**
 * @swagger
 * /api/payment/{id}:
 *   delete:
 *     summary: Eliminar un pago
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pago eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Pago no encontrado
 */
router.delete('/:id', authenticate, paymentController.deletePayment)

module.exports = router