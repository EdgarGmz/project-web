const db = require('../infrastructure/database/models')
const { Log } = db

/**
 * Servicio para crear y gestionar logs del sistema
 */

// Tipos de acciones estándar
const ACTIONS = {
    CREATE: 'CREATE',
    READ: 'READ',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    VIEW: 'VIEW',
    EXPORT: 'EXPORT',
    IMPORT: 'IMPORT',
    APPROVE: 'APPROVE',
    REJECT: 'REJECT',
    ERROR: 'ERROR'
}

// Servicios del sistema (todos en singular para consistencia)
const SERVICES = {
    AUTH: 'auth',
    USER: 'user',
    PRODUCT: 'product',
    CUSTOMER: 'customer',
    SALE: 'sale',
    INVENTORY: 'inventory',
    PURCHASE: 'purchase',
    RETURN: 'return',
    PAYMENT: 'payment',
    REPORT: 'report',
    BRANCH: 'branch',
    SETTINGS: 'settings'
}

/**
 * Crear un log en el sistema
 * @param {string} userId - ID del usuario que realiza la acción
 * @param {string} action - Tipo de acción (CREATE, UPDATE, DELETE, etc.)
 * @param {string} service - Servicio donde se realiza la acción
 * @param {string} message - Mensaje descriptivo de la acción
 * @returns {Promise<Object>} - Log creado
 */
const createLog = async (userId, action, service, message) => {
    try {
        if (!userId || !action || !service || !message) {
            console.error('LogService: Faltan parámetros requeridos')
            return null
        }

        const log = await Log.create({
            user_id: userId,
            action,
            service,
            message
        })

        return log
    } catch (error) {
        console.error('Error al crear log:', error.message)
        // No lanzar error para no interrumpir el flujo principal
        return null
    }
}

/**
 * Crear log de autenticación
 */
const logAuth = {
    login: async (userId, message) => {
        return createLog(userId, ACTIONS.LOGIN, SERVICES.AUTH, message)
    },
    logout: async (userId, message) => {
        return createLog(userId, ACTIONS.LOGOUT, SERVICES.AUTH, message)
    },
    create: async (userId, message) => {
        return createLog(userId, ACTIONS.CREATE, SERVICES.AUTH, message)
    },
    update: async (userId, message) => {
        return createLog(userId, ACTIONS.UPDATE, SERVICES.AUTH, message)
    },
    delete: async (userId, message) => {
        return createLog(userId, ACTIONS.DELETE, SERVICES.AUTH, message)
    },
    error: async (userId, message) => {
        return createLog(userId, ACTIONS.ERROR, SERVICES.AUTH, message)
    }
}

/**
 * Crear log de productos
 */
const logProduct = {
    create: async (userId, message) => {
        return createLog(userId, ACTIONS.CREATE, SERVICES.PRODUCT, message)
    },
    update: async (userId, message) => {
        return createLog(userId, ACTIONS.UPDATE, SERVICES.PRODUCT, message)
    },
    delete: async (userId, message) => {
        return createLog(userId, ACTIONS.DELETE, SERVICES.PRODUCT, message)
    },
    view: async (userId, message) => {
        return createLog(userId, ACTIONS.VIEW, SERVICES.PRODUCT, message)
    },
    import: async (userId, message) => {
        return createLog(userId, ACTIONS.IMPORT, SERVICES.PRODUCT, message)
    },
    export: async (userId, message) => {
        return createLog(userId, ACTIONS.EXPORT, SERVICES.PRODUCT, message)
    }
}

/**
 * Crear log de clientes
 */
const logCustomer = {
    create: async (userId, message) => {
        return createLog(userId, ACTIONS.CREATE, SERVICES.CUSTOMER, message)
    },
    update: async (userId, message) => {
        return createLog(userId, ACTIONS.UPDATE, SERVICES.CUSTOMER, message)
    },
    delete: async (userId, message) => {
        return createLog(userId, ACTIONS.DELETE, SERVICES.CUSTOMER, message)
    },
    view: async (userId, message) => {
        return createLog(userId, ACTIONS.VIEW, SERVICES.CUSTOMER, message)
    }
}

/**
 * Crear log de ventas
 */
const logSale = {
    create: async (userId, message) => {
        return createLog(userId, ACTIONS.CREATE, SERVICES.SALE, message)
    },
    update: async (userId, message) => {
        return createLog(userId, ACTIONS.UPDATE, SERVICES.SALE, message)
    },
    delete: async (userId, message) => {
        return createLog(userId, ACTIONS.DELETE, SERVICES.SALE, message)
    },
    view: async (userId, message) => {
        return createLog(userId, ACTIONS.VIEW, SERVICES.SALE, message)
    },
    approve: async (userId, message) => {
        return createLog(userId, ACTIONS.APPROVE, SERVICES.SALE, message)
    },
    reject: async (userId, message) => {
        return createLog(userId, ACTIONS.REJECT, SERVICES.SALE, message)
    }
}

