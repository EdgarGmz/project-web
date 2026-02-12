const { body, param, query } = require('express-validator');

/**
 * Validación para crear cliente
 */
const createCustomerValidator = [
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
        .optional()
        .trim()
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
    
    body('phone')
        .optional()
        .trim()
        .matches(/^[\d\s\-\+\(\)]+$/)
        .withMessage('El teléfono solo puede contener números, espacios y caracteres especiales básicos')
        .isLength({ max: 20 })
        .withMessage('El teléfono no puede exceder 20 caracteres'),
    
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
    
    body('tax_id')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('El RFC/NIT no puede exceder 20 caracteres'),
    
    body('customer_type')
        .optional()
        .isIn(['individual', 'business'])
        .withMessage('El tipo de cliente debe ser individual o business'),
    
    body('credit_limit')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El límite de crédito debe ser un número mayor o igual a 0'),
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden exceder 500 caracteres')
];

/**
 * Validación para actualizar cliente
 */
const updateCustomerValidator = [
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
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail(),
    
    body('phone')
        .optional()
        .trim()
        .matches(/^[\d\s\-\+\(\)]+$/)
        .withMessage('El teléfono solo puede contener números, espacios y caracteres especiales básicos')
        .isLength({ max: 20 })
        .withMessage('El teléfono no puede exceder 20 caracteres'),
    
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
    
    body('tax_id')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('El RFC/NIT no puede exceder 20 caracteres'),
    
    body('customer_type')
        .optional()
        .isIn(['individual', 'business'])
        .withMessage('El tipo de cliente debe ser individual o business'),
    
    body('credit_limit')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El límite de crédito debe ser un número mayor o igual a 0'),
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden exceder 500 caracteres')
];

/**
 * Validación para eliminar cliente
 */
const deleteCustomerValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo')
];

/**
 * Validación para obtener cliente por ID
 */
const getCustomerValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo')
];

/**
 * Validación para listar clientes (query params)
 */
const listCustomersValidator = [
    query('customer_type')
        .optional()
        .isIn(['individual', 'business'])
        .withMessage('El tipo de cliente debe ser individual o business'),
    
    query('search')
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
    createCustomerValidator,
    updateCustomerValidator,
    deleteCustomerValidator,
    getCustomerValidator,
    listCustomersValidator
};
