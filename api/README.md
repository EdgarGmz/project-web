# 🚀 Backend

Bienvenido al backend del proyecto. Este servicio está construido con **Node.js** + **Express**, utiliza **PostgreSQL** como base de datos mediante un **ORM**, y sigue la arquitectura **Clean/Hexagonal** con enfoque en **Microservicios**.

## 🛠️ Tecnologías

- Node.js
- Express
- PostgreSQL
- ORM (por ejemplo, Sequelize o TypeORM)
- Arquitectura Clean/Hexagonal
- Microservicios

## 📦 Estructura del Proyecto

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



