# 🚀 Project Web

  Este es un proyecto universitario. A continuación se detallan los pasos para configurar el entorno y clonar el repositorio.

## 🛠️ Stack Tecnológico

| Área                | Tecnología  | Enlace / Descarga |
|---------------------|-------------|-------------------|
| **Frontend**        | [Next.js](https://nextjs.org/) | [Documentación](https://nextjs.org/docs) |
| **Backend**         | [Express.js](https://expressjs.com/) <br> [Node.js](https://nodejs.org/) | [Express Docs](https://expressjs.com/en/starter/installing.html) <br> [Descargar Node.js](https://nodejs.org/en/download/) |
| **Base de Datos**   | [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) | [Descargar SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) |
| **DevOps**          | [GitHub](https://github.com/) <br> [Git](https://git-scm.com/) | [Regístrate en GitHub](https://github.com/join) <br> [Descargar Git](https://git-scm.com/downloads) |
| **Automatizaciones**| [Docker](https://www.docker.com/) | [Descargar Docker](https://www.docker.com/products/docker-desktop/) |

> **Notas**:
> - Se recomienda revisar los requisitos de cada tecnología antes de instalar.
> - Los enlaces llevan a las páginas oficiales y documentación de cada herramienta.

## 🔑 Configuración de la clave SSH para GitHub

  Para clonar el repositorio usando SSH, primero necesitas generar una clave SSH y agregarla a tu cuenta de GitHub. Los pasos varían ligeramente según tu        sistema operativo.

### Paso 1: Generar una nueva clave SSH

  Abre una terminal y ejecuta el siguiente comando, reemplazando `"tu_email@example.com"` con el correo electrónico asociado a tu cuenta de GitHub:

  ```bash
  ssh-keygen -t ed25519 -C "tu_email@example.com"
  ```

  Cuando te pida "Enter a file in which to save the key", puedes presionar Enter para aceptar la ubicación por defecto. Si se te solicita, ingresa una frase de contraseña segura.

### Paso 2: Agregar tu clave SSH al ssh-agent

  Este paso es diferente para cada sistema operativo.

#### <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg" width="20" height="20"/> Windows

  Puedes usar Git Bash o PowerShell para este paso.

  **Opción 1: Git Bash**

  Abre Git Bash y ejecuta los siguientes comandos:

  ```bash
  # Inicia el ssh-agent en segundo plano
  eval $(ssh-agent -s)
  
  # Agrega tu clave SSH privada al ssh-agent
  ssh-add ~/.ssh/id_ed25519
  ```

  **Opción 2: PowerShell**

  Abre PowerShell y ejecuta los siguientes comandos:

  ```powershell
  # Inicia el ssh-agent
  Start-SshAgent
  
  # Agrega tu clave SSH privada al ssh-agent
  ssh-add ~/.ssh/id_ed25519
  ```

#### <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg" width="20" height="20"/> macOS

  Ejecuta los siguientes comandos en la Terminal:

  ```bash
  # Inicia el ssh-agent en segundo plano
  eval "$(ssh-agent -s)"
  
  # Modifica tu archivo ~/.ssh/config para cargar claves automáticamente
  # en el agent y guardar las frases de contraseña en tu keychain.
  touch ~/.ssh/config
  echo "Host *
    AddKeysToAgent yes
    UseKeychain yes
    IdentityFile ~/.ssh/id_ed25519" >> ~/.ssh/config
  
  # Agrega tu clave SSH privada al ssh-agent
  ssh-add --apple-use-keychain ~/.ssh/id_ed25519
  ```

#### <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" width="20" height="20"/> Linux

  Ejecuta los siguientes comandos en la terminal:

  ```bash
  # Inicia el ssh-agent en segundo plano
  eval "$(ssh-agent -s)"
  
  # Agrega tu clave SSH privada al ssh-agent
  ssh-add ~/.ssh/id_ed25519
  ```

### Paso 3: Agregar la clave SSH a tu cuenta de GitHub

  Este paso es igual para todos los sistemas operativos.

  Primero, copia la clave SSH pública a tu portapapeles.

-   **macOS:**
    ```bash
    pbcopy < ~/.ssh/id_ed25519.pub
    ```
-   **Linux (requiere xclip):**
    ```bash
    sudo apt-get install xclip # O el gestor de paquetes de tu distribución
    xclip -selection clipboard < ~/.ssh/id_ed25519.pub
    ```
-   **Windows (en Git Bash):**
    ```bash
    cat ~/.ssh/id_ed25519.pub | clip
    ```
-   **Windows (en PowerShell):**
    ```powershell
    Get-Content ~/.ssh/id_ed25519.pub | Set-Clipboard
    ```
-   **O manualmente en cualquier SO:** Muestra la clave en la terminal y cópiala manualmente.
    ```bash
    cat ~/.ssh/id_ed25519.pub
    ```

Copia la salida completa del comando. Luego, sigue estos pasos en GitHub:

  1.  Ve a la configuración de tu cuenta de GitHub.
  2.  En la sección "Access", haz clic en "SSH and GPG keys".
  3.  Haz clic en "New SSH key" o "Add SSH key".
  4.  En el campo "Title", agrega un título descriptivo para la nueva clave (por ejemplo, "Mi Laptop de Trabajo").
  5.  Pega tu clave en el campo "Key".
  6.  Haz clic en "Add SSH key".

## 📥 Clonar el Repositorio

  Una vez que tu clave SSH esté configurada y agregada a GitHub, puedes clonar el repositorio.

  Abre tu terminal, navega al directorio donde quieras guardar el proyecto y ejecuta el siguiente comando:

  ```bash
  git clone git@github.com:EdgarGmz/project-web.git
  ```

  Esto creará una carpeta llamada `project-web` en tu directorio actual con todos los archivos del proyecto.

### Pasos para levantar la Web (Frontend)

1. Una vez clonado el repositorio, abre una nueva terminal (PowerShell, Git Bash, o Terminal).
2. Ubícate en la carpeta del proyecto frontend. Por ejemplo:
    ```terminal
    cd api-web
    ```
    > **Asegúrate de que el nombre de la carpeta corresponde al frontend (Next.js). Si tu carpeta se llama diferente, usa el nombre correcto.**
3. Instala las dependencias:
    ```bash
    npm install
    ```
4. Levanta el proyecto en modo desarrollo:
    ```bash
    npm run dev
    ```
5. Accede a la aplicación en tu navegador, normalmente en [http://localhost:3000](http://localhost:3000).

> **Requisitos previos:** Tener instalado [Node.js](https://nodejs.org/en/download/) y [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

> **Nota:** Si el puerto 3000 está ocupado, Next.js sugerirá otro puerto automáticamente.
    
