const db = require('../database/models');
const { TherapySession, Customer, User, Branch } = db;

// Obtener todas las sesiones terapéuticas
const getAllTherapySessions = async (req, res) => {
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

        // Filtrar por tipo de sesión si se proporciona
        if (req.query.session_type) {
            whereClause.session_type = req.query.session_type;
        }

        // Filtrar por cliente si se proporciona
        if (req.query.customer_id) {
            whereClause.customer_id = req.query.customer_id;
        }

        // Filtrar por terapeuta si se proporciona
        if (req.query.therapist_id) {
            whereClause.therapist_id = req.query.therapist_id;
        }

        // Filtrar por rango de fechas
        if (req.query.start_date || req.query.end_date) {
            whereClause.session_date = {};
            if (req.query.start_date) {
                whereClause.session_date[db.Sequelize.Op.gte] = new Date(req.query.start_date);
            }
            if (req.query.end_date) {
                whereClause.session_date[db.Sequelize.Op.lte] = new Date(req.query.end_date);
            }
        }

        // Aplicar filtros por sucursal según el rol
        if (currentUser.role === 'cashier' || currentUser.role === 'supervisor') {
            whereClause.branch_id = currentUser.branch_id;
        } else if (req.query.branch_id) {
            whereClause.branch_id = req.query.branch_id;
        }

        const { count, rows } = await TherapySession.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['session_date', 'DESC']],
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
                },
                {
                    model: User,
                    as: 'therapist',
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
            message: 'Sesiones terapéuticas obtenidas exitosamente',
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('Error al obtener sesiones terapéuticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener sesiones terapéuticas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtener una sesión terapéutica por ID
const getTherapySessionById = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;

        const session = await TherapySession.findByPk(id, {
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'address']
                },
                {
                    model: User,
                    as: 'therapist',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'role']
                },
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'name', 'code', 'city']
                }
            ]
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Sesión terapéutica no encontrada'
            });
        }

        // Verificar acceso por sucursal
        if ((currentUser.role === 'cashier' || currentUser.role === 'supervisor') 
            && session.branch_id !== currentUser.branch_id) {
            return res.status(403).json({
                success: false,
                message: 'No tiene acceso a sesiones de otras sucursales'
            });
        }

        res.json({
            success: true,
            message: 'Sesión terapéutica obtenida exitosamente',
            data: session
        });

    } catch (error) {
        console.error('Error al obtener sesión terapéutica:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener sesión terapéutica',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Crear una nueva sesión terapéutica
const createTherapySession = async (req, res) => {
    try {
        const currentUser = req.user;
        const {
            customer_id,
            therapist_id,
            branch_id,
            session_date,
            duration_minutes,
            session_type,
            status,
            notes,
            diagnosis,
            treatment_plan,
            price,
            payment_status
        } = req.body;

        // Validar campos requeridos
        if (!customer_id || !therapist_id || !session_date) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos requeridos: customer_id, therapist_id, session_date'
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

        // Verificar que el terapeuta existe
        const therapist = await User.findByPk(therapist_id);
        if (!therapist) {
            return res.status(404).json({
                success: false,
                message: 'Terapeuta no encontrado'
            });
        }

        // Si el usuario es cashier o supervisor, usar su sucursal
        let finalBranchId = branch_id;
        if (currentUser.role === 'cashier' || currentUser.role === 'supervisor') {
            finalBranchId = currentUser.branch_id;
        }

        // Crear la sesión
        const newSession = await TherapySession.create({
            customer_id,
            therapist_id,
            branch_id: finalBranchId,
            session_date,
            duration_minutes: duration_minutes || 60,
            session_type: session_type || 'individual',
            status: status || 'scheduled',
            notes,
            diagnosis,
            treatment_plan,
            price,
            payment_status: payment_status || 'pending',
            is_active: true
        });

        // Obtener la sesión con relaciones
        const session = await TherapySession.findByPk(newSession.id, {
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
                },
                {
                    model: User,
                    as: 'therapist',
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
            message: 'Sesión terapéutica creada exitosamente',
            data: session
        });

    } catch (error) {
        console.error('Error al crear sesión terapéutica:', error);
        
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
            message: 'Error al crear sesión terapéutica',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Actualizar una sesión terapéutica
const updateTherapySession = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;

        const session = await TherapySession.findByPk(id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Sesión terapéutica no encontrada'
            });
        }

        // Verificar acceso por sucursal
        if ((currentUser.role === 'cashier' || currentUser.role === 'supervisor') 
            && session.branch_id !== currentUser.branch_id) {
            return res.status(403).json({
                success: false,
                message: 'No tiene acceso a sesiones de otras sucursales'
            });
        }

        // Actualizar la sesión
        const updatableFields = [
            'session_date',
            'duration_minutes',
            'session_type',
            'status',
            'notes',
            'diagnosis',
            'treatment_plan',
            'price',
            'payment_status',
            'is_active'
        ];

        // Solo admin y owner pueden cambiar terapeuta, cliente o sucursal
        if (currentUser.role === 'owner' || currentUser.role === 'admin') {
            updatableFields.push('therapist_id', 'customer_id', 'branch_id');
        }

        const updateData = {};
        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        await session.update(updateData);

        // Obtener la sesión actualizada con relaciones
        const updatedSession = await TherapySession.findByPk(id, {
            include: [
                {
                    model: Customer,
                    as: 'customer',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'phone']
                },
                {
                    model: User,
                    as: 'therapist',
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
            message: 'Sesión terapéutica actualizada exitosamente',
            data: updatedSession
        });

    } catch (error) {
        console.error('Error al actualizar sesión terapéutica:', error);

        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: error.errors.map(e => e.message)
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al actualizar sesión terapéutica',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Eliminar una sesión terapéutica (soft delete)
const deleteTherapySession = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUser = req.user;

        const session = await TherapySession.findByPk(id);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Sesión terapéutica no encontrada'
            });
        }

        // Solo admin y owner pueden eliminar sesiones
        if (currentUser.role !== 'owner' && currentUser.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tiene permisos para eliminar sesiones'
            });
        }

        // Soft delete
        await session.update({ is_active: false });

        res.json({
            success: true,
            message: 'Sesión terapéutica eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar sesión terapéutica:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar sesión terapéutica',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtener estadísticas de sesiones
const getTherapySessionStats = async (req, res) => {
    try {
        const currentUser = req.user;

        const whereClause = {};

        // Aplicar filtros por sucursal según el rol
        if (currentUser.role === 'cashier' || currentUser.role === 'supervisor') {
            whereClause.branch_id = currentUser.branch_id;
        } else if (req.query.branch_id) {
            whereClause.branch_id = req.query.branch_id;
        }

        // Contar sesiones por estado
        const statusCounts = await TherapySession.findAll({
            where: whereClause,
            attributes: [
                'status',
                [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        // Contar sesiones por tipo
        const typeCounts = await TherapySession.findAll({
            where: whereClause,
            attributes: [
                'session_type',
                [db.Sequelize.fn('COUNT', db.Sequelize.col('id')), 'count']
            ],
            group: ['session_type'],
            raw: true
        });

        // Calcular ingresos totales y pendientes
        const revenue = await TherapySession.findAll({
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
    getAllTherapySessions,
    getTherapySessionById,
    createTherapySession,
    updateTherapySession,
    deleteTherapySession,
    getTherapySessionStats
};
