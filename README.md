# 🚀 **Project Web**

> **Proyecto universitario**  
> Guía visual paso a paso para configurar el entorno, clonar el repositorio y trabajar colaborativamente, ideal para quienes nunca han usado **Git** ni **GitHub**.

---

## 🧩 **Prerrequisitos antes de comenzar**

¡Asegúrate de instalar y configurar todo lo necesario antes de seguir con la guía!  
| 💻 Software            | 📋 Descripción             | 🔗 Enlace de descarga                |
|-----------------------|---------------------------|--------------------------------------|
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg" width="24"/> **Windows** <br> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg" width="24"/> **macOS** <br> <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" width="24"/> **Linux** | Sistema Operativo | — |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="24"/> **Node.js + npm** | Entorno de ejecución de JavaScript y gestor de paquetes. | [Descargar Node.js](https://nodejs.org/en/download/) |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" width="24"/> **Git** | Control de versiones | [Descargar Git](https://git-scm.com/downloads) |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" width="24"/> **GitHub** | Plataforma colaborativa | [Regístrate en GitHub](https://github.com/join) |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" width="24"/> **Docker** | Automatización de despliegues (opcional) | [Descargar Docker](https://www.docker.com/products/docker-desktop/) |
| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoftsqlserver/microsoftsqlserver-plain.svg" width="24"/> **SQL Server** | Base de datos | [Descargar SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) |

> 💡 **Tip:** Si usas Windows, instala [Git Bash](https://git-scm.com/downloads) para ejecutar comandos de Git fácilmente.

---

## 🔗 **Navegación rápida**

- [Configurar clave SSH para GitHub](#clave-ssh)
- [Clonar el repositorio](#clonar)
- [Primeros pasos con el proyecto](#iniciar)
- [Flujo de trabajo con Git y GitHub](#flujo-git)
- [Cómo crear un Pull Request](#pull-request)

---

<a name="clave-ssh"></a>
## 🛡️ **Configurar clave SSH para GitHub**

Antes de clonar, necesitas vincular tu computadora con tu cuenta de GitHub usando una clave SSH.

### 1️⃣ **Generar clave SSH**

Abre tu terminal y ejecuta:

```bash
ssh-keygen -t ed25519 -C "tu_email@example.com"
```
Presiona **Enter** para aceptar la ubicación por defecto, y establece una contraseña si lo deseas.

---

### 2️⃣ **Agregar la clave SSH al agente**

#### <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg" width="20"/> **Windows (elige tu terminal)**

<details>
<summary>🖥️ <b>PowerShell</b></summary>

1. **Inicia el agente SSH:**
    ```powershell
    Start-Service ssh-agent
    ```
    > Si ves un error de permisos, ejecuta PowerShell como administrador.

2. **Verifica que el servicio esté corriendo:**
    ```powershell
    Get-Service ssh-agent
    ```
    Debe mostrar el estado como `Running`.

3. **Agrega tu clave privada al agente:**
    ```powershell
    ssh-add $env:USERPROFILE\.ssh\id_ed25519
    ```
    > Si ves el mensaje `Could not open a connection to your authentication agent`, cierra y vuelve a abrir PowerShell.
</details>

<details>
<summary>💻 <b>Git Bash</b></summary>

1. **Inicia el agente SSH:**
    ```bash
    eval $(ssh-agent -s)
    ```

2. **Agrega tu clave privada al agente:**
    ```bash
    ssh-add ~/.ssh/id_ed25519
    ```
</details>

---

#### <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg" width="20"/> **macOS**
```bash
eval "$(ssh-agent -s)"
touch ~/.ssh/config
echo "Host *\n  AddKeysToAgent yes\n  UseKeychain yes\n  IdentityFile ~/.ssh/id_ed25519" >> ~/.ssh/config
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

#### <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" width="20"/> **Linux**
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

---

### 3️⃣ **Agregar la clave SSH a GitHub**

- Copia tu clave pública:
    - **macOS:** `pbcopy < ~/.ssh/id_ed25519.pub`
    - **Linux:** `xclip -selection clipboard < ~/.ssh/id_ed25519.pub`
    - **Windows (Git Bash):** `cat ~/.ssh/id_ed25519.pub | clip`
    - **Windows (PowerShell):** `Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub | Set-Clipboard`
    - **Cualquier SO (manual):** `cat ~/.ssh/id_ed25519.pub`
- Ve a **GitHub > Settings > SSH and GPG keys > New SSH key**  
    Pega tu clave y ponle un nombre identificable (ej. "Mi Laptop").

---

<a name="clonar"></a>
## 📥 **Clonar el repositorio**

Abre tu terminal y ejecuta:

```bash
git clone git@github.com:EdgarGmz/project-web.git
```
Esto creará la carpeta `project-web` con todos los archivos.

---

<a name="iniciar"></a>
## 🏁 **Primeros pasos para iniciar el proyecto (Frontend)**

1. Abre una terminal y navega a la carpeta del proyecto:
    ```bash
    cd project-web/api-web
    ```
    > 💡 Si tu carpeta del frontend tiene otro nombre, reemplázalo.

2. Instala las dependencias:
    ```bash
    npm install
    ```

3. Inicia el servidor en modo desarrollo:
    ```bash
    npm run dev
    ```

4. Abre tu navegador en [http://localhost:3000](http://localhost:3000)

> **Requisitos previos:** Tener instalado [Node.js](https://nodejs.org/en/download/) y [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
>  
> ⚠️ Si el puerto 3000 está ocupado, Next.js sugerirá otro puerto automáticamente.

---

<a name="flujo-git"></a>
## 🔄 **Flujo de trabajo con Git & GitHub**

### 🌳 **Ramas principales**

- **main**: Rama de producción (¡No hagas cambios directos aquí!)
- **develop**: Rama de pruebas, aquí se integran los cambios antes de pasar a producción.
- **feature/**, **fix/**, **hotfix/**: Ramas individuales para cada issue/tarea. Ejemplo: `feature/login-page`.

### 📝 **¿Cómo trabajo una issue?**

1. **Crea una rama desde `develop`** (usando el nombre de la issue/tarea):
    ```bash
    git checkout develop
    git pull
    git checkout -b feature/nombre-issue
    ```

2. **Realiza tus cambios y guarda tu trabajo**:
    ```bash
    git add .
    git commit -m "Descripción breve de los cambios"
    git push origin feature/nombre-issue
    ```

3. **Cuando termines tu tarea, crea un Pull Request**.  
    [Ver cómo hacerlo](#pull-request)

---

<a name="pull-request"></a>
## 🚩 **¿Qué hacer después de terminar una issue? (Pull Request)**

1. Ve al repositorio en GitHub.  
2. Haz clic en **"Compare & pull request"** para tu rama.
3. Llena los siguientes campos:
    - **Title:** Nombre corto y descriptivo de la tarea.
    - **Description:** Explica lo que hiciste, incluye referencias a la issue (ejemplo: `Closes #12`).
    - **Base branch:** Debe ser `develop`.
    - **Compare branch:** Tu rama (ej. `feature/nombre-issue`).
4. Haz clic en **"Create Pull Request"**.

> 💡 **La Pull Request será revisada y, al aprobarse, se integrará a `develop`.**

---

## 🖼️ **Ayudas visuales**

- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" width="20"/> &nbsp;[Guía oficial de GitHub para Pull Requests](https://docs.github.com/en/pull-requests)
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" width="20"/> &nbsp;[Conceptos básicos de Git](https://git-scm.com/book/es/v2/Empezando-Conceptos-básicos-de-Git)
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="20"/> &nbsp;[Documentación de Node.js](https://nodejs.org/en/docs/)
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" width="20"/> &nbsp;[Documentación de Next.js](https://nextjs.org/docs)
- <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" width="20"/> &nbsp;[Guía rápida de Docker](https://docs.docker.com/get-started/overview/)

---

## 🆘 **¿Dudas o problemas?**

- Consulta la [documentación oficial de GitHub](https://docs.github.com/en)
- Pregunta al equipo en el canal de comunicación interna.

---

> **¡Listo! Con esta guía puedes instalar, clonar y comenzar a colaborar en el proyecto de forma segura y ordenada.**
