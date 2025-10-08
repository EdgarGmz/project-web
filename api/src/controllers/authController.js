const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')
const { User, Branch } = require('../infrastructure/database/models')

// Generar JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    })
}

// Login de Usuario
const login = async (req, res) => {
    try {
        const { email, password } = req.body

        // Validar datos requeridos
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contrasena son requeridos'
            })
        }

        // Buscar usuario con su sucursal
        const user = await User.findOne({
            where: { email: email.toLowerCase() },
            include: [{
                model: Branch,
                as: 'Branch',
                attributes: [ 'id', 'name', 'code', 'city']
            }],
            attributes: [ 'id', 'first_name', 'last_name', 'email', 'password', 'role', 'employee_id', 'is_active', 'branch_id' ]
        })

        // Verificar si existe el usuario
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales invalidas'
            })
        }

        // Verificar si el usuario esta activo
        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Usuario desactivado. Contacte al administrador.'
            })
        }

        // Verificar contrasena
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales invalidas'
            })
        }

        // Actualizar ultimo login
        await user.update({ last_login: new Date() })
        
        // Generar token
        const token = generateToken(user.id)

        // Preparar datos del usuario (sin contrasena)
        const userData = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            employee_id: user.employee_id,
            branch_id: user.branch_id,
            branch: user.Branch
        }

        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            data: {
                user: userData,
                token: token,
                expires_in: process.env.JWT_EXPIRES_IN || '24h'
            }
        })
            
    } catch (error) {
        console.error('Error en login: ', error)
        res.status(500).json({
            success: false,
            message: 'Error en el servidor',
            error: process.env.NODE_ENV === 'development' ? error.message: undefined
        })
    }
}

// Registro de Usuario (solo admins)
const register = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            password,
            role,
            employee_id,
            phone,
            branch_id,
            hire_date,
        } = req.body

        // Validar datos requeridos
        if (!first_name || !last_name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos obligatorios deben ser completados'
            })
        }

        // Verificar que el email no exista
        const existingUser = await User.findOne({
            where: { email: email.toLowerCase()}
        })

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'El email ya esta registrado'
            })
        }

        // Verificar que el employee_id no exista (si se proporciona)
        if (employee_id) {
            const existingEmployee = await User.findOne({
                where: { employee_id }
            })

            if (existingEmployee) {
                return res.status(409).json({
                    success: false,
                    message: 'El ID de empleado ya esta registrado'
                })
            }
        }

        // Verificar que la sucursal exista (si se proporciona)
        if (branch_id) {
            const branch = await Branch.findByPk(branch_id)
            if (!branch) {
                return res.status(400).json({
                    success: false,
                    message: 'La sucursal especificada no existe'
                })
            }
        }

        // Encriptar la contrasena
        const saltRounds = 12
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        // Crear usuario
        const newUser = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            employee_id,
            phone,
            branch_id,
            hire_date: hire_date || new Date(),
            is_active: true
        })

        // Obtener usuario creado con datos de sucursal
        const createdUser = await User.findByPk(newUser.id, {
            include: [{
                model: Branch,
                as: 'Branch',
                attributes: ['id', 'name', 'code', 'city']
            }],
            attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'employee_id', 'phone', 'branch_id', 'hire_date', 'is_active', 'created_at']
        })

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: createdUser
        })
    } catch (error) {
        console.error('Error en registro: ', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
    }
}

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [{
                model: Branch,
                as: 'Branch',
                attributes: ['id', 'name', 'code', 'city', 'address']
            }],
            attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'employee_id', 'phone', 'branch_id', 'hire_date', 'is_active', 'created_at']
        })

        res.status(200).json({
            success: true,
            message: 'Perfil obtenido exitosamente',
            data: user
        })
    } catch (error) {
        console.error('Error al obtener perfil: ', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
    }
}

// Actualizar el perfil
const updateProfile = async (req, res) => {
    try {
        const { first_name, last_name, phone, email } = req.body
        const userId = req.user.id

        // Si se quiere cambiar el email, verificar que no exista
        if (email && email !== req.user.email) {
            const existingUser = await User.findOne({
                where: {
                    email: email.toLowerCase(),
                    id: { [Op.ne]: userId } // Excluir al usuario actual
                }
            })

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'El email ya esta en uso por otro usuario'
                })
            }
        }

        // Actualizar usuario
        await User.update({
            first_name,
            last_name,
            phone,
            email: email ? email.toLowerCase() : undefined
        }, {
            where: { id: userId }
        })

        // Obtener usuario actualizado
        const updatedUser = await User.findByPk(userId, {
            include: [{
                model: Branch,
                as: 'Branch',
                attributes: ['id', 'name', 'code', 'city']
            }],
            attributes: ['id', 'first_name', 'last_name', 'email', 'role', 'employee_id', 'phone', 'branch_id', 'hire_date', 'is_active', 'created_at']
        })

        res.status(200).json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            data: updatedUser
        })
    } catch (error) {
        console.error('Error al actualizar perfil: ', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
    }
}

// Cambiar la constrasena
const changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body
        const userId = req.user.id

        // Validar datos requeridos
        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false, 
                message: 'Contrasena actual y nueva contrasena son requeridas'
            })
        }

        // Validar la longitud de la constrasena
        if (new_password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contrasena debe tener al menos 6 caracteres'
            })
        }

        // Obtener el usuario actual
        const user = await User.findByPk(userId)

        // Varificar la contrasena actual
        const isCurrentPasswordValid = await bcrypt.compare(current_password, user.password)
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'La contrasena actual es incorrecta'
            })
        }

        // Encriptar nueva contrasena
        const saltRounds = 12
        const hashedNewPassword = await bcrypt.hash(new_password, saltRounds)

        // Actualizar contrasena
        await user.update({ password: hashedNewPassword })

        res.status(200).json({
            success: true,
            message: 'Contrasena actualizada exitosamente'
        })
    } catch (error) {
        console.error('Error al cambiar contrasena: ', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
    }
}

// Logout 
const logout = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Logout exitoso'
        })
    } catch (error) {
        console.error('Error en logout: ', error)
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        })
    }
}

module.exports = {
    login,
    register,
    getProfile,
    updateProfile,
    changePassword,
    logout
}