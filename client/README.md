# 🎨 Frontend - Sistema de Inventario PYMES

Frontend oficial del sistema integral de inventario, ventas y facturación para PYMES. Construido con **React 19** + **Vite 7**, implementando **Tailwind CSS** y **Atomic Design** para una experiencia de usuario óptima y escalable.

## ⚡ Características Principales

- 🎨 **UI/UX Moderno**: Diseño limpio y profesional con Tailwind CSS
- 🌓 **Tema Claro/Oscuro**: Cambio dinámico de tema con persistencia en LocalStorage
- 📱 **Diseño Responsive**: Optimizado para desktop, tablet y móvil
- 🔐 **Autenticación Completa**: Login, recuperación de contraseña y gestión de sesiones
- 👥 **Control de Roles**: UI adaptada según permisos del usuario (Owner, Admin, Supervisor, Cajero)
- 🏢 **Multi-sucursal**: Interfaz contextual por sucursal
- ⏰ **Dashboard Dinámico**: Información en tiempo real con fecha, hora, clima y ubicación
- 🧩 **Atomic Design**: Componentes reutilizables y mantenibles
- 🛒 **Punto de Venta (POS)**: Interfaz optimizada para ventas rápidas
- 📊 **Reportes**: Generación de reportes de ventas e inventario con exportación
- 🔄 **Devoluciones**: Sistema completo de gestión de devoluciones
- 💰 **Compras**: Gestión de compras a proveedores
- 📝 **Logs del Sistema**: Visualización de auditoría del sistema
- ⚙️ **Configuraciones**: Panel de configuración del sistema

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **React** | v19.1+ | Biblioteca de UI con hooks modernos |
| **Vite** | v7.1+ | Herramienta de desarrollo con HMR ultra-rápido |
| **React Router** | v7.9+ | Navegación SPA con rutas protegidas |
| **Tailwind CSS** | v3.4+ | Estilos utilitarios y diseño responsivo |
| **React Icons** | v5.5+ | Biblioteca de iconos |
| **Axios** | - | Cliente HTTP para comunicación con API |
| **jsPDF** | v3.0+ | Generación de PDFs para reportes |
| **jsPDF AutoTable** | v5.0+ | Tablas en PDFs |
| **XLSX** | v0.18+ | Exportación a Excel |
| **ESLint** | v9.36+ | Linter para código JavaScript/React |

## 📦 Estructura del Proyecto

### Arquitectura Atomic Design

