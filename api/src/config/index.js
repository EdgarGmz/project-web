require('dotenv').config()

const config = {
    // Configuracion del servidor
    server: {
        port: process.env.PORT || 3000,
        env: process.env.NODE_ENV || 'development'
    },

    // Configuracion de la base de datos
    database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        dialect: 'postgres'
    },

    // Configuracion de JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'tu-super-secreto-jwt-para-desarrollo',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },

    // Configuracion de CORS
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3001',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
}
module.exports = config