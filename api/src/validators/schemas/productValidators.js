const { body, param, query } = require('express-validator');

/**
 * Validación para crear producto
 */
const createProductValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre del producto es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),
    
    body('sku')
        .trim()
        .notEmpty()
        .withMessage('El SKU es requerido')
        .isLength({ min: 1, max: 50 })
        .withMessage('El SKU debe tener entre 1 y 50 caracteres')
        .matches(/^[A-Z0-9-_]+$/)
        .withMessage('El SKU solo puede contener letras mayúsculas, números, guiones y guiones bajos'),
    
    body('barcode')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('El código de barras no puede exceder 50 caracteres'),
    
    body('unit_price')
        .notEmpty()
        .withMessage('El precio unitario es requerido')
        .isFloat({ min: 0.01 })
        .withMessage('El precio unitario debe ser un número mayor a 0'),
    
    body('cost_price')
        .notEmpty()
        .withMessage('El precio de costo es requerido')
        .isFloat({ min: 0 })
        .withMessage('El precio de costo debe ser un número mayor o igual a 0'),
    
    body('category')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('La categoría no puede exceder 50 caracteres'),
    
    body('brand')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('La marca no puede exceder 50 caracteres'),
    
    body('unit_of_measure')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('La unidad de medida no puede exceder 20 caracteres'),
    
    body('min_stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock mínimo debe ser un número entero mayor o igual a 0'),
    
    body('max_stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock máximo debe ser un número entero mayor o igual a 0')
        .custom((value, { req }) => {
            if (req.body.min_stock && value < req.body.min_stock) {
                throw new Error('El stock máximo debe ser mayor o igual al stock mínimo');
            }
            return true;
        }),
    
    body('reorder_point')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El punto de reorden debe ser un número entero mayor o igual a 0'),
    
    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active debe ser un valor booleano'),
    
    body('tax_rate')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('La tasa de impuesto debe estar entre 0 y 100'),
    
    body('branch_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de sucursal debe ser un número entero positivo'),
    
    body('initialStock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock inicial debe ser un número entero mayor o igual a 0')
];

/**
 * Validación para actualizar producto
 */
const updateProductValidator = [
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
    
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),
    
    body('sku')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('El SKU no puede estar vacío')
        .isLength({ min: 1, max: 50 })
        .withMessage('El SKU debe tener entre 1 y 50 caracteres')
        .matches(/^[A-Z0-9-_]+$/)
        .withMessage('El SKU solo puede contener letras mayúsculas, números, guiones y guiones bajos'),
    
    body('barcode')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('El código de barras no puede exceder 50 caracteres'),
    
    body('unit_price')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('El precio unitario debe ser un número mayor a 0'),
    
    body('cost_price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio de costo debe ser un número mayor o igual a 0'),
    
    body('category')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('La categoría no puede exceder 50 caracteres'),
    
    body('brand')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('La marca no puede exceder 50 caracteres'),
    
    body('unit_of_measure')
        .optional()
        .trim()
        .isLength({ max: 20 })
        .withMessage('La unidad de medida no puede exceder 20 caracteres'),
    
    body('min_stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock mínimo debe ser un número entero mayor o igual a 0'),
    
    body('max_stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock máximo debe ser un número entero mayor o igual a 0'),
    
    body('reorder_point')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El punto de reorden debe ser un número entero mayor o igual a 0'),
    
    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active debe ser un valor booleano'),
    
    body('tax_rate')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('La tasa de impuesto debe estar entre 0 y 100')
];

/**
 * Validación para eliminar producto
 */
const deleteProductValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo')
];

/**
 * Validación para obtener producto por ID
 */
const getProductValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo')
];

/**
 * Validación para listar productos (query params)
 */
const listProductsValidator = [
    query('category')
        .optional()
        .trim(),
    
    query('brand')
        .optional()
        .trim(),
    
    query('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active debe ser un valor booleano'),
    
    query('branch_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de sucursal debe ser un número entero positivo'),
    
    query('min_stock_alert')
        .optional()
        .isBoolean()
        .withMessage('min_stock_alert debe ser un valor booleano'),
    
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

/**
 * Validación para ajuste de stock
 */
const adjustStockValidator = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('El ID debe ser un número entero positivo'),
    
    body('quantity')
        .notEmpty()
        .withMessage('La cantidad es requerida')
        .isInt()
        .withMessage('La cantidad debe ser un número entero'),
    
    body('type')
        .notEmpty()
        .withMessage('El tipo de ajuste es requerido')
        .isIn(['add', 'subtract', 'set'])
        .withMessage('El tipo debe ser add, subtract o set'),
    
    body('reason')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('La razón no puede exceder 200 caracteres'),
    
    body('branch_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de sucursal debe ser un número entero positivo')
];

module.exports = {
    createProductValidator,
    updateProductValidator,
    deleteProductValidator,
    getProductValidator,
    listProductsValidator,
    adjustStockValidator
};
