// Obtener la URL del backend desde las variables de entorno
const API_URL = import.meta.env.VITE_URL_API || 'http://localhost:3000/api'

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

        // 3. Si hay token, agregarlo para autenticarnos
        if(token){
            headers['Authorization'] = `Bearer ${token}`
        }

        // 4. Hacer la peticion al backend
        const response = await fetch(`${API_URL}${endpoint}`,{
            ...options, 
            headers,
        })

        // 5. Convertir la respuesta a JSON
        const data = await response.json()

        // 6. Verificar si hubo error
        if(!response.ok){
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