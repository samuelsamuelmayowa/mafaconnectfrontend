const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const LocationProductStock = sequelize.define("LocationProductStock", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  location_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  stock_qty: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  reorder_level: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
}, {
  tableName: "location_product_stocks",
  timestamps: true,
});

module.exports = { LocationProductStock };
