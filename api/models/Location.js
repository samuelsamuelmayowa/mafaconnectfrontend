const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");
const { User } = require("./user");

const Location = sequelize.define("Location", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    // type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  location_type: {
    type: DataTypes.ENUM("warehouse", "depot", "retail_store", "distribution_center"),
    allowNull: false,
  },

  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  zone: {
    type: DataTypes.ENUM(
      "North Central",
      "North East",
      "North West",
      "South East",
      "South South",
      "South West"
    ),
    allowNull: false,
  },

  capacity_sqft: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  manager_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    // type: DataTypes.INTEGER,
    allowNull: true,
  },

  bank_name: {
  type: DataTypes.STRING,
  allowNull: true,
},

account_name: {
  type: DataTypes.STRING,
  allowNull: true,
},

account_number: {
  type: DataTypes.STRING,
  allowNull: true,
},

sort_code: {
  type: DataTypes.STRING,
  allowNull: true,
},

}, {
  tableName: "locations",
  timestamps: true,
});

/**
 * ✅ Associations
 */
Location.belongsTo(User, {
  foreignKey: "manager_id",
  as: "manager",
});

User.hasMany(Location, {
  foreignKey: "manager_id",
  as: "managed_locations",
});

module.exports = { Location };

// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../db");

// const Location = sequelize.define("Location", {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },

//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },

//   address: {
//     type: DataTypes.STRING,
//   },

//   city: {
//     type: DataTypes.STRING,
//   },

//   bank_name: {
//     type: DataTypes.STRING,
//   },

//   bank_account_name: {
//     type: DataTypes.STRING,
//   },

//   bank_account_number: {
//     type: DataTypes.STRING,
//   },

//   bank_code: {
//     type: DataTypes.STRING,
//   },
// }, {
//   tableName: "locations",
//   timestamps: true,
// });

// module.exports = { Location };
