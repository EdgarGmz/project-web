import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import SessionExpiredModal from './components/molecules/SessionExpiredModal'

// Páginas públicas
import Landing from './components/pages/Landing'
import Login from './components/pages/Login'
import Register from './components/pages/Register'

// Páginas protegidas
import ProtectedRoute from './components/molecules/ProtectedRoute'
import DashboardLayout from './components/templates/DashboardLayout'

// Componentes de páginas
import Dashboard from './components/pages/Dashboard'
import Profile from './components/pages/Profile'
import Settings from './components/pages/Settings'

// Gestión de entidades
//import Suppliers from './components/organisms/Suppliers'
import Branches from './components/pages/Branches'
import Customers from './components/pages/Customers'
import Products from './components/pages/Products'
import Users from './components/pages/Users'

// Formularios
import BranchForm from './components/organisms/BranchForm'
import CustomerForm from './components/organisms/CustomerForm'
import ProductForm from './components/organisms/ProductForm'
import UserForm from './components/organisms/UserForm'

// Inventario y Ventas
import InventoryForm from './components/organisms/InventoryForm'
import Payments from './components/organisms/Payments'
import Purchases from './components/organisms/Purchases'
import Returns from './components/organisms/Returns'
import SaleForm from './components/organisms/SaleForm'
import Inventory from './components/pages/Inventory'
import POS from './components/pages/POS'
import Sales from './components/pages/Sales'

// Reportes y otros
import Audit from './components/organisms/Audit'
import InventoryReports from './components/organisms/InventoryReports'
import Notifications from './components/organisms/Notifications'
import SalesReports from './components/organisms/SalesReports'
import Reports from './components/pages/Reports'

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <SessionExpiredModal />
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard principal */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Perfil y configuración */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute roles={['owner', 'admin']}>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Gestión de usuarios */}
          <Route path="/users" element={
            <ProtectedRoute roles={['owner', 'admin']}>
              <DashboardLayout>
                <Users />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/users/new" element={
            <ProtectedRoute roles={['owner', 'admin']}>
              <DashboardLayout>
                <UserForm />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/users/:id/edit" element={
            <ProtectedRoute roles={['owner', 'admin']}>
              <DashboardLayout>
                <UserForm />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Gestión de sucursales */}
          <Route path="/branches" element={
            <ProtectedRoute roles={['owner', 'admin']}>
              <DashboardLayout>
                <Branches />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/branches/new" element={
            <ProtectedRoute roles={['owner', 'admin']}>
              <DashboardLayout>
                <BranchForm />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/branches/:id/edit" element={
            <ProtectedRoute roles={['owner', 'admin']}>
              <DashboardLayout>
                <BranchForm />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Gestión de productos */}
          <Route path="/products" element={
            <ProtectedRoute roles={['owner', 'admin', 'supervisor']}>
              <DashboardLayout>
                <Products />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/products/new" element={
            <ProtectedRoute roles={['owner', 'admin', 'supervisor']}>
              <DashboardLayout>
                <ProductForm />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/products/:id/edit" element={
            <ProtectedRoute roles={['owner', 'admin', 'supervisor']}>
              <DashboardLayout>
                <ProductForm />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Gestión de clientes */}
          <Route path="/customers" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Customers />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/customers/new" element={
            <ProtectedRoute>
              <DashboardLayout>
                <CustomerForm />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/customers/:id/edit" element={
            <ProtectedRoute>
              <DashboardLayout>
                <CustomerForm />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Gestión de proveedores
          <Route path="/suppliers" element={
            <ProtectedRoute roles={['owner', 'admin', 'supervisor']}>
              <DashboardLayout>
                <Suppliers />
              </DashboardLayout>
            </ProtectedRoute>
          } /> */}

          {/* Gestión de compras */}
          <Route path="/purchases" element={
            <ProtectedRoute roles={['owner', 'admin', 'supervisor']}>
              <DashboardLayout>
                <Purchases />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Gestión de inventario */}
          <Route path="/inventory" element={
            <ProtectedRoute roles={['owner', 'admin', 'supervisor']}>
              <DashboardLayout>
                <Inventory />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/inventory/new" element={
            <ProtectedRoute roles={['owner', 'admin', 'supervisor']}>
              <DashboardLayout>
                <InventoryForm />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/inventory/:id/edit" element={
            <ProtectedRoute roles={['owner', 'admin', 'supervisor']}>
              <DashboardLayout>
                <InventoryForm />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Sistema de ventas */}
          <Route path="/sales" element={
            <ProtectedRoute>
              <DashboardLayout>
                <Sales />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/sales/new" element={
            <ProtectedRoute>
              <DashboardLayout>
                <SaleForm />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/sales/:id/edit" element={
            <ProtectedRoute roles={['owner', 'admin', 'supervisor']}>
              <DashboardLayout>
                <SaleForm />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Punto de venta */}
          <Route path="/pos" element={
            <ProtectedRoute>
              <DashboardLayout>
                <POS />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Reportes */}
          <Route path="/reports" element={
            <ProtectedRoute roles={['owner', 'admin', 'supervisor', 'auditor']}>
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/reports/sales" element={
            <ProtectedRoute roles={['owner', 'admin', 'supervisor', 'auditor']}>
              <DashboardLayout>
                <SalesReports />
              </DashboardLayout>
            </ProtectedRoute>
          } />
          <Route path="/reports/inventory" element={
            <ProtectedRoute roles={['owner', 'admin', 'supervisor', 'auditor']}>
              <DashboardLayout>
                <InventoryReports />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Auditoría */}
          <Route path="/audit" element={
            <ProtectedRoute roles={['owner', 'auditor']}>
              <DashboardLayout>
                <Audit />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Notificaciones */}
          <Route path="/notifications" element={
            <ProtectedRoute roles={['owner', 'admin', 'supervisor']}>
              <DashboardLayout>
                <Notifications />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Pagos */}
          <Route path="/payments" element={
            <ProtectedRoute roles={['owner', 'admin']}>
              <DashboardLayout>
                <Payments />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Devoluciones */}
          <Route path="/returns" element={
            <ProtectedRoute roles={['owner', 'admin', 'supervisor', 'cashier']}>
              <DashboardLayout>
                <Returns />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          {/* Rutas especiales */}
          <Route path="/logout" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
