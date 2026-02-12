const { body, param, query } = require('express-validator');

/**
 * Validación para crear sucursal
 */
const createBranchValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre de la sucursal es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    
    body('code')
        .trim()
        .notEmpty()
        .withMessage('El código de la sucursal es requerido')
        .isLength({ min: 2, max: 20 })
        .withMessage('El código debe tener entre 2 y 20 caracteres')
        .matches(/^[A-Z0-9-_]+$/)
        .withMessage('El código solo puede contener letras mayúsculas, números, guiones y guiones bajos'),
    
    body('address')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('La dirección no puede exceder 200 caracteres'),
    
    body('city')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('La ciudad no puede exceder 50 caracteres'),
    
    body('state')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('El estado no puede exceder 50 caracteres'),
    
    body('postal_code')
        .optional()
        .trim()
        .isLength({ max: 10 })
        .withMessage('El código postal no puede exceder 10 caracteres'),
    
    body('phone')
        .optional()
        .trim()
        .matches(/^[\d\s\-\+\(\)]+$/)
        .withMessage('El teléfono solo puede contener números y caracteres especiales básicos')
        .isLength({ max: 20 })
        .withMessage('El teléfono no puede exceder 20 caracteres'),
    
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
    
    body('manager_name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('El nombre del gerente no puede exceder 100 caracteres'),
    
    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active debe ser un valor booleano')
];

/**
 * Validación para actualizar sucursal
 */
const updateBranchValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),
    
    body('name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('El nombre no puede estar vacío')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    
    body('code')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('El código no puede estar vacío')
        .isLength({ min: 2, max: 20 })
        .withMessage('El código debe tener entre 2 y 20 caracteres')
        .matches(/^[A-Z0-9-_]+$/)
        .withMessage('El código solo puede contener letras mayúsculas, números, guiones y guiones bajos'),
    
    body('address')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('La dirección no puede exceder 200 caracteres'),
    
    body('city')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('La ciudad no puede exceder 50 caracteres'),
    
    body('state')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('El estado no puede exceder 50 caracteres'),
    
    body('postal_code')
        .optional()
        .trim()
        .isLength({ max: 10 })
        .withMessage('El código postal no puede exceder 10 caracteres'),
    
    body('phone')
        .optional()
        .trim()
        .matches(/^[\d\s\-\+\(\)]+$/)
        .withMessage('El teléfono solo puede contener números y caracteres especiales básicos')
        .isLength({ max: 20 })
        .withMessage('El teléfono no puede exceder 20 caracteres'),
    
    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
    
    body('manager_name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('El nombre del gerente no puede exceder 100 caracteres'),
    
    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active debe ser un valor booleano')
];

/**
 * Validación para eliminar sucursal
 */
const deleteBranchValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo')
];

/**
 * Validación para obtener sucursal por ID
 */
const getBranchValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo')
];

/**
 * Validación para listar sucursales (query params)
 */
const listBranchesValidator = [
    query('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active debe ser un valor booleano'),
    
    query('city')
        .optional()
        .trim(),
    
    query('state')
        .optional()
        .trim(),
    
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número entero positivo'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser un número entre 1 y 100')
];

module.exports = {
    createBranchValidator,
    updateBranchValidator,
    deleteBranchValidator,
    getBranchValidator,
    listBranchesValidator
};