```
/client/src
├── /components
│   ├── /atoms                    # Elementos básicos
│   │   ├── PasswordInput.jsx      # Input de contraseña con toggle
│   │   └── ThemeToggle.jsx       # Toggle de tema claro/oscuro
│   ├── /molecules                # Combinaciones simples
│   │   ├── AlertModal.jsx        # Modal de alerta
│   │   ├── CancelledModal.jsx    # Modal de cancelación
│   │   ├── ConfirmModal.jsx      # Modal de confirmación
│   │   ├── ErrorModal.jsx        # Modal de error
│   │   ├── LoadingModal.jsx      # Modal de carga
│   │   ├── Modal.jsx             # Modal base reutilizable
│   │   ├── NotFound.jsx          # Componente 404
│   │   ├── PasswordInput.jsx     # Input de contraseña
│   │   ├── PromptModal.jsx       # Modal de prompt
│   │   ├── ProtectedRoute.jsx   # Ruta protegida con autenticación
│   │   ├── SessionExpiredModal.jsx # Modal de sesión expirada
│   │   └── SuccessModal.jsx      # Modal de éxito
│   ├── /organisms                # Componentes complejos
│   │   ├── CustomerForm.jsx      # Formulario de clientes
│   │   ├── InventoryReports.jsx  # Reportes de inventario
│   │   ├── Payments.jsx          # Gestión de métodos de pago
│   │   ├── ProductForm.jsx       # Formulario de productos
│   │   ├── Profile.jsx            # Perfil de usuario
│   │   ├── Purchases.jsx         # Gestión de compras
│   │   ├── Returns.jsx           # Gestión de devoluciones
│   │   ├── ReturnsReports.jsx    # Reportes de devoluciones
│   │   ├── SaleForm.jsx          # Formulario de ventas
│   │   ├── SalesReports.jsx      # Reportes de ventas
│   │   ├── Sidebar.jsx           # Barra lateral de navegación
│   │   └── UserForm.jsx          # Formulario de usuarios
│   ├── /pages                    # Páginas completas
│   │   ├── Landing.jsx           # Página de inicio pública
│   │   ├── Login.jsx             # Página de login
│   │   ├── Register.jsx         # Página de registro
│   │   ├── ForgotPassword.jsx    # Recuperación de contraseña
│   │   ├── ResetPassword.jsx    # Restablecer contraseña
│   │   ├── Dashboard.jsx         # Dashboard principal
│   │   ├── Profile.jsx           # Perfil de usuario
│   │   ├── Settings.jsx          # Configuraciones
│   │   ├── Users.jsx            # Gestión de usuarios
│   │   ├── Branches.jsx         # Gestión de sucursales
│   │   ├── Products.jsx         # Gestión de productos
│   │   ├── Customers.jsx        # Gestión de clientes
│   │   ├── Inventory.jsx        # Gestión de inventario
│   │   ├── Sales.jsx            # Gestión de ventas
│   │   ├── POS.jsx              # Punto de venta
│   │   ├── Reports.jsx          # Reportes principales
│   │   └── Logs.jsx             # Logs del sistema
│   └── /templates               # Layouts y plantillas
│       └── DashboardLayout.jsx   # Layout del dashboard
├── /contexts                    # Gestión de estado global
│   ├── AuthContext.jsx          # Contexto de autenticación
│   ├── ThemeContext.jsx         # Contexto de tema
│   └── SidebarContext.jsx       # Contexto de sidebar
├── /services                    # Comunicación con API
│   ├── api.js                   # Configuración base de Axios
│   ├── authService.js           # Servicios de autenticación
│   ├── userService.js           # Servicios de usuarios
│   ├── branchService.js         # Servicios de sucursales
│   ├── productService.js        # Servicios de productos
│   ├── customerService.js       # Servicios de clientes
│   ├── inventoryService.js      # Servicios de inventario
│   ├── saleServices.js         # Servicios de ventas
│   ├── paymentService.js       # Servicios de pagos
│   ├── returnService.js        # Servicios de devoluciones
│   ├── purchaseService.js      # Servicios de compras
│   ├── reportService.js        # Servicios de reportes
│   └── logService.js           # Servicios de logs
├── /assets                      # Recursos estáticos
│   ├── /img                     # Imágenes
│   └── /logo                    # Logos
├── /styles                      # Estilos globales
│   ├── global.css               # Estilos globales y variables CSS
│   └── tailwind.css             # Configuración de Tailwind
├── App.jsx                      # Componente principal y rutas
└── main.jsx                     # Punto de entrada
```

## 🚀 Inicialización del Proyecto

### Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** v18 o superior ([Descargar Node.js](https://nodejs.org/))
- **npm** (viene incluido con Node.js) o **yarn**
- **Git** (opcional, para clonar el repositorio)
- **Backend API** corriendo (ver README del backend)

### Paso 1: Clonar o Navegar al Proyecto

Si estás clonando desde un repositorio:
```bash
git clone <url-del-repositorio>
cd project-web/client
```

Si ya tienes el proyecto:
```bash
cd client
```

### Paso 2: Instalar Dependencias

Instala todas las dependencias necesarias del proyecto:
```bash
npm install
```

Esto instalará todas las dependencias listadas en `package.json`, incluyendo:
- React, React DOM, React Router
- Vite y plugins
- Tailwind CSS y PostCSS
- React Icons
- jsPDF, XLSX para reportes
- ESLint y herramientas de desarrollo

