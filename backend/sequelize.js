const { Sequelize } = require('sequelize')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './sqlite/DataBase.db',
})

module.exports = sequelize
