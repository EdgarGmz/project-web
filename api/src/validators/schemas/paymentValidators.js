const { body, param, query } = require('express-validator');

/**
 * Validación para registrar pago
 */
const createPaymentValidator = [
    body('sale_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de venta debe ser un número entero positivo'),
    
    body('purchase_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de compra debe ser un número entero positivo'),
    
    body('amount')
        .notEmpty()
        .withMessage('El monto es requerido')
        .isFloat({ min: 0.01 })
        .withMessage('El monto debe ser mayor a 0'),
    
    body('payment_method')
        .notEmpty()
        .withMessage('El método de pago es requerido')
        .isIn(['cash', 'card', 'transfer', 'credit', 'debit'])
        .withMessage('El método de pago debe ser cash, card, transfer, credit o debit'),
    
    body('payment_date')
        .optional()
        .isISO8601()
        .withMessage('La fecha de pago debe ser una fecha válida (ISO 8601)'),
    
    body('reference_number')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('El número de referencia no puede exceder 50 caracteres'),
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden exceder 500 caracteres')
];

/**
 * Validación para obtener pago por ID
 */
const getPaymentValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo')
];

/**
 * Validación para listar pagos (query params)
 */
const listPaymentsValidator = [
    query('sale_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de venta debe ser un número entero positivo'),
    
    query('purchase_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de compra debe ser un número entero positivo'),
    
    query('payment_method')
        .optional()
        .isIn(['cash', 'card', 'transfer', 'credit', 'debit'])
        .withMessage('El método de pago debe ser cash, card, transfer, credit o debit'),
    
    query('start_date')
        .optional()
        .isISO8601()
        .withMessage('La fecha de inicio debe ser una fecha válida (ISO 8601)'),
    
    query('end_date')
        .optional()
        .isISO8601()
        .withMessage('La fecha de fin debe ser una fecha válida (ISO 8601)'),
    
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
 * Validación para actualizar pago
 */
const updatePaymentValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),
    
    body('payment_status')
        .optional()
        .isIn(['pending', 'completed', 'failed', 'refunded'])
        .withMessage('El estado de pago debe ser pending, completed, failed o refunded'),
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden exceder 500 caracteres')
];

/**
 * Validación para eliminar pago
 */
const deletePaymentValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo')
];

module.exports = {
    createPaymentValidator,
    getPaymentValidator,
    listPaymentsValidator,
    updatePaymentValidator,
    deletePaymentValidator
};
