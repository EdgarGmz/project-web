# Matriz de Permisos por Rol

## Resumen de Jerarquía
**Owner** > **Admin** > **Supervisor** > **Cashier**

---

## Tabla de Permisos por Módulo

| Módulo | Owner | Admin | Supervisor | Cashier |
|--------|-------|-------|------------|---------|
| **Dashboard** | ✅ Acceso completo | ✅ Acceso completo | ✅ Acceso completo | ✅ Acceso limitado |
| **POS (Punto de Venta)** | ❌ Sin acceso | ❌ Sin acceso | ✅ Acceso completo | ✅ Acceso completo (Página principal) |
| **Productos** | ✅ CRUD completo | 📖 Solo lectura | ✅ CRUD completo | 📖 Solo lectura |
| **Clientes** | 📖 Solo lectura | ✅ CRUD completo | ✅ CRUD completo | ✅ CRUD completo |
| **Ventas** | 📖 Solo lectura | ✅ CRUD completo | ✅ CRUD completo | 📖 Solo lectura (puede crear vía POS) |
| **Inventario** | ✅ CRUD completo | ✅ CRUD completo | 📖 Solo lectura | ❌ Sin acceso |
| **Compras** | ✅ CRUD completo | ✅ CRUD completo | ❌ Sin acceso | ❌ Sin acceso |
| **Devoluciones** | ✅ CRUD completo | ✅ CRUD completo | ✅ CRUD completo | ❌ Sin acceso |
| **Reportes** | ✅ Acceso completo | ✅ Acceso completo | ❌ Sin acceso | ❌ Sin acceso |
| **Pagos** | ✅ Acceso completo | ✅ Acceso completo | ❌ Sin acceso | ❌ Sin acceso |
| **Usuarios** | ✅ CRUD completo | ✅ CRUD completo | ❌ Sin acceso | ❌ Sin acceso |
| **Sucursales** | ✅ CRUD completo | 📖 Solo lectura | ❌ Sin acceso | ❌ Sin acceso |
| **Perfil** | ✅ Acceso | ✅ Acceso | ✅ Acceso | ✅ Acceso |
| **Configuración** | ✅ Acceso completo | ✅ Acceso completo | ✅ Acceso limitado | ✅ Acceso limitado |

---

## Permisos Detallados por Rol

### 🔑 Owner (Propietario)
**Descripción**: Máximo nivel de autoridad, gestión completa del sistema excepto operaciones de caja.

#### Acceso Completo (CRUD)
- ✅ Productos (crear, editar, eliminar, ver)
- ✅ Inventario (ajustes, movimientos, transferencias)
- ✅ Compras (órdenes, recepción, proveedores)
- ✅ Devoluciones (procesar, aprobar)
- ✅ Reportes (ventas, inventario, financieros)
- ✅ Pagos (gestión de pagos y cobros)
- ✅ Usuarios (crear, editar, eliminar, asignar roles)
- ✅ Sucursales (crear, editar, eliminar, asignar usuarios)

#### Solo Lectura
- 📖 Ventas (ver historial, no puede crear/editar)
- 📖 Clientes (ver información, no puede modificar)

#### Sin Acceso
- ❌ POS (no opera caja directamente)

#### Privilegios Especiales
- 🌐 Acceso global a todas las sucursales
- 👥 Puede gestionar todos los usuarios del sistema
- 🏢 Único rol que puede crear/eliminar sucursales

---

### 👔 Admin (Administrador)
**Descripción**: Gestión operativa y administrativa, segundo nivel de autoridad.

#### Acceso Completo (CRUD)
- ✅ Inventario (ajustes, movimientos, transferencias)
- ✅ Compras (órdenes, recepción, proveedores)
- ✅ Devoluciones (procesar, aprobar)
- ✅ Reportes (ventas, inventario, financieros)
- ✅ Pagos (gestión de pagos y cobros)
- ✅ Usuarios (crear, editar, eliminar usuarios no-owner)
- ✅ Clientes (crear, editar, eliminar)
- ✅ Ventas (gestionar ventas, no crear nuevas)

#### Solo Lectura
- 📖 Productos (ver catálogo, no puede modificar)
- 📖 Sucursales (ver información de sucursales)

#### Sin Acceso
- ❌ POS (no opera caja)
- ❌ Creación/eliminación de productos
- ❌ Creación/eliminación de sucursales

#### Privilegios Especiales
- 🌐 Acceso global a todas las sucursales
- 👥 Puede gestionar usuarios excepto owners
- 📊 Acceso completo a reportes financieros

---

### 👨‍💼 Supervisor
**Descripción**: Gestión de ventas y operaciones de sucursal, supervisión de equipo.

#### Acceso Completo (CRUD)
- ✅ POS (operar punto de venta)
- ✅ Ventas (crear, editar, eliminar ventas)
- ✅ Productos (crear, editar, eliminar productos)
- ✅ Clientes (crear, editar, eliminar)
- ✅ Devoluciones (procesar devoluciones)

#### Solo Lectura
- 📖 Inventario (ver stock, no puede ajustar)

#### Sin Acceso
- ❌ Usuarios (no puede gestionar personal)
- ❌ Sucursales (no puede ver otras sucursales)
- ❌ Compras (no gestiona proveedores)
- ❌ Reportes (no genera reportes)
- ❌ Pagos (no gestiona pagos)

#### Restricciones
- 🏢 Solo puede ver/gestionar su sucursal asignada
- 👥 No puede crear ni modificar usuarios
- 📦 Puede solicitar productos pero no ajustar inventario

---

### 💰 Cashier (Cajero)
**Descripción**: Operación de caja, atención al cliente, rol más restrictivo.

#### Acceso Completo (CRUD)
- ✅ POS (página principal, operar punto de venta)
- ✅ Clientes (crear, editar clientes de su sucursal)

#### Solo Lectura
- 📖 Productos (consultar catálogo y precios)
- 📖 Ventas (ver historial de ventas)

#### Sin Acceso
- ❌ Usuarios
- ❌ Sucursales
- ❌ Inventario
- ❌ Compras
- ❌ Reportes
- ❌ Pagos
- ❌ Devoluciones
- ❌ Editar/eliminar productos

#### Restricciones
- 🏢 Solo puede ver/gestionar su sucursal asignada
- 💳 Puede crear ventas únicamente a través del POS
- 📋 No puede modificar ventas existentes
- 🚫 No puede procesar devoluciones

#### Comportamiento Especial
- 🎯 **Página de inicio**: POS (redirige automáticamente al login)
- 👤 Solo puede ver/editar clientes de su propia sucursal

---

## Notas de Implementación

### Seguridad
1. **Backend**: Todas las rutas están protegidas con middleware `authorize(...roles)`
2. **Frontend**: Triple capa de protección:
   - Sidebar: Elementos de menú filtrados por rol
   - Rutas: `ProtectedRoute` valida acceso
   - Componentes: `hasPermission()` oculta botones CRUD

### Acceso a Sucursales
- **Owner y Admin**: Acceso global a todas las sucursales
- **Supervisor y Cashier**: Solo su sucursal asignada (validado con `checkBranchAccess`)

### Flujo de Login
```javascript
// Owner/Admin/Supervisor → /dashboard
// Cashier → /pos (automático)
```

### Jerarquía de Roles
```
owner > admin > supervisor > cashier
```

### Permisos Heredados
Los roles NO heredan permisos de roles inferiores. Cada rol tiene su matriz específica de permisos.

---

**Última actualización**: 15 de noviembre de 2025  
**Branch**: `roles`  
**Estado**: ✅ Implementación completa en backend y frontend