/**
 * Crear log de inventario
 */
const logInventory = {
    create: async (userId, message) => {
        return createLog(userId, ACTIONS.CREATE, SERVICES.INVENTORY, message)
    },
    update: async (userId, message) => {
        return createLog(userId, ACTIONS.UPDATE, SERVICES.INVENTORY, message)
    },
    delete: async (userId, message) => {
        return createLog(userId, ACTIONS.DELETE, SERVICES.INVENTORY, message)
    },
    view: async (userId, message) => {
        return createLog(userId, ACTIONS.VIEW, SERVICES.INVENTORY, message)
    }
}

/**
 * Crear log de compras
 */
const logPurchase = {
    create: async (userId, message) => {
        return createLog(userId, ACTIONS.CREATE, SERVICES.PURCHASE, message)
    },
    update: async (userId, message) => {
        return createLog(userId, ACTIONS.UPDATE, SERVICES.PURCHASE, message)
    },
    delete: async (userId, message) => {
        return createLog(userId, ACTIONS.DELETE, SERVICES.PURCHASE, message)
    },
    view: async (userId, message) => {
        return createLog(userId, ACTIONS.VIEW, SERVICES.PURCHASE, message)
    },
    approve: async (userId, message) => {
        return createLog(userId, ACTIONS.APPROVE, SERVICES.PURCHASE, message)
    }
}

/**
 * Crear log de devoluciones
 */
const logReturn = {
    create: async (userId, message) => {
        return createLog(userId, ACTIONS.CREATE, SERVICES.RETURN, message)
    },
    update: async (userId, message) => {
        return createLog(userId, ACTIONS.UPDATE, SERVICES.RETURN, message)
    },
    delete: async (userId, message) => {
        return createLog(userId, ACTIONS.DELETE, SERVICES.RETURN, message)
    },
    approve: async (userId, message) => {
        return createLog(userId, ACTIONS.APPROVE, SERVICES.RETURN, message)
    }
}

/**
 * Crear log de pagos
 */
const logPayment = {
    create: async (userId, message) => {
        return createLog(userId, ACTIONS.CREATE, SERVICES.PAYMENT, message)
    },
    update: async (userId, message) => {
        return createLog(userId, ACTIONS.UPDATE, SERVICES.PAYMENT, message)
    },
    delete: async (userId, message) => {
        return createLog(userId, ACTIONS.DELETE, SERVICES.PAYMENT, message)
    },
    approve: async (userId, message) => {
        return createLog(userId, ACTIONS.APPROVE, SERVICES.PAYMENT, message)
    }
}

/**
 * Crear log de reportes
 */
const logReport = {
    create: async (userId, message) => {
        return createLog(userId, ACTIONS.CREATE, SERVICES.REPORT, message)
    },
    view: async (userId, message) => {
        return createLog(userId, ACTIONS.VIEW, SERVICES.REPORT, message)
    },
    export: async (userId, message) => {
        return createLog(userId, ACTIONS.EXPORT, SERVICES.REPORT, message)
    }
}

/**
 * Crear log de usuarios
 */
const logUser = {
    create: async (userId, message) => {
        return createLog(userId, ACTIONS.CREATE, SERVICES.USER, message)
    },
    update: async (userId, message) => {
        return createLog(userId, ACTIONS.UPDATE, SERVICES.USER, message)
    },
    delete: async (userId, message) => {
        return createLog(userId, ACTIONS.DELETE, SERVICES.USER, message)
    },
    view: async (userId, message) => {
        return createLog(userId, ACTIONS.VIEW, SERVICES.USER, message)
    }
}

/**
 * Crear log de sucursales
 */
const logBranch = {
    create: async (userId, message) => {
        return createLog(userId, ACTIONS.CREATE, SERVICES.BRANCH, message)
    },
    update: async (userId, message) => {
        return createLog(userId, ACTIONS.UPDATE, SERVICES.BRANCH, message)
    },
    delete: async (userId, message) => {
        return createLog(userId, ACTIONS.DELETE, SERVICES.BRANCH, message)
    },
    view: async (userId, message) => {
        return createLog(userId, ACTIONS.VIEW, SERVICES.BRANCH, message)
    }
}

/**
 * Crear log de configuración
 */
const logSettings = {
    update: async (userId, message) => {
        return createLog(userId, ACTIONS.UPDATE, SERVICES.SETTINGS, message)
    },
    view: async (userId, message) => {
        return createLog(userId, ACTIONS.VIEW, SERVICES.SETTINGS, message)
    }
}

module.exports = {
    createLog,
    logAuth,
    logProduct,
    logCustomer,
    logSale,
    logInventory,
    logPurchase,
    logReturn,
    logPayment,
    logReport,
    logUser,
    logBranch,
    logSettings,
    ACTIONS,
    SERVICES
}
