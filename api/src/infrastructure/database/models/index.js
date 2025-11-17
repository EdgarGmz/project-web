const fs = require('fs')
const path = require('path')
const { Sequelize, DataTypes } = require('sequelize')

// Importar instancia ya creada
const { sequelize } = require('../../../config/database')

// Cargar todos los modelos de la carpeta actual
const db = {}

fs.readdirSync(__dirname)
  .filter(file => file !== 'index.js' && file.endsWith('.js'))
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes)
    db[model.name] = model
  })

// Definir asociaciones entre modelos
if (db.Branch && db.User) {
  db.Branch.hasMany(db.User, { 
    foreignKey: 'branch_id', 
    as: 'users' 
  })
  db.User.belongsTo(db.Branch, { 
    foreignKey: 'branch_id', 
    as: 'branch' 
  })
}

if (db.Branch && db.Inventory) {
  db.Branch.hasMany(db.Inventory, { foreignKey: 'branch_id', as: 'inventories' })
  db.Inventory.belongsTo(db.Branch, { foreignKey: 'branch_id', as: 'branch' })
}

// Asociación Customer - Branch (agregada para soporte de clientes por sucursal)
if (db.Branch && db.Customer) {
  db.Branch.hasMany(db.Customer, { foreignKey: 'branch_id' })
  db.Customer.belongsTo(db.Branch, { foreignKey: 'branch_id', as: 'branch' })
}

if (db.Product && db.Inventory) {
  db.Product.hasMany(db.Inventory, { foreignKey: 'product_id', as: 'inventories' })
  db.Inventory.belongsTo(db.Product, { foreignKey: 'product_id', as: 'product' })
}

if (db.Customer && db.Sale) {
  db.Customer.hasMany(db.Sale, { foreignKey: 'customer_id', as: 'sales' })
  db.Sale.belongsTo(db.Customer, { foreignKey: 'customer_id', as: 'customer' })
}

if (db.User && db.Sale) {
  db.User.hasMany(db.Sale, { foreignKey: 'user_id', as: 'sales' })
  db.Sale.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' })
}

if (db.Branch && db.Sale) {
  db.Branch.hasMany(db.Sale, { foreignKey: 'branch_id', as: 'sales' })
  db.Sale.belongsTo(db.Branch, { foreignKey: 'branch_id', as: 'branch' })
}

if (db.Sale && db.SaleItem) {
  db.Sale.hasMany(db.SaleItem, { foreignKey: 'sale_id', as: 'items' })
  db.SaleItem.belongsTo(db.Sale, { foreignKey: 'sale_id', as: 'sale' })
}

if (db.Product && db.SaleItem) {
  db.Product.hasMany(db.SaleItem, { foreignKey: 'product_id', as: 'saleItems' })
  db.SaleItem.belongsTo(db.Product, { foreignKey: 'product_id', as: 'product' })
}

if (db.User && db.UserSession) {
  db.User.hasMany(db.UserSession, { foreignKey: 'user_id' })
  db.UserSession.belongsTo(db.User, { foreignKey: 'user_id' })
}

if (db.Customer && db.Payment) {
  db.Customer.hasMany(db.Payment, { foreignKey: 'customer_id' })
  db.Payment.belongsTo(db.Customer, { foreignKey: 'customer_id', as: 'customer' })
}

if (db.Customer && db.Return) {
  db.Customer.hasMany(db.Return, { foreignKey: 'customer_id' })
  db.Return.belongsTo(db.Customer, { foreignKey: 'customer_id', as: 'customer' })
}

if (db.Product && db.Return) {
  db.Product.hasMany(db.Return, { foreignKey: 'product_id' })
  db.Return.belongsTo(db.Product, { foreignKey: 'product_id', as: 'product' })
}

if (db.Sale && db.Return) {
  db.Sale.hasMany(db.Return, { foreignKey: 'sale_id' })
  db.Return.belongsTo(db.Sale, { foreignKey: 'sale_id', as: 'sale' })
}

if (db.SaleItem && db.Return) {
  db.SaleItem.hasMany(db.Return, { foreignKey: 'sale_item_id' })
  db.Return.belongsTo(db.SaleItem, { foreignKey: 'sale_item_id', as: 'saleItem' })
}

if (db.User && db.Return) {
  db.User.hasMany(db.Return, { foreignKey: 'approved_by' })
  db.Return.belongsTo(db.User, { foreignKey: 'approved_by', as: 'approvedBy' })
  
  db.User.hasMany(db.Return, { foreignKey: 'rejected_by' })
  db.Return.belongsTo(db.User, { foreignKey: 'rejected_by', as: 'rejectedBy' })
}

// Asociaciones Purchase - Branch y Purchase - User
if (db.Branch && db.Purchase) {
  db.Branch.hasMany(db.Purchase, { foreignKey: 'branch_id' })
  db.Purchase.belongsTo(db.Branch, { foreignKey: 'branch_id', as: 'Branch' })
}

if (db.User && db.Purchase) {
  db.User.hasMany(db.Purchase, { foreignKey: 'user_id' })
  db.Purchase.belongsTo(db.User, { foreignKey: 'user_id', as: 'User' })
}

// Asociaciones Log - User
if (db.User && db.Log) {
  db.User.hasMany(db.Log, { foreignKey: 'user_id', as: 'logs' })
  db.Log.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' })
}

// Asociaciones Report - Branch
if (db.Branch && db.Report) {
  db.Branch.hasMany(db.Report, { foreignKey: 'branch_id' })
  db.Report.belongsTo(db.Branch, { foreignKey: 'branch_id', as: 'branch' })
}

// Exportar instancia y modelos
db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db