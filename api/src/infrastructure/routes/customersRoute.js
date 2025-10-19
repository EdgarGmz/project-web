const express = require('express')
const router = express.Router()

// Importar controlador
const customerController = require('../controllers/customerController')
const { authenticate, authorize } = require('../../middleware/auth')

// Autenticación para todas las rutas
router.use(authenticate)

/**
 * @swagger
 * tags:
 *   - name: Customers
 *     description: Gestión de clientes
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         id: { type: integer, description: ID único del cliente, example: 1 }
 *         first_name: { type: string, description: Nombre, example: "Ana" }
 *         last_name: { type: string, description: Apellido, example: "Martínez" }
 *         email: { type: string, format: email, description: Email, example: "ana@email.com" }
 *         phone: { type: string, description: Teléfono, example: "81-1234-5678" }
 *         address: { type: string, description: Dirección, example: "Calle Falsa 123" }
 *         city: { type: string, description: Ciudad, example: "Monterrey" }
 *         state: { type: string, description: Estado, example: "Nuevo León" }
 *         postal_code: { type: string, description: Código postal, example: "64000" }
 *         company_name: { type: string, description: Empresa, example: "Tecnología Avanzada S.A." }
 *         tax_id: { type: string, description: RFC, example: "MATA850315AB1" }
 *         is_active: { type: boolean, description: Activo, example: true }
 *         created_at: { type: string, format: date-time, description: Registro, example: "2024-10-01T08:00:00Z" }
 *         updated_at: { type: string, format: date-time, description: Actualización, example: "2024-10-06T10:30:00Z" }
 *     CustomerInput:
 *       type: object
 *       properties:
 *         first_name: { type: string, minLength: 2, maxLength: 100, example: "Carlos" }
 *         last_name: { type: string, minLength: 2, maxLength: 100, example: "González" }
 *         email: { type: string, format: email, maxLength: 255, example: "carlos@email.com" }
 *         phone: { type: string, maxLength: 20, example: "81-9876-5432" }
 *         address: { type: string, maxLength: 255, example: "Av. Universidad #456" }
 *         city: { type: string, maxLength: 100, example: "San Pedro" }
 *         state: { type: string, maxLength: 100, example: "Nuevo León" }
 *         postal_code: { type: string, maxLength: 10, example: "66260" }
 *         company_name: { type: string, maxLength: 150, example: "Soluciones Digitales S.A." }
 *         tax_id: { type: string, maxLength: 20, example: "GOGC900515XY2" }
 *         is_active: { type: boolean, default: true, example: true }
 *     CustomerUpdate:
 *       type: object
 *       properties:
 *         first_name: { type: string, example: "Carlos Eduardo" }
 *         last_name: { type: string, example: "González López" }
 *         email: { type: string, format: email, example: "carlos.eduardo@nuevoemail.com" }
 *         phone: { type: string, example: "81-5555-7777" }
 *         address: { type: string, example: "Nueva Dirección #789" }
 *         city: { type: string, example: "Guadalupe" }
 *         company_name: { type: string, example: "Soluciones Digitales Avanzadas S.A." }
 *         is_active: { type: boolean, example: true }
 *     Error:
 *       type: object
 *       properties:
 *         success: { type: boolean, example: false }
 *         message: { type: string, example: "Error" }
 */

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Listar clientes
 *     tags: [Customers]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *         description: Página
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *         description: Elementos por página
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Buscar por nombre, apellido, email o empresa
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *         description: Filtrar por ciudad
 *       - in: query
 *         name: state
 *         schema: { type: string }
 *         description: Filtrar por estado
 *       - in: query
 *         name: is_active
 *         schema: { type: boolean }
 *         description: Filtrar por estado activo
 *       - in: query
 *         name: company
 *         schema: { type: boolean }
 *         description: Solo clientes corporativos
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Clientes obtenidos exitosamente" }
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Customer' }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total: { type: integer, example: 50 }
 *                     page: { type: integer, example: 1 }
 *                     limit: { type: integer, example: 10 }
 *                     pages: { type: integer, example: 5 }
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/', customerController.getAllCustomers)

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Cliente obtenido exitosamente" }
 *                 data: { $ref: '#/components/schemas/Customer' }
 *       404:
 *         description: No encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/:id', customerController.getCustomerById)

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Crear cliente
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CustomerInput' }
 *     responses:
 *       201:
 *         description: Cliente creado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Cliente creado exitosamente" }
 *                 data: { $ref: '#/components/schemas/Customer' }
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 message: { type: string, example: "Error de validación" }
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field: { type: string, example: "email" }
 *                       message: { type: string, example: "El email ya está registrado" }
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/', customerController.createCustomer)

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Actualizar cliente
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID del cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CustomerUpdate' }
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Cliente actualizado exitosamente" }
 *                 data: { $ref: '#/components/schemas/Customer' }
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       404:
 *         description: No encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.put('/:id', authorize('admin', 'manager'), customerController.updateCustomer)

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Eliminar cliente (soft delete)
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Cliente eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Cliente eliminado exitosamente" }
 *       400:
 *         description: No se puede eliminar (ventas asociadas)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: false }
 *                 message: { type: string, example: "No se puede eliminar el cliente porque tiene ventas asociadas" }
 *       404:
 *         description: No encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Error interno
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.delete('/:id', authorize('admin'), customerController.deleteCustomer)

module.exports = router
