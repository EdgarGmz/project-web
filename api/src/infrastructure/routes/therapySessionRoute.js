const express = require('express');
const router = express.Router();

// Importar controlador y middleware
const therapySessionController = require('../controllers/therapySessionController');
const { authenticate, authorize } = require('../../middleware/auth');

// Autenticación para todas las rutas
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   - name: Therapy Sessions
 *     description: Gestión de sesiones terapéuticas
 * components:
 *   schemas:
 *     TherapySession:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid, description: ID único de la sesión }
 *         customer_id: { type: string, format: uuid, description: ID del cliente/paciente }
 *         therapist_id: { type: string, format: uuid, description: ID del terapeuta }
 *         branch_id: { type: string, format: uuid, description: ID de la sucursal }
 *         session_date: { type: string, format: date-time, description: Fecha y hora de la sesión }
 *         duration_minutes: { type: integer, description: Duración en minutos, example: 60 }
 *         session_type: { type: string, enum: [individual, group, couple, family, online, assessment], description: Tipo de sesión }
 *         status: { type: string, enum: [scheduled, completed, cancelled, no_show, rescheduled], description: Estado de la sesión }
 *         notes: { type: string, description: Notas de la sesión }
 *         diagnosis: { type: string, description: Diagnóstico }
 *         treatment_plan: { type: string, description: Plan de tratamiento }
 *         price: { type: number, format: decimal, description: Precio de la sesión }
 *         payment_status: { type: string, enum: [pending, paid, partially_paid, cancelled], description: Estado del pago }
 *         is_active: { type: boolean, description: Si la sesión está activa }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *     TherapySessionInput:
 *       type: object
 *       required: [customer_id, therapist_id, session_date]
 *       properties:
 *         customer_id: { type: string, format: uuid }
 *         therapist_id: { type: string, format: uuid }
 *         branch_id: { type: string, format: uuid }
 *         session_date: { type: string, format: date-time }
 *         duration_minutes: { type: integer, default: 60 }
 *         session_type: { type: string, default: 'individual' }
 *         status: { type: string, default: 'scheduled' }
 *         notes: { type: string }
 *         diagnosis: { type: string }
 *         treatment_plan: { type: string }
 *         price: { type: number }
 *         payment_status: { type: string, default: 'pending' }
 */

/**
 * @swagger
 * /api/therapy-sessions:
 *   get:
 *     summary: Listar sesiones terapéuticas
 *     tags: [Therapy Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [scheduled, completed, cancelled, no_show, rescheduled] }
 *       - in: query
 *         name: session_type
 *         schema: { type: string }
 *       - in: query
 *         name: customer_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: therapist_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: branch_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: start_date
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: end_date
 *         schema: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Lista de sesiones terapéuticas
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.get('/', authorize('owner', 'admin', 'supervisor', 'cashier'), therapySessionController.getAllTherapySessions);

/**
 * @swagger
 * /api/therapy-sessions/stats:
 *   get:
 *     summary: Obtener estadísticas de sesiones
 *     tags: [Therapy Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branch_id
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Estadísticas de sesiones
 *       401:
 *         description: No autenticado
 */
router.get('/stats', authorize('owner', 'admin', 'supervisor'), therapySessionController.getTherapySessionStats);

/**
 * @swagger
 * /api/therapy-sessions/{id}:
 *   get:
 *     summary: Obtener sesión terapéutica por ID
 *     tags: [Therapy Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Sesión terapéutica encontrada
 *       404:
 *         description: Sesión no encontrada
 *       401:
 *         description: No autenticado
 */
router.get('/:id', authorize('owner', 'admin', 'supervisor', 'cashier'), therapySessionController.getTherapySessionById);

/**
 * @swagger
 * /api/therapy-sessions:
 *   post:
 *     summary: Crear nueva sesión terapéutica
 *     tags: [Therapy Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TherapySessionInput'
 *     responses:
 *       201:
 *         description: Sesión creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.post('/', authorize('owner', 'admin', 'supervisor'), therapySessionController.createTherapySession);

/**
 * @swagger
 * /api/therapy-sessions/{id}:
 *   put:
 *     summary: Actualizar sesión terapéutica
 *     tags: [Therapy Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TherapySessionInput'
 *     responses:
 *       200:
 *         description: Sesión actualizada exitosamente
 *       404:
 *         description: Sesión no encontrada
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.put('/:id', authorize('owner', 'admin', 'supervisor'), therapySessionController.updateTherapySession);

/**
 * @swagger
 * /api/therapy-sessions/{id}:
 *   delete:
 *     summary: Eliminar sesión terapéutica
 *     tags: [Therapy Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Sesión eliminada exitosamente
 *       404:
 *         description: Sesión no encontrada
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.delete('/:id', authorize('owner', 'admin'), therapySessionController.deleteTherapySession);

module.exports = router;
