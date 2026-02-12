const { param, query } = require('express-validator');

/**
 * Validación para obtener inventario por ID de producto
 */
const getInventoryValidator = [
    param('product_id')
        .isInt({ min: 1 })
        .withMessage('El ID del producto debe ser un número entero positivo')
];

/**
 * Validación para listar inventario (query params)
 */
const listInventoryValidator = [
    query('branch_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de sucursal debe ser un número entero positivo'),
    
    query('product_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID del producto debe ser un número entero positivo'),
    
    query('low_stock')
        .optional()
        .isBoolean()
        .withMessage('low_stock debe ser un valor booleano'),
    
    query('out_of_stock')
        .optional()
        .isBoolean()
        .withMessage('out_of_stock debe ser un valor booleano'),
    
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
 * Validación para historial de movimientos de inventario
 */
const inventoryHistoryValidator = [
    query('product_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID del producto debe ser un número entero positivo'),
    
    query('branch_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de sucursal debe ser un número entero positivo'),
    
    query('movement_type')
        .optional()
        .isIn(['in', 'out', 'adjustment', 'transfer'])
        .withMessage('El tipo de movimiento debe ser in, out, adjustment o transfer'),
    
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
    getInventoryValidator,
    listInventoryValidator,
    inventoryHistoryValidator
};
