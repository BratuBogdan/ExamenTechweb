const { DataTypes, Model } = require('sequelize')
const sequelize = require('../sequelize')
const Participant = sequelize.define('Participant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    validate: {
      len: {
        args: 5,
        msg: 'Name is too short!',
      },
    },
  },
})

module.exports = Participant
