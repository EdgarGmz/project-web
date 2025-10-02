const db = require('../infrastructure/database/models')
const { User, Branch } = db

//Obtener todos los usuarios
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const offset = (page - 1) * limit

        // Búsqueda opcional por nombre o email
        const search = req.query.search || ''
        const whereClause = search ? {
            [db.Sequelize.Op.or]: [
                { username: { [db.Sequelize.Op.iLike]: `%${search}%` } },
                { email: { [db.Sequelize.Op.iLike]: `%${search}%` } }
            ]
        } : {}

        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Branch,
                    as: 'branch',
                    attributes: ['id', 'name']
                }
            ],
            attributes: { exclude: ['password_hash'] } // No devolver password
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

//Obtener un usuario por ID
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
            attributes: { exclude: ['password_hash'] }
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
        const { username, email, password, role, branch_id, is_active } = req.body

        // Validaciones básicas
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email y password son obligatorios'
            })
        }

        // Verificar si el username ya existe
        const existingUsername = await User.findOne({ where: { username } })
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'El username ya está en uso'
            })
        }

        // Verificar si el email ya existe
        const existingEmail = await User.findOne({ where: { email } })
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            })
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

        // TODO: Aquí deberías hashear la contraseña con bcrypt
        // Por ahora, guardamos el password como texto plano (NO RECOMENDADO en producción)
        const newUser = await User.create({
            username,
            email,
            password_hash: password, // TODO: bcrypt.hash(password, 10)
            role: role || 'employee',
            branch_id,
            is_active: is_active !== false
        })

        // No devolver el password en la respuesta
        const userResponse = { ...newUser.toJSON() }
        delete userResponse.password_hash

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: userResponse
        })

    } catch (error) {
        console.error('Error al crear usuario:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        })
    }
}


// Actualizar un usuario

const updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const updateData = { ...req.body }

        const user = await User.findByPk(id)
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            })
        }

        // Verificar username duplicado (si se está actualizando)
        if (updateData.username && updateData.username !== user.username) {
            const existingUsername = await User.findOne({ 
                where: { 
                    username: updateData.username,
                    id: { [db.Sequelize.Op.ne]: id }
                } 
            })
            if (existingUsername) {
                return res.status(400).json({
                    success: false,
                    message: 'El username ya está en uso'
                })
            }
        }

        // Verificar email duplicado (si se está actualizando)
        if (updateData.email && updateData.email !== user.email) {
            const existingEmail = await User.findOne({ 
                where: { 
                    email: updateData.email,
                    id: { [db.Sequelize.Op.ne]: id }
                } 
            })
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está en uso'
                })
            }
        }

        // Si se está actualizando la contraseña
        if (updateData.password) {
            // TODO: updateData.password_hash = await bcrypt.hash(updateData.password, 10)
            updateData.password_hash = updateData.password // Temporal
            delete updateData.password
        }

        await user.update(updateData)

        // No devolver el password en la respuesta
        const userResponse = { ...user.toJSON() }
        delete userResponse.password_hash

        res.json({
            success: true,
            message: 'Usuario actualizado exitosamente',
            data: userResponse
        })

    } catch (error) {
        console.error('Error al actualizar usuario:', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
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

        await user.update({ is_active: false })

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