const { Setting } = require('../database/models');

// Valores por defecto para cada categoría
const defaultSettings = {
    general: {
        company_name: '',
        company_address: '',
        company_phone: '',
        company_email: '',
        tax_id: '',
        currency: 'USD',
        timezone: 'America/Mexico_City',
        language: 'es'
    },
    pos: {
        auto_print_receipt: true,
        receipt_footer_text: '',
        default_payment_method: 'cash',
        allow_negative_stock: false,
        require_customer_info: false,
        barcode_scanner_enabled: true
    },
    inventory: {
        low_stock_alert: true,
        auto_reorder: false,
        reorder_point_days: 7,
        cost_calculation_method: 'average',
        track_expiration_dates: false
    },
    notifications: {
        email_notifications: true,
        low_stock_notifications: true,
        daily_sales_report: false,
        system_alerts: true,
        new_user_notifications: true
    },
    security: {
        session_timeout: 60,
        require_password_change: false,
        password_expiry_days: 90,
        two_factor_auth: false,
        login_attempts_limit: 5
    },
    backup: {
        auto_backup: false,
        backup_frequency: 'daily',
        backup_retention_days: 30,
        last_backup: null
    }
};

// Obtener todas las configuraciones
const getAllSettings = async (req, res) => {
    try {
        const settings = await Setting.findAll();
        
        // Organizar por categoría
        const organized = {};
        
        for (const category in defaultSettings) {
            organized[category] = { ...defaultSettings[category] };
            
            settings
                .filter(s => s.category === category)
                .forEach(setting => {
                    let value = setting.value;
                    
                    // Convertir según el tipo
                    if (setting.type === 'boolean') {
                        value = value === 'true';
                    } else if (setting.type === 'number') {
                        value = parseInt(value);
                    } else if (setting.type === 'json') {
                        try {
                            value = JSON.parse(value);
                        } catch (e) {
                            value = null;
                        }
                    }
                    
                    organized[category][setting.key] = value;
                });
        }
        
        res.status(200).json({
            success: true,
            message: 'Configuraciones obtenidas exitosamente',
            data: organized
        });
    } catch (error) {
        console.error('Error al obtener configuraciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener configuraciones de una categoría
const getSettingsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        
        if (!defaultSettings[category]) {
            return res.status(400).json({
                success: false,
                message: 'Categoría inválida'
            });
        }
        
        const settings = await Setting.findAll({ where: { category } });
        const result = { ...defaultSettings[category] };
        
        settings.forEach(setting => {
            let value = setting.value;
            
            if (setting.type === 'boolean') {
                value = value === 'true';
            } else if (setting.type === 'number') {
                value = parseInt(value);
            } else if (setting.type === 'json') {
                try {
                    value = JSON.parse(value);
                } catch (e) {
                    value = null;
                }
            }
            
            result[setting.key] = value;
        });
        
        res.status(200).json({
            success: true,
            message: 'Configuraciones obtenidas exitosamente',
            data: result
        });
    } catch (error) {
        console.error('Error al obtener configuraciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Actualizar configuraciones de una categoría
const updateSettingsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const settings = req.body;
        
        if (!defaultSettings[category]) {
            return res.status(400).json({
                success: false,
                message: 'Categoría inválida'
            });
        }
        
        // Actualizar o crear cada configuración
        for (const [key, value] of Object.entries(settings)) {
            const type = typeof value === 'boolean' ? 'boolean' :
                        typeof value === 'number' ? 'number' :
                        typeof value === 'object' ? 'json' : 'string';
            
            const stringValue = type === 'json' ? JSON.stringify(value) : String(value);
            
            await Setting.upsert({
                category,
                key,
                value: stringValue,
                type
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Configuraciones actualizadas exitosamente'
        });
    } catch (error) {
        console.error('Error al actualizar configuraciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Restablecer configuraciones a valores por defecto
const resetSettingsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        
        if (!defaultSettings[category]) {
            return res.status(400).json({
                success: false,
                message: 'Categoría inválida'
            });
        }
        
        // Eliminar todas las configuraciones de esta categoría
        await Setting.destroy({ where: { category } });
        
        res.status(200).json({
            success: true,
            message: 'Configuraciones restablecidas a valores por defecto'
        });
    } catch (error) {
        console.error('Error al restablecer configuraciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

module.exports = {
    getAllSettings,
    getSettingsByCategory,
    updateSettingsByCategory,
    resetSettingsByCategory
};