### Paso 3: Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `/client` con la siguiente configuración:

```env
# URL de la API Backend
VITE_API_URL=http://localhost:3001/api
```

> ⚠️ **Importante:** 
> - Asegúrate de que el backend esté corriendo en el puerto especificado
> - Para producción, cambia la URL a la de tu servidor de producción
> - Las variables en Vite deben comenzar con `VITE_` para ser accesibles en el código

### Paso 4: Verificar que el Backend esté Corriendo

Antes de iniciar el frontend, asegúrate de que el backend esté funcionando:

1. **Navega a la carpeta del backend:**
```bash
cd ../api
```

2. **Inicia el servidor backend:**
```bash
npm run dev
```

3. **Verifica que esté corriendo:**
   - Abre `http://localhost:3001` en tu navegador
   - Deberías ver un mensaje JSON con información de la API

4. **Vuelve a la carpeta del cliente:**
```bash
cd ../client
```

### Paso 5: Iniciar el Servidor de Desarrollo

Inicia el servidor de desarrollo de Vite:

```bash
npm run dev
```

Si todo está correcto, verás un mensaje similar a:
```
  VITE v7.1.7  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Paso 6: Verificar que Funciona

1. **Abrir en el navegador:**
   - Abre `http://localhost:5173` en tu navegador
   - Deberías ver la página de Landing

2. **Probar el login:**
   - Navega a `/login`
   - Usa las credenciales de prueba del backend:
     - **Owner:** `edgar_gmz@apexstore.com` / `edgar1234`
     - **Admin:** `alexis@apexstore.com` / `alexis1234`
     - **Supervisor:** `orlando@apexstore.com` / `orlando1234`
     - **Cajero:** `juan@apexstore.com` / `juan1234`

3. **Verificar el dashboard:**
   - Después del login, deberías ser redirigido al dashboard
   - Verifica que el sidebar muestre las opciones según tu rol

### ✅ Inicialización Completa

Si has seguido todos los pasos, tu proyecto debería estar:
- ✅ Dependencias instaladas
- ✅ Variables de entorno configuradas
- ✅ Backend corriendo y accesible
- ✅ Frontend corriendo en desarrollo
- ✅ Aplicación accesible en el navegador

## 🎯 Rutas de la Aplicación

### Rutas Públicas
- `/` - Página de inicio (Landing)
- `/login` - Iniciar sesión
- `/register` - Registro de usuario
- `/forgot-password` - Recuperación de contraseña
- `/reset-password/:token` - Restablecer contraseña

### Rutas Protegidas

#### Dashboard y Perfil
- `/dashboard` - Dashboard principal (Owner, Admin, Supervisor)
- `/profile` - Perfil de usuario (Todos los roles)
- `/settings` - Configuraciones (Todos los roles)

#### Gestión de Usuarios
- `/users` - Lista de usuarios (Owner)
- `/users/new` - Crear usuario (Owner)
- `/users/:id/edit` - Editar usuario (Owner)

#### Gestión de Sucursales
- `/branches` - Lista de sucursales (Owner, Admin)

#### Gestión de Productos
- `/products` - Lista de productos (Todos los roles)
- `/products/new` - Crear producto (Owner)
- `/products/:id/edit` - Editar producto (Owner, Supervisor)

#### Gestión de Clientes
- `/customers` - Lista de clientes (Owner, Supervisor, Cajero)
- `/customers/new` - Crear cliente (Supervisor, Cajero)
- `/customers/:id/edit` - Editar cliente (Supervisor, Cajero)

#### Inventario
- `/inventory` - Gestión de inventario (Owner, Admin, Supervisor)

#### Ventas
- `/sales` - Lista de ventas (Supervisor, Cajero)
- `/sales/new` - Crear venta (Cajero)
- `/sales/:id/edit` - Editar venta (Cajero)
- `/pos` - Punto de venta (Cajero)

#### Compras
- `/purchases` - Gestión de compras (Owner)

