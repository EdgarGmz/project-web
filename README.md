# Project Web

Este es un proyecto universitario. A continuación se detallan los pasos para configurar el entorno y clonar el repositorio.

## Configuración de la clave SSH para GitHub

Para clonar el repositorio usando SSH, primero necesitas generar una clave SSH y agregarla a tu cuenta de GitHub. Los pasos varían ligeramente según tu sistema operativo.

### Paso 1: Generar una nueva clave SSH

Abre una terminal y ejecuta el siguiente comando, reemplazando `"tu_email@example.com"` con el correo electrónico asociado a tu cuenta de GitHub:

```bash
ssh-keygen -t ed25519 -C "tu_email@example.com"
```

Cuando te pida "Enter a file in which to save the key", puedes presionar Enter para aceptar la ubicación por defecto. Si se te solicita, ingresa una frase de contraseña segura.

### Paso 2: Agregar tu clave SSH al ssh-agent

Este paso es diferente para cada sistema operativo.

#### Windows

Abre Git Bash o PowerShell y ejecuta los siguientes comandos:

```bash
# Inicia el ssh-agent en segundo plano
eval $(ssh-agent -s)

# Agrega tu clave SSH privada al ssh-agent
ssh-add ~/.ssh/id_ed25519
```

#### macOS

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

#### Linux

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

## Clonar el Repositorio

Una vez que tu clave SSH esté configurada y agregada a GitHub, puedes clonar el repositorio.

Abre tu terminal, navega al directorio donde quieras guardar el proyecto y ejecuta el siguiente comando:

```bash
git clone git@github.com:EdgarGmz/project-web.git
```

Esto creará una carpeta llamada `project-web` en tu directorio actual con todos los archivos del proyecto.
