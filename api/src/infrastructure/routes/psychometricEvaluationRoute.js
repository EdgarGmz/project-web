const express = require('express');
const router = express.Router();

// Importar controlador y middleware
const psychometricEvaluationController = require('../controllers/psychometricEvaluationController');
const { authenticate, authorize } = require('../../middleware/auth');

// Autenticación para todas las rutas
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   - name: Psychometric Evaluations
 *     description: Gestión de evaluaciones psicométricas
 * components:
 *   schemas:
 *     PsychometricEvaluation:
 *       type: object
 *       properties:
 *         id: { type: string, format: uuid, description: ID único de la evaluación }
 *         customer_id: { type: string, format: uuid, description: ID del cliente/paciente }
 *         evaluator_id: { type: string, format: uuid, description: ID del evaluador }
 *         branch_id: { type: string, format: uuid, description: ID de la sucursal }
 *         evaluation_date: { type: string, format: date-time, description: Fecha y hora de la evaluación }
 *         test_name: { type: string, description: Nombre de la prueba psicométrica }
 *         test_type: { type: string, enum: [personality, intelligence, aptitude, neuropsychological, projective, clinical, vocational, other], description: Tipo de prueba }
 *         duration_minutes: { type: integer, description: Duración en minutos, example: 60 }
 *         status: { type: string, enum: [scheduled, in_progress, completed, cancelled, rescheduled], description: Estado de la evaluación }
 *         raw_scores: { type: object, description: Puntuaciones brutas de la evaluación }
 *         scaled_scores: { type: object, description: Puntuaciones escaladas o normalizadas }
 *         interpretation: { type: string, description: Interpretación clínica de los resultados }
 *         recommendations: { type: string, description: Recomendaciones basadas en la evaluación }
 *         notes: { type: string, description: Notas adicionales del evaluador }
 *         price: { type: number, format: decimal, description: Precio de la evaluación }
 *         payment_status: { type: string, enum: [pending, paid, partially_paid, cancelled], description: Estado del pago }
 *         is_active: { type: boolean, description: Si la evaluación está activa }
 *         created_at: { type: string, format: date-time }
 *         updated_at: { type: string, format: date-time }
 *     PsychometricEvaluationInput:
 *       type: object
 *       required: [customer_id, evaluator_id, evaluation_date, test_name]
 *       properties:
 *         customer_id: { type: string, format: uuid }
 *         evaluator_id: { type: string, format: uuid }
 *         branch_id: { type: string, format: uuid }
 *         evaluation_date: { type: string, format: date-time }
 *         test_name: { type: string }
 *         test_type: { type: string, default: 'personality' }
 *         duration_minutes: { type: integer, default: 60 }
 *         status: { type: string, default: 'scheduled' }
 *         raw_scores: { type: object }
 *         scaled_scores: { type: object }
 *         interpretation: { type: string }
 *         recommendations: { type: string }
 *         notes: { type: string }
 *         price: { type: number }
 *         payment_status: { type: string, default: 'pending' }
 */

/**
 * @swagger
 * /api/psychometric-evaluations:
 *   get:
 *     summary: Listar evaluaciones psicométricas
 *     tags: [Psychometric Evaluations]
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
 *         schema: { type: string, enum: [scheduled, in_progress, completed, cancelled, rescheduled] }
 *       - in: query
 *         name: test_type
 *         schema: { type: string }
 *       - in: query
 *         name: customer_id
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: evaluator_id
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
 *         description: Lista de evaluaciones psicométricas
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.get('/', authorize('owner', 'admin', 'supervisor', 'cashier'), psychometricEvaluationController.getAllPsychometricEvaluations);

/**
 * @swagger
 * /api/psychometric-evaluations/stats:
 *   get:
 *     summary: Obtener estadísticas de evaluaciones
 *     tags: [Psychometric Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: branch_id
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Estadísticas de evaluaciones
 *       401:
 *         description: No autenticado
 */
router.get('/stats', authorize('owner', 'admin', 'supervisor'), psychometricEvaluationController.getPsychometricEvaluationStats);

/**
 * @swagger
 * /api/psychometric-evaluations/{id}:
 *   get:
 *     summary: Obtener evaluación psicométrica por ID
 *     tags: [Psychometric Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Evaluación psicométrica encontrada
 *       404:
 *         description: Evaluación no encontrada
 *       401:
 *         description: No autenticado
 */
router.get('/:id', authorize('owner', 'admin', 'supervisor', 'cashier'), psychometricEvaluationController.getPsychometricEvaluationById);

/**
 * @swagger
 * /api/psychometric-evaluations:
 *   post:
 *     summary: Crear nueva evaluación psicométrica
 *     tags: [Psychometric Evaluations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PsychometricEvaluationInput'
 *     responses:
 *       201:
 *         description: Evaluación creada exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.post('/', authorize('owner', 'admin', 'supervisor'), psychometricEvaluationController.createPsychometricEvaluation);

/**
 * @swagger
 * /api/psychometric-evaluations/{id}:
 *   put:
 *     summary: Actualizar evaluación psicométrica
 *     tags: [Psychometric Evaluations]
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
 *             $ref: '#/components/schemas/PsychometricEvaluationInput'
 *     responses:
 *       200:
 *         description: Evaluación actualizada exitosamente
 *       404:
 *         description: Evaluación no encontrada
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.put('/:id', authorize('owner', 'admin', 'supervisor'), psychometricEvaluationController.updatePsychometricEvaluation);

/**
 * @swagger
 * /api/psychometric-evaluations/{id}:
 *   delete:
 *     summary: Eliminar evaluación psicométrica
 *     tags: [Psychometric Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Evaluación eliminada exitosamente
 *       404:
 *         description: Evaluación no encontrada
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos
 */
router.delete('/:id', authorize('owner', 'admin'), psychometricEvaluationController.deletePsychometricEvaluation);

module.exports = router;