#### Devoluciones
- `/returns` - Gestión de devoluciones (Todos los roles)

#### Pagos
- `/payments` - Métodos de pago (Owner)

#### Reportes
- `/reports` - Reportes principales (Owner, Admin)
- `/reports/sales` - Reportes de ventas (Owner, Admin)
- `/reports/inventory` - Reportes de inventario (Owner, Admin)

#### Logs
- `/logs` - Logs del sistema (Owner, Admin)

## 🎨 Sistema de Temas

### Implementación
- **ThemeContext**: Gestión global del estado del tema
- **CSS Variables**: Colores dinámicos en `global.css`
- **Persistencia**: LocalStorage para mantener preferencia del usuario
- **Toggle Component**: Cambio fácil entre temas con `ThemeToggle`

### Uso del ThemeContext
```javascript
import { useTheme } from '../contexts/ThemeContext'

function MyComponent() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <div className={`bg-surface text-text`}>
      <button onClick={toggleTheme}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  )
}
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
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const {
    user,           // Datos del usuario actual
    login,          // Función de login
    logout,         // Función de logout
    loading,        // Estado de carga
    hasPermission   // Verificación de permisos
  } = useAuth()
  
  // Verificar permisos
  if (hasPermission(['owner', 'admin'])) {
    // Mostrar contenido restringido
  }
}
```

### Rutas Protegidas
```javascript
import ProtectedRoute from './components/molecules/ProtectedRoute'

<ProtectedRoute roles={['owner', 'admin']}>
  <AdminPanel />
</ProtectedRoute>
```

### Servicios de Autenticación
- `login(email, password)` - Iniciar sesión
- `logout()` - Cerrar sesión
- `getProfile()` - Obtener perfil del usuario
- `updateProfile(data)` - Actualizar perfil
- `changePassword(currentPassword, newPassword)` - Cambiar contraseña
- `forgotPassword(email)` - Solicitar recuperación
- `resetPassword(token, newPassword)` - Restablecer contraseña

## 📊 Características del Dashboard

### Header Dinámico
- ⏰ **Fecha y Hora**: Actualización en tiempo real cada segundo
- ☀️🌙 **Iconos Contextuales**: Sol/Luna según hora del día
- 🌡️ **Información Climática**: Datos meteorológicos simulados
- 📍 **Ubicación Personalizada**: Ciudad y estado de la sucursal del usuario
- 👤 **Avatar de Usuario**: Iniciales con menú dropdown
  - Ver perfil
  - Configuración
  - Cerrar sesión

### Sidebar Responsivo
- 🎯 **Navegación Contextual**: Menús según rol del usuario
- 📱 **Responsive**: Colapsa automáticamente en móvil
- 🎨 **Iconos Visuales**: Identificación rápida de secciones
- 🔒 **Permisos Visuales**: Solo muestra opciones autorizadas
- 🌓 **Tema Adaptativo**: Se adapta al tema claro/oscuro

### Estadísticas del Dashboard
- 📈 Ventas del día/mes
- 📦 Productos con stock bajo
- 💰 Ingresos totales
- 🛒 Ventas recientes
- 📊 Gráficos de rendimiento

## 📚 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo con HMR

# Producción
npm run build        # Crear build de producción
npm run preview      # Preview del build de producción

