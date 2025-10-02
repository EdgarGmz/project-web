const { Sequelize } = require('sequelize')

// CONFIGURACIÓN FLEXIBLE: SQLite para desarrollo, PostgreSQL para producción
const isDevelopment = process.env.NODE_ENV !== 'production'

let sequelize

if (isDevelopment && !process.env.USE_POSTGRES) {
    // SQLite para desarrollo rápido
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: './database.sqlite',
        logging: console.log,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    })
} else {
    // PostgreSQL para producción
    sequelize = new Sequelize({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        dialect: 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0, 
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            dateStrings: true,
            typeCast: true,
            timeZone: '+00:00'
        },
        timezone: '+00:00'
    })
}

// Función para probar la conexión
const testConnection = async () => {
    try {
        await sequelize.authenticate()
        const dbType = sequelize.getDialect()
        console.log(`✅ Conexión a ${dbType.toUpperCase()} establecida correctamente.`)
    } catch (error) {
        console.error('❌ No se pudo conectar a la base de datos: ', error.message)
    }
}

module.exports = {
    sequelize, 
    testConnection
}