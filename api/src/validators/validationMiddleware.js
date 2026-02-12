const { validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación
 * Extrae los errores de validación de express-validator y los formatea
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
            field: error.path || error.param,
            message: error.msg,
            value: error.value
        }));

        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: formattedErrors
        });
    }
    
    next();
};

module.exports = {
    handleValidationErrors
};
