import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import SuccessModal from '../molecules/SuccessModal'
import LoadingModal from '../molecules/LoadingModal'
import { api } from '../../services/api'

export default function Settings() {
  const { user, hasPermission } = useAuth()
  const { theme, toggle } = useTheme()
  const [loading, setLoading] = useState(false)
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' })
  const [settings, setSettings] = useState({
    company_name: '',
    company_email: '',
    company_phone: '',
    currency: 'MXN',
    language: 'es',
    low_stock_alert: true,
    email_notifications: true
  })

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Aquí puedes agregar la lógica para guardar en el backend si es necesario
      // Por ahora solo guardamos en localStorage
      localStorage.setItem('appSettings', JSON.stringify(settings))
      
      setSuccessModal({ isOpen: true, message: 'Configuración guardada exitosamente' })
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar configuración guardada al iniciar
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }, [])

  return (
    <>
      <LoadingModal isOpen={loading} message="Guardando configuración..." />
      <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="text-muted">Ajustes básicos de la aplicación</p>
      </div>

      {/* Apariencia */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-600/20">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-purple-500/10 border-2 border-purple-500/40 flex items-center justify-center text-2xl">
            🎨
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Apariencia</h3>
            <p className="text-xs text-muted mt-0.5">Personaliza la interfaz visual</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-600/20">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{theme === 'dark' ? '🌙' : '☀️'}</span>
              <div>
                <div className="font-medium text-white">Tema</div>
                <div className="text-sm text-muted">Modo {theme === 'dark' ? 'Oscuro' : 'Claro'}</div>
              </div>
            </div>
            <button
              onClick={toggle}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                theme === 'dark' ? 'bg-accent' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform flex items-center justify-center ${
                  theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                }`}
              >
                {theme === 'dark' ? '🌙' : '☀️'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Configuración General */}
      {hasPermission(['owner', 'admin']) && (
        <div className="card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-600/20">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-500/10 border-2 border-blue-500/40 flex items-center justify-center text-2xl">
              🏢
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Información General</h3>
              <p className="text-xs text-muted mt-0.5">Datos básicos de la empresa</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-white">
                <span>🏷️</span>
                Nombre de la Empresa
              </label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => updateSetting('company_name', e.target.value)}
                placeholder="Mi Empresa S.A."
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-white">
                <span>📧</span>
                Email de Contacto
              </label>
              <input
                type="email"
                value={settings.company_email}
                onChange={(e) => updateSetting('company_email', e.target.value)}
                placeholder="contacto@empresa.com"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-white">
                <span>📞</span>
                Teléfono
              </label>
              <input
                type="tel"
                value={settings.company_phone}
                onChange={(e) => updateSetting('company_phone', e.target.value)}
                placeholder="+52 55 1234 5678"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-white">
                <span>💰</span>
                Moneda
              </label>
              <select
                value={settings.currency}
                onChange={(e) => updateSetting('currency', e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              >
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="USD">USD - Dólar Americano</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Notificaciones */}
      {hasPermission(['owner', 'admin']) && (
        <div className="card">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-600/20">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500/30 to-yellow-500/10 border-2 border-yellow-500/40 flex items-center justify-center text-2xl">
              🔔
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Notificaciones</h3>
              <p className="text-xs text-muted mt-0.5">Configura las alertas del sistema</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-600/20">
              <div className="flex items-center gap-3">
                <span className="text-xl">📊</span>
                <div>
                  <div className="font-medium text-white">Alertas de Stock Bajo</div>
                  <div className="text-sm text-muted">Notifica cuando el inventario esté bajo</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.low_stock_alert}
                  onChange={(e) => updateSetting('low_stock_alert', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-600/20">
              <div className="flex items-center gap-3">
                <span className="text-xl">📧</span>
                <div>
                  <div className="font-medium text-white">Notificaciones por Email</div>
                  <div className="text-sm text-muted">Recibe alertas importantes por correo</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.email_notifications}
                  onChange={(e) => updateSetting('email_notifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-yellow-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Botón Guardar */}
      {hasPermission(['owner', 'admin']) && (
        <div className="flex justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Guardando...
              </>
            ) : (
              <>
                <span>💾</span>
                Guardar Configuración
              </>
            )}
          </button>
        </div>
      )}

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        message={successModal.message}
      />
    </div>
    </>
  )
}
