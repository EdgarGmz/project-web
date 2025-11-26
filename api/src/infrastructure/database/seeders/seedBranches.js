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
      email: 'cedis@apexstore.com',
      is_active: true
    },
    {
      name: 'Sucursal A',
      code: 'SUA-001',
      address: 'Av. Revolución #1000, Zona Industrial',
      city: 'Garcia',
      state: 'Nuevo Leon',
      postal_code: '64000',
      phone: '81-0000-0000',
      email: 'garcia@apexstore.com',
      is_active: true
    },
    {
      name: 'Sucursal B',
      code: 'SUB-002',
      address: 'Av. Rio Grande #982, Zona Centro',
      city: 'Santa Catarina',
      state: 'Nuevo Leon',
      postal_code: '64000',
      phone: '81-0000-0000',
      email: 'santacarina@apexstore.com',
      is_active: true
    }
  ])  
}

module.exports = seedBranches;
