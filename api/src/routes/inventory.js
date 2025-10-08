const express = require('express')
const router = express.Router()

// Importar controlador
const inventoryController = require('../controllers/inventoryController')

// ===========================================
// DOCUMENTACIÓN SWAGGER - INVENTARIO
// ===========================================

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Gestión de inventario
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Inventory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del registro de inventario
 *           example: 1
 *         product_id:
 *           type: integer
 *           description: ID del producto
 *           example: 1
 *         branch_id:
 *           type: integer
 *           description: ID de la sucursal
 *           example: 1
 *         current_stock:
 *           type: integer
 *           description: Stock actual disponible
 *           example: 25
 *         minimum_stock:
 *           type: integer
 *           description: Stock mínimo requerido
 *           example: 5
 *         maximum_stock:
 *           type: integer
 *           description: Stock máximo permitido
 *           example: 100
 *         reserved_stock:
 *           type: integer
 *           description: Stock reservado para ventas pendientes
 *           example: 3
 *         location:
 *           type: string
 *           description: Ubicación física del producto en el almacén
 *           example: "A1-B2-C3"
 *         last_restock_date:
 *           type: string
 *           format: date-time
 *           description: Fecha del último reabastecimiento
 *           example: "2024-10-01T10:00:00Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación del registro
 *           example: "2024-09-15T08:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *           example: "2024-10-06T14:30:00Z"
 *         Product:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             name:
 *               type: string
 *               example: "PlayStation 5"
 *             sku:
 *               type: string
 *               example: "PS5-CONSOLE-001"
 *             price:
 *               type: number
 *               format: float
 *               example: 599.99
 *             category:
 *               type: string
 *               example: "Consola"
 *         Branch:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             name:
 *               type: string
 *               example: "Sucursal Centro"
 *             code:
 *               type: string
 *               example: "CTR-001"
 *             city:
 *               type: string
 *               example: "Monterrey"
 *     
 *     InventoryInput:
 *       type: object
 *       required:
 *         - product_id
 *         - branch_id
 *       properties:
 *         product_id:
 *           type: integer
 *           description: ID del producto a agregar al inventario
 *           example: 1
 *         branch_id:
 *           type: integer
 *           description: ID de la sucursal
 *           example: 1
 *         current_stock:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           description: Stock inicial del producto
 *           example: 50
 *         minimum_stock:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           description: Stock mínimo requerido
 *           example: 10
 *         maximum_stock:
 *           type: integer
 *           minimum: 0
 *           description: Stock máximo permitido
 *           example: 200
 *         reserved_stock:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           description: Stock reservado
 *           example: 0
 *         location:
 *           type: string
 *           maxLength: 50
 *           description: Ubicación en el almacén
 *           example: "A1-B2-C3"
 *         last_restock_date:
 *           type: string
 *           format: date-time
 *           description: Fecha del último reabastecimiento
 *           example: "2024-10-06T10:00:00Z"
 *     
 *     InventoryUpdate:
 *       type: object
 *       properties:
 *         current_stock:
 *           type: integer
 *           minimum: 0
 *           example: 75
 *         minimum_stock:
 *           type: integer
 *           minimum: 0
 *           example: 15
 *         maximum_stock:
 *           type: integer
 *           minimum: 0
 *           example: 150
 *         reserved_stock:
 *           type: integer
 *           minimum: 0
 *           example: 5
 *         location:
 *           type: string
 *           example: "B2-C3-D4"
 *         last_restock_date:
 *           type: string
 *           format: date-time
 *           example: "2024-10-06T15:00:00Z"
 *     
 *     StockAdjustment:
 *       type: object
 *       required:
 *         - adjustment
 *         - reason
 *       properties:
 *         adjustment:
 *           type: integer
 *           description: Cantidad a ajustar (positivo para aumentar, negativo para disminuir)
 *           example: 10
 *         reason:
 *           type: string
 *           enum: [restock, sale, damage, theft, correction, return]
 *           description: Motivo del ajuste de stock
 *           example: "restock"
 *         notes:
 *           type: string
 *           maxLength: 255
 *           description: Notas adicionales sobre el ajuste
 *           example: "Reabastecimiento semanal programado"
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Obtener todo el inventario
 *     description: Retorna una lista paginada del inventario con información de productos y sucursales
 *     tags: [Inventory]
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
 *         name: branch_id
 *         schema:
 *           type: integer
 *         description: Filtrar por sucursal específica
 *         example: 1
 *       - in: query
 *         name: product_id
 *         schema:
 *           type: integer
 *         description: Filtrar por producto específico
 *         example: 1
 *       - in: query
 *         name: low_stock
 *         schema:
 *           type: boolean
 *         description: Mostrar solo productos con stock bajo (current_stock <= minimum_stock)
 *         example: true
 *       - in: query
 *         name: out_of_stock
 *         schema:
 *           type: boolean
 *         description: Mostrar solo productos sin stock (current_stock = 0)
 *         example: false
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filtrar por ubicación en almacén
 *         example: "A1"
 *     responses:
 *       200:
 *         description: Inventario obtenido exitosamente
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
 *                   example: "Inventario obtenido exitosamente"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Inventory'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     pages:
 *                       type: integer
 *                       example: 15
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', inventoryController.getAllInventory)

