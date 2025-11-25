const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const ProductLocationStock = sequelize.define("ProductLocationStock", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orders: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  location_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  stock_qty: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  reorder_level: {
    type: DataTypes.INTEGER,
    defaultValue: 20,
  },

}, {
  tableName: "product_location_stocks",
  timestamps: true,
});

module.exports = { ProductLocationStock };
