const express = require('express')
const router = express.Router()

// Importar rutas especificas
const productRoutes = require('./products')
const userRoutes = require('./users')
const branchRoutes = require('./branches')
const customerRoutes = require('./customers')
const saleRoutes = require('./sales')
const inventoryRoutes = require('./inventory')
const authRoutes = require('./auth')

// Rutas de la API
router.get('/', (req, res) => {
    res.json({
        message: 'API del Sistema de Gestion de Inventario y Ventas',
        version: '1.0.0',
        endpoints: {
            products: '/api/products',
            users: '/api/users',
            branches: '/api/branches',
            customers: '/api/customers',
            sales: '/api/sales',
            inventory: '/api/inventory',
            auth: '/api/auth'
        }
    })
})

// Usar las rutas especificas
router.use('/products', productRoutes)
router.use('/users', userRoutes)
router.use('/branches', branchRoutes)
router.use('/customers', customerRoutes)
router.use('/sales', saleRoutes)
router.use('/inventory', inventoryRoutes)
router.use('/auth', authRoutes)

module.exports = router
