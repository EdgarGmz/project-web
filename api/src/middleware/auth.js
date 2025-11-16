const jwt = require('jsonwebtoken')
const { User, Branch } = require('../infrastructure/database/models')

// Middleware para verficar autenticacion
const authenticate = async (req, res, next) => {
    try {
        // Obtener el header
        const authHeader = req.header('Authorization')
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : null

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido',
                code: 'NO_TOKEN'
            })
        }

        // Verificar token
        let decoded
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expirado',
                    code: 'TOKEN_EXPIRED'
                })
            } else if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token invalido',
                    code: 'INVALID_TOKEN'
                })
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Error de autenticacion',
                    code: 'AUTH_ERROR'
                })
            }
        }

        // Buscar usuario
        const user = await User.findByPk(decoded.id, {
            include: [{
                model: Branch,
                as: 'branch',
                attributes: ['id', 'name', 'code', 'city']
            }],
            attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'employee_id', 'branch_id', 'is_active']
        })

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token invalido - Usuario no encontrado',
                code: 'INVALID_TOKEN'
            })
        }

        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Usuario desactivado',
                code: 'USER_INACTIVE'
            })
        }

        // Agregar usuario a la request
        req.user = user
        next()

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token invalido',
                code: 'INVALID_TOKEN'
            })
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado',
                code: 'TOKEN_EXPIRED'
            })
        }

        console.error('Error en autenticacion: ', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
    }
}

// Middleware para verificar los roles
const authorize = (...roles) => {
    return(req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado',
                code: 'NOT_AUTHENTICATED'
            })
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Acceso denegado. Requiere rol: ${roles.join(' o ')}`,
                code: 'INSUFFICIENT_PERMISSIONS',
                required_roles: roles,
                user_role: req.user.role
            })
        }
        next()
    }
}

// Middleware para verificar que el usuario pertenezca a la sucursal
const checkBranchAccess = (req, res, next) => {
    const { branch_id } = req.params || req.body || req.query

    // Si no se especifica sucursal, permitir
    if (!branch_id) {
        return next()
    }

    // Los owner y admins pueden acceder a cualquier sucursal
    if (req.user.role === 'owner' || req.user.role === 'admin') {
        return next()
    }

    // Verificar que el usuario pertenezca a la sucursal
    if (req.user.branch_id !== parseInt(branch_id)){
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado a esta sucursal',
            code: 'BRANCH_ACCESS_DENIED',
        })
    }
    next()
}

// Middleware opcional (no require token pero lo procesa si existe)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization')
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : null
        
        if (!token) {
            req.user = null
            return next()
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findByPk(decoded.id, {
            attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'employee_id', 'branch_id', 'is_active']
        })

        req.user = user && user.is_active ? user : null
        next()

    } catch (error) {
        req.user = null
        next()
    }
}

module.exports = {
    authenticate,
    authorize,
    checkBranchAccess,
    optionalAuth
}