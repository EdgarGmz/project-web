const { body, param, query } = require('express-validator');

/**
 * Validación para crear compra
 */
const createPurchaseValidator = [
    body('supplier_name')
        .trim()
        .notEmpty()
        .withMessage('El nombre del proveedor es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre del proveedor debe tener entre 2 y 100 caracteres'),
    
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
    
    body('items.*.unit_cost')
        .notEmpty()
        .withMessage('El costo unitario es requerido')
        .isFloat({ min: 0 })
        .withMessage('El costo unitario debe ser un número mayor o igual a 0'),
    
    body('purchase_date')
        .optional()
        .isISO8601()
        .withMessage('La fecha de compra debe ser una fecha válida (ISO 8601)'),
    
    body('payment_method')
        .optional()
        .isIn(['cash', 'card', 'transfer', 'credit'])
        .withMessage('El método de pago debe ser cash, card, transfer o credit'),
    
    body('payment_status')
        .optional()
        .isIn(['pending', 'paid', 'partial'])
        .withMessage('El estado de pago debe ser pending, paid o partial'),
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden exceder 500 caracteres')
];

/**
 * Validación para actualizar compra
 */
const updatePurchaseValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),
    
    body('payment_status')
        .optional()
        .isIn(['pending', 'paid', 'partial'])
        .withMessage('El estado de pago debe ser pending, paid o partial'),
    
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden exceder 500 caracteres')
];

/**
 * Validación para obtener compra por ID
 */
const getPurchaseValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo')
];

/**
 * Validación para listar compras (query params)
 */
const listPurchasesValidator = [
    query('branch_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de sucursal debe ser un número entero positivo'),
    
    query('payment_status')
        .optional()
        .isIn(['pending', 'paid', 'partial'])
        .withMessage('El estado de pago debe ser pending, paid o partial'),
    
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

module.exports = {
    createPurchaseValidator,
    updatePurchaseValidator,
    getPurchaseValidator,
    listPurchasesValidator
};
