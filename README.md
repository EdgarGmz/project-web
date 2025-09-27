# 🛒 Proyecto #7: Sistema de Inventario, Ventas y Facturación de PYMES

Este proyecto consiste en el desarrollo de un sistema integral para la gestión de inventario, ventas y facturación dirigido a pequeñas y medianas empresas (PYMES). El sistema permite registrar productos 🏷️, controlar el stock 📦, gestionar ventas 🧾 y emitir facturas 🧾 de manera eficiente, facilitando la administración 🧑‍💼 y el seguimiento 📊 de las operaciones comerciales.



# PLANEACIÓN
## 🛡️ S-SDLC: Ciclo de Vida de Desarrollo de Software Seguro

### 1️⃣ Planificación / Requerimientos

**Objetivo:** Definir qué se va a construir y cuáles son los riesgos de seguridad.

**Actividades clave:**
- 🔍 Análisis de riesgos y amenazas.
- 📝 Definir requerimientos de seguridad (confidencialidad, integridad, disponibilidad, autenticación, autorización, auditoría).
- 📜 Considerar regulaciones y normas (ej. ISO 27001, GDPR, OWASP SAMM).

---

### 2️⃣ Diseño

**Objetivo:** Establecer una arquitectura segura.

**Actividades clave:**
- 🕵️ Modelado de amenazas (ej. STRIDE).
- 🏗️ Selección de patrones y arquitecturas seguras.
- 🛡️ Uso de principios de diseño seguro (mínimo privilegio, defensa en profundidad, fail-safe, etc.).
- 🔒 Definir controles de seguridad (cifrado, hashing, firewalls lógicos, etc.).

---

### 3️⃣ Desarrollo / Codificación

**Objetivo:** Implementar siguiendo prácticas de programación segura.

**Actividades clave:**
- 📚 Aplicar guías de codificación segura (ej. OWASP Secure Coding Practices).
- 👀 Revisiones de código (manuales y automatizadas).
- 🧪 Escaneo estático de seguridad (SAST).
- 🚫 Evitar vulnerabilidades comunes (inyección SQL, XSS, CSRF, malas validaciones).

---

### 4️⃣ Pruebas / Verificación

**Objetivo:** Validar que el software cumple con los requisitos de seguridad.

**Actividades clave:**
- 🧪 Pruebas dinámicas de seguridad (DAST).
- 📦 Análisis de dependencias y librerías de terceros (SCA).
- 🕵️ Ethical hacking / pruebas de penetración.
- ✅ Validar autenticación, autorización, manejo de errores y logging.

---

### 5️⃣ Despliegue / Implementación

**Objetivo:** Asegurar que el software se libere en un entorno seguro.

**Actividades clave:**
- ⚙️ Configuración segura del entorno (servidores, redes, base de datos).
- 🩹 Aplicación de parches y actualizaciones.
- 👤 Revisar accesos y roles de usuarios.
- 📈 Monitoreo inicial tras la puesta en producción.

---

### 6️⃣ Mantenimiento / Operación

**Objetivo:** Mantener la seguridad a lo largo del ciclo de vida.

**Actividades clave:**
- 🔎 Monitoreo continuo de incidentes y vulnerabilidades.
- 🩹 Aplicar parches de seguridad y actualizaciones.
- 📋 Auditorías y revisiones periódicas.
- 🚨 Plan de respuesta ante incidentes.

---

#### ✅ Beneficios de aplicar S-SDLC

>- 💸 Reducción de costos al corregir vulnerabilidades (más barato en diseño que en producción).
>- 🤝 Mejora la confianza de usuarios y clientes.
>- 📑 Cumplimiento normativo y reducción de riesgos legales.
>- 🏗️ Software más robusto y mantenible.


## Stack Tecnológico Sugerido

A continuación se presenta una descripción clara y estructurada de las tecnologías seleccionadas para cada capa del desarrollo del sistema:

### 🖥️ Frontend

