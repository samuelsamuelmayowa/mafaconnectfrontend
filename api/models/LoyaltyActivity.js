
const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");
const LoyaltyActivity = sequelize.define("LoyaltyActivity", {
  id: {  type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  customer_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  type: { 
    type: DataTypes.ENUM("earned", "redemption", "refund"),
    allowNull: false 
  },
  points: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.STRING },
}, {
  tableName: "loyalty_activities",
  timestamps: true
});


// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../db");

// const LoyaltyActivity = sequelize.define("LoyaltyActivity", {
//   id: { 
//     type: DataTypes.INTEGER.UNSIGNED, 
//     autoIncrement: true, 
//     primaryKey: true 
//   },

//   customer_id: { 
//     type: DataTypes.INTEGER.UNSIGNED,
//     allowNull: false,
//     references: { model: "users", key: "id" },
//     onDelete: "CASCADE",
//     onUpdate: "CASCADE"
//   },

//   type: { 
//     type: DataTypes.ENUM("earned", "redemption", "refund"),
//     allowNull: false 
//   },

//   points: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },

//   description: { type: DataTypes.STRING, allowNull: false }
// }, {
//   tableName: "loyalty_activities",
//   timestamps: true
// });

module.exports = LoyaltyActivity;

// // const { DataTypes } = require("sequelize");
// // const { sequelize } = require("../db");

// // const LoyaltyActivity = sequelize.define("LoyaltyActivity", {
// //   id: {  type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
// //   customer_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
// //   type: { 
// //     type: DataTypes.ENUM("earned", "redemption", "refund"),
// //     allowNull: false 
// //   },
// //   points: { type: DataTypes.INTEGER, allowNull: false },
// //   description: { type: DataTypes.STRING },
// // }, {
// //   tableName: "loyalty_activities", // make sure table name is correct
// //   timestamps: true
// // });

// // module.exports = LoyaltyActivity;

// // // const { DataTypes } = require("sequelize");
// // // const { sequelize } = require("../db");

// // // const LoyaltyActivity = sequelize.define("LoyaltyActivity", {
// // //   id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
// // //   customer_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
// // //   type: { 
// // //     type: DataTypes.ENUM("earned", "redemption", "refund"),
// // //     allowNull: false 
// // //   },
// // //   points: { type: DataTypes.INTEGER, allowNull: false }, // + or -
// // //   description: { type: DataTypes.STRING, allowNull: true }, // "3KG Rice Purchase"
// // // });

// // // module.exports = LoyaltyActivity;
