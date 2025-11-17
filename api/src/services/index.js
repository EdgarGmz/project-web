// Servicios de negocio
const logService = require('./logService')

module.exports = {
    logService,
    // Funciones específicas del logService para fácil acceso
    logAuth: logService.logAuth,
    logProduct: logService.logProduct,
    logCustomer: logService.logCustomer,
    logSale: logService.logSale,
    logInventory: logService.logInventory,
    logPurchase: logService.logPurchase,
    logReturn: logService.logReturn,
    logPayment: logService.logPayment,
    logReport: logService.logReport,
    logUser: logService.logUser,
    logBranch: logService.logBranch,
    logSettings: logService.logSettings
}