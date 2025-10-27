const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

// Swagger
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')

// Importar rutas
const routes = require('./infrastructure/routes')

// Crear aplicacion Express
const app = express()

// ===========================================
// SWAGGER DOCUMENTATION
// ===========================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Docs - Sistema de Inventario',
    docExpansion: 'list'
}))

// ===========================================
// MIDDLEWARE DE SEGURIDAD
// ===========================================

app.use(helmet())

// CORS
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}))

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // maximo 100 requests por ventana de tiempo
    message: 'Demasiadas solicitudes desde esta IP'
})
app.use('/api/', limiter)

// ===========================================
// MIDDLEWARE DE APLICACIÓN
// ===========================================

// Morgan para logging
app.use(morgan('combined'))

// Parse JSON
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ===========================================
// RUTAS
// ===========================================

// Ruta de health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    })
})

// Rutas de la API
app.use('/api', routes)

// Ruta 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint no encontrado',
        path: req.originalUrl,
        method: req.method
    })
})

// ===========================================
// MANEJO DE ERRORES
// ===========================================

app.use((error, req, res, next) => {
    console.error('Error:', error)
    
    res.status(error.status || 500).json({
        error: error.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    })
})

module.exports = app