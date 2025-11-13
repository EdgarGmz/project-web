const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authenticate } = require('../../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Obtener todas las configuraciones
router.get('/', settingController.getAllSettings);

// Obtener configuraciones por categoría
router.get('/:category', settingController.getSettingsByCategory);

// Actualizar configuraciones por categoría
router.put('/:category', settingController.updateSettingsByCategory);

// Restablecer configuraciones a valores por defecto
router.post('/:category/reset', settingController.resetSettingsByCategory);

module.exports = router;
