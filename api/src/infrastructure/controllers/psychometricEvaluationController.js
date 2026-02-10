const db = require('../database/models');
const { PsychometricEvaluation, Customer, User, Branch } = db;

// Obtener todas las evaluaciones psicométricas
const getAllPsychometricEvaluations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const currentUser = req.user;
        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        // Filtros opcionales
        const whereClause = {};
        
        // Filtrar por estado si se proporciona
        if (req.query.status) {
            whereClause.status = req.query.status;
        }

        // Filtrar por tipo de prueba si se proporciona
        if (req.query.test_type) {
            whereClause.test_type = req.query.test_type;
        }

        // Filtrar por cliente si se proporciona
        if (req.query.customer_id) {
            whereClause.customer_id = req.query.customer_id;
        }

        // Filtrar por evaluador si se proporciona
        if (req.query.evaluator_id) {
            whereClause.evaluator_id = req.query.evaluator_id;
        }

        // Filtrar por rango de fechas
        if (req.query.start_date || req.query.end_date) {
            whereClause.evaluation_date = {};
            if (req.query.start_date) {
                whereClause.evaluation_date[db.Sequelize.Op.gte] = new Date(req.query.start_date);
            }
            if (req.query.end_date) {
                whereClause.evaluation_date[db.Sequelize.Op.lte] = new Date(req.query.end_date);
            }
        }

        // Aplicar filtros por sucursal según el rol
        if (currentUser.role === 'cashier' || currentUser.role === 'supervisor') {
            whereClause.branch_id = currentUser.branch_id;
        } else if (req.query.branch_id) {
            whereClause.branch_id = req.query.branch_id;
        }

        const { count, rows } = await PsychometricEvaluation.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['evaluation_date', 'DESC']],
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
                },
                {
                    model: User,
                    as: 'evaluator',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                },
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'name', 'code']
                }
            ]
        });

        res.json({
            success: true,
            message: 'Evaluaciones psicométricas obtenidas exitosamente',
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener evaluaciones psicométricas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener evaluaciones psicométricas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtener una evaluación psicométrica por ID
const getPsychometricEvaluationById = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;

        const evaluation = await PsychometricEvaluation.findByPk(id, {
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'address']
                },
                {
                    model: User,
                    as: 'evaluator',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'role']
                },
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'name', 'code', 'city']
                }
            ]
        });

        if (!evaluation) {
            return res.status(404).json({
                success: false,
                message: 'Evaluación psicométrica no encontrada'
            });
        }

        // Verificar acceso por sucursal
        if ((currentUser.role === 'cashier' || currentUser.role === 'supervisor') 
            && evaluation.branch_id !== currentUser.branch_id) {
            return res.status(403).json({
                success: false,
                message: 'No tiene acceso a evaluaciones de otras sucursales'
            });
        }

        res.json({
            success: true,
            message: 'Evaluación psicométrica obtenida exitosamente',
            data: evaluation
        });

    } catch (error) {
        console.error('Error al obtener evaluación psicométrica:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener evaluación psicométrica',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Crear una nueva evaluación psicométrica
const createPsychometricEvaluation = async (req, res) => {
    try {
        const currentUser = req.user;
        const {
            customer_id,
            evaluator_id,
            branch_id,
            evaluation_date,
            test_name,
            test_type,
            duration_minutes,
            status,
            raw_scores,
            scaled_scores,
            interpretation,
            recommendations,
            notes,
            price,
            payment_status
        } = req.body;

        // Validar campos requeridos
        if (!customer_id || !evaluator_id || !evaluation_date || !test_name) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos: customer_id, evaluator_id, evaluation_date, test_name'
            });
        }

        // Verificar que el cliente existe
        const customer = await Customer.findByPk(customer_id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        // Verificar que el evaluador existe
        const evaluator = await User.findByPk(evaluator_id);
        if (!evaluator) {
            return res.status(404).json({
                success: false,
                message: 'Evaluador no encontrado'
            });
        }

        // Si el usuario es cashier o supervisor, usar su sucursal
        let finalBranchId = branch_id;
        if (currentUser.role === 'cashier' || currentUser.role === 'supervisor') {
            finalBranchId = currentUser.branch_id;
        }

        // Crear la evaluación
        const newEvaluation = await PsychometricEvaluation.create({
            customer_id,
            evaluator_id,
            branch_id: finalBranchId,
            evaluation_date,
            test_name,
            test_type: test_type || 'personality',
            duration_minutes: duration_minutes || 60,
            status: status || 'scheduled',
            raw_scores,
            scaled_scores,
            interpretation,
            recommendations,
            notes,
            price,
            payment_status: payment_status || 'pending',
            is_active: true
        });

        // Obtener la evaluación con relaciones
        const evaluation = await PsychometricEvaluation.findByPk(newEvaluation.id, {
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
                },
                {
                    model: User,
                    as: 'evaluator',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                },
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'name', 'code']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Evaluación psicométrica creada exitosamente',
            data: evaluation
        });

    } catch (error) {
        console.error('Error al crear evaluación psicométrica:', error);
        
        // Manejar errores de validación
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: error.errors.map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al crear evaluación psicométrica',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Actualizar una evaluación psicométrica
const updatePsychometricEvaluation = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;

        const evaluation = await PsychometricEvaluation.findByPk(id);

        if (!evaluation) {
            return res.status(404).json({
                success: false,
                message: 'Evaluación psicométrica no encontrada'
            });
        }

        // Verificar acceso por sucursal
        if ((currentUser.role === 'cashier' || currentUser.role === 'supervisor') 
            && evaluation.branch_id !== currentUser.branch_id) {
            return res.status(403).json({
                success: false,
                message: 'No tiene acceso a evaluaciones de otras sucursales'
            });
        }

        // Actualizar la evaluación
        const updatableFields = [
            'evaluation_date',
            'test_name',
            'test_type',
            'duration_minutes',
            'status',
            'raw_scores',
            'scaled_scores',
            'interpretation',
            'recommendations',
            'notes',
            'price',
            'payment_status',
            'is_active'
        ];

        // Solo admin y owner pueden cambiar evaluador, cliente o sucursal
        if (currentUser.role === 'owner' || currentUser.role === 'admin') {
            updatableFields.push('evaluator_id', 'customer_id', 'branch_id');
        }

        const updateData = {};
        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        await evaluation.update(updateData);

        // Obtener la evaluación actualizada con relaciones
        const updatedEvaluation = await PsychometricEvaluation.findByPk(id, {
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
                },
                {
                    model: User,
                    as: 'evaluator',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                },
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'name', 'code']
                }
            ]
        });

        res.json({
            success: true,
            message: 'Evaluación psicométrica actualizada exitosamente',
            data: updatedEvaluation
        });

    } catch (error) {
        console.error('Error al actualizar evaluación psicométrica:', error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: error.errors.map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al actualizar evaluación psicométrica',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Eliminar una evaluación psicométrica (soft delete)
const deletePsychometricEvaluation = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;

        const evaluation = await PsychometricEvaluation.findByPk(id);

        if (!evaluation) {
            return res.status(404).json({
                success: false,
                message: 'Evaluación psicométrica no encontrada'
            });
        }

        // Solo admin y owner pueden eliminar evaluaciones
        if (currentUser.role !== 'owner' && currentUser.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tiene permisos para eliminar evaluaciones'
            });
        }

        // Soft delete
        await evaluation.update({ is_active: false });

        res.json({
            success: true,
            message: 'Evaluación psicométrica eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar evaluación psicométrica:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar evaluación psicométrica',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtener estadísticas de evaluaciones
const getPsychometricEvaluationStats = async (req, res) => {
    try {
        const currentUser = req.user;

        const whereClause = {};

        // Aplicar filtros por sucursal según el rol
        if (currentUser.role === 'cashier' || currentUser.role === 'supervisor') {
            whereClause.branch_id = currentUser.branch_id;
        } else if (req.query.branch_id) {
            whereClause.branch_id = req.query.branch_id;
        }

        // Contar evaluaciones por estado
        const statusCounts = await PsychometricEvaluation.findAll({
            where: whereClause,
            attributes: [
                'status',
                [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        // Contar evaluaciones por tipo
        const typeCounts = await PsychometricEvaluation.findAll({
            where: whereClause,
            attributes: [
                'test_type',
                [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
            ],
            group: ['test_type'],
            raw: true
        });

        // Calcular ingresos totales y pendientes
        const revenue = await PsychometricEvaluation.findAll({
            where: whereClause,
            attributes: [
                'payment_status',
                [db.Sequelize.fn('SUM', db.Sequelize.col('price')), 'total']
            ],
            group: ['payment_status'],
            raw: true
        });

        res.json({
            success: true,
            message: 'Estadísticas obtenidas exitosamente',
            data: {
                by_status: statusCounts,
                by_type: typeCounts,
                revenue
            }
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getAllPsychometricEvaluations,
    getPsychometricEvaluationById,
    createPsychometricEvaluation,
    updatePsychometricEvaluation,
    deletePsychometricEvaluation,
    getPsychometricEvaluationStats
};
