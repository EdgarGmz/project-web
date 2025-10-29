const db = require('../models');
const { Customer } = db;

async function seedCustomers() {
	return await Customer.bulkCreate([
		{
            first_name: 'Juan',
            last_name: 'Perez Garcia',
            email: 'juan.perez@example.com',
            phone: '555-0001-001',
            address: 'Calle Falsa 123, Ciudad de Mexico',
            city: 'Ciudad de Mexico',
            postal_code: '01000',
            company_name: 'Empresa S.A. de C.V.',
            tax_id: 'RFC123456789',
            is_active: true
        },
        {
            first_name: 'Maria',
            last_name: 'Lopez Martinez',
            email: 'maria.lopez@example.com',
            phone: '555-0002-002',
            address: 'Av. Reforma 456, Ciudad de Mexico',
            city: 'Ciudad de Mexico',
            postal_code: '01100',
            company_name: 'Comercializadora Lopez',
            tax_id: 'RFC987654321',
            is_active: true
        },
        {
            first_name: 'Carlos',
            last_name: 'Ramirez Torres',
            email: 'carlos.ramirez@example.com',
            phone: '555-0003-003',
            address: 'Calle Hidalgo 789, Monterrey',
            city: 'Monterrey',
            postal_code: '64000',
            company_name: 'Ramirez y Asociados',
            tax_id: 'RFC112233445',
            is_active: true
        },
        {
            first_name: 'Ana',
            last_name: 'Gonzalez Ruiz',
            email: 'ana.gonzalez@example.com',
            phone: '555-0004-004',
            address: 'Av. Juarez 321, Guadalajara',
            city: 'Guadalajara',
            postal_code: '44100',
            company_name: 'Gonzalez Consultores',
            tax_id: 'RFC556677889',
            is_active: true
        },
        {
            first_name: 'Luis',
            last_name: 'Fernandez Soto',
            email: 'luis.fernandez@example.com',
            phone: '555-0005-005',
            address: 'Calle Morelos 654, Puebla',
            city: 'Puebla',
            postal_code: '72000',
            company_name: 'Fernandez Servicios',
            tax_id: 'RFC998877665',
            is_active: true
        },
        {
            first_name: 'Sofia',
            last_name: 'Diaz Castro',
            email: 'sofia.diaz@example.com',
            phone: '555-0006-006',
            address: 'Av. Universidad 987, Toluca',
            city: 'Toluca',
            postal_code: '50000',
            company_name: 'Diaz y Cia',
            tax_id: 'RFC223344556',
            is_active: true
        },
        {
            first_name: 'Miguel',
            last_name: 'Hernandez Vargas',
            email: 'miguel.hernandez@example.com',
            phone: '555-0007-007',
            address: 'Calle Independencia 111, Leon',
            city: 'Leon',
            postal_code: '37000',
            company_name: 'Hernandez Distribuciones',
            tax_id: 'RFC334455667',
            is_active: true
        },
        {
            first_name: 'Laura',
            last_name: 'Martinez Flores',
            email: 'laura.martinez@example.com',
            phone: '555-0008-008',
            address: 'Av. Insurgentes 222, Queretaro',
            city: 'Queretaro',
            postal_code: '76000',
            company_name: 'Martinez Flores S.A.',
            tax_id: 'RFC445566778',
            is_active: true
        },
        {
            first_name: 'Jorge',
            last_name: 'Castillo Morales',
            email: 'jorge.castillo@example.com',
            phone: '555-0009-009',
            address: 'Calle Zaragoza 333, Cancun',
            city: 'Cancun',
            postal_code: '77500',
            company_name: 'Castillo Morales',
            tax_id: 'RFC556677880',
            is_active: true
        },
        {
            first_name: 'Patricia',
            last_name: 'Sanchez Gomez',
            email: 'patricia.sanchez@example.com',
            phone: '555-0010-010',
            address: 'Av. Constituyentes 444, Merida',
            city: 'Merida',
            postal_code: '97000',
            company_name: 'Sanchez Gomez S.A.',
            tax_id: 'RFC667788990',
            is_active: true
        },
        {
            first_name: 'Ricardo',
            last_name: 'Vega Luna',
            email: 'ricardo.vega@example.com',
            phone: '555-0011-020',
            address: 'Calle 5 de Mayo 555, Tijuana',
            city: 'Tijuana',
            postal_code: '22000',
            company_name: 'Vega Luna',
            tax_id: 'RFC778899001',
            is_active: true
        }
	]);
}

module.exports = seedCustomers;
