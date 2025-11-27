const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");
const OrderItem = sequelize.define("OrderItem", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  order_id: {
    type: DataTypes.INTEGER,
  },

  product_id: {
    type: DataTypes.INTEGER,
  },

  quantity: {
    type: DataTypes.INTEGER,
  },

  unit_price: {
    type: DataTypes.FLOAT,
  },

  total_price: {
    type: DataTypes.FLOAT,
  },

});


module.exports = OrderItem;