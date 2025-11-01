const db = require('../models');
const { Report, Branch } = db;

async function seedReports() {
  const branches = await Branch.findAll({ limit: 2 });
  return await Report.bulkCreate([
    { branch_id: branches[0]?.id || null, type: 'sales', title: 'Reporte de Ventas Semanal', description: 'Estadísticas de ventas de la semana actual.', data: { totalSales: 120, totalAmount: 15000, bestSeller: 'PlayStation 5' }, generated_at: new Date() },
    { branch_id: branches[1]?.id || null, type: 'inventory', title: 'Reporte de Inventario Mensual', description: 'Inventario y productos más vendidos del mes.', data: { lowStock: ['Nintendo Switch OLED'], outOfStock: [], topProduct: 'God of War Ragnarök' }, generated_at: new Date() },
    { branch_id: null, type: 'performance', title: 'Rendimiento General de Sucursales', description: 'Comparativo de ventas y desempeño por sucursal.', data: { branches: [{ name: 'Centro', sales: 8000 }, { name: 'Norte', sales: 7000 }] }, generated_at: new Date() }
  ]);
}

module.exports = seedReports;
