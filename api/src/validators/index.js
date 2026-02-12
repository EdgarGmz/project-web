// Exportar todos los validadores desde un punto central
const authValidators = require('./schemas/authValidators');
const userValidators = require('./schemas/userValidators');
const productValidators = require('./schemas/productValidators');
const customerValidators = require('./schemas/customerValidators');
const saleValidators = require('./schemas/saleValidators');
const branchValidators = require('./schemas/branchValidators');
const purchaseValidators = require('./schemas/purchaseValidators');
const inventoryValidators = require('./schemas/inventoryValidators');
const paymentValidators = require('./schemas/paymentValidators');
const reportValidators = require('./schemas/reportValidators');
const { handleValidationErrors } = require('./validationMiddleware');

module.exports = {
    // Middleware para manejo de errores
    handleValidationErrors,
    
    // Auth validators
    ...authValidators,
    
    // User validators
    ...userValidators,
    
    // Product validators
    ...productValidators,
    
    // Customer validators
    ...customerValidators,
    
    // Sale validators
    ...saleValidators,
    
    // Branch validators
    ...branchValidators,
    
    // Purchase validators
    ...purchaseValidators,
    
    // Inventory validators
    ...inventoryValidators,
    
    // Payment validators
    ...paymentValidators,
    
    // Report validators
    ...reportValidators
};
