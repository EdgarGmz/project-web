# Sistema de Logs - Documentación

## 📋 Descripción

Sistema completo de auditoría y logs para rastrear todas las acciones de los usuarios en el sistema.

## 🗄️ Modelo Log

### Campos
- `id` (UUID): Identificador único del log
- `user_id` (UUID): ID del usuario que realiza la acción
- `action` (STRING): Tipo de acción (CREATE, UPDATE, DELETE, LOGIN, etc.)
- `service` (STRING): Módulo/servicio donde se realiza la acción
- `message` (TEXT): Descripción detallada de la acción
- `created_at` (DATE): Fecha de creación
- `updated_at` (DATE): Fecha de última actualización
- `deleted_at` (DATE): Fecha de eliminación (soft delete)

### Asociaciones
- `belongsTo` User: Cada log pertenece a un usuario

## 🛣️ Rutas API

Todas las rutas requieren autenticación y están restringidas a roles `owner` y `admin`.

### GET /api/logs
Obtiene todos los logs con filtros y paginación.

**Query Parameters:**
- `page` (number): Número de página
- `limit` (number): Resultados por página (default: 50)
- `user_id` (UUID): Filtrar por usuario
- `action` (string): Filtrar por tipo de acción
- `service` (string): Filtrar por servicio
- `startDate` (date): Fecha inicial
- `endDate` (date): Fecha final
- `search` (string): Buscar en mensaje

**Ejemplo:**
```bash
GET /api/logs?page=1&limit=20&service=products&action=CREATE
```

### GET /api/logs/:id
Obtiene un log específico por ID.

**Ejemplo:**
```bash
GET /api/logs/57664af9-b24d-45a3-8ae0-25685c8f1f77
```

### GET /api/logs/user/:userId
Obtiene todos los logs de un usuario específico.

**Ejemplo:**
```bash
GET /api/logs/user/88fee13a-7b05-4bce-86af-9db1ad86bf4d?page=1&limit=50
```

### GET /api/logs/stats
Obtiene estadísticas de logs (acciones más frecuentes, usuarios más activos, etc.).

**Query Parameters:**
- `startDate` (date): Fecha inicial
- `endDate` (date): Fecha final

**Ejemplo:**
```bash
GET /api/logs/stats?startDate=2025-11-01&endDate=2025-11-30
```

### POST /api/logs
Crea un nuevo log manualmente.

**Body:**
```json
{
  "user_id": "88fee13a-7b05-4bce-86af-9db1ad86bf4d",
  "action": "CREATE",
  "service": "products",
  "message": "Usuario creó un nuevo producto: Gaming Mouse Pro"
}
```

### DELETE /api/logs/cleanup?days=90
Elimina logs antiguos (solo `owner`).

**Query Parameters:**
- `days` (number): Eliminar logs más antiguos que X días

**Ejemplo:**
```bash
DELETE /api/logs/cleanup?days=90
```

## 🔧 Servicio de Logs

### Uso Básico

```javascript
const { logService } = require('../../services');
const { ACTIONS } = logService;

// Ejemplo en un controlador
const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        
        // Registrar la acción
        await logService.logProduct(
            req.user.id, 
            ACTIONS.CREATE, 
            `Usuario creó el producto: ${product.name}`
        );
        
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        // Registrar error
        await logService.logProduct(
            req.user.id, 
            ACTIONS.ERROR, 
            `Error al crear producto: ${error.message}`
        );
        
        res.status(500).json({ success: false, message: error.message });
    }
};
```

### Funciones Disponibles

#### Función Principal
```javascript
logService.createLog(userId, action, service, message)
```

#### Funciones por Módulo
- `logAuth(userId, action, message)` - Autenticación
- `logProduct(userId, action, message)` - Productos
- `logCustomer(userId, action, message)` - Clientes
- `logSale(userId, action, message)` - Ventas
- `logInventory(userId, action, message)` - Inventario
- `logPurchase(userId, action, message)` - Compras
- `logReturn(userId, action, message)` - Devoluciones
- `logPayment(userId, action, message)` - Pagos
- `logReport(userId, action, message)` - Reportes
- `logUser(userId, action, message)` - Usuarios
- `logBranch(userId, action, message)` - Sucursales
- `logSettings(userId, action, message)` - Configuración

### Constantes

#### ACTIONS
```javascript
{
    CREATE: 'CREATE',
    READ: 'READ',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    VIEW: 'VIEW',
    EXPORT: 'EXPORT',
    IMPORT: 'IMPORT',
    APPROVE: 'APPROVE',
    REJECT: 'REJECT',
    ERROR: 'ERROR'
}
```

