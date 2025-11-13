const db = require('../database/models')
const { User, Branch } = db

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const offset = (page - 1) * limit

        // Búsqueda opcional por nombre o email
        const search = req.query.search || ''
        const whereClause = search ? {
            [db.Sequelize.Op.or]: [
                { first_name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
                { last_name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
                { email: { [db.Sequelize.Op.iLike]: `%${search}%` } }
            ]
        } : {}

        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [
                // Primero el owner, luego por fecha de creación descendente
                [db.Sequelize.literal("CASE WHEN role = 'owner' THEN 0 ELSE 1 END"), 'ASC'],
                ['created_at', 'DESC']
            ],
            include: [
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'name']
                }
            ],
            attributes: { exclude: ['password'] }
        })

        res.json({
            success: true,
            message: 'Usuarios obtenidos exitosamente',
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                pages: Math.ceil(count / limit)
            }
        })

    } catch (error) {
        console.error('Error al obtener usuarios:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Obtener un usuario por ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params

        const user = await User.findByPk(id, {
            include: [
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'name', 'address']
                }
            ],
            attributes: { exclude: ['password'] }
        })

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            })
        }

        res.json({
            success: true,
            message: 'Usuario obtenido exitosamente',
            data: user
        })

    } catch (error) {
        console.error('Error al obtener usuario:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

// Crear un nuevo usuario
const createUser = async (req, res) => {
    try {
        let { first_name, last_name, email, password, role, employee_id, phone, hire_date, branch_id, is_active } = req.body

        // Validaciones básicas
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, apellido, email y password son obligatorios'
            })
        }

        // Validar roles permitidos para creación
        const allowedRoles = ['admin', 'supervisor', 'cashier']
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden crear usuarios con los roles: admin, supervisor o cashier'
            })
        }

        // Generar employee_id automáticamente si no se proporciona
        if (!employee_id) {
            // Generar un ID basado en las iniciales y un número aleatorio
            const initials = (first_name.charAt(0) + last_name.charAt(0)).toUpperCase()
            const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
            employee_id = `EMP${initials}${randomNum}`
            
            // Verificar que no exista ya
            let attempts = 0
            while (attempts < 10) {
                const existingId = await User.findOne({ where: { employee_id } })
                if (!existingId) break
                
                const newRandomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
                employee_id = `EMP${initials}${newRandomNum}`
                attempts++
            }
        }

        // Limpiar y validar branch_id
        if (branch_id === '' || branch_id === null || branch_id === undefined) {
            branch_id = null
        } else if (branch_id && typeof branch_id === 'string') {
            // Si es un UUID (36 caracteres), mantenerlo como string
            // Si es un número como string, convertirlo a entero
            if (branch_id.length === 36) {
                // Es un UUID, mantener como string
                console.log('✅ branch_id es UUID en createUser, manteniéndolo:', branch_id)
            } else {
                // Intentar convertir a número
                const numericBranchId = parseInt(branch_id, 10)
                if (isNaN(numericBranchId)) {
                    branch_id = null
                } else {
                    branch_id = numericBranchId
                }
            }
        }

        // Regla de negocio: Solo supervisores y cajeros requieren sucursal específica
        if ((role === 'supervisor' || role === 'cashier') && !branch_id) {
            return res.status(400).json({
                success: false,
                message: 'Los supervisores y cajeros deben pertenecer a una sucursal'
            })
        }

        // Regla de negocio: Admins y owners van a CEDIS por defecto
        if ((role === 'admin' || role === 'owner')) {
            // Buscar CEDIS (debería ser ID 1)
            let cedis = await Branch.findOne({ where: { code: 'CEDIS-000' } })
            if (!cedis) {
                // Si CEDIS no existe, crearlo automáticamente
                console.log('CEDIS no encontrado, creando automáticamente...')
                cedis = await Branch.create({
                    name: 'CEDIS - Centro de Distribución',
                    code: 'CEDIS-000',
                    address: 'Blvd. Industrial #1000, Zona Industrial, Monterrey',
                    city: 'Monterrey',
                    state: 'Nuevo Leon',
                    postal_code: '64000',
                    phone: '81-0000-0000',
                    email: 'cedis@apexstore.com',
                    is_active: true
                })
                console.log('CEDIS creado con ID:', cedis.id)
            }
            branch_id = cedis.id
        }

        // El sistema solo debe contener un 'owner' por regla de negocio
        if (role === 'owner') {
            const existingOwner = await User.findOne({ 
                where: { role: 'owner' },
                paranoid: false // Incluir usuarios eliminados
            })
            if (existingOwner) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un usuario con el rol de owner'
                })
            }
        }

        // Verificar si el email ya existe (incluyendo usuarios eliminados)
        const existingEmail = await User.findOne({ 
            where: { email },
            paranoid: false // Incluir registros soft-deleted
        })
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está en uso'
            })
        }

        // Verificar employee_id duplicado si se proporciona (incluyendo usuarios eliminados)
        if (employee_id) {
            const existingEmployeeId = await User.findOne({ 
                where: { employee_id },
                paranoid: false // Incluir registros soft-deleted
            })
            if (existingEmployeeId) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID de empleado ya está en uso'
                })
            }
        }

        // Verificar que la sucursal existe (si se proporciona)
        if (branch_id) {
            const branch = await Branch.findByPk(branch_id)
            if (!branch) {
                return res.status(400).json({
                    success: false,
                    message: 'La sucursal especificada no existe'
                })
            }
        }

        const newUser = await User.create({
            first_name,
            last_name,
            email,
            password,
            role: role || 'cashier',
            employee_id,
            phone,
            hire_date,
            branch_id,
            is_active: is_active !== false
        })

        const userResponse = { ...newUser.toJSON() }
        delete userResponse.password

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: userResponse
        })

    } catch (error) {
        console.error('❌ Error detallado al crear usuario:')
        console.error('- Mensaje:', error.message)
        console.error('- Stack:', error.stack)
        console.error('- Datos recibidos:', req.body)
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor: ' + error.message,
            error: error.message
        })
    }
}

