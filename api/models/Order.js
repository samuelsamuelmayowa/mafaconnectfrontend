const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },

  order_number: {
    type: DataTypes.STRING,
    unique: true,
  },

  // MUST match users.id (UNSIGNED)
  customer_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },

  payment_reference: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // MUST match users.id (UNSIGNED)
  sales_agent_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },

  // MUST match locations.id (UNSIGNED)
  location_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },

  payment_method: {
    type: DataTypes.STRING,
  },

  payment_status: {
    type: DataTypes.STRING,
    defaultValue: "pending",
  },

  order_status: {
    type: DataTypes.STRING,
    defaultValue: "pending",
  },

  total_amount: DataTypes.FLOAT,
  shipping_fee: DataTypes.FLOAT,

  reservation_expires_at: {
    type: DataTypes.DATE,
  },

}, { timestamps: true });

// --- NOTIFICATIONS MODEL ---
const Notification = sequelize.define("Notification", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },

  // MUST match users.id (UNSIGNED)
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },

  title: DataTypes.STRING,
  message: DataTypes.STRING,

  // MUST match orders.id (UNSIGNED)
  order_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },

  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
}, { timestamps: true });


module.exports = {
  Order,
  Notification,
};


// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../db");
// const Order = sequelize.define("Order", {
//   id: {
//     type: DataTypes.INTEGER.UNSIGNED,
//     // type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },

//   order_number: {
//     type: DataTypes.STRING,
//     unique: true,
//   },

//   customer_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false, // customer placing order
//   },

//   payment_reference: {
//   type: DataTypes.STRING,
//   allowNull: true,
// },


//   sales_agent_id: {
//     type: DataTypes.INTEGER,
//     allowNull: true, // NULL if customer created it
//   },

//   // location_id: {
//   //   type: DataTypes.INTEGER,
//   //   allowNull: false, // pickup location
//   // },

//     // ✅ THIS ONE
//   location_id: {
//     type: DataTypes.INTEGER,
//     allowNull: true, // <-- CHANGE THIS LINE
//   },


//   payment_method: {
//     type: DataTypes.STRING, // bank_transfer, stripe, pay_on_pickup
//   },

//   payment_status: {
//     type: DataTypes.STRING,
//     defaultValue: "pending", // pending | paid | cancelled
//   },

//   order_status: {
//     type: DataTypes.STRING,
//     defaultValue: "pending", // pending | processing | completed | cancelled
//   },

//   total_amount: DataTypes.FLOAT,
//   shipping_fee: DataTypes.FLOAT,

//   reservation_expires_at: {
//     type: DataTypes.DATE // expiry for unpaid orders
//   },

// }, { timestamps: true });



// const Notification = sequelize.define("Notification", {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },

//   user_id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },

//   title: DataTypes.STRING,
//   message: DataTypes.STRING,
//   order_id: DataTypes.INTEGER,

//   read: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false,
//   }
// }, { timestamps: true });

// module.exports = {
//     Order,
//   Notification

  
// }

