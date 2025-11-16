const express = require('express')
const router = express.Router()
const reportController = require('../controllers/reportController')
const { authenticate, authorize } = require('../../middleware/auth')

// Aplicar autenticación a todas las rutas
router.use(authenticate)

// Rutas de reportes - Owner y Admin tienen acceso completo
router.get('/', authorize('owner', 'admin'), reportController.getAllReports)
router.get('/:id', authorize('owner', 'admin'), reportController.getReportById)
router.post('/', authorize('owner', 'admin'), reportController.createReport)
router.put('/:id', authorize('owner', 'admin'), reportController.updateReport)
router.delete('/:id', authorize('owner', 'admin'), reportController.deleteReport)

module.exports = router
