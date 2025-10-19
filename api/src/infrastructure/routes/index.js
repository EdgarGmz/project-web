const express = require('express')
const router = express.Router()

// Importar rutas específicas
const productRoutes = require('./productsRoute')
const userRoutes = require('./usersRoute')
const branchRoutes = require('./branchesRoute')
const customerRoutes = require('./customersRoute')
const saleRoutes = require('./salesRoute')
const inventoryRoutes = require('./inventoryRoute')
const authRoutes = require('./auth')
const returnRoutes = require('./returnsRoute')
const paymentRoutes = require('./paymentRoute')

// Rutas de la API
router.get('/', (req, res) => {
    res.json({
        message: 'API del Sistema de Gestión de Inventario y Ventas',
        version: '1.0.0',
        endpoints: {
            products: '/api/products',
            users: '/api/users',
            branches: '/api/branches',
            customers: '/api/customers',
            sales: '/api/sales',
            inventory: '/api/inventory',
            auth: '/api/auth',
            returns: '/api/returns',
            payments: '/api/payment'
        }
    })
})

// Usar las rutas específicas
router.use('/products', productRoutes)
router.use('/users', userRoutes)
router.use('/branches', branchRoutes)
router.use('/customers', customerRoutes)
router.use('/sales', saleRoutes)
router.use('/inventory', inventoryRoutes)
router.use('/auth', authRoutes)
router.use('/returns', returnRoutes)
router.use('/payment', paymentRoutes)

module.exports = router