#### SERVICES
```javascript
{
    AUTH: 'auth',
    USERS: 'users',
    PRODUCTS: 'products',
    CUSTOMERS: 'customers',
    SALES: 'sales',
    INVENTORY: 'inventory',
    PURCHASES: 'purchases',
    RETURNS: 'returns',
    PAYMENTS: 'payments',
    REPORTS: 'reports',
    BRANCHES: 'branches',
    SETTINGS: 'settings'
}
```

## 📝 Ejemplos de Implementación

### Ejemplo 1: Login de Usuario
```javascript
// authController.js
const { logService, ACTIONS } = require('../../services/logService');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        
        if (user && await bcrypt.compare(password, user.password)) {
            const token = generateToken(user);
            
            // Registrar login exitoso
            await logService.logAuth(
                user.id,
                ACTIONS.LOGIN,
                `Usuario ${user.email} inició sesión exitosamente desde IP ${req.ip}`
            );
            
            return res.json({ success: true, token });
        }
        
        // Registrar intento fallido
        await logService.logAuth(
            user?.id || 'unknown',
            ACTIONS.ERROR,
            `Intento de login fallido para email: ${email}`
        );
        
        res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
```

### Ejemplo 2: Actualización de Producto
```javascript
// productController.js
const { logService, ACTIONS } = require('../../services/logService');

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const oldProduct = await Product.findByPk(id);
        
        const product = await Product.update(req.body, { where: { id } });
        
        // Registrar cambios específicos
        const changes = [];
        if (oldProduct.name !== req.body.name) {
            changes.push(`Nombre: ${oldProduct.name} → ${req.body.name}`);
        }
        if (oldProduct.price !== req.body.price) {
            changes.push(`Precio: $${oldProduct.price} → $${req.body.price}`);
        }
        
        await logService.logProduct(
            req.user.id,
            ACTIONS.UPDATE,
            `Producto ${id} actualizado. Cambios: ${changes.join(', ')}`
        );
        
        res.json({ success: true, data: product });
    } catch (error) {
        await logService.logProduct(
            req.user.id,
            ACTIONS.ERROR,
            `Error actualizando producto ${id}: ${error.message}`
        );
        res.status(500).json({ success: false, message: error.message });
    }
};
```

### Ejemplo 3: Eliminación de Cliente
```javascript
// customerController.js
const { logService, ACTIONS } = require('../../services/logService');

const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customer.findByPk(id);
        
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        }
        
        await Customer.destroy({ where: { id } });
        
        await logService.logCustomer(
            req.user.id,
            ACTIONS.DELETE,
            `Cliente eliminado: ${customer.first_name} ${customer.last_name} (${customer.email})`
        );
        
        res.json({ success: true, message: 'Cliente eliminado' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
```

### Ejemplo 4: Generación de Reporte
```javascript
// reportController.js
const { logService, ACTIONS } = require('../../services/logService');

const generateSalesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        const report = await generateReport(startDate, endDate);
        
        await logService.logReport(
            req.user.id,
            ACTIONS.EXPORT,
            `Reporte de ventas generado para el período ${startDate} - ${endDate}`
        );
        
        res.json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
```

## 🔍 Consultas y Filtros

### Consultar logs de las últimas 24 horas
```bash
GET /api/logs?startDate=2025-11-15T00:00:00Z&endDate=2025-11-16T00:00:00Z
```

### Logs de un usuario específico
```bash
GET /api/logs/user/88fee13a-7b05-4bce-86af-9db1ad86bf4d
```

### Logs de creación de productos
```bash
GET /api/logs?service=products&action=CREATE
```

### Buscar en mensajes
```bash
GET /api/logs?search=PlayStation
```

### Estadísticas del mes actual
```bash
GET /api/logs/stats?startDate=2025-11-01&endDate=2025-11-30
```

## 🧹 Mantenimiento

### Limpieza Automática
Para mantener la base de datos optimizada, se recomienda ejecutar periódicamente:

```bash
DELETE /api/logs/cleanup?days=90
```

Esto eliminará logs más antiguos de 90 días usando soft delete.

## 🔐 Seguridad

- ✅ Todas las rutas requieren autenticación
- ✅ Solo `owner` y `admin` pueden acceder a los logs
- ✅ Solo `owner` puede eliminar logs
- ✅ Soft delete habilitado para recuperación
- ✅ Los logs se crean de forma no-bloqueante (no interrumpen el flujo principal)

## 📊 Base de Datos

### Índices Creados
- `user_id`: Para consultas por usuario
- `action`: Para filtrar por tipo de acción
- `service`: Para filtrar por módulo
- `created_at`: Para consultas por fecha

Estos índices optimizan las consultas y mejoran el rendimiento.
