# 🛒 Proyecto 7: Sistema de Gestión de Inventario y Punto de Venta

---

## 📚 Menú de Navegación

- [📝 Descripción General](#descripcion-general)
- [🦺 S-SDLC (Secure Software Development Life Cycle)](#s-sdlc)
- [🏗️ Arquitectura Recomendada](#arquitectura)
- [🚀 Requerimientos Funcionales Clave](#requerimientos)
- [🗂️ Modelo de Datos Sugerido](#modelo-datos)
- [📆 Milestones Semanales](#milestones)
- [🛠️ Tecnologías Sugeridas](#tecnologias)
- [📚 Cobertura de Temas del Cronograma](#cobertura)
- [🔌 Realtime y Comunicación](#realtime)
- [🧩 Prerrequisitos Antes de Comenzar](#prerrequisitos)
- [🔗 Navegación Rápida](#navegacion)
- [🛡️ Configurar clave SSH para GitHub](#clave-ssh)
- [📥 Clonar el repositorio](#clonar)
- [🏁 Primeros pasos para iniciar el proyecto](#iniciar)
- [🔄 Flujo de trabajo con Git & GitHub](#flujo-git)
- [🚩 Pull Requests](#pull-request)
- [🖼️ Ayudas Visuales](#ayudas)
- [🆘 Dudas o Problemas](#dudas)

---

<a name="descripcion-general"></a>
## 📝 Descripción General
Plataforma integral para la gestión de inventarios, ventas y facturación de **PYMES**. Permite a propietarios, empleados y supervisores gestionar productos, procesar ventas, controlar stock y generar reportes en tiempo real.

[🔝 Volver al menú](#-menú-de-navegación)

---

<a name="s-sdlc"></a>
## 🦺 S-SDLC (Secure Software Development Life Cycle)

El **S-SDLC** es un enfoque que integra la seguridad en todas las fases del ciclo de desarrollo de software, garantizando que desde el análisis y diseño hasta el despliegue y mantenimiento, la seguridad sea prioritaria.

### 🔒 Fases del S-SDLC
1. **Requerimientos seguros:** Identificación de amenazas y requisitos de seguridad desde el inicio.
2. **Diseño seguro:** Modelado de amenazas, diseño de controles y arquitecturas seguras.
3. **Programación segura:** Uso de buenas prácticas de codificación y revisión de código.
4. **Pruebas de seguridad:** Tests automatizados y manuales, análisis de vulnerabilidades.
5. **Despliegue y mantenimiento seguro:** Monitoreo, parches y gestión de incidentes.

[🔝 Volver al menú](#-menú-de-navegación)

---

<a name="arquitectura"></a>
## 🏗️ Arquitectura Clean/Hexagonal + Microservicios (o Modular Monolito)

- **Clean/Hexagonal Architecture:** Promueve una separación estricta entre el dominio del negocio, la lógica de aplicación y las dependencias externas.
- **Microservicios:** Cada módulo crítico (usuarios, inventario, ventas, reportes, etc.) puede ser desplegado y escalado de forma independiente.
- **Modular Monolito:** Si el sistema inicia pequeño, se puede desarrollar como un monolito bien organizado en módulos, permitiendo migrar fácilmente a microservicios en el futuro.

### 🧩 Componentes Clave
- **API Gateway**
- **Frontend desacoplado (SPA)**
- **Backend Modular**
- **Base de datos relacional (PostgreSQL)**
- **Caché y colas (Redis, RabbitMQ)**
- **Comunicación en tiempo real (Socket.IO)**

### 📊 Diagrama Resumido

```
[Frontend SPA]
     |
[API Gateway] ---- [Auth Service]
     |                   |
-------------------------------
|   |   |   |   |   |   |   |
Inv Prod Vent Fact Rep Notif Sucur
|   |   |   |   |   |   |   |
-------------- PostgreSQL -------------
                    |
               [Redis/Cache]
```

[🔝 Volver al menú](#-menú-de-navegación)

---

<a name="requerimientos"></a>
## 🚀 Requerimientos Funcionales Clave

### 🧩 Funcionalidades Básicas
- 🔐 Autenticación por roles
- 📦 Gestión completa de inventario con alertas
- 🛍️ Punto de venta (POS) con código de barras
- 🧾 Facturación electrónica
- 🏪 Control de múltiples sucursales
- 📊 Reportes de ventas
- 🚚 Gestión de proveedores

### ✨ Funcionalidades Avanzadas
- ⚠️ Notificaciones automáticas
- 📈 Dashboard en tiempo real
- ↩️ Sistema de devoluciones
- 💳 Integración con pagos
- 👀 Auditoría completa

[🔝 Volver al menú](#-menú-de-navegación)

---

<a name="modelo-datos"></a>
## 🗂️ Modelo de Datos Sugerido

Incluye tablas como:  
`users`, `branches`, `products`, `inventory`, `sales`, `sale_items`, `customers`, `user_sessions`

# Tablas del Sistema

## Tabla: `users`
| Campo        | Tipo                                   | Descripción              |
|--------------|----------------------------------------|--------------------------|
| id           | INT PRIMARY KEY                        | Identificador único      |
| email        | VARCHAR(255) UNIQUE                    | Email del usuario        |
| password     | VARCHAR(255)                           | Contraseña encriptada    |
| first_name   | VARCHAR(100)                           | Nombre                   |
| last_name    | VARCHAR(100)                           | Apellido                 |
| role         | ENUM('owner', 'supervisor', 'cashier', 'admin', 'auditor') | Rol          |
| employee_id  | VARCHAR(20) UNIQUE                     | ID de empleado           |
| phone        | VARCHAR(20)                            | Teléfono                 |
| hire_date    | DATE                                   | Fecha de contratación    |
| branch_id    | INT FOREIGN KEY                        | ID de sucursal asignada  |
| permissions  | JSON                                   | Permisos específicos     |
| is_active    | BOOLEAN                                | Estado activo            |
| last_login   | TIMESTAMP                              | Último acceso            |
| reset_token  | VARCHAR(255)                           | Token de reset           |

---

## Tabla: `branches`
| Campo        | Tipo           | Descripción          |
|--------------|----------------|----------------------|
| id           | INT PRIMARY KEY| Identificador único  |
| name         | VARCHAR(255)   | Nombre de la sucursal|
| address      | TEXT           | Dirección            |
| phone        | VARCHAR(20)    | Teléfono             |
| manager_id   | INT FOREIGN KEY| ID del gerente       |
| is_active    | BOOLEAN        | Sucursal activa      |
| opening_hours| JSON           | Horarios de apertura |
| created_at   | TIMESTAMP      | Fecha de creación    |

---

## Tabla: `products`
| Campo         | Tipo                | Descripción         |
|---------------|---------------------|---------------------|
| id            | INT PRIMARY KEY     | Identificador único |
| sku           | VARCHAR(50) UNIQUE  | Código SKU          |
| barcode       | VARCHAR(100)        | Código de barras    |
| name          | VARCHAR(255)        | Nombre del producto |
| description   | TEXT                | Descripción         |
| category_id   | INT FOREIGN KEY     | ID de categoría     |
| supplier_id   | INT FOREIGN KEY     | ID del proveedor    |
| cost_price    | DECIMAL(10,2)       | Precio de costo     |
| selling_price | DECIMAL(10,2)       | Precio de venta     |
| tax_rate      | DECIMAL(5,2)        | Tasa de impuesto    |
| unit_of_measure| VARCHAR(20)        | Unidad de medida    |
| image_url     | VARCHAR(255)        | URL de imagen       |
| is_active     | BOOLEAN             | Producto activo     |
| created_at    | TIMESTAMP           | Fecha de creación   |
| updated_at    | TIMESTAMP           | Última actualización|

---

## Tabla: `inventory`
| Campo           | Tipo            | Descripción          |
|-----------------|-----------------|----------------------|
| id              | INT PRIMARY KEY | Identificador único  |
| product_id      | INT FOREIGN KEY | ID del producto      |
| branch_id       | INT FOREIGN KEY | ID de la sucursal    |
| current_stock   | INT             | Stock actual         |
| minimum_stock   | INT             | Stock mínimo         |
| maximum_stock   | INT             | Stock máximo         |
| reserved_stock  | INT             | Stock reservado      |
| last_restock_date| DATE           | Fecha último restock |
| expiry_date     | DATE            | Fecha de vencimiento |
| location        | VARCHAR(100)    | Ubicación en almacén |
| last_count_date | DATE            | Fecha último conteo  |

---

## Tabla: `sales`
| Campo           | Tipo                                   | Descripción          |
|-----------------|----------------------------------------|----------------------|
| id              | INT PRIMARY KEY                        | Identificador único  |
| invoice_number  | VARCHAR(50) UNIQUE                     | Número de factura    |
| branch_id       | INT FOREIGN KEY                        | ID de sucursal       |
| cashier_id      | INT FOREIGN KEY                        | ID del cajero        |
| customer_id     | INT FOREIGN KEY                        | ID del cliente       |
| sale_date       | TIMESTAMP                              | Fecha de venta       |
| subtotal        | DECIMAL(12,2)                          | Subtotal             |
| tax_amount      | DECIMAL(12,2)                          | Monto de impuestos   |
| discount_amount | DECIMAL(12,2)                          | Monto de descuento   |
| total_amount    | DECIMAL(12,2)                          | Total                |
| payment_method  | VARCHAR(50)                            | Método de pago       |
| payment_status  | ENUM('pending', 'paid', 'partial', 'refunded') | Estado       |
| notes           | TEXT                                   | Notas adicionales    |
| is_voided       | BOOLEAN                                | Venta anulada        |

---

## Tabla: `sale_items`
| Campo              | Tipo            | Descripción          |
|--------------------|-----------------|----------------------|
| id                 | INT PRIMARY KEY | Identificador único  |
| sale_id            | INT FOREIGN KEY | ID de la venta       |
| product_id         | INT FOREIGN KEY | ID del producto      |
| quantity           | DECIMAL(10,2)   | Cantidad             |
| unit_price         | DECIMAL(10,2)   | Precio unitario      |
| discount_percentage| DECIMAL(5,2)    | Porcentaje de descuento|
| line_total         | DECIMAL(12,2)   | Total de línea       |

---

## Tabla: `customers`
| Campo           | Tipo                | Descripción              |
|-----------------|---------------------|--------------------------|
| id              | INT PRIMARY KEY     | Identificador único      |
| customer_code   | VARCHAR(20) UNIQUE  | Código de cliente        |
| first_name      | VARCHAR(100)        | Nombre                   |
| last_name       | VARCHAR(100)        | Apellido                 |
| email           | VARCHAR(255)        | Email                    |
| phone           | VARCHAR(20)         | Teléfono                 |
| address         | TEXT                | Dirección                |
| tax_id          | VARCHAR(50)         | RUC/NIT                  |
| credit_limit    | DECIMAL(12,2)       | Límite de crédito        |
| current_balance | DECIMAL(12,2)       | Saldo actual             |
| is_active       | BOOLEAN             | Cliente activo           |
| registration_date| TIMESTAMP          | Fecha de registro        |

---

## Tabla: `user_sessions`
| Campo        | Tipo                  | Descripción            |
|--------------|-----------------------|------------------------|
| id           | VARCHAR(255) PRIMARY KEY | ID de sesión        |
| user_id      | INT FOREIGN KEY       | ID del usuario         |
| branch_id    | INT FOREIGN KEY       | ID de sucursal         |
| ip_address   | VARCHAR(45)           | Dirección IP           |
| pos_terminal | VARCHAR(50)           | Terminal POS           |
| created_at   | TIMESTAMP             | Fecha de creación      |
| expires_at   | TIMESTAMP             | Fecha de expiración    |
| last_activity| TIMESTAMP             | Última actividad       |


[🔝 Volver al menú](#-menú-de-navegación)

---

<a name="milestones"></a>
## 📆 Milestones Semanales

| 📅 Semana | 🎯 Entregable | 🧩 Cobertura |
|--------|------------|-----------|
| **1** | Arquitectura base | Estructura WEB |
| **2** | Login, roles y permisos | Autenticación |
| **3** | Control de acceso | Protección de rutas |
| **4** | Inventario y productos | CRUD |
| **5** | Punto de Venta | Validación, pagos |
| **6** | Dashboard dinámico | Gráficos |
| **7** | Recuperación acceso | Auditoría |
| **8** | Reportes y analytics | Exportación |
| **9** | Optimización | Seguridad |
| **10**| Despliegue | Documentación |

[🔝 Volver al menú](#-menú-de-navegación)

---

<a name="tecnologias"></a>
## 🛠️ Tecnologías Sugeridas

- **Frontend:** React / Vue.js
- **Backend:** Node.js / Express o Laravel
- **API Gateway:** Kong, Nginx
- **Base de Datos:** PostgreSQL
- **Realtime:** Socket.io
- **Caché/Colas:** Redis, RabbitMQ
- **Reports:** jsPDF, ExcelJS
- **Pagos:** Stripe, PayPal

[🔝 Volver al menú](#-menú-de-navegación)

---

<a name="cobertura"></a>
## 📚 Cobertura de Temas del Cronograma

- 🏗️ Estructura del sitio WEB  
- 🔍 Búsquedas avanzadas  
- ✔️ Validaciones  
- 🔄 Actualizaciones dinámicas  
- 🟢 Notificaciones en tiempo real  
- 🎞️ Animaciones  
- 🛡️ Multirol empresarial  
- 🔁 Multisesiones POS  
- 🔑 Reset seguro  
- 🚦 Autorización granular  

[🔝 Volver al menú](#-menú-de-navegación)

---

<a name="realtime"></a>
## 🔌 Realtime y Comunicación
**Socket.IO** para actualizaciones en tiempo real de stock, ventas y notificaciones.

[🔝 Volver al menú](#-menú-de-navegación)

---

<a name="prerrequisitos"></a>
## 🧩 Prerrequisitos Antes de Comenzar

| 💻 Software      | 📋 Descripción             | 🔗 Enlace |
|-----------------|---------------------------|-----------|
| Node.js + npm   | Entorno JS    | [Descargar](https://nodejs.org/en/download/) |
| Git             | Control de versiones | [Descargar](https://git-scm.com/downloads) |
| GitHub          | Plataforma colaborativa | [Regístrate](https://github.com/join) |
| Docker          | Automatización despliegues | [Descargar](https://www.docker.com/products/docker-desktop/) |
| PostgreSQL/SQL Server | Base de datos | [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) |

[🔝 Volver al menú](#-menú-de-navegación)

---

<a name="navegacion"></a>
## 🔗 Navegación Rápida

- [Configurar clave SSH](#clave-ssh)  
- [Clonar repositorio](#clonar)  
- [Iniciar proyecto](#iniciar)  
- [Flujo de Git](#flujo-git)  
- [Pull Requests](#pull-request)  

[🔝 Volver al menú](#-menú-de-navegación)

---

<a name="clave-ssh"></a>
## 🛡️ Configurar clave SSH para GitHub

```bash
ssh-keygen -t ed25519 -C "tu_email@example.com"
```

Luego agregar la clave pública en GitHub > Settings > SSH and GPG keys.

[🔝 Volver al menú](#-menú-de-navegación)

---

<a name="clonar"></a>
## 📥 Clonar el repositorio

```bash
git clone git@github.com:EdgarGmz/project-web.git
```

[🔝 Volver al menú](#-menú-de-navegación)

---

<a name="iniciar"></a>
## 🏁 Primeros pasos para iniciar el proyecto (Frontend)

```bash
cd project-web/api-web
npm install
npm run dev
```

Abrir: [http://localhost:3000](http://localhost:3000)

[🔝 Volver al menú](#-menú-de-navegación)

---

<a name="flujo-git"></a>
## 🔄 Flujo de trabajo con Git & GitHub

- **main:** Producción  
- **develop:** Integración  
- **feature/**, **fix/**, **hotfix/**  

Ejemplo de flujo:

```bash
git checkout develop
git pull
git checkout -b feature/nombre-issue
git add .
git commit -m "cambios"
git push origin feature/nombre-issue
```

[🔝 Volver al menú](#-menú-de-navegación)

---

<a name="pull-request"></a>
## 🚩 Pull Requests

1. Subir tu rama.  
2. Click en **Compare & pull request**.  
3. Seleccionar `develop` como base.  
4. Crear el PR.  

[🔝 Volver al menú](#-menú-de-navegación)

---

<a name="ayudas"></a>
## 🖼️ Ayudas Visuales

- [Guía oficial de GitHub para Pull Requests](https://docs.github.com/en/pull-requests)  
- [Documentación de Node.js](https://nodejs.org/en/docs/)  
- [Documentación de Next.js](https://nextjs.org/docs)  
- [Guía rápida de Docker](https://docs.docker.com/get-started/overview/)  

[🔝 Volver al menú](#-menú-de-navegación)

---

<a name="dudas"></a>
## 🆘 Dudas o Problemas

- Revisar [documentación oficial de GitHub](https://docs.github.com/en)  
- Consultar al equipo en el canal de comunicación interna.  

[🔝 Volver al menú](#-menú-de-navegación)

---

> ✅ Ahora cada sección tiene un link para volver al menú principal.  
