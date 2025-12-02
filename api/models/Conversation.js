const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const Conversation = sequelize.define("Conversation", {
  id: {
type: DataTypes.INTEGER.UNSIGNED,    
    // type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  subject: DataTypes.STRING,
  status: {
    type: DataTypes.ENUM("open", "closed"),
    defaultValue: "open",
  },
  created_by:{type: DataTypes.INTEGER.UNSIGNED} ,
  // DataTypes.INTEGER,
  assigned_to:{type: DataTypes.INTEGER.UNSIGNED},
  //  DataTypes.INTEGER,
}, {
  tableName: "conversations",
  timestamps: true,
});

module.exports = { Conversation };

// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../db");

// const Conversation = sequelize.define("Conversation", {

//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },

//   subject: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },

//   created_by: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },

//   assigned_to: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//   },

//   status: {
//     type: DataTypes.ENUM("open", "closed"),
//     defaultValue: "open"
//   },

//   last_message_at: {
//     type: DataTypes.DATE,
//     allowNull: true
//   }

// }, {
//   tableName: "conversations",
//   timestamps: true
// });

// module.exports = { Conversation };
