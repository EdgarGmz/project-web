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

// Servicios del sistema
const SERVICES = {
    AUTH: 'auth',
    USERS: 'users',
    PRODUCTS: 'products',
    CUSTOMERS: 'customers',
    SALES: 'sales',
    INVENTORY: 'inventory',
    PURCHASES: 'purchases',
    RETURNS: 'returns',
    PAYMENTS: 'payments',
    REPORTS: 'reports',
    BRANCHES: 'branches',
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
        return createLog(userId, ACTIONS.CREATE, SERVICES.PRODUCTS, message)
    },
    update: async (userId, message) => {
        return createLog(userId, ACTIONS.UPDATE, SERVICES.PRODUCTS, message)
    },
    delete: async (userId, message) => {
        return createLog(userId, ACTIONS.DELETE, SERVICES.PRODUCTS, message)
    },
    view: async (userId, message) => {
        return createLog(userId, ACTIONS.VIEW, SERVICES.PRODUCTS, message)
    },
    import: async (userId, message) => {
        return createLog(userId, ACTIONS.IMPORT, SERVICES.PRODUCTS, message)
    },
    export: async (userId, message) => {
        return createLog(userId, ACTIONS.EXPORT, SERVICES.PRODUCTS, message)
    }
}

/**
 * Crear log de clientes
 */
const logCustomer = {
    create: async (userId, message) => {
        return createLog(userId, ACTIONS.CREATE, SERVICES.CUSTOMERS, message)
    },
    update: async (userId, message) => {
        return createLog(userId, ACTIONS.UPDATE, SERVICES.CUSTOMERS, message)
    },
    delete: async (userId, message) => {
        return createLog(userId, ACTIONS.DELETE, SERVICES.CUSTOMERS, message)
    },
    view: async (userId, message) => {
        return createLog(userId, ACTIONS.VIEW, SERVICES.CUSTOMERS, message)
    }
}

/**
 * Crear log de ventas
 */
const logSale = {
    create: async (userId, message) => {
        return createLog(userId, ACTIONS.CREATE, SERVICES.SALES, message)
    },
    update: async (userId, message) => {
        return createLog(userId, ACTIONS.UPDATE, SERVICES.SALES, message)
    },
    delete: async (userId, message) => {
        return createLog(userId, ACTIONS.DELETE, SERVICES.SALES, message)
    },
    view: async (userId, message) => {
        return createLog(userId, ACTIONS.VIEW, SERVICES.SALES, message)
    },
    approve: async (userId, message) => {
        return createLog(userId, ACTIONS.APPROVE, SERVICES.SALES, message)
    },
    reject: async (userId, message) => {
        return createLog(userId, ACTIONS.REJECT, SERVICES.SALES, message)
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
        return createLog(userId, ACTIONS.CREATE, SERVICES.PURCHASES, message)
    },
    update: async (userId, message) => {
        return createLog(userId, ACTIONS.UPDATE, SERVICES.PURCHASES, message)
    },
    delete: async (userId, message) => {
        return createLog(userId, ACTIONS.DELETE, SERVICES.PURCHASES, message)
    },
    approve: async (userId, message) => {
        return createLog(userId, ACTIONS.APPROVE, SERVICES.PURCHASES, message)
    }
}

/**
 * Crear log de devoluciones
 */
const logReturn = {
    create: async (userId, message) => {
        return createLog(userId, ACTIONS.CREATE, SERVICES.RETURNS, message)
    },
    update: async (userId, message) => {
        return createLog(userId, ACTIONS.UPDATE, SERVICES.RETURNS, message)
    },
    delete: async (userId, message) => {
        return createLog(userId, ACTIONS.DELETE, SERVICES.RETURNS, message)
    },
    approve: async (userId, message) => {
        return createLog(userId, ACTIONS.APPROVE, SERVICES.RETURNS, message)
    }
}

/**
 * Crear log de pagos
 */
const logPayment = {
    create: async (userId, message) => {
        return createLog(userId, ACTIONS.CREATE, SERVICES.PAYMENTS, message)
    },
    update: async (userId, message) => {
        return createLog(userId, ACTIONS.UPDATE, SERVICES.PAYMENTS, message)
    },
    delete: async (userId, message) => {
        return createLog(userId, ACTIONS.DELETE, SERVICES.PAYMENTS, message)
    },
    approve: async (userId, message) => {
        return createLog(userId, ACTIONS.APPROVE, SERVICES.PAYMENTS, message)
    }
}

/**
 * Crear log de reportes
 */
const logReport = {
    create: async (userId, message) => {
        return createLog(userId, ACTIONS.CREATE, SERVICES.REPORTS, message)
    },
    view: async (userId, message) => {
        return createLog(userId, ACTIONS.VIEW, SERVICES.REPORTS, message)
    },
    export: async (userId, message) => {
        return createLog(userId, ACTIONS.EXPORT, SERVICES.REPORTS, message)
    }
}

/**
 * Crear log de usuarios
 */
const logUser = {
    create: async (userId, message) => {
        return createLog(userId, ACTIONS.CREATE, SERVICES.USERS, message)
    },
    update: async (userId, message) => {
        return createLog(userId, ACTIONS.UPDATE, SERVICES.USERS, message)
    },
    delete: async (userId, message) => {
        return createLog(userId, ACTIONS.DELETE, SERVICES.USERS, message)
    },
    view: async (userId, message) => {
        return createLog(userId, ACTIONS.VIEW, SERVICES.USERS, message)
    }
}

/**
 * Crear log de sucursales
 */
const logBranch = {
    create: async (userId, message) => {
        return createLog(userId, ACTIONS.CREATE, SERVICES.BRANCHES, message)
    },
    update: async (userId, message) => {
        return createLog(userId, ACTIONS.UPDATE, SERVICES.BRANCHES, message)
    },
    delete: async (userId, message) => {
        return createLog(userId, ACTIONS.DELETE, SERVICES.BRANCHES, message)
    },
    view: async (userId, message) => {
        return createLog(userId, ACTIONS.VIEW, SERVICES.BRANCHES, message)
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
