const { DataTypes, Model, DATE } = require('sequelize')
const sequelize = require('../sequelize')
const Meeting = sequelize.define('Meeting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  descriere: {
    type: DataTypes.STRING,
    validate: {
      len: {
        args: 3,
        msg: 'Description is too short!',
      },
    },
  },
  url: {
    type: DataTypes.STRING,
    validate: {
      isUrl: true,
    },
  },
  date: {
    type: DataTypes.DATE,
    validate: {
      isAfter: sequelize.fn('NOW'),
    },
  },
})

module.exports = Meeting
