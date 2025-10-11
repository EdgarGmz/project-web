import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'

// Páginas públicas
import Landing from './components/pages/Landing'
import Login from './components/pages/Login'
import Register from './components/pages/Register'

// Páginas protegidas
import ProtectedRoute from './components/molecules/ProtectedRoute'
import Dashboard from './components/pages/Dashboard'
import DashboardLayout from './components/templates/DashboardLayout'

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="card">
                  <h1 className="text-2xl font-semibold">Perfil</h1>
                  <p className="text-muted">Próximamente...</p>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/logout" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
