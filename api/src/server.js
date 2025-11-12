const app = require('./app')
const { testConnection } = require('./config/database')

const PORT = process.env.PORT || 3000

// Iniciar servicio
const startServer = async () => {
    try {
        // Probar conexion de la base de datos
        await testConnection()

        // Iniciar servidor
        const server = app.listen(PORT, () => {
            console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`)
            console.log(`📱 Health check: http://localhost:${PORT}/health`)
            console.log(`🔗 API base: http://localhost:${PORT}/api`)
            console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`)
            console.log(`📝 Swagger: http://localhost:${PORT}/api-docs`)
        })

        // Mantener el servidor vivo
        server.on('error', (error) => {
            console.error('❌ Error en el servidor:', error)
        })

    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error)
        process.exit(1)
    }
}

startServer()