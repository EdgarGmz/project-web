const express = require('express')
const router = express.Router()
const logController = require('../controllers/logController')
const { authenticate, authorize } = require('../../middleware/auth')

// Todas las rutas de logs requieren autenticación
// Solo owner y admin pueden acceder a los logs
router.use(authenticate)

/**
 * @swagger
 * /logs:
 *   get:
 *     summary: Obtener todos los logs
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados por página
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID de usuario
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filtrar por tipo de acción
 *       - in: query
 *         name: service
 *         schema:
 *           type: string
 *         description: Filtrar por servicio
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en mensaje
 *     responses:
 *       200:
 *         description: Logs obtenidos exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/', authorize('owner'), logController.getAllLogs)

/**
 * @swagger
 * /logs/stats:
 *   get:
 *     summary: Obtener estadísticas de logs
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/stats', authorize('owner'), logController.getLogStats)

/**
 * @swagger
 * /logs/user/{userId}:
 *   get:
 *     summary: Obtener logs de un usuario específico
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados por página
 *     responses:
 *       200:
 *         description: Logs del usuario obtenidos exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/user/:userId', authorize('owner'), logController.getLogsByUser)

/**
 * @swagger
 * /logs/{id}:
 *   get:
 *     summary: Obtener un log por ID
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del log
 *     responses:
 *       200:
 *         description: Log obtenido exitosamente
 *       404:
 *         description: Log no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', authorize('owner'), logController.getLogById)

/**
 * @swagger
 * /logs:
 *   post:
 *     summary: Crear un nuevo log
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - action
 *               - service
 *               - message
 *             properties:
 *               user_id:
 *                 type: string
 *               action:
 *                 type: string
 *               service:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Log creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
// Permitir que cualquier usuario autenticado cree logs (pero solo para su propio user_id)
router.post('/', authenticate, logController.createLog)

/**
 * @swagger
 * /logs/cleanup:
 *   delete:
 *     summary: Eliminar logs antiguos
 *     tags: [Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         required: true
 *         schema:
 *           type: integer
 *         description: Eliminar logs más antiguos que X días
 *     responses:
 *       200:
 *         description: Logs antiguos eliminados exitosamente
 *       400:
 *         description: Parámetro inválido
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
router.delete('/cleanup', authorize('owner'), logController.deleteOldLogs)

module.exports = router
