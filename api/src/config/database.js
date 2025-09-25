const { Sequelize } = require('sequelize')

// Configuracion de la base de datos usando variables de entorno
const sequelize = new Sequelize({
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

// Funcion para probar la conexion
const testConnection = async () => {
    try {
        await sequelize.authenticate()
        console.log('✅Conexion a PostgreSQL establecida correctamente.')
    } catch (error) {
        console.error(' No se pudo conectar a la base de datos: ', error.message)
    }
}

module.exports = {
    sequelize, 
    testConnection
}