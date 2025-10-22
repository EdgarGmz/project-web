const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User, Branch } = require('../database/models');

// Helper para generar JWT
const generateToken = (userId) =>
    jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

// Helper para limpiar usuario
const cleanUser = (user) => ({
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role,
    employee_id: user.employee_id,
    branch_id: user.branch_id,
    branch: user.Branch,
});

// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res
                .status(400)
                .json({ success: false, message: 'Email y contraseña son requeridos' });
        }

        const user = await User.findOne({
            where: { email: email.toLowerCase() },
            include: [
                {
                    model: Branch,
                    as: 'Branch',
                    attributes: ['id', 'name', 'code', 'city'],
                },
            ],
            attributes: [
                'id',
                'first_name',
                'last_name',
                'email',
                'password',
                'role',
                'employee_id',
                'is_active',
                'branch_id',
            ],
        });

        if (!user || !user.is_active) {
            return res
                .status(401)
                .json({ success: false, message: 'Credenciales inválidas o usuario desactivado' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res
                .status(401)
                .json({ success: false, message: 'Credenciales inválidas' });
        }

        await user.update({ last_login: new Date() });
        const token = generateToken(user.id);

        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            data: {
                user: cleanUser(user),
                token,
                expires_in: process.env.JWT_EXPIRES_IN || '24h',
            },
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

// Obtener perfil
const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [
                {
                    model: Branch,
                    as: 'Branch',
                    attributes: ['id', 'name', 'code', 'city', 'address'],
                },
            ],
            attributes: [
                'id',
                'first_name',
                'last_name',
                'email',
                'role',
                'employee_id',
                'phone',
                'branch_id',
                'hire_date',
                'is_active',
                'created_at',
            ],
        });
        res.status(200).json({
            success: true,
            message: 'Perfil obtenido exitosamente',
            data: user,
        });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

// Actualizar perfil
const updateProfile = async (req, res) => {
    try {
        const { first_name, last_name, phone, email } = req.body;
        const userId = req.user.id;

        if (email && email !== req.user.email) {
            const existingUser = await User.findOne({
                where: { email: email.toLowerCase(), id: { [Op.ne]: userId } },
            });
            if (existingUser) {
                return res
                    .status(409)
                    .json({ success: false, message: 'El email ya está en uso por otro usuario' });
            }
        }

        await User.update(
            {
                first_name,
                last_name,
                phone,
                email: email ? email.toLowerCase() : undefined,
            },
            { where: { id: userId } }
        );

        const updatedUser = await User.findByPk(userId, {
            include: [
                {
                    model: Branch,
                    as: 'Branch',
                    attributes: ['id', 'name', 'code', 'city'],
                },
            ],
            attributes: [
                'id',
                'first_name',
                'last_name',
                'email',
                'role',
                'employee_id',
                'phone',
                'branch_id',
                'hire_date',
                'is_active',
                'created_at',
            ],
        });

        res.status(200).json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            data: updatedUser,
        });
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
    try {
        const { current_password, new_password } = req.body;
        const userId = req.user.id;

        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña actual y nueva contraseña son requeridas',
            });
        }
        if (new_password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres',
            });
        }

        const user = await User.scope('withPassword').findByPk(userId);
        const isCurrentPasswordValid = await bcrypt.compare(current_password, user.password);
        if (!isCurrentPasswordValid) {
            return res
                .status(401)
                .json({ success: false, message: 'La contraseña actual es incorrecta' });
        }

        const hashedNewPassword = await bcrypt.hash(new_password, 12);
        await user.update({ password: hashedNewPassword });

        res.status(200).json({ success: true, message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

// Logout (solo respuesta, JWT no se puede invalidar en backend puro)
const logout = async (req, res) => {
    try {
        res.status(200).json({ success: true, message: 'Logout exitoso' });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};

module.exports = {
    login,
    getProfile,
    updateProfile,
    changePassword,
    logout,
};