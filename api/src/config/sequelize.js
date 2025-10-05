require('dotenv').config()

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './src/infrastructure/database/database.sqlite',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false,
      paranoid: true
    }
  },

  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  },
  
  production: {
    dialect: 'sqlite',
    storage: './src/infrastructure/database/database.sqlite',
    logging: false,
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false,
      paranoid: true
    }
  }
}