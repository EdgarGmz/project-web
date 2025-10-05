require('dotenv').config()
const { Sequelize } = require('sequelize')

const config = {
  dialect: 'sqlite',
  storage: './src/infrastructure/database/database.sqlite',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: false,
    paranoid: true
  }
}

const sequelize = new Sequelize(config)

const testConnection = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ Conexión a base de datos SQLite establecida correctamente')
    
    return true
  } catch (error) {
    console.error('❌ Error de conexión a base de datos:', error)
    throw error
  }
}

module.exports = {
  sequelize,
  config,
  testConnection
}