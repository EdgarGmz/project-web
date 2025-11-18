# 🎨 Frontend - Sistema de Inventario PYMES

Frontend oficial del sistema integral de inventario, ventas y facturación para PYMES. Construido con **React 18** + **Vite**, implementando **Tailwind CSS** y **Atomic Design** para una experiencia de usuario óptima y escalable.

## ⚡ Características Principales

- 🎨 **UI/UX Moderno**: Diseño limpio y profesional con Tailwind CSS
- 🌓 **Tema Claro/Oscuro**: Cambio dinámico de tema con persistencia
- 📱 **Diseño Responsivo**: Optimizado para desktop, tablet y móvil
- � **Autenticación Completa**: Login, registro y gestión de sesiones
- 👥 **Control de Roles**: UI adaptada según permisos del usuario
- 🏢 **Multi-sucursal**: Interfaz contextual por sucursal
- ⏰ **Dashboard Dinámico**: Información en tiempo real
- 🧩 **Atomic Design**: Componentes reutilizables y mantenibles

## 🚀 Configuración Rápida

### Instalación
```bash
npm install
```

### Variables de Entorno
```env
VITE_API_URL=http://localhost:3001/api
```

### Desarrollo
```bash
npm run dev
```
Disponible en `http://localhost:5173`

## 🛠️ Stack Tecnológico

- **React 18** - Biblioteca de UI con hooks modernos
- **Vite** - Herramienta de desarrollo con HMR ultra-rápido
- **Tailwind CSS** - Estilos utilitarios y diseño responsivo
- **React Router** - Navegación SPA con rutas protegidas
- **Context API** - Gestión de estado global
- **Axios** - Cliente HTTP para comunicación con API

## 🏗️ Arquitectura Atomic Design

```
/client/src
├── /components
│   ├── /atoms           # Elementos básicos
│   │   └── ThemeToggle.jsx
│   ├── /molecules       # Combinaciones simples
│   │   ├── ProtectedRoute.jsx
│   │   ├── SessionExpiredModal.jsx
│   │   └── /UserForm
│   ├── /organisms       # Componentes complejos
│   │   ├── Sidebar.jsx
│   │   ├── BranchForm.jsx
│   │   ├── ProductForm.jsx
│   │   ├── CustomerForm.jsx
│   │   ├── InventoryForm.jsx
│   │   ├── SaleForm.jsx
│   │   ├── UserForm.jsx
│   │   ├── Payments.jsx
│   │   ├── Returns.jsx
│   │   ├── SalesReports.jsx
│   │   ├── InventoryReports.jsx
│   │   ├── Notifications.jsx
│   │   ├── Profile.jsx
│   │   ├── Purchases.jsx
│   │   └── Audit.jsx
│   ├── /pages          # Páginas completas
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Products.jsx
│   │   ├── Users.jsx
│   │   ├── Branches.jsx
│   │   ├── Customers.jsx
│   │   ├── Inventory.jsx
│   │   ├── Sales.jsx
│   │   ├── POS.jsx
│   │   ├── Reports.jsx
│   │   ├── Profile.jsx
│   │   └── Settings.jsx
│   └── /templates      # Layouts y plantillas
│       └── DashboardLayout.jsx
├── /contexts           # Gestión de estado
│   ├── AuthContext.jsx
│   ├── ThemeContext.jsx
│   └── SidebarContext.jsx
├── /services           # Comunicación con API
│   ├── api.js
│   ├── authService.js
│   ├── userService.js
│   ├── branchService.js
│   ├── productService.js
│   ├── customerService.js
│   ├── inventoryService.js
│   ├── saleServices.js
│   ├── paymentService.js
│   ├── returnService.js
│   └── reportService.js
├── /assets             # Recursos estáticos
│   ├── /img
│   └── /logo
└── /styles             # Estilos globales
    ├── global.css
    └── tailwind.css
```

## 🎯 Características

- 🔐 **Autenticación JWT** con roles y permisos
- 🏢 **Gestión Multi-sucursal** independiente
- 📦 **CRUD Completo** para productos, usuarios, clientes
- 🛒 **Punto de Venta (POS)** con procesamiento de ventas
- 📊 **Reportes y Analytics** de inventario y ventas
- 🌓 **Tema Claro/Oscuro** con persistencia
- 📱 **Diseño Responsivo** optimizado para todos los dispositivos
- ⏰ **Dashboard Dinámico** con información en tiempo real

## 🎨 Sistema de Temas

### Implementación
- **ThemeContext**: Gestión global del estado del tema
- **CSS Variables**: Colores dinámicos en `global.css`
- **Persistencia**: LocalStorage para mantener preferencia
- **Toggle Component**: Cambio fácil entre temas

```javascript
// Uso del ThemeContext
const { theme, toggleTheme } = useTheme();
```

### Paleta de Colores

#### Tema Claro
- Primary: `#3B82F6` (Blue-500)
- Background: `#FFFFFF`
- Surface: `#F8FAFC`
- Text: `#1E293B`

#### Tema Oscuro
- Primary: `#60A5FA` (Blue-400)
- Background: `#0F172A`
- Surface: `#1E293B`
- Text: `#F1F5F9`

## 🔐 Gestión de Autenticación

### AuthContext
```javascript
const {
  user,           // Datos del usuario actual
  login,          // Función de login
  logout,         // Función de logout
  loading,        // Estado de carga
  hasPermission   // Verificación de permisos
} = useAuth();
```

### Rutas Protegidas
```javascript
<ProtectedRoute roles={['owner', 'admin']}>
  <AdminPanel />
</ProtectedRoute>
```

## � Características del Dashboard

### Header Dinámico
- ⏰ **Fecha y Hora**: Actualización en tiempo real cada segundo
- ☀️🌙 **Iconos Contextuales**: Sol/Luna según hora del día
- 🌡️ **Información Climática**: Simulación de datos meteorológicos
- 📍 **Ubicación Personalizada**: Ciudad y estado de la sucursal del usuario
- 👤 **Avatar de Usuario**: Iniciales con menú dropdown

### Sidebar Responsivo
- 🎯 **Navegación Contextual**: Menús según rol del usuario
- 📱 **Responsive**: Colapsa automáticamente en móvil
- 🎨 **Iconos Visuales**: Identificación rápida de secciones
- 🔒 **Permisos Visuales**: Solo muestra opciones autorizadas

## 🔄 Actualizaciones Recientes

### v2.0.0 - Dashboard Dinámico y UX Mejorada

#### 🎨 Interfaz
- ✅ **Header Dinámico**: Información en tiempo real (fecha, hora, clima, ubicación)
- ✅ **Avatar Sistema**: Iniciales del usuario con menú dropdown
- ✅ **Sidebar Limpio**: Eliminada información duplicada del usuario
- ✅ **Responsive Design**: Optimización para móviles y tablets

#### 🏢 Funcionalidades
- ✅ **CRUD Sucursales**: Formularios completos con validación
- ✅ **Ubicación Contextual**: Muestra ciudad/estado de sucursal del usuario
- ✅ **Gestión de Estado**: SidebarContext para UI responsive
- ✅ **Mejora UX**: Navegación más intuitiva y datos relevantes

## �📚 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## 🔗 Recursos

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Atomic Design Methodology](https://bradfrost.com/blog/post/atomic-web-design/)