# Calidad de código
npm run lint         # Ejecutar ESLint
```

## 🔄 Actualizaciones Recientes

### v3.0.0 - Funcionalidades Completas
- ✅ **Sistema de Logs**: Visualización de auditoría del sistema
- ✅ **Gestión de Compras**: CRUD completo de compras a proveedores
- ✅ **Sistema de Devoluciones**: Gestión completa con aprobación
- ✅ **Reportes Mejorados**: Exportación a PDF y Excel
- ✅ **Recuperación de Contraseña**: Flujo completo de forgot/reset password
- ✅ **Configuraciones**: Panel de configuración del sistema
- ✅ **Modales Mejorados**: Sistema completo de modales reutilizables
- ✅ **Mejoras de UX**: Mejor feedback visual y manejo de errores

### v2.0.0 - Dashboard Dinámico y UX Mejorada
- ✅ **Header Dinámico**: Información en tiempo real (fecha, hora, clima, ubicación)
- ✅ **Avatar Sistema**: Iniciales del usuario con menú dropdown
- ✅ **Sidebar Limpio**: Eliminada información duplicada del usuario
- ✅ **Responsive Design**: Optimización para móviles y tablets
- ✅ **CRUD Sucursales**: Formularios completos con validación
- ✅ **Ubicación Contextual**: Muestra ciudad/estado de sucursal del usuario
- ✅ **Gestión de Estado**: SidebarContext para UI responsive

## 🎯 Componentes Principales

### Modales
- **AlertModal**: Alertas informativas
- **ConfirmModal**: Confirmaciones de acciones
- **ErrorModal**: Errores del sistema
- **SuccessModal**: Operaciones exitosas
- **LoadingModal**: Estados de carga
- **PromptModal**: Solicitud de entrada de datos
- **SessionExpiredModal**: Sesión expirada automática

### Formularios
- **UserForm**: Crear/editar usuarios
- **ProductForm**: Crear/editar productos
- **CustomerForm**: Crear/editar clientes
- **SaleForm**: Procesar ventas
- **Profile**: Perfil de usuario

### Reportes
- **SalesReports**: Reportes de ventas con exportación
- **InventoryReports**: Reportes de inventario
- **ReturnsReports**: Reportes de devoluciones

## 🔗 Servicios de API

Todos los servicios están centralizados en `/src/services`:

- **authService**: Autenticación y autorización
- **userService**: Gestión de usuarios
- **branchService**: Gestión de sucursales
- **productService**: Gestión de productos
- **customerService**: Gestión de clientes
- **inventoryService**: Gestión de inventario
- **saleServices**: Procesamiento de ventas
- **paymentService**: Métodos de pago
- **returnService**: Devoluciones
- **purchaseService**: Compras
- **reportService**: Reportes
- **logService**: Logs del sistema

## 🐛 Troubleshooting

### Error de conexión con la API
- Verifica que el backend esté corriendo en `http://localhost:3001`
- Revisa que `VITE_API_URL` en `.env` sea correcta
- Verifica la consola del navegador para errores CORS

### Error de autenticación
- Verifica que el token JWT esté siendo guardado en localStorage
- Revisa que las credenciales sean correctas
- Verifica que el backend esté configurado correctamente

### Error de build
- Limpia la caché: `rm -rf node_modules .vite dist`
- Reinstala dependencias: `npm install`
- Verifica que todas las variables de entorno estén configuradas

### Hot Module Replacement (HMR) no funciona
- Reinicia el servidor de desarrollo
- Verifica que no haya errores en la consola
- Limpia la caché del navegador

## 📚 Recursos

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com/)
- [Atomic Design Methodology](https://bradfrost.com/blog/post/atomic-web-design/)
- [React Icons](https://react-icons.github.io/react-icons/)

## 📝 Notas de Desarrollo

### Estructura de Componentes
- **Atoms**: Componentes básicos e indivisibles
- **Molecules**: Combinaciones simples de atoms
- **Organisms**: Componentes complejos con lógica
- **Pages**: Páginas completas de la aplicación
- **Templates**: Layouts y estructuras reutilizables

### Convenciones de Código
- Usar camelCase para nombres de funciones y variables
- Usar PascalCase para componentes React
- Mantener componentes pequeños y enfocados
- Usar hooks personalizados para lógica reutilizable
- Seguir principios de Atomic Design

### Mejores Prácticas
- Siempre usar `ProtectedRoute` para rutas que requieren autenticación
- Validar permisos antes de mostrar contenido restringido
- Manejar estados de carga y error en todas las peticiones
- Usar modales para feedback al usuario
- Mantener el código limpio y bien documentado
