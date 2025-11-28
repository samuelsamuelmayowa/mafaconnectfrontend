const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const Message = sequelize.define("Message", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }

}, {
  tableName: "messages",
  timestamps: true,
});

module.exports = { Message };
