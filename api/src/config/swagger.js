const swaggerJSDoc = require('swagger-jsdoc');
require('dotenv').config();

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'API de Gestión Empresarial',
        version: '1.0.0',
        description: `
            API completa para sistema de gestión de APEXStore, una tienda en el giro de venta videojuegos

            🧩 Características principales:
                • Gestión de usuarios y roles con diferentes niveles de acceso
                • Administración de sucursales multi•ubicación
                • Control de productos e inventario en tiempo real
                • Gestión completa de clientes (personas físicas y empresas)
                • Sistema de ventas con múltiples métodos de pago
                • Reportes detallados de ventas, inventario y rendimiento

            Autenticación: JWT Bearer Token
            Formato de respuesta: JSON estándar con estructura \`success/message/data\`
        `,
        contact: {
            name: 'Edgar Gómez',
            email: 'edgar_gomez90@outlook.com',
            url: 'https://github.com/EdgarGmz'
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT'
        },
        termsOfService: 'https://proyecto.com/terms'
    },
    servers: [
        {
            url: process.env.API_URL || 'http://localhost:3000',
            description: 'Servidor de Desarrollo'
        },
        {
            url: 'https://api.gamingstore.com',
            description: 'Servidor de Producción'
        },
        {
            url: 'https://staging-api.gamingstore.com',
            description: 'Servidor de Staging'
        }
    ],
    tags: [
        {
            name: 'Authentication',
            description: '🔐 Autenticación y autorización de usuarios. Login, logout y gestión de sesiones JWT.',
            externalDocs: {
                description: 'Documentación de JWT',
                url: 'https://jwt.io/'
            }
        },
        {
            name: 'Users',
            description: '👥 Gestión completa de usuarios del sistema. Creación, actualización, roles y permisos por sucursal.'
        },
        {
            name: 'Branches',
            description: '🏢 Administración de sucursales y ubicaciones. Configuración de datos de contacto y estado.'
        },
        {
            name: 'Products',
            description: '📦 Catálogo completo de productos gaming. Gestión de SKU, precios, categorías y metadatos.'
        },
        {
            name: 'Customers',
            description: '👤 Gestión de clientes personas físicas y empresas. Datos de contacto y facturación.'
        },
        {
            name: 'Inventory',
            description: '📊 Control de inventario en tiempo real por sucursal. Stock disponible, mínimos y reservas.'
        },
        {
            name: 'Sales',
            description: '💰 Sistema de ventas y facturación. Procesamiento de órdenes e items de venta.'
        },
        {
            name: 'Reports',
            description: '📈 Reportes y estadísticas del negocio. Ventas, inventario y rendimiento por sucursal.'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Token JWT para autenticación'
            }
        },
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false, description: 'Indica si la operación fue exitosa' },
                    message: { type: 'string', example: 'Descripción del error', description: 'Mensaje descriptivo del error' },
                    error: { type: 'string', example: 'Información técnica del error', description: 'Detalles técnicos del error (solo en desarrollo)' },
                    code: { type: 'string', example: 'VALIDATION_ERROR', description: 'Código de error para manejo programático' }
                }
            },
            ValidationError: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Error de validación' },
                    errors: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                field: { type: 'string', example: 'email', description: 'Campo que causó el error' },
                                message: { type: 'string', example: 'El email es requerido', description: 'Descripción específica del error' },
                                value: { type: 'string', example: 'valor-inválido', description: 'Valor que causó el error' }
                            }
                        }
                    }
                }
            },
            PaginatedResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Datos obtenidos exitosamente' },
                    data: {
                        type: 'array',
                        items: { type: 'object', description: 'Array de elementos del tipo correspondiente' }
                    },
                    pagination: {
                        type: 'object',
                        properties: {
                            total: { type: 'integer', example: 150, description: 'Total de elementos disponibles' },
                            page: { type: 'integer', example: 1, description: 'Página actual' },
                            limit: { type: 'integer', example: 10, description: 'Elementos por página' },
                            pages: { type: 'integer', example: 15, description: 'Total de páginas disponibles' },
                            hasNext: { type: 'boolean', example: true, description: 'Indica si hay página siguiente' },
                            hasPrev: { type: 'boolean', example: false, description: 'Indica si hay página anterior' }
                        }
                    }
                }
            },
            Product: {
                type: 'object',
                required: ['name', 'price'],
                properties: {
                    id: { type: 'integer', description: 'ID único del producto', example: 1 },
                    name: { type: 'string', description: 'Nombre del producto', example: 'Control Genérico Alámbrico', minLength: 2, maxLength: 255 },
                    description: { type: 'string', description: 'Descripción detallada del producto', example: 'Control genérico alámbrico compatible con PC y consolas, marca XIAOMI, conexión USB, ergonomía mejorada.', maxLength: 1000 },
                    price: { type: 'number', format: 'decimal', description: 'Precio de venta al público', example: 299.99, minimum: 0 },
                    cost: { type: 'number', format: 'decimal', description: 'Costo de adquisición del producto', example: 180.00, minimum: 0 },
                    sku: { type: 'string', description: 'Código SKU único del producto', example: 'XIAOMI-CONTROL-USB-001', maxLength: 50 },
                    barcode: { type: 'string', description: 'Código de barras para lectura óptica', example: '7894561230123', maxLength: 50 },
                    category: { type: 'string', description: 'Categoría del producto', example: 'Accesorios > Controles', maxLength: 100 },
                    brand: { type: 'string', description: 'Marca del producto', example: 'XIAOMI', maxLength: 100 },
                    unit_of_measure: { type: 'string', enum: ['unit', 'kg', 'liter', 'meter', 'box', 'pack'], description: 'Unidad de medida para el producto', example: 'unit' },
                    minimum_stock: { type: 'integer', description: 'Cantidad mínima de stock requerida', example: 5, minimum: 0 },
                    maximum_stock: { type: 'integer', description: 'Cantidad máxima de stock permitida', example: 100, minimum: 0 },
                    is_active: { type: 'boolean', description: 'Estado activo del producto', example: true },
                    created_at: { type: 'string', format: 'date-time', description: 'Fecha y hora de creación del producto', example: '2024-10-01T08:00:00Z' },
                    updated_at: { type: 'string', format: 'date-time', description: 'Fecha y hora de última actualización', example: '2024-10-06T14:30:00Z' }
                }
            },
            ProductInput: {
                type: 'object',
                required: ['name', 'sku', 'unit_price', 'cost_price'],
                properties: {
                    name: { type: 'string', minLength: 2, maxLength: 150, example: 'Control Genérico Alámbrico' },
                    description: { type: 'string', maxLength: 1000, example: 'Control genérico alámbrico compatible con PC y consolas.' },
                    sku: { type: 'string', maxLength: 50, example: 'XIAOMI-CTRL-USB-001' },
                    barcode: { type: 'string', maxLength: 20, example: '7894561230123' },
                    unit_price: { type: 'number', format: 'decimal', minimum: 0.01, example: 299.99 },
                    cost_price: { type: 'number', format: 'decimal', minimum: 0.01, example: 180.00 },
                    tax_rate: { type: 'number', format: 'decimal', minimum: 0, maximum: 1, default: 0.16, example: 0.16 },
                    unit_measure: {
                        type: 'string',
                        enum: ['pza', 'kg', 'm', 'litro', 'm2', 'm3', 'caja', 'paquete'],
                        default: 'pza',
                        example: 'pza'
                    },
                    min_stock: { type: 'integer', minimum: 0, default: 5, example: 5 },
                    max_stock: { type: 'integer', minimum: 1, default: 1000, example: 100 },
                    is_active: { type: 'boolean', default: true, example: true }
                }
            },
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' },
                    first_name: { type: 'string', example: 'Edgar', maxLength: 100 },
                    last_name: { type: 'string', example: 'Gómez', maxLength: 100 },
                    email: { type: 'string', format: 'email', example: 'owner@gamigstore.com' },
                    role: { type: 'string', enum: ['admin', 'manager', 'cashier'], example: 'cashier' },
                    employee_id: { type: 'string', example: 'EMP001', maxLength: 20 },
                    phone: { type: 'string', example: '81-1234-5678', maxLength: 20 },
                    branch_id: { type: 'string', format: 'uuid', example: 'b2c3d4e5-f6a7-8901-2345-67890abcdef1' },
                    is_active: { type: 'boolean', example: true },
                    hire_date: { type: 'string', format: 'date', example: '2024-01-15' },
                    last_login: { type: 'string', format: 'date-time', example: '2024-10-06T10:30:00Z' },
                    created_at: { type: 'string', format: 'date-time', example: '2024-10-01T08:00:00Z' },
                    updated_at: { type: 'string', format: 'date-time', example: '2024-10-06T10:30:00Z' }
                }
            },
            Branch: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    name: { type: 'string', example: 'Sucursal Centro', maxLength: 100 },
                    code: { type: 'string', example: 'CTR-001', maxLength: 20 },
                    address: { type: 'string', example: 'Av. Juárez #123, Centro', maxLength: 255 },
                    city: { type: 'string', example: 'Monterrey', maxLength: 100 },
                    state: { type: 'string', example: 'Nuevo León', maxLength: 100 },
                    postal_code: { type: 'string', example: '64000', maxLength: 10 },
                    phone: { type: 'string', example: '81-1234-5678', maxLength: 20 },
                    email: { type: 'string', format: 'email', example: 'centro@empresa.com' },
                    manager_id: { type: 'integer', example: 1 },
                    is_active: { type: 'boolean', example: true },
                    created_at: { type: 'string', format: 'date-time', example: '2024-10-01T08:00:00Z' },
                    updated_at: { type: 'string', format: 'date-time', example: '2024-10-06T10:30:00Z' }
                }
            },
            BranchInput: {
                type: 'object',
                required: ['name', 'code', 'address', 'city', 'state', 'postal_code', 'email'],
                properties: {
                    name: { type: 'string', example: 'Sucursal San Jeronimo', description: 'Nombre unico de la sucursal' },
                    code: { type: 'string', example: 'SJE-002', description: 'Codigo unico para la sucursal' },
                    address: { type: 'string', example: 'Av. San Jeronimo 500, San Jeronimo', description: 'Direccion completa de la sucursal' },
                    city: { type: 'string', example: 'Monterrey', description: 'Ciudad donde se encuentra la sucursal' },
                    state: { type: 'string', example: 'Nuevo Leon', description: 'Estado donde se encuentra la sucursal' },
                    postal_code: { type: 'string', example: '64640', description: 'Codigo postal de la sucursal' },
                    phone: { type: 'string', example: '81-8888-9999', description: 'Telefono de contacto de la sucursal' },
                    email: { type: 'string', format: 'email', example: 'sanjeronimo@empresa.com', description: 'Email de contacto de la sucursal' },
                    manager_id: { type: 'integer', example: 2, description: 'ID del usuario que sera el gerente de la sucursal (opcional)' }
                }
            },
            BranchUpdate: {
                type: 'object',
                properties: {
                    name: { type: 'string', example: 'Sucursal San Jeronimo', description: 'Nombre unico de la sucursal' },
                    address: { type: 'string', example: 'Av. San Jeronimo 500, San Jeronimo', description: 'Direccion completa de la sucursal' },
                    city: { type: 'string', example: 'Monterrey', description: 'Ciudad donde se encuentra la sucursal' },
                    state: { type: 'string', example: 'Nuevo Leon', description: 'Estado donde se encuentra la sucursal' },
                    postal_code: { type: 'string', example: '64640', description: 'Codigo postal de la sucursal' },
                    phone: { type: 'string', example: '81-8888-9999', description: 'Telefono de contacto de la sucursal' },
                    email: { type: 'string', format: 'email', example: 'sanjeronimo@empresa.com', description: 'Email de contacto de la sucursal' },
                    manager_id: { type: 'integer', example: 2, description: 'ID del usuario que sera el gerente de la sucursal' },
                    is_active: { type: 'boolean', example: true, description: 'Estado de la sucursal' }
                }
            },
            Customer: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    first_name: { type: 'string', example: 'Ana', maxLength: 100 },
                    last_name: { type: 'string', example: 'Martínez', maxLength: 100 },
                    email: { type: 'string', format: 'email', example: 'ana.martinez@email.com' },
                    phone: { type: 'string', example: '81-1234-5678', maxLength: 20 },
                    address: { type: 'string', example: 'Calle Falsa 123, Colonia Centro', maxLength: 255 },
                    city: { type: 'string', example: 'Monterrey', maxLength: 100 },
                    state: { type: 'string', example: 'Nuevo León', maxLength: 100 },
                    postal_code: { type: 'string', example: '64000', maxLength: 10 },
                    company_name: { type: 'string', example: 'Tecnología Avanzada S.A.', maxLength: 150 },
                    tax_id: { type: 'string', example: 'MATA850315AB1', maxLength: 20 },
                    is_active: { type: 'boolean', example: true },
                    created_at: { type: 'string', format: 'date-time', example: '2024-10-01T08:00:00Z' },
                    updated_at: { type: 'string', format: 'date-time', example: '2024-10-06T10:30:00Z' }
                }
            },
            Inventory: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    product_id: { type: 'integer', example: 1 },
                    branch_id: { type: 'integer', example: 1 },
                    current_stock: { type: 'integer', example: 25, minimum: 0 },
                    minimum_stock: { type: 'integer', example: 5, minimum: 0 },
                    maximum_stock: { type: 'integer', example: 100, minimum: 0 },
                    reserved_stock: { type: 'integer', example: 3, minimum: 0 },
                    location: { type: 'string', example: 'A1-B2-C3', maxLength: 50 },
                    last_restock_date: { type: 'string', format: 'date-time', example: '2024-10-01T10:00:00Z' },
                    created_at: { type: 'string', format: 'date-time', example: '2024-09-15T08:00:00Z' },
                    updated_at: { type: 'string', format: 'date-time', example: '2024-10-06T14:30:00Z' }
                }
            },
            InventoryInput: {
                type: 'object',
                required: ['product_id', 'branch_id', 'quantity'],
                properties: {
                    product_id: { type: 'string', format: 'uuid', description: 'ID del producto (UUID)' },
                    branch_id: { type: 'string', format: 'uuid', description: 'ID de la sucursal (UUID)' },
                    quantity: { type: 'integer', example: 10, minimum: 0, description: 'Cantidad actual en stock' },
                    min_stock: { type: 'integer', example: 5, minimum: 0, description: 'Stock mínimo requerido' },
                    notes: { type: 'string', example: 'Inventario inicial', maxLength: 500, description: 'Notas adicionales' }
                },
                example: {
                    product_id: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
                    branch_id: "b2c3d4e5-f6a7-8901-2345-67890abcdef1",
                    quantity: 20,
                    min_stock: 10,
                    notes: "Inventario inicial para nuevo producto"
                }
            },
            Sale: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    sale_number: { type: 'string', example: 'VEN-2024-000001' },
                    customer_id: { type: 'integer', example: 1 },
                    user_id: { type: 'integer', example: 1 },
                    branch_id: { type: 'integer', example: 1 },
                    sale_date: { type: 'string', format: 'date-time', example: '2024-10-06T14:30:00Z' },
                    status: { type: 'string', enum: ['pending', 'completed', 'cancelled', 'refunded'], example: 'completed' },
                    payment_method: { type: 'string', enum: ['cash', 'card', 'transfer', 'mixed'], example: 'card' },
                    subtotal: { type: 'number', format: 'float', example: 599.99 },
                    tax_amount: { type: 'number', format: 'float', example: 95.99 },
                    discount_amount: { type: 'number', format: 'float', example: 50.00 },
                    total_amount: { type: 'number', format: 'float', example: 645.98 },
                    notes: { type: 'string', example: 'Cliente frecuente - Descuento aplicado', maxLength: 500 },
                    created_at: { type: 'string', format: 'date-time', example: '2024-10-06T14:30:00Z' },
                    updated_at: { type: 'string', format: 'date-time', example: '2024-10-06T14:35:00Z' }
                }
            },
            SaleItem: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    sale_id: { type: 'integer', example: 1 },
                    product_id: { type: 'integer', example: 1 },
                    quantity: { type: 'integer', example: 2, minimum: 1 },
                    unit_price: { type: 'number', format: 'float', example: 599.99 },
                    discount_percentage: { type: 'number', format: 'float', example: 5.0, minimum: 0, maximum: 100 },
                    discount_amount: { type: 'number', format: 'float', example: 30.00 },
                    subtotal: { type: 'number', format: 'float', example: 1169.98 }
                }
            },
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email', example: 'owner@gamingstore.com', description: 'Email del usuario registrado' },
                    password: { type: 'string', minLength: 6, example: 'admin123', description: 'Contraseña del usuario' }
                }
            },
            LoginResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Login exitoso' },
                    data: {
                        type: 'object',
                        properties: {
                            user: { $ref: '#/components/schemas/User' },
                            token: {
                                type: 'string',
                                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzU5OTg0NzA4LCJleHAiOjE3NjAwNzExMDh9.s_5_85iKnUDGYLkLCLYCGgVPoH3mP2NTaQfJTF7QNb4',
                                description: 'JWT token para autenticación'
                            },
                            expires_in: { type: 'string', example: '24h' }
                        }
                    }
                }
            },
            SuccessResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Operación exitosa' },
                    data: { type: 'object' }
                }
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Error en la operación' },
                    error: { type: 'string', example: 'Descripción detallada del error' },
                    code: { type: 'string', example: 'VALIDATION_ERROR' }
                }
            },
            PaginationResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                        type: 'array',
                        items: { type: 'object' },
                        description: 'Array de elementos'
                    },
                    pagination: {
                        type: 'object',
                        properties: {
                            page: { type: 'integer', example: 1, description: 'Página actual' },
                            limit: { type: 'integer', example: 10, description: 'Elementos por página' },
                            total: { type: 'integer', example: 100, description: 'Total de elementos' },
                            totalPages: { type: 'integer', example: 10, description: 'Total de páginas' }
                        }
                    }
                }
            },
            UserSession: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    user_id: { type: 'integer', example: 1 },
                    session_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                    refresh_token: { type: 'string', example: 'refresh_token_example' },
                    ip_address: { type: 'string', example: '192.168.1.100' },
                    user_agent: { type: 'string', example: 'Mozilla/5.0...' },
                    login_at: { type: 'string', format: 'date-time' },
                    last_activity: { type: 'string', format: 'date-time' },
                    expires_at: { type: 'string', format: 'date-time' },
                    is_active: { type: 'boolean', example: true },
                    logout_at: { type: 'string', format: 'date-time', nullable: true },
                    created_at: { type: 'string', format: 'date-time' },
                    updated_at: { type: 'string', format: 'date-time' }
                }
            }
        }
    },
    security: [
        {
            bearerAuth: []
        }
    ]
};

const options = {
    definition: swaggerDefinition,
    apis: [
        './src/infrastructure/routes/*.js',
        './src/infrastructure/controllers/*.js',
        './src/app.js'
    ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
