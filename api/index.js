// Cargar variables de entorno
require('dotenv').config()

const express = require('express')
const app = express()

// Cargar variables de entorno desde .env, o en su defecto usar el puerto 3000
port = process.env.DB_PORT || 3000


// Middleware para interpretar JSON
app.use(express.json())

// Endpoint de prueba
app.get('/', (req, res) => {
    res.send(`🚀 API is running on port ${port}`)
})

// Levantar el servidor
app.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`)
})