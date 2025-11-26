const db = require('../models');
const { Branch } = db;

async function seedBranches() {
  // Solo crear CEDIS para deploy
  return await Branch.bulkCreate([
    {
      name: 'CEDIS - Centro de Distribución',
      code: 'CEDIS-000',
      address: 'Blvd. Industrial #1000, Zona Industrial',
      city: 'Monterrey',
      state: 'Nuevo Leon',
      postal_code: '64000',
      phone: '81-0000-0000',
      email: 'cedis@empresa.com',
      is_active: true
    }
  ])  
}

module.exports = seedBranches;
