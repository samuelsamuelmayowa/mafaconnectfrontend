const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const LoyaltyAccount = sequelize.define("LoyaltyAccount", {
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },

  // customer_id: { type: DataTypes.INTEGER, allowNull: false },
    customer_id: {
         type: DataTypes.INTEGER,   
    //   type: DataTypes.INTEGER.UNSIGNED,  // MUST match users.id
      allowNull: false,
      unique: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

  points_balance: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  tier: {
    type: DataTypes.STRING,
    defaultValue: "Bronze",
  },

}, {
  tableName: "loyalty_accounts",
  timestamps: true,
});

module.exports = { LoyaltyAccount };


// // models/LoyaltyAccount.js
// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../db");

// const LoyaltyAccount = sequelize.define(
//   "LoyaltyAccount",
//   {
//     id: {
//       type: DataTypes.INTEGER.UNSIGNED,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     customer_id: {
//          type: DataTypes.INTEGER,   
//     //   type: DataTypes.INTEGER.UNSIGNED,  // MUST match users.id
//       allowNull: false,
//       unique: true,
//       references: {
//         model: "users",
//         key: "id",
//       },
//       onDelete: "CASCADE",
//       onUpdate: "CASCADE",
//     },
//     points_balance: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       defaultValue: 0,
//     },
//     lifetime_points_earned: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       defaultValue: 0,
//     },
//     lifetime_points_redeemed: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       defaultValue: 0,
//     },
//     tier: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       defaultValue: "Bronze",
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
//     tableName: "loyalty_accounts",
//   }
// );

// module.exports = { LoyaltyAccount };

// // // models/LoyaltyAccount.js
// // const { DataTypes } = require("sequelize");
// // const { sequelize } = require("../db");

// // const LoyaltyAccount = sequelize.define(
// //   "LoyaltyAccount",
// //   {
// //     id: {
// //       type: DataTypes.INTEGER.UNSIGNED,
// //       autoIncrement: true,
// //       primaryKey: true,
// //     },
// //     customer_id: {
// //       // match your customers table type (string or int)
// //       type: DataTypes.STRING,
// //       allowNull: false,
// //       unique: true,
// //     },
// //     points_balance: {
// //       type: DataTypes.INTEGER,
// //       allowNull: false,
// //       defaultValue: 0,
// //     },
// //     lifetime_points_earned: {
// //       type: DataTypes.INTEGER,
// //       allowNull: false,
// //       defaultValue: 0,
// //     },
// //     lifetime_points_redeemed: {
// //       type: DataTypes.INTEGER,
// //       allowNull: false,
// //       defaultValue: 0,
// //     },
// //     tier: {
// //       type: DataTypes.STRING,
// //       allowNull: false,
// //       defaultValue: "Bronze",
// //     },
// //     createdAt: {
// //       type: DataTypes.DATE,
// //       defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
// //     },
// //     updatedAt: {
// //       type: DataTypes.DATE,
// //       defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
// //     },
// //   },
// //   {
// //     tableName: "loyalty_accounts",
// //   }
// // );

// // module.exports = { LoyaltyAccount };
