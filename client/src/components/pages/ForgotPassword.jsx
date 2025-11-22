import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await api.post('/auth/forgot-password', { email })
      
      if (response.success) {
        setIsSuccess(true)
        setMessage(response.message)
        setEmail('')
      }
    } catch (error) {
      setIsSuccess(false)
      setMessage(error.response?.data?.message || 'Error al procesar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20">
      <section className="w-full max-w-md">
        <article className="w-full space-y-6 backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl p-8 shadow-xl">
          
          <header className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Recuperar Contraseña</h2>
            <p className="text-muted">Ingresa tu email para recibir un enlace de recuperación</p>
          </header>
          {message && (
            <div
              className={`flex flex-col items-center justify-center gap-2 p-4 my-2 rounded-xl text-base font-medium shadow-lg transition-all duration-300 animate-fade-in
                ${isSuccess
                  ? 'bg-green-600/20 border border-green-500 text-green-700'
                  : 'bg-red-600/20 border border-red-500 text-red-700'}
              `}
              style={{ minHeight: '64px' }}
            >
              <span className="flex items-center gap-2">
                {isSuccess ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                )}
                <span>{message}</span>
              </span>
            </div>
          )}

          {!isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <fieldset>
                <label className="block text-sm font-medium mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-md focus:border-accent transition"
                  placeholder="usuario@ejemplo.com"
                />
              </fieldset>

              <button type="submit" disabled={loading} className="w-full btn py-3 disabled:opacity-50">
                {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
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

          {isSuccess && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-400">
                    <strong>Para la demostración:</strong> Revisa la consola del backend para ver el "email" con el enlace de recuperación.
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