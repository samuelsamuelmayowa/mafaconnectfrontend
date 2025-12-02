
const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      // type: DataTypes.INTEGER,
      autoIncrement: true, primaryKey: true
    },
    productid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      allowNull: false,
    },
    bag_size_kg: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    name: { type: DataTypes.STRING, allowNull: false },
    sku: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
    cost_price: { type: DataTypes.FLOAT, allowNull: false },
    sale_price: { type: DataTypes.FLOAT, allowNull: false },
    stock_qty: { type: DataTypes.INTEGER, defaultValue: 0 },
    reorder_level: { type: DataTypes.INTEGER, defaultValue: 50 },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_by: { 
      type: DataTypes.INTEGER.UNSIGNED,
       allowNull: false },
  },
  
  {
    tableName: "products",
    timestamps: true,
  }
);

module.exports = { Product };










