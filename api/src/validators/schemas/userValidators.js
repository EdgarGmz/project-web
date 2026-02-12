const { body, param, query } = require('express-validator');

/**
 * Validación para crear usuario
 */
const createUserValidator = [
    body('first_name')
        .trim()
        .notEmpty()
        .withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El nombre solo puede contener letras'),
    
    body('last_name')
        .trim()
        .notEmpty()
        .withMessage('El apellido es requerido')
        .isLength({ min: 2, max: 50 })
        .withMessage('El apellido debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El apellido solo puede contener letras'),
    
    body('email')
        .trim()
        .notEmpty()
        .withMessage('El email es requerido')
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('La contraseña es requerida')
        .isLength({ min: 8 })
        .withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
    
    body('role')
        .notEmpty()
        .withMessage('El rol es requerido')
        .isIn(['owner', 'admin', 'supervisor', 'cashier'])
        .withMessage('El rol debe ser owner, admin, supervisor o cashier'),
    
    body('employee_id')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('El ID de empleado no puede exceder 20 caracteres'),
    
    body('branch_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de sucursal debe ser un número entero positivo'),
    
    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active debe ser un valor booleano')
];

/**
 * Validación para actualizar usuario
 */
const updateUserValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),
    
    body('first_name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('El nombre no puede estar vacío')
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El nombre solo puede contener letras'),
    
    body('last_name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('El apellido no puede estar vacío')
        .isLength({ min: 2, max: 50 })
        .withMessage('El apellido debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El apellido solo puede contener letras'),
    
    body('email')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('El email no puede estar vacío')
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
    
    body('role')
        .optional()
        .isIn(['owner', 'admin', 'supervisor', 'cashier'])
        .withMessage('El rol debe ser owner, admin, supervisor o cashier'),
    
    body('employee_id')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('El ID de empleado no puede exceder 20 caracteres'),
    
    body('branch_id')
        .optional()
        .custom((value) => {
            if (value === null) return true; // Allow null
            if (Number.isInteger(value) && value > 0) return true;
            throw new Error('El ID de sucursal debe ser un número entero positivo o null');
        }),
    
    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active debe ser un valor booleano')
];

/**
 * Validación para eliminar usuario
 */
const deleteUserValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo')
];

/**
 * Validación para obtener usuario por ID
 */
const getUserValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo')
];

/**
 * Validación para listar usuarios (query params)
 */
const listUsersValidator = [
    query('role')
        .optional()
        .isIn(['owner', 'admin', 'supervisor', 'cashier'])
        .withMessage('El rol debe ser owner, admin, supervisor o cashier'),
    
    query('branch_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de sucursal debe ser un número entero positivo'),
    
    query('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active debe ser un valor booleano'),
    
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número entero positivo'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser un número entre 1 y 100')
];

/**
 * Validación para cambiar contraseña de usuario (por admin)
 */
const changeUserPasswordValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),
    
    body('new_password')
        .notEmpty()
        .withMessage('La nueva contraseña es requerida')
        .isLength({ min: 8 })
        .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número')
];

module.exports = {
    createUserValidator,
    updateUserValidator,
    deleteUserValidator,
    getUserValidator,
    listUsersValidator,
    changeUserPasswordValidator
};
