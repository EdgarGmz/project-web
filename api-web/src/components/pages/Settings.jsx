import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function Settings() {
  const { user, hasPermission } = useAuth()
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
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
  })

  const tabs = [
    { id: 'general', label: 'General', icon: '🏢', permission: ['owner', 'admin'] },
    { id: 'pos', label: 'Punto de Venta', icon: '🛒', permission: ['owner', 'admin', 'supervisor'] },
    { id: 'inventory', label: 'Inventario', icon: '📦', permission: ['owner', 'admin', 'supervisor'] },
    { id: 'notifications', label: 'Notificaciones', icon: '🔔', permission: ['owner', 'admin'] },
    { id: 'security', label: 'Seguridad', icon: '🔒', permission: ['owner'] },
    { id: 'backup', label: 'Respaldos', icon: '💾', permission: ['owner'] }
  ]

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/settings', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await response.json()
      if (data.success) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...data.data
        }))
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const saveSettings = async (section) => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3000/api/settings/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settings[section])
      })
      
      if (response.ok) {
        alert('Configuración guardada exitosamente')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error al guardar la configuración')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const performBackup = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:3000/api/backup', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `backup_${new Date().toISOString().split('T')[0]}.sql`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        updateSetting('backup', 'last_backup', new Date().toISOString())
        alert('Respaldo creado exitosamente')
      }
    } catch (error) {
      console.error('Error creating backup:', error)
      alert('Error al crear el respaldo')
    } finally {
      setLoading(false)
    }
  }

  const resetToDefaults = async (section) => {
    if (confirm('¿Estás seguro de restaurar la configuración por defecto? Esta acción no se puede deshacer.')) {
      try {
        const response = await fetch(`http://localhost:3000/api/settings/${section}/reset`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        
        if (response.ok) {
          fetchSettings()
          alert('Configuración restaurada a valores por defecto')
        }
      } catch (error) {
        console.error('Error resetting settings:', error)
        alert('Error al restaurar la configuración')
      }
    }
  }

  const availableTabs = tabs.filter(tab => hasPermission(tab.permission))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="text-muted">Personaliza el comportamiento del sistema</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-surface/50 p-1 rounded-lg">
        {availableTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
              activeTab === tab.id 
                ? 'bg-accent text-black' 
                : 'text-muted hover:text-text'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Configuración General</h3>
              <button
                onClick={() => saveSettings('general')}
                disabled={loading}
                className="btn"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre de la Empresa</label>
                  <input
                    type="text"
                    value={settings.general.company_name}
                    onChange={(e) => updateSetting('general', 'company_name', e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Dirección</label>
                  <textarea
                    value={settings.general.company_address}
                    onChange={(e) => updateSetting('general', 'company_address', e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={settings.general.company_phone}
                    onChange={(e) => updateSetting('general', 'company_phone', e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.general.company_email}
                    onChange={(e) => updateSetting('general', 'company_email', e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">RFC/NIT</label>
                  <input
                    type="text"
                    value={settings.general.tax_id}
                    onChange={(e) => updateSetting('general', 'tax_id', e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Moneda</label>
                  <select
                    value={settings.general.currency}
                    onChange={(e) => updateSetting('general', 'currency', e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  >
                    <option value="USD">USD - Dólar Americano</option>
                    <option value="MXN">MXN - Peso Mexicano</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Zona Horaria</label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  >
                    <option value="America/Mexico_City">Ciudad de México</option>
                    <option value="America/New_York">Nueva York</option>
                    <option value="Europe/Madrid">Madrid</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* POS Settings */}
        {activeTab === 'pos' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Configuración de Punto de Venta</h3>
              <button
                onClick={() => saveSettings('pos')}
                disabled={loading}
                className="btn"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border border-slate-600/20 rounded-lg">
                    <div>
                      <div className="font-medium">Imprimir recibo automáticamente</div>
                      <div className="text-sm text-muted">Imprime el recibo después de cada venta</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.pos.auto_print_receipt}
                      onChange={(e) => updateSetting('pos', 'auto_print_receipt', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-slate-600/20 rounded-lg">
                    <div>
                      <div className="font-medium">Permitir stock negativo</div>
                      <div className="text-sm text-muted">Permite vender aunque no haya stock</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.pos.allow_negative_stock}
                      onChange={(e) => updateSetting('pos', 'allow_negative_stock', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-slate-600/20 rounded-lg">
                    <div>
                      <div className="font-medium">Requerir información del cliente</div>
                      <div className="text-sm text-muted">Obligatorio seleccionar cliente en cada venta</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.pos.require_customer_info}
                      onChange={(e) => updateSetting('pos', 'require_customer_info', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Método de pago por defecto</label>
                    <select
                      value={settings.pos.default_payment_method}
                      onChange={(e) => updateSetting('pos', 'default_payment_method', e.target.value)}
                      className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                    >
                      <option value="cash">Efectivo</option>
                      <option value="card">Tarjeta</option>
                      <option value="transfer">Transferencia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Texto del pie de recibo</label>
                    <textarea
                      value={settings.pos.receipt_footer_text}
                      onChange={(e) => updateSetting('pos', 'receipt_footer_text', e.target.value)}
                      placeholder="Gracias por su compra..."
                      className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                      rows="3"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border border-slate-600/20 rounded-lg">
                    <div>
                      <div className="font-medium">Escáner de código de barras</div>
                      <div className="text-sm text-muted">Habilita el uso de escáner en POS</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.pos.barcode_scanner_enabled}
                      onChange={(e) => updateSetting('pos', 'barcode_scanner_enabled', e.target.checked)}
                      className="w-4 h-4"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Settings */}
        {activeTab === 'inventory' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Configuración de Inventario</h3>
              <button
                onClick={() => saveSettings('inventory')}
                disabled={loading}
                className="btn"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-slate-600/20 rounded-lg">
                  <div>
                    <div className="font-medium">Alertas de stock bajo</div>
                    <div className="text-sm text-muted">Notifica cuando el stock esté bajo</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.inventory.low_stock_alert}
                    onChange={(e) => updateSetting('inventory', 'low_stock_alert', e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-600/20 rounded-lg">
                  <div>
                    <div className="font-medium">Reorden automático</div>
                    <div className="text-sm text-muted">Genera órdenes de compra automáticamente</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.inventory.auto_reorder}
                    onChange={(e) => updateSetting('inventory', 'auto_reorder', e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-600/20 rounded-lg">
                  <div>
                    <div className="font-medium">Rastrear fechas de vencimiento</div>
                    <div className="text-sm text-muted">Control de productos perecederos</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.inventory.track_expiration_dates}
                    onChange={(e) => updateSetting('inventory', 'track_expiration_dates', e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Días para punto de reorden</label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={settings.inventory.reorder_point_days}
                    onChange={(e) => updateSetting('inventory', 'reorder_point_days', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Método de cálculo de costo</label>
                  <select
                    value={settings.inventory.cost_calculation_method}
                    onChange={(e) => updateSetting('inventory', 'cost_calculation_method', e.target.value)}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  >
                    <option value="fifo">FIFO (Primero en entrar, primero en salir)</option>
                    <option value="lifo">LIFO (Último en entrar, primero en salir)</option>
                    <option value="average">Costo Promedio</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Configuración de Notificaciones</h3>
              <button
                onClick={() => saveSettings('notifications')}
                disabled={loading}
                className="btn"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-slate-600/20 rounded-lg">
                <div>
                  <div className="font-medium">Notificaciones por email</div>
                  <div className="text-sm text-muted">Recibe notificaciones importantes por correo</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.email_notifications}
                  onChange={(e) => updateSetting('notifications', 'email_notifications', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-600/20 rounded-lg">
                <div>
                  <div className="font-medium">Alertas de stock bajo</div>
                  <div className="text-sm text-muted">Notifica cuando los productos tengan stock bajo</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.low_stock_notifications}
                  onChange={(e) => updateSetting('notifications', 'low_stock_notifications', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-600/20 rounded-lg">
                <div>
                  <div className="font-medium">Reporte diario de ventas</div>
                  <div className="text-sm text-muted">Envía un resumen de ventas al final del día</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.daily_sales_report}
                  onChange={(e) => updateSetting('notifications', 'daily_sales_report', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-600/20 rounded-lg">
                <div>
                  <div className="font-medium">Alertas del sistema</div>
                  <div className="text-sm text-muted">Notificaciones sobre el estado del sistema</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.system_alerts}
                  onChange={(e) => updateSetting('notifications', 'system_alerts', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-600/20 rounded-lg">
                <div>
                  <div className="font-medium">Notificaciones de nuevos usuarios</div>
                  <div className="text-sm text-muted">Alerta cuando se registren nuevos usuarios</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.new_user_notifications}
                  onChange={(e) => updateSetting('notifications', 'new_user_notifications', e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Configuración de Seguridad</h3>
              <button
                onClick={() => saveSettings('security')}
                disabled={loading}
                className="btn"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tiempo de sesión (minutos)</label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    value={settings.security.session_timeout}
                    onChange={(e) => updateSetting('security', 'session_timeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Días para cambio de contraseña</label>
                  <input
                    type="number"
                    min="30"
                    max="365"
                    value={settings.security.password_expiry_days}
                    onChange={(e) => updateSetting('security', 'password_expiry_days', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Límite de intentos de login</label>
                  <input
                    type="number"
                    min="3"
                    max="10"
                    value={settings.security.login_attempts_limit}
                    onChange={(e) => updateSetting('security', 'login_attempts_limit', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-slate-600/20 rounded-lg">
                  <div>
                    <div className="font-medium">Requerir cambio de contraseña</div>
                    <div className="text-sm text-muted">Fuerza cambio de contraseña en primer login</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.security.require_password_change}
                    onChange={(e) => updateSetting('security', 'require_password_change', e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border border-slate-600/20 rounded-lg">
                  <div>
                    <div className="font-medium">Autenticación de dos factores</div>
                    <div className="text-sm text-muted">Requiere código adicional para login</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.security.two_factor_auth}
                    onChange={(e) => updateSetting('security', 'two_factor_auth', e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backup Settings */}
        {activeTab === 'backup' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Configuración de Respaldos</h3>
              <div className="flex gap-2">
                <button
                  onClick={performBackup}
                  disabled={loading}
                  className="btn"
                >
                  {loading ? 'Creando...' : '💾 Crear Respaldo'}
                </button>
                <button
                  onClick={() => saveSettings('backup')}
                  disabled={loading}
                  className="btn"
                >
                  Guardar Configuración
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-slate-600/20 rounded-lg">
                  <div>
                    <div className="font-medium">Respaldo automático</div>
                    <div className="text-sm text-muted">Crea respaldos de forma automática</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.backup.auto_backup}
                    onChange={(e) => updateSetting('backup', 'auto_backup', e.target.checked)}
                    className="w-4 h-4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Frecuencia de respaldo</label>
                  <select
                    value={settings.backup.backup_frequency}
                    onChange={(e) => updateSetting('backup', 'backup_frequency', e.target.value)}
                    disabled={!settings.backup.auto_backup}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md disabled:opacity-50"
                  >
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Días de retención</label>
                  <input
                    type="number"
                    min="7"
                    max="365"
                    value={settings.backup.backup_retention_days}
                    onChange={(e) => updateSetting('backup', 'backup_retention_days', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-surface border border-slate-600/30 rounded-md"
                  />
                  <div className="text-xs text-muted mt-1">
                    Los respaldos se eliminarán automáticamente después de este período
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-surface/50 rounded-lg">
                  <h5 className="font-medium mb-2">Estado del último respaldo</h5>
                  {settings.backup.last_backup ? (
                    <div className="text-sm">
                      <div className="text-green-400 mb-1">✅ Completado</div>
                      <div className="text-muted">
                        {new Date(settings.backup.last_backup).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted">
                      No se han creado respaldos aún
                    </div>
                  )}
                </div>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400">⚠️</span>
                    <div className="text-sm">
                      <div className="font-medium text-yellow-400 mb-1">Importante</div>
                      <div className="text-muted">
                        Los respaldos contienen información sensible. Guárdalos en un lugar seguro
                        y nunca los compartas con terceros no autorizados.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reset Section */}
        <div className="card bg-red-500/5 border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-red-400">Zona de Peligro</h3>
              <p className="text-muted text-sm">
                Acciones irreversibles que afectan la configuración del sistema
              </p>
            </div>
            <button
              onClick={() => resetToDefaults(activeTab)}
              className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-md hover:bg-red-500/30 transition"
            >
              🔄 Restaurar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}