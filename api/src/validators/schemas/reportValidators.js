const { query } = require('express-validator');

/**
 * Validación para reportes de ventas
 */
const salesReportValidator = [
    query('start_date')
        .optional()
        .isISO8601()
        .withMessage('La fecha de inicio debe ser una fecha válida (ISO 8601)'),
    
    query('end_date')
        .optional()
        .isISO8601()
        .withMessage('La fecha de fin debe ser una fecha válida (ISO 8601)'),
    
    query('branch_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de sucursal debe ser un número entero positivo'),
    
    query('group_by')
        .optional()
        .isIn(['day', 'week', 'month', 'year'])
        .withMessage('group_by debe ser day, week, month o year')
];

/**
 * Validación para reportes de inventario
 */
const inventoryReportValidator = [
    query('branch_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de sucursal debe ser un número entero positivo'),
    
    query('category')
        .optional()
        .trim(),
    
    query('low_stock_only')
        .optional()
        .isBoolean()
        .withMessage('low_stock_only debe ser un valor booleano')
];

/**
 * Validación para reportes de productos más vendidos
 */
const topProductsReportValidator = [
    query('start_date')
        .optional()
        .isISO8601()
        .withMessage('La fecha de inicio debe ser una fecha válida (ISO 8601)'),
    
    query('end_date')
        .optional()
        .isISO8601()
        .withMessage('La fecha de fin debe ser una fecha válida (ISO 8601)'),
    
    query('branch_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de sucursal debe ser un número entero positivo'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser un número entre 1 y 100')
];

/**
 * Validación para reportes financieros
 */
const financialReportValidator = [
    query('start_date')
        .optional()
        .isISO8601()
        .withMessage('La fecha de inicio debe ser una fecha válida (ISO 8601)'),
    
    query('end_date')
        .optional()
        .isISO8601()
        .withMessage('La fecha de fin debe ser una fecha válida (ISO 8601)'),
    
    query('branch_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de sucursal debe ser un número entero positivo')
];

module.exports = {
    salesReportValidator,
    inventoryReportValidator,
    topProductsReportValidator,
    financialReportValidator
};
