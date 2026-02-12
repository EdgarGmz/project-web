# Request Validators

This directory contains all request validation logic for the API using `express-validator`.

## Overview

The validation layer provides:
- Input sanitization and normalization
- Type validation
- Business rule enforcement
- Consistent error responses
- Security against injection attacks

## Directory Structure

```
validators/
├── index.js                     # Central export point for all validators
├── validationMiddleware.js      # Error handler middleware
├── schemas/                     # Validation schema definitions
│   ├── authValidators.js       # Authentication endpoints
│   ├── userValidators.js       # User management
│   ├── productValidators.js    # Product management
│   ├── customerValidators.js   # Customer management
│   ├── saleValidators.js       # Sales operations
│   ├── branchValidators.js     # Branch management
│   ├── purchaseValidators.js   # Purchase orders
│   ├── inventoryValidators.js  # Inventory management
│   ├── paymentValidators.js    # Payment processing
│   └── reportValidators.js     # Report queries
└── README.md                    # This file
```

## Usage

### In Routes

Import validators and error handler:

```javascript
const {
    createUserValidator,
    updateUserValidator,
    handleValidationErrors
} = require('../../validators');
```

Apply to routes in this order:
1. Authentication middleware (if needed)
2. Authorization middleware (if needed)
3. Validator(s)
4. Error handler
5. Controller

```javascript
router.post('/', 
    authenticate,                // Auth middleware
    authorize('owner'),          // Authorization
    createUserValidator,         // Validation rules
    handleValidationErrors,      // Error handler
    userController.createUser    // Controller
);
```

### Creating New Validators

1. Create a new file in `schemas/` directory:

```javascript
const { body, param, query } = require('express-validator');

const createItemValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be 2-100 characters'),
    
    body('price')
        .notEmpty()
        .withMessage('Price is required')
        .isFloat({ min: 0.01 })
        .withMessage('Price must be greater than 0')
];

module.exports = {
    createItemValidator
};
```

2. Export from `index.js`:

```javascript
const itemValidators = require('./schemas/itemValidators');

module.exports = {
    // ... existing exports
    ...itemValidators
};
```

3. Use in routes as shown above.

## Validation Types

### Body Validation
For POST/PUT request bodies:
```javascript
body('fieldName')
    .trim()                          // Remove whitespace
    .notEmpty()                      // Required field
    .isEmail()                       // Email format
    .isLength({ min: 2, max: 50 })  // Length constraint
    .matches(/regex/)                // Pattern matching
```

### Parameter Validation
For URL parameters (e.g., `/users/:id`):
```javascript
param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer')
```

### Query Validation
For query strings (e.g., `?page=1&limit=10`):
```javascript
query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
```

## Common Validators

| Validator | Description | Example |
|-----------|-------------|---------|
| `notEmpty()` | Field must not be empty | `body('name').notEmpty()` |
| `isEmail()` | Must be valid email | `body('email').isEmail()` |
| `isInt()` | Must be integer | `param('id').isInt({ min: 1 })` |
| `isFloat()` | Must be decimal | `body('price').isFloat({ min: 0 })` |
| `isLength()` | String length | `body('name').isLength({ min: 2, max: 50 })` |
| `matches()` | Regex pattern | `body('code').matches(/^[A-Z0-9-]+$/)` |
| `isIn()` | Value in array | `body('role').isIn(['admin', 'user'])` |
| `isBoolean()` | Must be boolean | `body('active').isBoolean()` |
| `isISO8601()` | Valid date | `body('date').isISO8601()` |
| `custom()` | Custom logic | `body('field').custom(value => {...})` |

## Sanitization

Always sanitize user input:

```javascript
body('email')
    .trim()              // Remove whitespace
    .normalizeEmail()    // Lowercase and normalize

body('name')
    .trim()
    .escape()            // Escape HTML characters
```

## Error Responses

When validation fails, the API returns:

```json
{
    "success": false,
    "message": "Error de validación",
    "errors": [
        {
            "field": "email",
            "message": "Must be a valid email",
            "value": "invalid-email"
        }
    ]
}
```

## Best Practices

1. **Always sanitize input** - Use `trim()`, `normalizeEmail()`, etc.
2. **Provide clear error messages** - Use `.withMessage()` for user-friendly errors
3. **Validate types** - Prevent injection attacks with type validation
4. **Use `optional()`** - For optional fields that should only validate if present
5. **Chain validators** - Multiple validators can be chained for complex rules
6. **Keep validators focused** - One validator per operation (create, update, etc.)
7. **Document validators** - Add JSDoc comments explaining validation rules

## Security Considerations

- **SQL Injection**: Type validation prevents SQL injection
- **XSS**: Input sanitization removes malicious scripts
- **Password Security**: Enforce complexity requirements
- **Email Validation**: Prevents invalid email exploitation
- **Length Limits**: Prevent buffer overflow attacks

## Testing

Test validators with invalid data:

```bash
# Missing required fields
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{}'

# Invalid format
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "not-an-email"}'

# Valid data
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "name": "John Doe"}'
```

## Documentation

For complete documentation, see:
- `Docs/VALIDATION_IMPLEMENTATION.md` - Full implementation guide
- `Docs/VALIDATION_FINAL_SUMMARY.md` - Executive summary

## References

- [express-validator Documentation](https://express-validator.github.io/)
- [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
