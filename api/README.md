# 🚀 Backend

Bienvenido al backend del proyecto. Este servicio está construido con **Node.js** + **Express**, utiliza **PostgreSQL** como base de datos mediante un **ORM**, y sigue la arquitectura **Clean/Hexagonal** con enfoque en **Microservicios**.

## 🛠️ Tecnologías

| Tecnología         | ¿Por qué se utiliza?                                                                 | Link de descarga/documentación                  |
|--------------------|--------------------------------------------------------------------------------------|-------------------------------------------------|
| ![Node.js logo](https://nodejs.org/static/images/logo.svg){width=32} <br/> **Node.js**        | Motor de ejecución para JavaScript en el backend, eficiente y escalable.             | [Descarga aquí](https://nodejs.org/)                |
| ![Express logo](https://upload.wikimedia.org/wikipedia/commons/6/64/Expressjs.png){width=32} <br/> **Express**        | Framework minimalista para crear APIs de forma rápida y sencilla.                    | [Documentación](https://expressjs.com/)         |
| ![PostgreSQL logo](https://www.postgresql.org/media/img/about/press/elephant.png){width=32} <br/> **PostgreSQL**     | Base de datos relacional robusta y de código abierto.                                | [Descarga aquí](https://www.postgresql.org/download/)|
| ![ORM icon](https://cdn-icons-png.flaticon.com/512/2721/2721297.png){width=32} <br/> **ORM**<br/>(Sequelize/TypeORM) | Facilita la interacción con la base de datos usando objetos y migraciones.           | [Sequelize](https://sequelize.org/)<br/>[TypeORM](https://typeorm.io/) |
| ![Hexagonal Architecture](https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Hexagonal_Architecture.svg/120px-Hexagonal_Architecture.svg.png){width=32} <br/> **Arquitectura Clean/Hexagonal** | Permite desacoplar la lógica de negocio de las dependencias externas.                | [Más info](https://alistair.cockburn.us/hexagonal-architecture/) |
| ![Microservices icon](https://cdn-icons-png.flaticon.com/512/2721/2721297.png){width=32} <br/> **Microservicios** | Facilita la escalabilidad y el mantenimiento dividiendo el sistema en módulos.        | [Conceptos](https://microservices.io/)          |

## 📦 Estructura del Proyecto
### Diagrama
* 🧩 **Clean/Hexagonal:** Dominios y lógica desacoplados.
* 🧱 **Microservicios:** Módulos críticos escalables.
* 🏗️ **Monolito Modular:** Fácil migración a microservicios.
```mermaid
flowchart TD
   A[Frontend SPA] --> B[API Gateway]
   B --> C1[Auth Service]
   B --> C2[Usuarios]
   B --> C3[Inventario]
   B --> C4[Ventas]
   B --> C5[Reportes]
   C2 & C3 & C4 & C5 --> D[(PostgreSQL)]
   D --> E[Redis/Cache]
```

### Estrucuración de Carptetas
```
/src
    /modules         # Microservicios y lógica de negocio
    /infrastructure  # Integraciones externas (DB, APIs)
    /domain          # Entidades y lógica de dominio
    /application     # Casos de uso
    /config          # Configuración general
```

## ⚙️ Instalación

1. **Clona el repositorio**
     ```bash
     git clone https://github.com/tu-usuario/tu-repo.git
     cd tu-repo/api
     ```

2. **Instala dependencias**
     ```bash
     npm install
     ```

3. **Configura variables de entorno**
     Crea un archivo `.env` con la configuración de tu base de datos PostgreSQL:
     ```
     DB_HOST=localhost
     DB_PORT=5432
     DB_USER=usuario
     DB_PASSWORD=contraseña
     DB_NAME=nombre_db
     ```

4. **Ejecuta migraciones (si aplica)**
     ```bash
     npm run migrate
     ```

## ▶️ Levantar el Backend

```bash
npm run dev
```
El servidor estará disponible en `http://localhost:3000`.

## 🧪 Pruebas

```bash
npm test
```

## 📚 Documentación

- [Express](https://expressjs.com/)
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Clean Architecture](https://github.com/jeffreypalermo/cleanarchitecture)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)



