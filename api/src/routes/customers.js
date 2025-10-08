const express = require('express')
const router = express.Router()

// Importar controlador
const customerController = require('../controllers/customerController')

// ===========================================
// DOCUMENTACIÓN SWAGGER - CLIENTES
// ===========================================

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Gestión de clientes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del cliente
 *           example: 1
 *         first_name:
 *           type: string
 *           description: Nombre del cliente
 *           example: "Ana"
 *         last_name:
 *           type: string
 *           description: Apellido del cliente
 *           example: "Martínez"
 *         email:
 *           type: string
 *           format: email
 *           description: Email del cliente
 *           example: "ana.martinez@email.com"
 *         phone:
 *           type: string
 *           description: Teléfono del cliente
 *           example: "81-1234-5678"
 *         address:
 *           type: string
 *           description: Dirección del cliente
 *           example: "Calle Falsa 123, Colonia Centro"
 *         city:
 *           type: string
 *           description: Ciudad del cliente
 *           example: "Monterrey"
 *         state:
 *           type: string
 *           description: Estado del cliente
 *           example: "Nuevo León"
 *         postal_code:
 *           type: string
 *           description: Código postal
 *           example: "64000"
 *         company_name:
 *           type: string
 *           description: Nombre de la empresa (para clientes corporativos)
 *           example: "Tecnología Avanzada S.A."
 *         tax_id:
 *           type: string
 *           description: RFC o identificación fiscal
 *           example: "MATA850315AB1"
 *         is_active:
 *           type: boolean
 *           description: Estado activo del cliente
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de registro
 *           example: "2024-10-01T08:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *           example: "2024-10-06T10:30:00Z"
 *     
 *     CustomerInput:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Nombre del cliente
 *           example: "Carlos"
 *         last_name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Apellido del cliente
 *           example: "González"
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           description: Email único del cliente
 *           example: "carlos.gonzalez@email.com"
 *         phone:
 *           type: string
 *           maxLength: 20
 *           description: Teléfono de contacto
 *           example: "81-9876-5432"
 *         address:
 *           type: string
 *           maxLength: 255
 *           description: Dirección completa
 *           example: "Av. Universidad #456, Col. Del Valle"
 *         city:
 *           type: string
 *           maxLength: 100
 *           description: Ciudad
 *           example: "San Pedro"
 *         state:
 *           type: string
 *           maxLength: 100
 *           description: Estado o provincia
 *           example: "Nuevo León"
 *         postal_code:
 *           type: string
 *           maxLength: 10
 *           description: Código postal
 *           example: "66260"
 *         company_name:
 *           type: string
 *           maxLength: 150
 *           description: Nombre de empresa (opcional)
 *           example: "Soluciones Digitales S.A."
 *         tax_id:
 *           type: string
 *           maxLength: 20
 *           description: RFC o identificación fiscal
 *           example: "GOGC900515XY2"
 *         is_active:
 *           type: boolean
 *           default: true
 *           description: Estado activo del cliente
 *           example: true
 *     
 *     CustomerUpdate:
 *       type: object
 *       properties:
 *         first_name:
 *           type: string
 *           example: "Carlos Eduardo"
 *         last_name:
 *           type: string
 *           example: "González López"
 *         email:
 *           type: string
 *           format: email
 *           example: "carlos.eduardo@nuevoemail.com"
 *         phone:
 *           type: string
 *           example: "81-5555-7777"
 *         address:
 *           type: string
 *           example: "Nueva Dirección #789, Col. Moderna"
 *         city:
 *           type: string
 *           example: "Guadalupe"
 *         company_name:
 *           type: string
 *           example: "Soluciones Digitales Avanzadas S.A."
 *         is_active:
 *           type: boolean
 *           example: true
 */

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Obtener todos los clientes
 *     description: Retorna una lista paginada de todos los clientes registrados
 *     tags: [Customers]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Cantidad de elementos por página
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre, apellido, email o empresa
 *         example: "martinez"
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtrar por ciudad
 *         example: "Monterrey"
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filtrar por estado
 *         example: "Nuevo León"
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *         example: true
 *       - in: query
 *         name: company
 *         schema:
 *           type: boolean
 *         description: Filtrar solo clientes corporativos
 *         example: true
 *     responses:
 *       200:
 *         description: Lista de clientes obtenida exitosamente
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
 *                   example: "Clientes obtenidos exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Customer'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     pages:
 *                       type: integer
 *                       example: 5
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', customerController.getAllCustomers)

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Obtener un cliente por ID
 *     description: Retorna los detalles de un cliente específico
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del cliente
 *         example: 1
 *     responses:
 *       200:
 *         description: Cliente encontrado exitosamente
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
 *                   example: "Cliente obtenido exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Cliente no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', customerController.getCustomerById)

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Crear un nuevo cliente
 *     description: Registra un nuevo cliente en el sistema
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerInput'
 *           examples:
 *             cliente_personal:
 *               summary: Cliente persona física
 *               value:
 *                 first_name: "María"
 *                 last_name: "López"
 *                 email: "maria.lopez@email.com"
 *                 phone: "81-1111-2222"
 *                 address: "Calle Principal #100, Col. Centro"
 *                 city: "Monterrey"
 *                 state: "Nuevo León"
 *                 postal_code: "64000"
 *                 tax_id: "LOPM850420AB3"
 *             cliente_corporativo:
 *               summary: Cliente empresa
 *               value:
 *                 first_name: "Roberto"
 *                 last_name: "Hernández"
 *                 email: "contacto@techcorp.com"
 *                 phone: "81-3333-4444"
 *                 address: "Av. Tecnológico #500, Parque Industrial"
 *                 city: "Apodaca"
 *                 state: "Nuevo León"
 *                 postal_code: "66600"
 *                 company_name: "TechCorp Solutions S.A. de C.V."
 *                 tax_id: "TCS201015ABC"
 *             cliente_basico:
 *               summary: Cliente con datos mínimos
 *               value:
 *                 first_name: "José"
 *                 last_name: "Ramírez"
 *                 phone: "81-5555-6666"
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
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
 *                   example: "Cliente creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Error de validación"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: "email"
 *                       message:
 *                         type: string
 *                         example: "El email ya está registrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', customerController.createCustomer)

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Actualizar un cliente
 *     description: Actualiza los datos de un cliente existente
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del cliente
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerUpdate'
 *           examples:
 *             actualizacion_contacto:
 *               summary: Actualizar información de contacto
 *               value:
 *                 phone: "81-7777-8888"
 *                 email: "nuevo.email@empresa.com"
 *                 address: "Nueva Dirección #999, Col. Moderna"
 *             expansion_empresa:
 *               summary: Expansión de empresa
 *               value:
 *                 company_name: "TechCorp Solutions Internacional S.A."
 *                 address: "Av. Internacional #1000, World Trade Center"
 *                 city: "San Pedro Garza García"
 *             cambio_estado:
 *               summary: Activar/Desactivar cliente
 *               value:
 *                 is_active: false
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente
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
 *                   example: "Cliente actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', customerController.updateCustomer)

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Eliminar un cliente (soft delete)
 *     description: Marca un cliente como eliminado (soft delete)
 *     tags: [Customers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del cliente
 *         example: 1
 *     responses:
 *       200:
 *         description: Cliente eliminado exitosamente
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
 *                   example: "Cliente eliminado exitosamente"
 *       400:
 *         description: No se puede eliminar (tiene ventas asociadas)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "No se puede eliminar el cliente porque tiene ventas asociadas"
 *       404:
 *         description: Cliente no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', customerController.deleteCustomer)

module.exports = router