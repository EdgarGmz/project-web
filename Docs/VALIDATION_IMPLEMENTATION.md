# Request Validation Implementation

This document describes the comprehensive request validation layer implemented using `express-validator` across all API endpoints.

## Overview

A centralized validation system has been implemented to ensure all incoming requests are validated before reaching the business logic. This provides:

- **Input Sanitization**: Automatic trimming, normalization, and cleaning of user input
- **Type Validation**: Ensures data types match expected formats
- **Business Rules**: Enforces domain-specific constraints (e.g., password strength, email format)
- **Consistent Error Format**: Standardized error responses across all endpoints

## Architecture

```
Request → [Route] → [Validation Middleware] → [Error Handler] → [Controller]
```

### Directory Structure

```
api/src/validators/
├── index.js                          # Central export point
├── validationMiddleware.js           # Error handler middleware
└── schemas/
    ├── authValidators.js            # Authentication validations
    ├── userValidators.js            # User management validations
    ├── productValidators.js         # Product validations
    ├── customerValidators.js        # Customer validations
    ├── saleValidators.js            # Sales validations
    ├── branchValidators.js          # Branch validations
    ├── purchaseValidators.js        # Purchase validations
    ├── inventoryValidators.js       # Inventory validations
    ├── paymentValidators.js         # Payment validations
    └── reportValidators.js          # Report query validations
```

## Usage

### In Routes

```javascript
const {
    createUserValidator,
    updateUserValidator,
    handleValidationErrors
} = require('../../validators');

router.post('/', 
    authenticate,                    // Auth middleware (if needed)
    authorize('owner'),              // Authorization (if needed)
    createUserValidator,             // Validation rules
    handleValidationErrors,          // Error handler
    userController.createUser        // Controller
);
```

### Error Response Format

When validation fails, the API returns a 400 status with:

```json
{
    "success": false,
    "message": "Error de validación",
    "errors": [
        {
            "field": "email",
            "message": "Debe ser un email válido",
            "value": "invalid-email"
        },
        {
            "field": "password",
            "message": "La contraseña debe tener al menos 8 caracteres",
            "value": "123"
        }
    ]
}
```

## Validation Rules by Module

### Authentication (`authValidators.js`)

#### Login
- **email**: Required, valid email format, normalized
- **password**: Required, minimum 6 characters

#### Register
- **first_name**: Required, 2-50 characters, letters only
- **last_name**: Required, 2-50 characters, letters only
- **email**: Required, valid email, normalized
- **password**: Required, min 8 chars, must contain uppercase, lowercase, and number
- **role**: Optional, must be owner/admin/supervisor/cashier
- **branch_id**: Optional, positive integer

#### Change Password
- **current_password**: Required
- **new_password**: Required, min 8 chars, complexity rules
- **confirm_password**: Required, must match new_password

### Users (`userValidators.js`)

#### Create User
- **first_name**: Required, 2-50 characters, letters only
- **last_name**: Required, 2-50 characters, letters only
- **email**: Required, valid email format
- **password**: Required, min 8 chars, complexity rules
- **role**: Required, must be owner/admin/supervisor/cashier
- **employee_id**: Optional, max 20 characters
- **branch_id**: Optional, positive integer
- **is_active**: Optional, boolean

#### Update User
- **id**: Required in URL, positive integer
- All fields optional but validated if provided
- Same rules as create for each field

#### List Users (Query Params)
- **role**: Optional, must be valid role
- **branch_id**: Optional, positive integer
- **is_active**: Optional, boolean
- **page**: Optional, min 1
- **limit**: Optional, 1-100

### Products (`productValidators.js`)

#### Create Product
- **name**: Required, 2-100 characters
- **sku**: Required, uppercase alphanumeric with dashes/underscores
- **unit_price**: Required, float > 0.01
- **cost_price**: Required, float >= 0
- **barcode**: Optional, max 50 characters
- **category**: Optional, max 50 characters
- **min_stock**: Optional, integer >= 0
- **max_stock**: Optional, integer >= 0, must be >= min_stock
- **tax_rate**: Optional, 0-100

#### Update Product
- **id**: Required in URL, positive integer
- All fields optional but validated if provided

#### List Products (Query Params)
- **category**: Optional, string
- **brand**: Optional, string
- **is_active**: Optional, boolean
- **min_stock_alert**: Optional, boolean
- **search**: Optional, string
- **page**: Optional, min 1
- **limit**: Optional, 1-100

### Customers (`customerValidators.js`)

