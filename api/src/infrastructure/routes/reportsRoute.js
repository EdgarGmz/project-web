const express = require('express')
const router = express.Router()
const reportController = require('../controllers/reportController')
const { authenticate } = require('../../middleware/auth')

// Aplicar autenticación a todas las rutas
router.use(authenticate)

// Rutas de reportes
router.get('/', reportController.getAllReports)
router.get('/:id', reportController.getReportById)
router.post('/', reportController.createReport)
router.put('/:id', reportController.updateReport)
router.delete('/:id', reportController.deleteReport)

module.exports = router
