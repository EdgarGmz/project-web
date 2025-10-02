const swaggerJSDoc = require('swagger-jsdoc')
require('dotenv').config()

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'API Sistema de Gestión de Inventario y Ventas',
        version: '1.0.0',
        description: 'API RESTful para gestión de inventario, ventas y clientes',
        contact: {
            name: 'EdgarGmz',
            email: 'edgar_gomez90@outlook.com'
        }
    },
    servers: [
        {
            url: `http://localhost:${process.env.PORT || 3000}${process.env.API_BASE_PATH || '/api'}`,
            description: 'Servidor de desarrollo - Prueba de API'
        }
    ],
    components: {
        schemas: {
            Product: {
                type: 'object',
                required: ['name', 'price'],
                properties: {
                    id: {
                        type: 'integer',
                        description: 'ID único del producto'
                    },
                    name: {
                        type: 'string',
                        description: 'Nombre del producto',
                        example: 'Laptop Dell XPS 13'
                    },
                    description: {
                        type: 'string',
                        description: 'Descripción del producto',
                        example: 'Laptop ultrabook con procesador Intel i7'
                    },
                    price: {
                        type: 'number',
                        format: 'decimal',
                        description: 'Precio de venta',
                        example: 1299.99
                    },
                    cost: {
                        type: 'number',
                        format: 'decimal',
                        description: 'Costo del producto',
                        example: 899.99
                    },
                    sku: {
                        type: 'string',
                        description: 'Código SKU único',
                        example: 'DELL-XPS13-001'
                    },
                    barcode: {
                        type: 'string',
                        description: 'Código de barras',
                        example: '1234567890123'
                    },
                    unit_of_measure: {
                        type: 'string',
                        enum: ['unit', 'kg', 'liter', 'meter', 'box'],
                        description: 'Unidad de medida',
                        example: 'unit'
                    },
                    minimum_stock: {
                        type: 'integer',
                        description: 'Stock mínimo',
                        example: 5
                    },
                    maximum_stock: {
                        type: 'integer',
                        description: 'Stock máximo',
                        example: 100
                    },
                    is_active: {
                        type: 'boolean',
                        description: 'Estado del producto',
                        example: true
                    },
                    created_at: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Fecha de creación'
                    },
                    updated_at: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Fecha de actualización'
                    }
                }
            },

            Branch: {
                type: 'object',
                required: ['name', 'address'],
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string', example: 'Sucursal Centro' },
                    address: { type: 'string', example: 'Av. Principal #123' },
                    phone: { type: 'string', example: '+52 555 123 4567' },
                    email: { type: 'string', example: 'centro@empresa.com' },
                    is_active: { type: 'boolean', example: true }
                }
            },

            Customer: {
                type: 'object',
                required: ['name', 'email'],
                properties: {
                    id: { type: 'integer' },
                    name: { type: 'string', example: 'Juan Pérez' },
                    email: { type: 'string', example: 'juan@email.com' },
                    phone: { type: 'string', example: '+52 555 987 6543' },
                    address: { type: 'string', example: 'Calle Secundaria #456' },
                    is_active: { type: 'boolean', example: true }
                }
            },

            User: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                    id: { type: 'integer' },
                    username: { type: 'string', example: 'admin' },
                    email: { type: 'string', example: 'admin@empresa.com' },
                    role: { 
                        type: 'string', 
                        enum: ['admin', 'manager', 'employee'],
                        example: 'admin' 
                    },
                    branch_id: { type: 'integer', example: 1 },
                    is_active: { type: 'boolean', example: true }
                }
            },

            Sale: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    total_amount: { type: 'number', example: 299.99 },
                    payment_method: { 
                        type: 'string',
                        enum: ['cash', 'card', 'transfer'],
                        example: 'card'
                    },
                    customer_id: { type: 'integer', example: 1 },
                    user_id: { type: 'integer', example: 1 },
                    branch_id: { type: 'integer', example: 1 }
                }
            },

            Inventory: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    current_stock: { type: 'integer', example: 25 },
                    reserved_stock: { type: 'integer', example: 5 },
                    product_id: { type: 'integer', example: 1 },
                    branch_id: { type: 'integer', example: 1 }
                }
            },
            ProductInput: {
                type: 'object',
                required: ['name', 'price'],
                properties: {
                    name: {
                        type: 'string',
                        example: 'Laptop Dell XPS 13'
                    },
                    description: {
                        type: 'string',
                        example: 'Laptop ultrabook con procesador Intel i7'
                    },
                    price: {
                        type: 'number',
                        example: 1299.99
                    },
                    cost: {
                        type: 'number',
                        example: 899.99
                    },
                    sku: {
                        type: 'string',
                        example: 'DELL-XPS13-001'
                    },
                    barcode: {
                        type: 'string',
                        example: '1234567890123'
                    },
                    unit_of_measure: {
                        type: 'string',
                        enum: ['unit', 'kg', 'liter', 'meter', 'box'],
                        example: 'unit'
                    },
                    minimum_stock: {
                        type: 'integer',
                        example: 5
                    },
                    maximum_stock: {
                        type: 'integer',
                        example: 100
                    },
                    is_active: {
                        type: 'boolean',
                        example: true
                    }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: false
                    },
                    message: {
                        type: 'string',
                        example: 'Error message'
                    },
                    error: {
                        type: 'string',
                        example: 'Detailed error information'
                    }
                }
            },
            PaginatedResponse: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: true
                    },
                    message: {
                        type: 'string',
                        example: 'Productos obtenidos exitosamente'
                    },
                    data: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/Product'
                        }
                    },
                    pagination: {
                        type: 'object',
                        properties: {
                            total: {
                                type: 'integer',
                                example: 25
                            },
                            page: {
                                type: 'integer',
                                example: 1
                            },
                            limit: {
                                type: 'integer',
                                example: 10
                            },
                            pages: {
                                type: 'integer',
                                example: 3
                            }
                        }
                    }
                }
            }
        }
    }
}

const options = {
    definition: swaggerDefinition,
    apis: ['./src/routes/*.js', './src/controllers/*.js'] // Archivos que contienen documentación
}

const swaggerSpec = swaggerJSDoc(options)

module.exports = swaggerSpec