#### Create Customer
- **first_name**: Required, 2-50 characters, letters only
- **last_name**: Required, 2-50 characters, letters only
- **email**: Optional, valid email format
- **phone**: Optional, valid phone format, max 20 chars
- **address**: Optional, max 200 characters
- **city**: Optional, max 50 characters
- **state**: Optional, max 50 characters
- **postal_code**: Optional, max 10 characters
- **tax_id**: Optional, max 20 characters (RFC/NIT)
- **customer_type**: Optional, individual or business
- **credit_limit**: Optional, float >= 0

### Sales (`saleValidators.js`)

#### Create Sale
- **customer_id**: Optional, positive integer
- **branch_id**: Required, positive integer
- **items**: Required, array with min 1 item
  - **product_id**: Required, positive integer
  - **quantity**: Required, integer >= 1
  - **unit_price**: Required, float >= 0
  - **discount**: Optional, 0-100
- **payment_method**: Required, cash/card/transfer/credit
- **payment_status**: Optional, pending/paid/partial/cancelled
- **discount_percentage**: Optional, 0-100
- **tax_amount**: Optional, float >= 0

### Branches (`branchValidators.js`)

#### Create Branch
- **name**: Required, 2-100 characters
- **code**: Required, 2-20 characters, uppercase alphanumeric
- **address**: Optional, max 200 characters
- **city**: Optional, max 50 characters
- **phone**: Optional, valid phone format
- **email**: Optional, valid email
- **is_active**: Optional, boolean

### Purchases (`purchaseValidators.js`)

#### Create Purchase
- **supplier_name**: Required, 2-100 characters
- **branch_id**: Required, positive integer
- **items**: Required, array with min 1 item
  - **product_id**: Required, positive integer
  - **quantity**: Required, integer >= 1
  - **unit_cost**: Required, float >= 0
- **purchase_date**: Optional, ISO 8601 date
- **payment_method**: Optional, cash/card/transfer/credit
- **payment_status**: Optional, pending/paid/partial

### Inventory (`inventoryValidators.js`)

#### List Inventory (Query Params)
- **branch_id**: Optional, positive integer
- **product_id**: Optional, positive integer
- **low_stock**: Optional, boolean
- **out_of_stock**: Optional, boolean
- **page**: Optional, min 1
- **limit**: Optional, 1-100

### Payments (`paymentValidators.js`)

#### Create Payment
- **sale_id**: Optional, positive integer
- **purchase_id**: Optional, positive integer
- **amount**: Required, float > 0.01
- **payment_method**: Required, cash/card/transfer/credit/debit
- **payment_date**: Optional, ISO 8601 date
- **reference_number**: Optional, max 50 characters

### Reports (`reportValidators.js`)

#### Sales Report
- **start_date**: Optional, ISO 8601 date
- **end_date**: Optional, ISO 8601 date
- **branch_id**: Optional, positive integer
- **group_by**: Optional, day/week/month/year

#### Inventory Report
- **branch_id**: Optional, positive integer
- **category**: Optional, string
- **low_stock_only**: Optional, boolean

## Security Features

1. **Input Sanitization**: All string inputs are trimmed and normalized
2. **Email Normalization**: Emails are lowercased and standardized
3. **SQL Injection Prevention**: Type validation prevents injection attacks
4. **XSS Prevention**: Input sanitization removes malicious scripts
5. **Rate Limiting**: Combined with existing rate limiting middleware
6. **Password Complexity**: Enforced minimum requirements for security

## Benefits

1. **Consistency**: All endpoints follow the same validation pattern
2. **Maintainability**: Centralized validation logic is easier to update
3. **Security**: Prevents invalid/malicious data from reaching the database
4. **User Experience**: Clear, specific error messages help users fix issues
5. **Performance**: Early validation reduces unnecessary database queries
6. **Documentation**: Validation schemas serve as API documentation

## Testing

Manual validation testing can be performed using curl:

```bash
# Test missing required fields
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{}'

# Test invalid email format
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid", "password": "123"}'

# Test valid data
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "validpassword"}'
```

## Future Enhancements

1. **Custom Validators**: Add async validators for database uniqueness checks
2. **Rate Limiting per Field**: Prevent brute force on specific fields
3. **Conditional Validation**: Complex multi-field validation rules
4. **File Upload Validation**: Add validators for file uploads
5. **Localization**: Support multiple languages for error messages
6. **Schema Documentation**: Auto-generate API documentation from validators

## References

- [express-validator Documentation](https://express-validator.github.io/)
- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
