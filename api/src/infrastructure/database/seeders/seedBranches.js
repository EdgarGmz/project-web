const db = require('../models');
const { Branch } = db;

async function seedBranches() {
  return await Branch.bulkCreate([
     // Crear sucursales        
        {
        name: 'Sucursal Centro',
        code: 'CTR-001',
        address: 'Av. Juarez #123, Centro, Ciudad de Monterrey',
        city: 'Monterrey',
        state: 'Nuevo Leon',
        postal_code: '64000',
        phone: '81-1234-5678',
        email: 'sucursal_centro@empresa.com',
        is_active: true
        },

        {
        name: 'Sucursal Norte',
        code: 'NTE-002',
        address: 'Av. Constitucion #123, Centro, Ciudad de Guadalupe',
        city: 'Guadalupe',
        state: 'Nuevo Leon',
        postal_code: '64000',
        phone: '81-2468-1357',
        email: 'sucursal_norte@empresa.com',
        is_active: true
        },

        {
        name: 'Sucursal Sur',
        code: 'SUR-003',
        address: 'Av. Almazan #123, Centro, Ciudad de San Nicolas',
        city: 'San Nicolas',
        state: 'Nuevo Leon',
        postal_code: '64000',
        phone: '81-9876-5432',
        email: 'sucursal_sur@empresa.com',
        is_active: true
        },

        {
        name: 'Sucursal Cumbres',
        code: 'CMB-004',
        address: 'Av. Paseo de los Leones #456, Cumbres, Monterrey',
        city: 'Monterrey',
        state: 'Nuevo Leon',
        postal_code: '64610',
        phone: '81-1122-3344',
        email: 'sucursal_cumbres@empresa.com',
        is_active: true
        },

        {
        name: 'Sucursal San Pedro',
        code: 'SPD-005',
        address: 'Av. Vasconcelos #789, San Pedro Garza Garcia',
        city: 'San Pedro',
        state: 'Nuevo Leon',
        postal_code: '66220',
        phone: '81-2233-4455',
        email: 'sucursal_sanpedro@empresa.com',
        is_active: true
        },

        {
        name: 'Sucursal Apodaca',
        code: 'APD-006',
        address: 'Av. Miguel Aleman #321, Apodaca',
        city: 'Apodaca',
        state: 'Nuevo Leon',
        postal_code: '66600',
        phone: '81-3344-5566',
        email: 'sucursal_apodaca@empresa.com',
        is_active: true
        },

        {
        name: 'Sucursal Escobedo',
        code: 'ESC-007',
        address: 'Av. Sendero #654, Escobedo',
        city: 'Escobedo',
        state: 'Nuevo Leon',
        postal_code: '66050',
        phone: '81-4455-6677',
        email: 'sucursal_escobedo@empresa.com',
        is_active: true
        },

        {
        name: 'Sucursal Santa Catarina',
        code: 'STC-008',
        address: 'Av. Manuel Ordoñez #987, Santa Catarina',
        city: 'Santa Catarina',
        state: 'Nuevo Leon',
        postal_code: '66100',
        phone: '81-5566-7788',
        email: 'sucursal_santacatarina@empresa.com',
        is_active: true
        },

        {
        name: 'Sucursal Linares',
        code: 'LIN-009',
        address: 'Calle Hidalgo #159, Centro, Linares',
        city: 'Linares',
        state: 'Nuevo Leon',
        postal_code: '67700',
        phone: '821-123-4567',
        email: 'sucursal_linares@empresa.com',
        is_active: true
        },

        {
        name: 'Sucursal Saltillo',
        code: 'SLT-010',
        address: 'Blvd. Venustiano Carranza #321, Saltillo',
        city: 'Saltillo',
        state: 'Coahuila',
        postal_code: '25280',
        phone: '844-234-5678',
        email: 'sucursal_saltillo@empresa.com',
        is_active: true
        },

        {
        name: 'Sucursal Torreon',
        code: 'TRN-011',
        address: 'Av. Juarez #456, Centro, Torreon',
        city: 'Torreon',
        state: 'Coahuila',
        postal_code: '27000',
        phone: '871-345-6789',
        email: 'sucursal_torreon@empresa.com',
        is_active: true
        },

        {
        name: 'Sucursal San Luis',
        code: 'SLS-012',
        address: 'Av. Carranza #789, Centro, San Luis Potosi',
        city: 'San Luis Potosi',
        state: 'San Luis Potosi',
        postal_code: '78000',
        phone: '444-456-7890',
        email: 'sucursal_sanluis@empresa.com',
        is_active: true
        },
        
        {
        name: 'Sucursal Queretaro',
        code: 'QRO-013',
        address: 'Av. 5 de Febrero #101, Queretaro',
        city: 'Queretaro',
        state: 'Queretaro',
        postal_code: '76100',
        phone: '442-567-8901',
        email: 'sucursal_queretaro@empresa.com',
        is_active: true
        }
    ])  
}

module.exports = seedBranches;
