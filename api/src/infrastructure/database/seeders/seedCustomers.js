const db = require('../models');
const { Customer } = db;

async function seedCustomers(branches) {
	// Crear clientes básicos
	const customers = await Customer.bulkCreate([
		{
            first_name: 'Publico',
            last_name: 'en General',
            email: null,
            phone: null,
            address: null,
            city: null,
            postal_code: null,
            company_name: null,
            tax_id: null,
            document_type: null,
            document_number: null,
            is_active: true
        },
        {
            first_name: 'Juan',
            last_name: 'Pérez García',
            email: 'juan.perez@example.com',
            phone: '555-1234-5678',
            address: 'Av. Principal #123, Col. Centro',
            city: 'Monterrey',
            state: 'Nuevo León',
            postal_code: '64000',
            company_name: null,
            tax_id: null,
            document_type: 'dni',
            document_number: '12345678',
            is_active: true
        },
        {
            first_name: 'María',
            last_name: 'González López',
            email: 'maria.gonzalez@example.com',
            phone: '555-2345-6789',
            address: 'Calle Reforma #456, Col. Del Valle',
            city: 'Monterrey',
            state: 'Nuevo León',
            postal_code: '64010',
            company_name: null,
            tax_id: null,
            document_type: 'dni',
            document_number: '87654321',
            is_active: true
        },
        {
            first_name: 'Carlos',
            last_name: 'Rodríguez Martínez',
            email: 'carlos.rodriguez@example.com',
            phone: '555-3456-7890',
            address: 'Blvd. Constitución #789',
            city: 'Monterrey',
            state: 'Nuevo León',
            postal_code: '64020',
            company_name: null,
            tax_id: null,
            document_type: 'dni',
            document_number: '11223344',
            is_active: true
        }
	]);

	// Asociar todos los clientes con CEDIS
	if (branches && branches.length > 0) {
		const cedis = branches.find(b => b.code === 'CEDIS-000') || branches[0];
		if (cedis) {
			for (const customer of customers) {
				await customer.addBranch(cedis.id);
			}
		}
	}

	return customers;
}

module.exports = seedCustomers;
