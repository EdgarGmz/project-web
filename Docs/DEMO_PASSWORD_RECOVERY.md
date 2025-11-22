# 🎬 GUÍA DE DEMOSTRACIÓN - RECUPERACIÓN DE CONTRASEÑA

## 📋 Preparación para la Demostración

### ✅ Usuarios de Prueba Disponibles
Los siguientes usuarios están disponibles en el sistema para la demostración:

```
📧 admin@example.com
🔒 Contraseña: admin123
👤 Rol: Owner (acceso completo)

📧 gerente@sucursal.com  
🔒 Contraseña: gerente123
👤 Rol: Admin

📧 supervisor@tienda.com
🔒 Contraseña: supervisor123  
👤 Rol: Supervisor

📧 cajero@tienda.com
🔒 Contraseña: cajero123
👤 Rol: Cashier
```

### 🖥️ URLs de la Aplicación
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Login:** http://localhost:5173/login

---

## 🎯 SCRIPT DE DEMOSTRACIÓN (5 minutos)

### 🎬 PASO 1: Mostrar el Sistema Funcionando (30 segundos)
```
1. Abrir http://localhost:5173/login
2. Señalar: "Aquí tenemos nuestro sistema de inventario con login"
3. Mostrar el nuevo enlace: "¿Olvidaste tu contraseña?"
```

### 🎬 PASO 2: Simular Usuario que Olvidó Contraseña (1 minuto)
```
1. Hacer clic en "¿Olvidaste tu contraseña?"
2. Explicar: "Este es el formulario de recuperación"
3. Ingresar email: admin@example.com
4. Hacer clic en "Enviar Enlace de Recuperación"
5. Señalar el mensaje de éxito
```

### 🎬 PASO 3: Mostrar "Email" Simulado en Consola (2 minutos)
```
1. Cambiar a la consola del backend
2. Señalar la salida con formato:
   ===================================================
   📧 [SIMULADOR DE EMAIL - RECUPERACIÓN DE CONTRASEÑA]
   ===================================================
   📧 Para: admin@example.com
   👤 Usuario: Admin System
   🔑 Token: abc123def456...
   ⏰ Válido hasta: 21/11/2025 00:22:40
   🔗 Link de recuperación:
      http://localhost:5173/reset-password/abc123def456...
   ===================================================

3. Explicar: "En producción esto sería un email real"
4. Copiar el link completo de la consola
```

### 🎬 PASO 4: Proceso de Restablecimiento (1.5 minutos)
```
1. Pegar el link copiado en el navegador
2. Mostrar la página de restablecimiento con el token detectado
3. Ingresar nueva contraseña: "nuevapassword123"
4. Confirmar la contraseña
5. Hacer clic en "Restablecer Contraseña"
6. Mostrar mensaje de éxito y redirección automática
```

### 🎬 PASO 5: Verificar Cambio y Consola Final (1 minuto)
```
1. Volver a la consola del backend para mostrar:
   ===================================================
   ✅ [CONTRASEÑA RESTABLECIDA EXITOSAMENTE]
   ===================================================
   👤 Usuario: Admin System
   📧 Email: admin@example.com
   🕐 Fecha: 21/11/2025 00:23:15
   🔒 Nueva contraseña establecida correctamente
   ===================================================

2. Probar login con la nueva contraseña
3. Explicar: "El token se limpia automáticamente por seguridad"
```

---

## 🔒 PUNTOS CLAVE DE SEGURIDAD A EXPLICAR

### ✅ **Validaciones Implementadas:**
- ✅ Solo usuarios registrados pueden solicitar reset
- ✅ Tokens únicos y aleatorios (32 bytes hex)
- ✅ Expiración automática en 30 minutos
- ✅ Tokens de un solo uso (se limpian después del uso)
- ✅ Validación de contraseña mínima (8 caracteres)
- ✅ No revelación de información (mismo mensaje si el email no existe)

### ✅ **Logs de Auditoría:**
- ✅ Registro de solicitudes de recuperación
- ✅ Registro de cambios de contraseña exitosos
- ✅ Timestamps de todas las operaciones

### ✅ **Experiencia de Usuario:**
- ✅ Mensajes claros y profesionales
- ✅ Indicadores visuales de progreso
- ✅ Validación en tiempo real
- ✅ Redirección automática después del éxito

---

## 🛠️ COMANDOS PARA PREPARAR LA DEMO

### Iniciar Backend:
```bash
cd api
npm run dev
```

### Iniciar Frontend:
```bash
cd client  
npm run dev
```

### Reset de Usuario (si es necesario):
```bash
# En la consola del backend, encontrar el usuario y limpiar token:
# User.update({ reset_token: null, reset_token_expires: null, password: 'hash_original' }, { where: { email: 'admin@example.com' }})
```

---

## 🎓 PREGUNTAS FRECUENTES DEL PROFESOR

**P: ¿Por qué no usar email real?**
R: Para la demostración es más claro ver el proceso completo sin depender de configuración SMTP. En producción se cambiaría la simulación por nodemailer o similar.

**P: ¿Qué pasa si el token expira?**
R: El usuario debe solicitar un nuevo token. El sistema valida automáticamente la expiración.

**P: ¿Es seguro este método?**
R: Sí, implementa las mejores prácticas: tokens únicos, expiración, un solo uso, y no revelación de información de usuarios.

**P: ¿Se puede usar múltiples veces?**
R: No, cada token es de un solo uso. Después de usarlo se limpia de la base de datos.

---

## 📊 MÉTRICAS DE LA DEMOSTRACIÓN

- ⏱️ **Tiempo total:** 5 minutos
- 🔄 **Procesos mostrados:** 5 pasos claros
- 🛡️ **Aspectos de seguridad:** 6 puntos clave
- 📧 **Simulación realista:** Email formateado profesional
- ✅ **Funcionalidad completa:** Flujo end-to-end operativo

---

**💡 Tip:** Tener la consola del backend visible en una pantalla separada para mostrar los logs en tiempo real durante la demostración.