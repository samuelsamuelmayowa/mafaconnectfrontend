const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const Invoice = sequelize.define("Invoice", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  invoice_number: {
    type: DataTypes.STRING,
    unique: true,
  },

  order_id: {
    // type: DataTypes.INTEG
    // ER,
     type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },

  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  total_amount: {
    type: DataTypes.FLOAT,
  },

  file_url: {
    type: DataTypes.STRING, // For PDF download link
  },
   payment_reference: {               // ✅ ADD THIS
    type: DataTypes.STRING,
    allowNull: true
  },
  issue_date: { type: DataTypes.DATE, allowNull: true },
due_date: { type: DataTypes.DATE, allowNull: true },


}, { timestamps: true });

module.exports = Invoice;