/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     summary: Obtener un registro de inventario por ID
 *     description: Retorna los detalles de un registro específico del inventario
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del registro de inventario
 *         example: 1
 *     responses:
 *       200:
 *         description: Registro de inventario encontrado exitosamente
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
 *                   example: "Inventario obtenido exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Inventory'
 *       404:
 *         description: Registro de inventario no encontrado
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
 *                   example: "Registro de inventario no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', inventoryController.getInventoryById)

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Crear un nuevo registro de inventario
 *     description: Agrega un producto al inventario de una sucursal específica
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventoryInput'
 *           examples:
 *             nuevo_producto:
 *               summary: Producto nuevo en sucursal
 *               value:
 *                 product_id: 1
 *                 branch_id: 1
 *                 current_stock: 50
 *                 minimum_stock: 10
 *                 maximum_stock: 200
 *                 location: "A1-B2-C3"
 *                 last_restock_date: "2024-10-06T10:00:00Z"
 *             stock_inicial:
 *               summary: Stock inicial básico
 *               value:
 *                 product_id: 2
 *                 branch_id: 2
 *                 current_stock: 25
 *                 minimum_stock: 5
 *                 maximum_stock: 100
 *                 location: "B1-C1-D1"
 *             sin_stock:
 *               summary: Producto sin stock inicial
 *               value:
 *                 product_id: 3
 *                 branch_id: 1
 *                 current_stock: 0
 *                 minimum_stock: 3
 *                 maximum_stock: 50
 *                 location: "C1-D1-E1"
 *     responses:
 *       201:
 *         description: Registro de inventario creado exitosamente
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
 *                   example: "Item de inventario creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Inventory'
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
 *                   example: "Ya existe un registro de inventario para este producto en esta sucursal"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', inventoryController.createInventory)

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: Actualizar un registro de inventario
 *     description: Actualiza los datos de un registro existente del inventario
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del registro de inventario
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InventoryUpdate'
 *           examples:
 *             ajuste_stock:
 *               summary: Ajuste de niveles de stock
 *               value:
 *                 current_stock: 75
 *                 minimum_stock: 15
 *                 maximum_stock: 150
 *             cambio_ubicacion:
 *               summary: Cambio de ubicación
 *               value:
 *                 location: "B2-C3-D4"
 *                 last_restock_date: "2024-10-06T15:00:00Z"
 *             reabastecimiento:
 *               summary: Después de reabastecimiento
 *               value:
 *                 current_stock: 100
 *                 reserved_stock: 0
 *                 last_restock_date: "2024-10-06T16:00:00Z"
 *     responses:
 *       200:
 *         description: Registro de inventario actualizado exitosamente
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
 *                   example: "Item de inventario actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Inventory'
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Registro de inventario no encontrado
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
router.put('/:id', inventoryController.updateInventory)

/**
 * @swagger
 * /api/inventory/{id}:
 *   delete:
 *     summary: Eliminar un registro de inventario
 *     description: Elimina completamente un producto del inventario de una sucursal
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del registro de inventario
 *         example: 1
 *     responses:
 *       200:
 *         description: Registro de inventario eliminado exitosamente
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
 *                   example: "Item de inventario eliminado exitosamente"
 *       400:
 *         description: No se puede eliminar (tiene stock o ventas pendientes)
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
 *                   example: "No se puede eliminar el registro porque tiene stock disponible"
 *       404:
 *         description: Registro de inventario no encontrado
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
router.delete('/:id', inventoryController.deleteInventory)

/**
 * @swagger
 * /api/inventory/{id}/adjust:
 *   post:
 *     summary: Ajustar stock de inventario
 *     description: Realiza un ajuste de stock (positivo o negativo) con seguimiento del motivo
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único del registro de inventario
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockAdjustment'
 *           examples:
 *             reabastecimiento:
 *               summary: Reabastecimiento de stock
 *               value:
 *                 adjustment: 50
 *                 reason: "restock"
 *                 notes: "Reabastecimiento semanal programado - Lote ABC123"
 *             venta:
 *               summary: Reducción por venta
 *               value:
 *                 adjustment: -3
 *                 reason: "sale"
 *                 notes: "Venta al cliente #12345"
 *             daño:
 *               summary: Reducción por daño
 *               value:
 *                 adjustment: -2
 *                 reason: "damage"
 *                 notes: "Productos dañados durante transporte"
 *             correccion:
 *               summary: Corrección de inventario
 *               value:
 *                 adjustment: -5
 *                 reason: "correction"
 *                 notes: "Ajuste por diferencia en conteo físico"
 *             devolucion:
 *               summary: Devolución de cliente
 *               value:
 *                 adjustment: 1
 *                 reason: "return"
 *                 notes: "Devolución cliente #67890 - producto en perfecto estado"
 *     responses:
 *       200:
 *         description: Stock ajustado exitosamente
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
 *                   example: "Stock ajustado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     inventory:
 *                       $ref: '#/components/schemas/Inventory'
 *                     adjustment:
 *                       type: object
 *                       properties:
 *                         previous_stock:
 *                           type: integer
 *                           example: 25
 *                         adjustment:
 *                           type: integer
 *                           example: 10
 *                         new_stock:
 *                           type: integer
 *                           example: 35
 *                         reason:
 *                           type: string
 *                           example: "restock"
 *                         notes:
 *                           type: string
 *                           example: "Reabastecimiento semanal"
 *       400:
 *         description: Error de validación o stock insuficiente
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
 *                   example: "Stock insuficiente para realizar el ajuste"
 *       404:
 *         description: Registro de inventario no encontrado
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
router.post('/:id/adjust', inventoryController.adjustStock)

module.exports = router