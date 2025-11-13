const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener estadísticas generales
router.get('/stats', dashboardController.getStats);

// Obtener ventas recientes
router.get('/recent-sales', dashboardController.getRecentSales);

// Obtener productos más vendidos
router.get('/top-products', dashboardController.getTopProducts);

// Obtener productos con stock bajo
router.get('/low-stock', dashboardController.getLowStockProducts);

module.exports = router;
