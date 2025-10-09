const { Sequelize, DataTypes } = require('sequelize')
const config = require('../../../config/sequelize')[process.env.NODE_ENV || 'development']

// Crear instancia de Sequelize
const sequelize = new Sequelize(config.database, config.username, config.password, config)

// Definir modelos

// BRANCH
const Branch = sequelize.define('Branch', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  address: DataTypes.TEXT,
  city: DataTypes.STRING(50),
  state: DataTypes.STRING(50),
  postal_code: DataTypes.STRING(10),
  phone: DataTypes.STRING(20),
  email: DataTypes.STRING(100),
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'branches',
  timestamps: true,
  paranoid: false
})

// USER
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('owner', 'admin', 'supervisor', 'cashier'),
    defaultValue: 'cashier'
  },
  employee_id: {
    type: DataTypes.STRING(20),
    unique: true
  },
  phone: DataTypes.STRING(20),
  hire_date: DataTypes.DATEONLY,
  branch_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Branch,
      key: 'id'
    }
  },
  permissions: DataTypes.JSON,
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: false
})

// CUSTOMER
const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  first_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  email: DataTypes.STRING(100),
  phone: DataTypes.STRING(20),
  address: DataTypes.TEXT,
  city: DataTypes.STRING(50),
  postal_code: DataTypes.STRING(10),
  company_name: DataTypes.STRING(100),
  tax_id: DataTypes.STRING(50),
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'customers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

// PRODUCT
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: DataTypes.TEXT,
  sku: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  barcode: {
    type: DataTypes.STRING(50),
    unique: true
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  subcategory: DataTypes.STRING(50),
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  unit_measure: {
    type: DataTypes.STRING(20),
    defaultValue: 'unit'
  },
  weight: DataTypes.DECIMAL(8, 3),
  dimensions: DataTypes.JSON,
  tax_rate: {
    type: DataTypes.DECIMAL(5, 4),
    defaultValue: 0.0000
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  metadata: DataTypes.JSON,
  tags: DataTypes.JSON
}, {
  tableName: 'products',
  timestamps: true
})

// INVENTORY
const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  branch_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Branch,
      key: 'id'
    }
  },
  current_stock: {
    type: DataTypes.DECIMAL(10, 3),
    defaultValue: 0.000
  },
  minimum_stock: {
    type: DataTypes.DECIMAL(10, 3),
    defaultValue: 0.000
  },
  maximum_stock: DataTypes.DECIMAL(10, 3),
  reserved_stock: {
    type: DataTypes.DECIMAL(10, 3),
    defaultValue: 0.000
  },
  available_stock: {
    type: DataTypes.DECIMAL(10, 3),
    defaultValue: 0.000
  },
  last_purchase_date: DataTypes.DATE,
  last_sale_date: DataTypes.DATE,
  location: DataTypes.STRING(100),
  notes: DataTypes.TEXT
}, {
  tableName: 'inventory',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: false
})

// Definir relaciones
Branch.hasMany(User, { foreignKey: 'branch_id' })
User.belongsTo(Branch, { foreignKey: 'branch_id' })

Branch.hasMany(Inventory, { foreignKey: 'branch_id' })
Inventory.belongsTo(Branch, { foreignKey: 'branch_id' })

Product.hasMany(Inventory, { foreignKey: 'product_id' })
Inventory.belongsTo(Product, { foreignKey: 'product_id' })

// Exportar modelos
const db = {
  sequelize,
  Sequelize,
  Branch,
  User,
  Customer,
  Product,
  Inventory
}

module.exports = db