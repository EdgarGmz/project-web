const { body, param, query } = require('express-validator');

/**
 * Validación para crear venta
 */
const createSaleValidator = [
    body('customer_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID del cliente debe ser un número entero positivo'),
    
    body('branch_id')
        .notEmpty()
        .withMessage('El ID de sucursal es requerido')
        .isInt({ min: 1 })
        .withMessage('El ID de sucursal debe ser un número entero positivo'),
    
    body('items')
        .isArray({ min: 1 })
        .withMessage('Debe incluir al menos un producto'),
    
    body('items.*.product_id')
        .notEmpty()
        .withMessage('El ID del producto es requerido')
        .isInt({ min: 1 })
        .withMessage('El ID del producto debe ser un número entero positivo'),
    
    body('items.*.quantity')
        .notEmpty()
        .withMessage('La cantidad es requerida')
        .isInt({ min: 1 })
        .withMessage('La cantidad debe ser un número entero positivo'),
    
    body('items.*.unit_price')
        .notEmpty()
        .withMessage('El precio unitario es requerido')
        .isFloat({ min: 0 })
        .withMessage('El precio unitario debe ser un número mayor o igual a 0'),
    
    body('items.*.discount')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('El descuento debe estar entre 0 y 100'),
    
    body('payment_method')
        .notEmpty()
        .withMessage('El método de pago es requerido')
        .isIn(['cash', 'card', 'transfer', 'credit'])
        .withMessage('El método de pago debe ser cash, card, transfer o credit'),
    
    body('payment_status')
        .optional()
        .isIn(['pending', 'paid', 'partial', 'cancelled'])
        .withMessage('El estado de pago debe ser pending, paid, partial o cancelled'),
    
    body('discount_percentage')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('El porcentaje de descuento debe estar entre 0 y 100'),
    
    body('discount_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El monto de descuento debe ser mayor o igual a 0'),
    
    body('tax_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El monto de impuesto debe ser mayor o igual a 0'),
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden exceder 500 caracteres')
];

/**
 * Validación para actualizar venta
 */
const updateSaleValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),
    
    body('payment_method')
        .optional()
        .isIn(['cash', 'card', 'transfer', 'credit'])
        .withMessage('El método de pago debe ser cash, card, transfer o credit'),
    
    body('payment_status')
        .optional()
        .isIn(['pending', 'paid', 'partial', 'cancelled'])
        .withMessage('El estado de pago debe ser pending, paid, partial o cancelled'),
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden exceder 500 caracteres')
];

/**
 * Validación para cancelar venta
 */
const cancelSaleValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),
    
    body('reason')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('La razón no puede exceder 200 caracteres')
];

/**
 * Validación para obtener venta por ID
 */
const getSaleValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo')
];

/**
 * Validación para listar ventas (query params)
 */
const listSalesValidator = [
    query('branch_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de sucursal debe ser un número entero positivo'),
    
    query('customer_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID del cliente debe ser un número entero positivo'),
    
    query('payment_method')
        .optional()
        .isIn(['cash', 'card', 'transfer', 'credit'])
        .withMessage('El método de pago debe ser cash, card, transfer o credit'),
    
    query('payment_status')
        .optional()
        .isIn(['pending', 'paid', 'partial', 'cancelled'])
        .withMessage('El estado de pago debe ser pending, paid, partial o cancelled'),
    
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
 * Validación para agregar pago a venta
 */
const addPaymentValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),
    
    body('amount')
        .notEmpty()
        .withMessage('El monto es requerido')
        .isFloat({ min: 0.01 })
        .withMessage('El monto debe ser mayor a 0'),
    
    body('payment_method')
        .notEmpty()
        .withMessage('El método de pago es requerido')
        .isIn(['cash', 'card', 'transfer', 'credit'])
        .withMessage('El método de pago debe ser cash, card, transfer o credit'),
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Las notas no pueden exceder 200 caracteres')
];

module.exports = {
    createSaleValidator,
    updateSaleValidator,
    cancelSaleValidator,
    getSaleValidator,
    listSalesValidator,
    addPaymentValidator
};
