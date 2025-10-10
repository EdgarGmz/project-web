# 📦 Sistema de Gestión de Inventario y Punto de Venta para PYMES

---

## 🧭 Descripción General
El **Sistema de Gestión de Inventario y Punto de Venta (POS)** ha sido desarrollado con el objetivo de brindar a las pequeñas y medianas empresas (PYMES) una solución integral, moderna y segura para el manejo de sus operaciones comerciales.  
Este proyecto busca centralizar la administración de inventarios, ventas, facturación y control de usuarios, bajo un entorno intuitivo y adaptable.  

El sistema prioriza tres pilares fundamentales:
- **Eficiencia:** Reducción de tiempos en procesos de venta y registro de productos.  
- **Seguridad:** Incorporación de buenas prácticas y controles de acceso.  
- **Escalabilidad:** Arquitectura modular preparada para el crecimiento del negocio.  

---

## 📚 Tabla de Contenidos
1. [🏁 Introducción](#-introducción)  
2. [📘 Documentación del Proyecto](#-documentación-del-proyecto)  
3. [🧩 Diagramas y Modelos](#-diagramas-y-modelos)  
4. [🖥️ Pantallas y Bocetos](#️-pantallas-y-bocetos)  
5. [🛡️ Ciclo de Vida y Seguridad (S-SDLC)](#️-ciclo-de-vida-y-seguridad-s-sdlc)  
6. [📈 Beneficios del Sistema](#-beneficios-del-sistema)  
7. [🚀 Guía para Nuevos Contribuidores](#-guía-para-nuevos-contribuidores)  

---

## 🏁 Introducción
El presente proyecto busca ofrecer una herramienta profesional para la **gestión integral de inventarios, ventas, facturación electrónica y control administrativo**, diseñada específicamente para PYMES.  

Su enfoque combina la facilidad de uso con altos estándares de seguridad informática, permitiendo a los usuarios operar en entornos de múltiples sucursales, roles y niveles de acceso.  

Además, el sistema se estructura bajo un modelo de **Desarrollo Seguro (S-SDLC)** que garantiza la protección de la información en cada etapa del ciclo de vida del software.

---

## 📘 Documentación del Proyecto
Toda la documentación técnica y funcional del sistema se encuentra en la carpeta **Docs/Requerimientos**.  
A continuación se detallan los archivos existentes y los pendientes por incorporar.

### 📄 Requerimientos y Seguridad
| 📂 Documento | 📝 Descripción | 🔗 Enlace |
|---------------|----------------|-----------|
| **Requerimientos del Sistema** | Describe los requerimientos generales del proyecto, incluyendo especificaciones técnicas, limitaciones, alcance y objetivos principales. Sirve como base para comprender las necesidades del cliente y las condiciones bajo las cuales operará el sistema. | [📎 Ver Documento](Docs/Requerimientos/Requerimientos_Sistema_PYMES.docx) |
| **Requerimientos Funcionales** | Detalla las funciones que debe cumplir el sistema, los casos de uso, flujos de trabajo y módulos principales. Define la interacción entre el usuario y la aplicación, asegurando que las funcionalidades respondan a los procesos clave del negocio. | [📎 Ver Documento](Docs/Requerimientos/Requisitos_funcionales.docx) |
| **Requisitos Básicos de Seguridad** | Establece las políticas y medidas mínimas de seguridad necesarias para proteger los datos y garantizar la integridad del sistema. Incluye prácticas como autenticación, control de acceso y manejo de información sensible. | [📎 Ver Documento](Docs/Requerimientos/Requisitos_basicos_de_seguridad.docx) |
| **Lista de Riesgos de Seguridad** | Identifica posibles amenazas y vulnerabilidades que podrían afectar el sistema. Clasifica los riesgos según su impacto y probabilidad, y propone estrategias de mitigación y respuesta ante incidentes. | [📎 Ver Documento](Docs/Requerimientos/Lista_de_Riesgos_Seguridad_.docx) |
| **Análisis STRIDE** | Presenta un análisis detallado de amenazas utilizando la metodología STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service y Elevation of Privilege). Permite detectar debilidades y definir contramedidas específicas. | [📎 Ver Documento](Docs/Requerimientos/Analisis_STRIDE_Inventario_Ventas.docx) |
| **Definicion de Roles de Usuario y Permisos** | Este documento detalla la estructura jerárquica y las responsabilidades asignadas a cada tipo de usuario dentro del sistema. Define los niveles de acceso, permisos de lectura, escritura, modificación y eliminación según los módulos (Inventario, Ventas, Facturación, Administración, etc.). | [📎 Ver Documento](Docs/Requerimientos/Roles_y_Permisos_Sistema.docx) |
| **Controles de Seguridad Avanzados** | Contiene la descripción técnica de las medidas de protección reforzadas aplicadas en el sistema, complementando los requisitos básicos de seguridad. Incluye mecanismos como autenticación multifactor (MFA). | [📎 Ver Documento](Docs/Requerimientos/Controles_seguridad.docx) |
| **Diagramas de Arquitectura del Sistema** | Presenta la estructura lógica, física y de comunicación del sistema. Describe los componentes principales (frontend, backend, base de datos, API y servicios externos) y la forma en que se interconectan dentro de la infraestructura de despliegue. | [📎 Ver Documento](Docs/Requerimientos/ARQUITECTURA DEL SISTEMA.docx) |


## 🧩 Diagramas y Modelos
Los diagramas permiten comprender la estructura interna y las relaciones entre entidades del sistema.  
Estos recursos visuales se encuentran dentro de `Docs/Requerimientos`.

| 📊 Recurso | 🧠 Descripción | 🔗 Enlace |
|-------------|----------------|-----------|
| **Diagrama de Relación Extendida** | Muestra la conexión entre módulos del sistema y entidades clave. | [🖼️ Ver Imagen](Docs/Requerimientos/Diagrama%20de%20realcion%20extendida.jpg) |
| **Entidad Relación (E-R)** | Representa gráficamente las tablas y relaciones de base de datos. | [🖼️ Ver Imagen](Docs/Requerimientos/Entidad%20Relacion.png) |
| **Modelo STRIDE** | Ilustración del análisis de amenazas STRIDE aplicado al sistema. | [🖼️ Ver Imagen](Docs/Requerimientos/STRIDE.png) |

> 💡 *Estos diagramas sirven como referencia para los equipos de desarrollo, QA y documentación técnica.*

---

## 🖥️ Pantallas y Bocetos
La carpeta `Docs/Screens` contiene los prototipos de diseño y pantallas funcionales del sistema.  
Cada uno de ellos ofrece una vista previa de la interfaz de usuario y los flujos operativos esperados.

| 🧾 Archivo | 🖋️ Descripción | 🔗 Enlace |
|-------------|----------------|-----------|
| **Bocetos del Sistema** | Presenta los diseños base del sistema de inventario y punto de venta. | [📎 Ver PPTX](Docs/Screens/Bocetos_Sistema_Gestion_Inventario_PDV.pptx) |
| **Pantallas JECO** | Contiene las pantallas finales del módulo POS. | [📎 Ver PPTX](Docs/Screens/PANTALLAS-JECO.pptx) |
| **Plantilla de Presentaciones** | Formato oficial para presentaciones del proyecto. | [📎 Ver PPTX](Docs/Screens/plantilla.pptx) |

> 🧭 *Estos archivos son esenciales para el diseño UI/UX y el onboarding de nuevos desarrolladores.*

---

## 🛡️ Ciclo de Vida y Seguridad (S-SDLC)
El desarrollo del sistema se basa en el modelo **Secure Software Development Life Cycle**, garantizando la inclusión de medidas de seguridad en cada fase.  

### 🔹 Fases Principales
1. **Planificación y Requerimientos:** Identificación de requisitos funcionales y de seguridad.  
2. **Diseño:** Creación de modelos seguros, definición de roles, y políticas de acceso.  
3. **Desarrollo:** Codificación con estándares OWASP, uso de herramientas SAST y revisión de código.  
4. **Pruebas:** Validación de seguridad (DAST), pruebas de carga, y auditorías internas.  
5. **Despliegue:** Configuración segura en entorno productivo, revisión de permisos y roles.  
6. **Mantenimiento:** Actualizaciones periódicas, monitoreo de incidentes y respuesta ante amenazas.

### 🔒 Controles Clave
- Autenticación multifactor (MFA)  
- Hashing de contraseñas con Argon2  
- Validaciones de entrada/salida  
- Monitoreo y logging seguro  
- Backups cifrados con AES-256  
- Políticas de contraseñas y sesiones seguras  

---

## 📈 Beneficios del Sistema
- 🔹 **Automatización** de procesos administrativos y contables.  
- 🔹 **Reducción de errores** en inventarios y control de stock.  
- 🔹 **Reportes en tiempo real** para decisiones estratégicas.  
- 🔹 **Módulos escalables**, personalizables según la necesidad del negocio.  
- 🔹 **Seguridad integrada** desde la planificación hasta la operación.  
- 🔹 **Interfaz intuitiva**, adaptable a distintos perfiles de usuario.

---

## 🚀 Guía para Nuevos Contribuidores
Si eres un nuevo desarrollador o colaborador, te recomendamos los siguientes pasos:

1. **Leer la sección de Requerimientos Funcionales** para comprender el alcance.  
2. **Revisar los Diagramas E-R y STRIDE** para entender la estructura del sistema.  
3. **Analizar los Documentos de Seguridad** para conocer las medidas implementadas.  
4. **Ejecutar las pruebas iniciales** de desarrollo y verificar los módulos activos.  
5. **Consultar los Bocetos del Sistema** antes de modificar la interfaz.  

> 🧠 *El conocimiento compartido y la documentación actualizada son pilares de este proyecto.*

[🔝 Volver al Menú](#-menú-de-navegación)