// Actualizar un usuario
const updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const updateData = { ...req.body }

        console.log('🔄 Actualizando usuario:', id)
        console.log('📝 Datos originales recibidos:', updateData)

        const user = await User.findByPk(id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            })
        }

        // Validar roles permitidos para actualización (no se puede cambiar a owner)
        if (updateData.role && updateData.role === 'owner') {
            return res.status(400).json({
                success: false,
                message: 'No se puede asignar el rol de propietario a través de actualización'
            })
        }

        // Verificar email duplicado (si se está actualizando, incluyendo usuarios eliminados)
        if (updateData.email && updateData.email !== user.email) {
            const existingEmail = await User.findOne({
                where: {
                    email: updateData.email,
                    id: { [db.Sequelize.Op.ne]: id }
                },
                paranoid: false // Incluir registros soft-deleted
            })
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está en uso'
                })
            }
        }

        // Verificar employee_id duplicado (si se está actualizando, incluyendo usuarios eliminados)
        if (updateData.employee_id && updateData.employee_id !== user.employee_id) {
            const existingEmployeeId = await User.findOne({
                where: {
                    employee_id: updateData.employee_id,
                    id: { [db.Sequelize.Op.ne]: id }
                },
                paranoid: false // Incluir registros soft-deleted
            })
            if (existingEmployeeId) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID de empleado ya está en uso'
                })
            }
        }

        // Aplicar reglas de negocio para sucursales si se está actualizando el rol o branch_id
        if (updateData.role || updateData.hasOwnProperty('branch_id')) {
            const newRole = updateData.role || user.role

            // Regla de negocio: Solo supervisores y cajeros requieren sucursal específica
            if ((newRole === 'supervisor' || newRole === 'cashier') && 
                (!updateData.branch_id || updateData.branch_id === '' || updateData.branch_id === null)) {
                
                // Si está cambiando DE otro rol A supervisor/cajero, verificar sucursal actual
                if (updateData.role && user.branch_id) {
                    // Verificar si la sucursal actual es CEDIS
                    const currentBranch = await Branch.findByPk(user.branch_id)
                    console.log(`🏢 Sucursal actual del usuario:`, {
                        id: currentBranch?.id,
                        code: currentBranch?.code,
                        name: currentBranch?.name
                    })
                    
                    if (currentBranch && currentBranch.code === 'CEDIS-000') {
                        // Usuario está en CEDIS pero necesita ir a una sucursal específica
                        return res.status(400).json({
                            success: false,
                            code: 'CEDIS_ROLE_CONFLICT',
                            message: `Los supervisores y cajeros no pueden estar asignados a CEDIS (${currentBranch.name}). Para cambiar el rol a ${newRole}, primero debe asignar al usuario a una sucursal específica desde el formulario de edición.`
                        })
                    }
                    
                    // Conservar la sucursal actual del usuario (no es CEDIS)
                    updateData.branch_id = user.branch_id
                    console.log(`✅ Usuario cambiado a ${newRole}, conservando sucursal actual: ${user.branch_id}`)
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Los supervisores y cajeros deben pertenecer a una sucursal específica. Por favor, asigna una sucursal primero.'
                    })
                }
            }

            // Regla de negocio: Admins y owners van a CEDIS por defecto
            if ((newRole === 'admin' || newRole === 'owner')) {
                // Buscar CEDIS
                let cedis = await Branch.findOne({ where: { code: 'CEDIS-000' } })
                if (!cedis) {
                    // Si CEDIS no existe, crearlo automáticamente
                    console.log('CEDIS no encontrado en updateUser, creando automáticamente...')
                    cedis = await Branch.create({
                        name: 'CEDIS - Centro de Distribución',
                        code: 'CEDIS-000',
                        address: 'Blvd. Industrial #1000, Zona Industrial, Monterrey',
                        city: 'Monterrey',
                        state: 'Nuevo Leon',
                        postal_code: '64000',
                        phone: '81-0000-0000',
                        email: 'cedis@apexstore.com',
                        is_active: true
                    })
                    console.log('CEDIS creado en updateUser con ID:', cedis.id)
                }
                updateData.branch_id = cedis.id
            }
        }

        // Limpiar y validar branch_id DESPUÉS de aplicar reglas de negocio
        if (updateData.branch_id === '' || updateData.branch_id === null || updateData.branch_id === undefined) {
            updateData.branch_id = null
        } else if (updateData.branch_id && typeof updateData.branch_id === 'string') {
            // Si es un UUID (36 caracteres), mantenerlo como string
            // Si es un número como string, convertirlo a entero
            if (updateData.branch_id.length === 36) {
                // Es un UUID, mantener como string
                console.log('✅ branch_id es UUID, manteniéndolo:', updateData.branch_id)
            } else {
                // Intentar convertir a número
                const numericBranchId = parseInt(updateData.branch_id, 10)
                if (isNaN(numericBranchId)) {
                    updateData.branch_id = null
                } else {
                    updateData.branch_id = numericBranchId
                }
            }
        }

        console.log('✅ Datos finales a actualizar:', updateData)

        await user.update(updateData)

        const userResponse = { ...user.toJSON() }
        delete userResponse.password

        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            data: userResponse
        })

    } catch (error) {
        console.error('❌ Error detallado al actualizar usuario:')
        console.error('- Usuario ID:', req.params.id)
        console.error('- Mensaje:', error.message)
        console.error('- Nombre del error:', error.name)
        console.error('- Datos recibidos:', req.body)
        console.error('- Stack:', error.stack)
        
        // Si es un error de validación de Sequelize, dar más detalles
        if (error.name === 'SequelizeValidationError') {
            console.error('- Errores de validación:', error.errors)
            const validationErrors = error.errors.map(err => `${err.path}: ${err.message}`).join(', ')
            return res.status(400).json({
                success: false,
                message: 'Error de validación: ' + validationErrors,
                error: error.message
            })
        }
        
        // Si es un error de constraint único
        if (error.name === 'SequelizeUniqueConstraintError') {
            console.error('- Campos duplicados:', error.errors)
            return res.status(400).json({
                success: false,
                message: 'Ya existe un usuario con estos datos',
                error: error.message
            })
        }
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor: ' + error.message,
            error: error.message
        })
    }
}

// Eliminar un usuario (soft delete)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params

        const user = await User.findByPk(id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            })
        }

        // Regla de negocio: No se puede eliminar al usuario owner
        if (user.role === 'owner') {
            return res.status(403).json({
                success: false,
                message: 'No se puede eliminar al usuario propietario del sistema (owner)'
            })
        }

        // Usar soft delete para mantener consistencia con productos
        await user.destroy() // Sequelize soft delete (paranoid: true)

        res.json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        })

    } catch (error) {
        console.error('Error al eliminar usuario:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
}
