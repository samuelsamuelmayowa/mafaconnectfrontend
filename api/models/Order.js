const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");
const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  order_number: {
    type: DataTypes.STRING,
    unique: true,
  },

  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false, // customer placing order
  },

  payment_reference: {
  type: DataTypes.STRING,
  allowNull: true,
},


  sales_agent_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // NULL if customer created it
  },

  // location_id: {
  //   type: DataTypes.INTEGER,
  //   allowNull: false, // pickup location
  // },

    // ✅ THIS ONE
  location_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // <-- CHANGE THIS LINE
  },


  payment_method: {
    type: DataTypes.STRING, // bank_transfer, stripe, pay_on_pickup
  },

  payment_status: {
    type: DataTypes.STRING,
    defaultValue: "pending", // pending | paid | cancelled
  },

  order_status: {
    type: DataTypes.STRING,
    defaultValue: "pending", // pending | processing | completed | cancelled
  },

  total_amount: DataTypes.FLOAT,
  shipping_fee: DataTypes.FLOAT,

  reservation_expires_at: {
    type: DataTypes.DATE // expiry for unpaid orders
  },

}, { timestamps: true });



const Notification = sequelize.define("Notification", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  title: DataTypes.STRING,
  message: DataTypes.STRING,
  order_id: DataTypes.INTEGER,

  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, { timestamps: true });

module.exports = {
    Order,
  Notification

  
}

