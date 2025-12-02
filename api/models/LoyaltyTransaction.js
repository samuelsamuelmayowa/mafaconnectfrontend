const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const LoyaltyTransaction = sequelize.define("LoyaltyTransaction", {
  id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    autoIncrement: true, 
    primaryKey: true 
  },

  loyalty_account_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },

  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "earn",
  },

  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  meta: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: "loyalty_transactions",
  timestamps: true,
});

module.exports = { LoyaltyTransaction };

// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../db");

// const LoyaltyTransaction = sequelize.define("LoyaltyTransaction", {
//   id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
//       loyalty_account_id: {
//       type: DataTypes.INTEGER.UNSIGNED,
//       allowNull: false,
//     },

//   account_id: { type: DataTypes.INTEGER, allowNull: false },

//   points: { type: DataTypes.INTEGER, allowNull: false },

//   description: { type: DataTypes.STRING, allowNull: false },

// }, {
//   tableName: "loyalty_transactions",
//   timestamps: true,
// });

// module.exports = { LoyaltyTransaction };

// // models/LoyaltyTransaction.js
// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../db");

// const LoyaltyTransaction = sequelize.define(
//   "LoyaltyTransaction",
//   {
//     id: {
//       type: DataTypes.INTEGER.UNSIGNED,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     loyalty_account_id: {
//       type: DataTypes.INTEGER.UNSIGNED,
//       allowNull: false,
//     },
//     type: {
//       type: DataTypes.ENUM("earn", "redeem", "adjustment", "expiration"),
//       allowNull: false,
//     },
//     points: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     source: {
//       type: DataTypes.STRING, // e.g. "order", "manual"
//       allowNull: true,
//     },
//     source_ref: {
//       type: DataTypes.STRING, // e.g. order_number or invoice
//       allowNull: true,
//     },
//     note: {
//       type: DataTypes.TEXT,
//       allowNull: true,
//     },
//     createdAt: {
//       type: DataTypes.DATE,
//       defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
//     },
//     updatedAt: {
//       type: DataTypes.DATE,
//       defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
//     },
//   },
//   {
//     tableName: "loyalty_transactions",
//   }
// );

// module.exports = { LoyaltyTransaction };
