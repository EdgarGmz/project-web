const { body } = require('express-validator');

/**
 * Validación para login
 */
const loginValidator = [
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
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
];

/**
 * Validación para registro de usuario
 */
const registerValidator = [
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
        .optional()
        .isIn(['owner', 'admin', 'supervisor', 'cashier'])
        .withMessage('El rol debe ser owner, admin, supervisor o cashier'),
    
    body('branch_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El ID de sucursal debe ser un número entero positivo')
];

/**
 * Validación para cambio de contraseña
 */
const changePasswordValidator = [
    body('current_password')
        .notEmpty()
        .withMessage('La contraseña actual es requerida'),
    
    body('new_password')
        .notEmpty()
        .withMessage('La nueva contraseña es requerida')
        .isLength({ min: 8 })
        .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número'),
    
    body('confirm_password')
        .notEmpty()
        .withMessage('La confirmación de contraseña es requerida')
        .custom((value, { req }) => {
            if (value !== req.body.new_password) {
                throw new Error('Las contraseñas no coinciden');
            }
            return true;
        })
];

/**
 * Validación para reseteo de contraseña (solicitud)
 */
const requestPasswordResetValidator = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('El email es requerido')
        .isEmail()
        .withMessage('Debe ser un email válido')
        .normalizeEmail()
];

/**
 * Validación para reseteo de contraseña (confirmación)
 */
const resetPasswordValidator = [
    body('token')
        .notEmpty()
        .withMessage('El token es requerido'),
    
    body('new_password')
        .notEmpty()
        .withMessage('La nueva contraseña es requerida')
        .isLength({ min: 8 })
        .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número'),
    
    body('confirm_password')
        .notEmpty()
        .withMessage('La confirmación de contraseña es requerida')
        .custom((value, { req }) => {
            if (value !== req.body.new_password) {
                throw new Error('Las contraseñas no coinciden');
            }
            return true;
        })
];

module.exports = {
    loginValidator,
    registerValidator,
    changePasswordValidator,
    requestPasswordResetValidator,
    resetPasswordValidator
};