- **Lenguaje:** JavaScript/TypeScript
- **Framework/Biblioteca:** [React](https://react.dev/) (con [Vite](https://vitejs.dev/) como herramienta de desarrollo)
- **Arquitectura:** Atomic Design para organización y reutilización de componentes
- **Motivo:** React es moderno, escalable y ampliamente adoptado; Vite ofrece desarrollo rápido y eficiente.

### 🖲️ Backend

- **Lenguaje:** JavaScript
- **Framework:** [Node.js](https://nodejs.org/) con [Express](https://expressjs.com/)
- **Arquitectura:** RESTful API, siguiendo principios Clean/Hexagonal para desacoplar lógica de negocio y detalles técnicos
- **Motivo:** Node.js permite alta concurrencia y desarrollo ágil; Express es minimalista y flexible.

### 🗄️ Base de Datos

- **Tipo:** Relacional
- **Motor:** [PostgreSQL](https://www.postgresql.org/)
- **Modelo de datos:** Tablas normalizadas para usuarios, sucursales, productos, inventario, ventas, clientes y sesiones
- **ORM:** [Sequelize](https://sequelize.org/) o [Prisma](https://www.prisma.io/) para acceso seguro y desacoplado a los datos
- **Motivo:** PostgreSQL es robusto, seguro y soporta transacciones complejas; el ORM facilita la gestión de datos.

### 🗂️ Control de versiones

- **Herramienta:** [Git](https://git-scm.com/)
- **Plataforma:** [GitHub](https://github.com/)
- **Repositorio:** [https://github.com/EdgarGmz/project-web](https://github.com/EdgarGmz/project-web)

### ⚙️ Servicios adicionales

- **APIs externas:** Integración opcional con servicios de facturación electrónica y notificaciones (correo/SMS)
- **Despliegue:** [Vercel](https://vercel.com/) o [Netlify](https://www.netlify.com/) para frontend; [Heroku](https://www.heroku.com/) o [Railway](https://railway.app/) para backend y base de datos
- **Herramientas DevOps:** GitHub Actions para CI/CD, Docker para contenedores, monitoreo con [Grafana](https://grafana.com/) o [Prometheus](https://prometheus.io/)
- **Motivo:** Facilitan la integración, despliegue continuo y monitoreo del sistema.

## ⚙️ Justificación técnica de la selección tecnológica

La elección del stack tecnológico se fundamenta en criterios clave para garantizar el éxito y sostenibilidad del proyecto:

- 🧩 **Compatibilidad:** Todas las tecnologías seleccionadas se alinean con los objetivos de un sistema robusto, escalable y seguro para PYMES.
- 📚 **Curva de aprendizaje y experiencia:** El equipo tiene experiencia previa en JavaScript, React, Node.js y bases de datos relacionales, lo que reduce la curva de aprendizaje y acelera el desarrollo.
- 🚀 **Escalabilidad y rendimiento:** React y Node.js permiten construir aplicaciones modulares y escalables; PostgreSQL soporta grandes volúmenes de datos y transacciones complejas.
- 🔒 **Seguridad:** El stack facilita la implementación de buenas prácticas de seguridad, autenticación y control de acceso.
- 🌐 **Comunidad y soporte:** Todas las tecnologías cuentan con comunidades activas, documentación extensa y soporte continuo.
- 🔗 **Integración:** El stack permite una integración sencilla entre frontend, backend, base de datos y servicios externos, optimizando el flujo de trabajo y la interoperabilidad.

Esta selección asegura un desarrollo eficiente, mantenible y alineado con las necesidades del negocio.

La elección de cada tecnología se fundamenta en criterios clave alineados con los objetivos del proyecto y las necesidades de PYMES:

### 🖥️ Frontend: React + Vite

- 🧩 **Compatibilidad:** React es ideal para interfaces dinámicas y modulares, permitiendo una experiencia de usuario fluida y escalable.
- 📚 **Curva de aprendizaje y experiencia:** El equipo cuenta con experiencia previa en React y JavaScript, lo que reduce tiempos de capacitación y errores.
- 🚀 **Escalabilidad y rendimiento:** React facilita la reutilización de componentes y Vite optimiza el desarrollo con recarga rápida y build eficiente.
- 🌐 **Comunidad y soporte:** React tiene una comunidad robusta, abundante documentación y soporte continuo.
- 🔗 **Integración:** React se integra fácilmente con APIs RESTful y herramientas modernas de desarrollo.

### 🖲️ Backend: Node.js + Express

- 🧩 **Compatibilidad:** Node.js permite construir APIs rápidas y escalables, adecuadas para sistemas de ventas y facturación.
- 📚 **Curva de aprendizaje y experiencia:** El equipo domina JavaScript, lo que agiliza el desarrollo fullstack y la resolución de problemas.
- 🔒 **Escalabilidad y seguridad:** Express es flexible y permite implementar buenas prácticas de seguridad y patrones arquitectónicos modernos.
- 🌐 **Comunidad y soporte:** Node.js y Express cuentan con gran cantidad de recursos, librerías y soporte activo.
- 🔗 **Integración:** Facilita la conexión con bases de datos relacionales y servicios externos.

### 🗄️ Base de datos: PostgreSQL + ORM (Sequelize/Prisma)

- 🧩 **Compatibilidad:** PostgreSQL es robusto y soporta transacciones complejas, esenciales para inventario y facturación.
- 📚 **Curva de aprendizaje y experiencia:** El equipo tiene experiencia previa en bases de datos relacionales y ORMs, lo que acelera el desarrollo.
- 🔒 **Escalabilidad y seguridad:** PostgreSQL ofrece alta seguridad, integridad de datos y escalabilidad vertical/horizontal.
- 🌐 **Comunidad y soporte:** Amplia documentación, comunidad activa y soporte empresarial.
- 🔗 **Integración:** Los ORMs seleccionados permiten acceso seguro y desacoplado desde Node.js.

### 🗂️ Control de versiones: Git + GitHub

- 🧩 **Compatibilidad:** Git es estándar en la industria y GitHub facilita la colaboración y gestión de versiones.
- 📚 **Curva de aprendizaje y experiencia:** El equipo utiliza Git en proyectos previos, asegurando eficiencia y control.
- 🔒 **Escalabilidad y seguridad:** GitHub ofrece control de acceso, auditoría y flujos de trabajo CI/CD.
- 🌐 **Comunidad y soporte:** Gran comunidad, documentación y herramientas de integración.
- 🔗 **Integración:** Compatible con DevOps, despliegue automatizado y gestión de issues.

### ⚙️ Servicios adicionales: Vercel/Netlify, Heroku/Railway, Docker, GitHub Actions

- 🧩 **Compatibilidad:** Permiten despliegue ágil y seguro tanto para frontend como backend.
- 📚 **Curva de aprendizaje y experiencia:** El equipo ha trabajado con estas plataformas, facilitando la puesta en producción.
- 🔒 **Escalabilidad y seguridad:** Ofrecen escalabilidad automática, monitoreo y buenas prácticas de seguridad.
- 🌐 **Comunidad y soporte:** Documentación extensa y soporte técnico.
- 🔗 **Integración:** Integración nativa con GitHub y herramientas DevOps para CI/CD y monitoreo.

---

## Base de Datos
>La base de datos está diseñada para soportar la gestión integral de inventario, ventas y facturación en PYMES. Incluye tablas para usuarios, sucursales, productos, inventario, ventas, clientes y sesiones, permitiendo un control detallado de cada aspecto del negocio. La estructura relacional facilita la trazabilidad de operaciones, la seguridad de los datos y la escalabilidad del sistema. Cada entidad está normalizada para evitar redundancias y asegurar integridad referencial, permitiendo consultas eficientes y reportes precisos sobre el estado del inventario, historial de ventas, facturación y administración de usuarios.
### 🧑‍💼 Tabla: users

| 🏷️ Campo         | 📦 Tipo                                      | 📝 Descripción                |
|------------------|----------------------------------------------|-------------------------------|
| 🆔 id            | INT PRIMARY KEY                              | Identificador único           |
| 📧 email         | VARCHAR(255) UNIQUE                          | Email del usuario             |
| 🔒 password      | VARCHAR(255)                                 | Contraseña encriptada         |
| 👤 first_name    | VARCHAR(100)                                 | Nombre                        |
| 👥 last_name     | VARCHAR(100)                                 | Apellido                      |
| 🛡️ role          | ENUM('owner', 'supervisor', 'cashier', 'admin', 'auditor') | Rol                |
| 🏢 employee_id   | VARCHAR(20) UNIQUE                           | ID de empleado                |
| 📱 phone         | VARCHAR(20)                                  | Teléfono                      |
| 📅 hire_date     | DATE                                         | Fecha de contratación         |
| 🏬 branch_id     | INT FOREIGN KEY                              | ID de sucursal asignada       |
| 🗝️ permissions   | JSON                                         | Permisos específicos          |
| ✅ is_active     | BOOLEAN                                      | Estado activo                 |
| ⏰ last_login    | TIMESTAMP                                    | Último acceso                 |
| 🔑 reset_token   | VARCHAR(255)                                 | Token de reset                |

---

### 🏬 Tabla: branches

| 🏷️ Campo        | 📦 Tipo            | 📝 Descripción           |
|-----------------|--------------------|--------------------------|
| 🆔 id           | INT PRIMARY KEY    | Identificador único      |
| 🏢 name         | VARCHAR(255)       | Nombre de la sucursal    |
| 📍 address      | TEXT               | Dirección                |
| 📱 phone        | VARCHAR(20)        | Teléfono                 |
| 👤 manager_id   | INT FOREIGN KEY    | ID del gerente           |
| ✅ is_active    | BOOLEAN            | Sucursal activa          |
| ⏰ opening_hours| JSON               | Horarios de apertura     |
| 🗓️ created_at   | TIMESTAMP          | Fecha de creación        |

---

### 📦 Tabla: products

| 🏷️ Campo           | 📦 Tipo                | 📝 Descripción         |
|--------------------|------------------------|------------------------|
| 🆔 id              | INT PRIMARY KEY        | Identificador único    |
| 🏷️ sku             | VARCHAR(50) UNIQUE     | Código SKU             |
| 🏷️ barcode         | VARCHAR(100)           | Código de barras       |
| 🏷️ name            | VARCHAR(255)           | Nombre del producto    |
| 📝 description     | TEXT                   | Descripción            |
| 🗂️ category_id     | INT FOREIGN KEY        | ID de categoría        |
| 🚚 supplier_id     | INT FOREIGN KEY        | ID del proveedor       |
| 💰 cost_price      | DECIMAL(10,2)          | Precio de costo        |
| 💵 selling_price   | DECIMAL(10,2)          | Precio de venta        |
| 🧾 tax_rate        | DECIMAL(5,2)           | Tasa de impuesto       |
| 📏 unit_of_measure | VARCHAR(20)            | Unidad de medida       |
| 🖼️ image_url       | VARCHAR(255)           | URL de imagen          |
| ✅ is_active       | BOOLEAN                | Producto activo        |
| 🗓️ created_at      | TIMESTAMP              | Fecha de creación      |
| 🔄 updated_at      | TIMESTAMP              | Última actualización   |

---

### 📊 Tabla: inventory

| 🏷️ Campo            | 📦 Tipo            | 📝 Descripción             |
|---------------------|--------------------|----------------------------|
| 🆔 id               | INT PRIMARY KEY    | Identificador único        |
| 📦 product_id       | INT FOREIGN KEY    | ID del producto            |
| 🏬 branch_id        | INT FOREIGN KEY    | ID de la sucursal          |
| 📈 current_stock    | INT                | Stock actual               |
| 📉 minimum_stock    | INT                | Stock mínimo               |
| 📈 maximum_stock    | INT                | Stock máximo               |
| 📦 reserved_stock   | INT                | Stock reservado            |
| 📅 last_restock_date| DATE               | Fecha último restock       |
| ⏳ expiry_date      | DATE               | Fecha de vencimiento       |
| 📍 location         | VARCHAR(100)       | Ubicación en almacén       |
| 📅 last_count_date  | DATE               | Fecha último conteo        |

---

### 🧾 Tabla: sales

| 🏷️ Campo           | 📦 Tipo                | 📝 Descripción           |
|--------------------|------------------------|--------------------------|
| 🆔 id              | INT PRIMARY KEY        | Identificador único      |
| 🧾 invoice_number  | VARCHAR(50) UNIQUE     | Número de factura        |
| 🏬 branch_id       | INT FOREIGN KEY        | ID de sucursal           |
| 👤 cashier_id      | INT FOREIGN KEY        | ID del cajero            |
| 🧑‍💼 customer_id   | INT FOREIGN KEY        | ID del cliente           |
| 📅 sale_date       | TIMESTAMP              | Fecha de venta           |
| 💵 subtotal        | DECIMAL(12,2)          | Subtotal                 |
| 🧾 tax_amount      | DECIMAL(12,2)          | Monto de impuestos       |
| 🎟️ discount_amount| DECIMAL(12,2)          | Monto de descuento       |
| 💰 total_amount    | DECIMAL(12,2)          | Total                    |
| 💳 payment_method  | VARCHAR(50)            | Método de pago           |
| 🟢 payment_status  | ENUM('pending', 'paid', 'partial', 'refunded') | Estado      |
| 📝 notes           | TEXT                   | Notas adicionales        |
| ❌ is_voided       | BOOLEAN                | Venta anulada            |

---

### 🧾 Tabla: sale_items

| 🏷️ Campo              | 📦 Tipo            | 📝 Descripción         |
|-----------------------|--------------------|------------------------|
| 🆔 id                 | INT PRIMARY KEY    | Identificador único    |
| 🧾 sale_id            | INT FOREIGN KEY    | ID de la venta         |
| 📦 product_id         | INT FOREIGN KEY    | ID del producto        |
| 🔢 quantity           | DECIMAL(10,2)      | Cantidad               |
| 💵 unit_price         | DECIMAL(10,2)      | Precio unitario        |
| 🎟️ discount_percentage| DECIMAL(5,2)      | Porcentaje de descuento|
| 💰 line_total         | DECIMAL(12,2)      | Total de línea         |

---

### 🧑‍💼 Tabla: customers

| 🏷️ Campo           | 📦 Tipo                | 📝 Descripción         |
|--------------------|------------------------|------------------------|
| 🆔 id              | INT PRIMARY KEY        | Identificador único    |
| 🏷️ customer_code   | VARCHAR(20) UNIQUE     | Código de cliente      |
| 👤 first_name      | VARCHAR(100)           | Nombre                 |
| 👥 last_name       | VARCHAR(100)           | Apellido               |
| 📧 email           | VARCHAR(255)           | Email                  |
| 📱 phone           | VARCHAR(20)            | Teléfono               |
| 📍 address         | TEXT                   | Dirección              |
| 🧾 tax_id          | VARCHAR(50)            | RUC/NIT                |
| 💳 credit_limit    | DECIMAL(12,2)          | Límite de crédito      |
| 💰 current_balance | DECIMAL(12,2)          | Saldo actual           |
| ✅ is_active       | BOOLEAN                | Cliente activo         |
| 🗓️ registration_date| TIMESTAMP             | Fecha de registro      |

---

### 🖥️ Tabla: user_sessions

| 🏷️ Campo        | 📦 Tipo                  | 📝 Descripción           |
|-----------------|--------------------------|--------------------------|
| 🆔 id           | VARCHAR(255) PRIMARY KEY | ID de sesión             |
| 👤 user_id      | INT FOREIGN KEY          | ID del usuario           |
| 🏬 branch_id    | INT FOREIGN KEY          | ID de sucursal           |
| 🌐 ip_address   | VARCHAR(45)              | Dirección IP             |
| 🖥️ pos_terminal | VARCHAR(50)              | Terminal POS             |
| 🗓️ created_at   | TIMESTAMP                | Fecha de creación        |
| ⏳ expires_at   | TIMESTAMP                | Fecha de expiración      |
| ⏰ last_activity| TIMESTAMP                | Última actividad         |


# Pasos para clonar el repositorio

## Configuración de SSH
### 🔑 Configuración de SSH en GitHub

#### 1️⃣ Generar una clave SSH

- **Windows (Git Bash/PowerShell), macOS o Linux:**
  
  ```bash
  ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"
  ```
  <kbd>Copiar</kbd>
  > Si tu sistema no soporta `ed25519`, usa:  
  > `ssh-keygen -t rsa -b 4096 -C "tu-email@ejemplo.com"`
  <kbd>Copiar</kbd>

- Presiona `Enter` para aceptar la ubicación por defecto y establece una contraseña segura si lo deseas.

---

#### 2️⃣ 📁 Copiar la clave pública

- Ejecuta el siguiente comando para copiar la clave al portapapeles:

  - **Windows (Git Bash):**
    ```bash
    cat ~/.ssh/id_ed25519.pub | clip
    ```
    <kbd>Copiar</kbd>
  - **PowerShell:**
    ```powershell
    Get-Content ~/.ssh/id_ed25519.pub | Set-Clipboard
    ```
    <kbd>Copiar</kbd>
  - **macOS:**
    ```bash
    pbcopy < ~/.ssh/id_ed25519.pub
    ```
    <kbd>Copiar</kbd>
  - **Linux:**
    ```bash
    cat ~/.ssh/id_ed25519.pub | xclip -selection clipboard
    ```
    <kbd>Copiar</kbd>

---

#### 3️⃣ 🛡️ Agregar la clave a GitHub

- Ve a [GitHub > Settings > SSH and GPG keys](https://github.com/settings/keys)
- Haz clic en **New SSH key** (`➕`)
- Pega la clave pública copiada y guarda.

---

#### 4️⃣ 🧪 Probar la conexión

```bash
ssh -T git@github.com
```
<kbd>Copiar</kbd>
- Si ves un mensaje de bienvenida, ¡la configuración fue exitosa!

---

#### 5️⃣ 📝 Configurar Git para usar SSH

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```
<kbd>Copiar</kbd>

---

> 💡 **Tip:** Si tienes varias claves SSH, puedes gestionar el archivo `~/.ssh/config` para especificar qué clave usar con GitHub.


## Clonar el repositorio en tu dispositivo
### 🚀 Clonar el repositorio

1️⃣ Abre tu terminal y navega a la carpeta donde quieres clonar el proyecto.

2️⃣ Ejecuta el siguiente comando:

```bash
git clone git@github.com:EdgarGmz/project-web.git
```
<kbd>Copiar</kbd>

3️⃣ Ingresa al directorio del proyecto:

```bash
cd project-web
```
<kbd>Copiar</kbd>

¡Listo! Ahora tienes el repositorio en tu dispositivo.