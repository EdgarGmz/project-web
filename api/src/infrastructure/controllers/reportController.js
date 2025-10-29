const db = require('../database/models');
const { Report, Branch } = db;

// Obtener todos los reportes
const getAllReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const type = req.query.type;
    const branch_id = req.query.branch_id;

    const whereClause = {};
    if (type) whereClause.type = type;
    if (branch_id) whereClause.branch_id = branch_id;

    const { count, rows } = await Report.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['generated_at', 'DESC']],
      include: [
        { model: Branch, as: 'branch', attributes: ['id', 'name'] }
      ]
    });

    res.json({
      success: true,
      message: 'Reportes obtenidos exitosamente',
      data: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// Obtener un reporte por ID
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findByPk(id, {
      include: [{ model: Branch, as: 'branch', attributes: ['id', 'name'] }]
    });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    }
    res.json({ success: true, message: 'Reporte obtenido exitosamente', data: report });
  } catch (error) {
    console.error('Error al obtener reporte:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// Crear un nuevo reporte
const createReport = async (req, res) => {
  try {
    const { branch_id, type, title, description, data } = req.body;
    if (!type || !title || !data) {
      return res.status(400).json({ success: false, message: 'Tipo, título y datos son obligatorios' });
    }
    const newReport = await Report.create({ branch_id, type, title, description, data });
    res.status(201).json({ success: true, message: 'Reporte creado exitosamente', data: newReport });
  } catch (error) {
    console.error('Error al crear reporte:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// Actualizar un reporte
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    }
    await report.update(updateData);
    res.json({ success: true, message: 'Reporte actualizado exitosamente', data: report });
  } catch (error) {
    console.error('Error al actualizar reporte:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

// Eliminar un reporte
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Reporte no encontrado' });
    }
    await report.destroy();
    res.json({ success: true, message: 'Reporte eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar reporte:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

module.exports = {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport
};
