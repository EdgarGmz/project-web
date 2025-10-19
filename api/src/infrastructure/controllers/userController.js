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
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Branch,
                    as: 'Branch',
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
                    as: 'Branch',
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
        const { first_name, last_name, email, password, role, employee_id, phone, hire_date, branch_id, is_active } = req.body

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, apellido, email y password son obligatorios'
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

        // Verificar employee_id duplicado si se proporciona
        if (employee_id) {
            const existingEmployeeId = await User.findOne({ where: { employee_id } })
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

        // Verificar employee_id duplicado (si se está actualizando)
        if (updateData.employee_id && updateData.employee_id !== user.employee_id) {
            const existingEmployeeId = await User.findOne({
                where: {
                    employee_id: updateData.employee_id,
                    id: { [db.Sequelize.Op.ne]: id }
                }
            })
            if (existingEmployeeId) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID de empleado ya está en uso'
                })
            }
        }

        await user.update(updateData)

        const userResponse = { ...user.toJSON() }
        delete userResponse.password

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