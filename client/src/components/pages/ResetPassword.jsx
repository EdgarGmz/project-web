import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import PasswordInput from '../atoms/PasswordInput'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validatePasswords = () => {
    if (formData.newPassword.length < 8) {
      setMessage('La contraseña debe tener al menos 8 caracteres')
      return false
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('Las contraseñas no coinciden')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!validatePasswords()) {
      setLoading(false)
      setIsSuccess(false)
      return
    }

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword: formData.newPassword
      })
      
      if (response.success) {
        setIsSuccess(true)
        setMessage(response.data.message)
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    } catch (error) {
      setIsSuccess(false)
      setMessage(error.response?.data?.message || 'Error al restablecer la contraseña')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) {
      setMessage('Token no proporcionado')
      setIsSuccess(false)
    }
  }, [token])

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20">
      <section className="w-full max-w-md">
        <article className="w-full space-y-6 backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 shadow-xl">
          
          <header className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Restablecer Contraseña</h2>
            <p className="text-muted">Ingresa tu nueva contraseña</p>
          </header>
          {message && (
            <output className={`p-3 rounded-md text-sm ${
              isSuccess 
                ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {message}
              {isSuccess && (
                <div className="text-xs mt-1 opacity-75">Serás redirigido al login en 3 segundos...</div>
              )}
            </output>
          )}

          {!isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <fieldset>
                <label className="block text-sm font-medium mb-2">Nueva Contraseña</label>
                <PasswordInput
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Mínimo 8 caracteres"
                  className="bg-white/5 backdrop-blur-sm border-white/20 focus:border-accent"
                  required
                />
              </fieldset>

              <fieldset>
                <label className="block text-sm font-medium mb-2">Confirmar Nueva Contraseña</label>
                <PasswordInput
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirma tu nueva contraseña"
                  className="bg-white/5 backdrop-blur-sm border-white/20 focus:border-accent"
                  required
                />
              </fieldset>

              <button type="submit" disabled={loading || !token} className="w-full btn py-3 disabled:opacity-50">
                {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
              </button>
            </form>
          )}

          <footer className="text-center">
            <Link 
              to="/login" 
              className="text-muted hover:text-text transition text-sm"
            >
              ← Volver al Login
            </Link>
          </footer>

          {token && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-400">
                    <strong>Token detectado:</strong> {token.slice(0, 8)}...
                    <br />
                    <strong>Para la demostración:</strong> Este token fue generado por el sistema y es válido por 30 minutos.
                  </p>
                </div>
              </div>
            </div>
          )}

        </article>
      </section>
    </main>
  )
}