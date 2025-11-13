// Obtener la URL del backend desde las variables de entorno
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Variable para evitar multiples alertas
let sessionExpiredShown = false

/**
 * Fuincion para hacer las peticiones al backend
 * @param { string }  endpoint - ruta de la API (ej. '/auth/login')
 * @param { object } options - Opciones de la aplicacion (metodo, body, etc)
 */

const apiRequest = async (endpoint, options = {}) =>{
    try{
        // 1. Obtener el token de autenticacion (si existe)
        const token = localStorage.getItem('token')

        // 2. Configurar los headers (metadatos de la peticion)
        const headers ={
            'Content-Type': 'application/json', // <-- Decimos que enviamos JSON
            ...options.headers,// <-- Agregar headers si los hay
        }

        // 3. Si hay token, agregarlo para autenticarnos (excepto para login)
        if(token && endpoint !== '/auth/login'){
            headers['Authorization'] = `Bearer ${token}`
            console.log('🔑 Agregando token a headers para:', endpoint)
        } else if (endpoint === '/auth/login') {
            console.log('🔐 Login request - NO enviando token')
        }

        // 4. Hacer la peticion al backend
        const method = options.method || 'GET'
        console.log(`📤 ${method} ${endpoint}`)
        const response = await fetch(`${API_URL}${endpoint}`,{
            ...options, 
            headers,
        })
        console.log(`📥 Response: ${response.status} for ${endpoint}`)

        // 5. Convertir la respuesta a JSON
        const data = await response.json()

        // 6. Verificar si hubo error
        if(!response.ok){
            console.log(`❌ Error en petición: ${method} ${endpoint} - Status: ${response.status}`)
            console.log('Response data:', data)
            
            // Si el token es invalido, mostrar el modal y cerrar sesion (excepto durante login)
            if (response.status === 401 && !sessionExpiredShown && endpoint !== '/auth/login') {
                console.log('🔐 Token expirado detectado, mostrando modal de sesión expirada')
                sessionExpiredShown = true

                // Emitir evento personalizado para que el componente lo maneje
                window.dispatchEvent(new CustomEvent('sessionExpired',  {
                    detail: { message: data.message || 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.' }
                }))

                // Esperar un momento antes de redirigir 
                setTimeout(() =>{
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    window.location.href = '/login'
                }, 3000)

                return
            }
            throw new Error(data.message || 'Error en la peticion')
        }
        return data
    }catch(error){
        console.error('Error en la peticion: ', error)
        throw error
    }    
}

// Exportar metodos para cada tipo de peticion HTTP
export const api = {
    // GET - Obtener datos 
    get: (endpoint) => apiRequest(endpoint, { method: 'GET'}),

    // POST - Crear/Enviar datos
    post: (endpoint, data) => apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    // PUT - Actualizar datos
    put: (endpoint, data) => apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    // PATCH - Actualizar datos parciales
    patch: (endpoint, data) => apiRequest(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data)
    }),

    // DELETE - Eliminar datos
    delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE'})
}

export default api