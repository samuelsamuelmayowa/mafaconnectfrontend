const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const Reward = sequelize.define(
  "Reward",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    points_cost: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    reward_type: {
      type: DataTypes.ENUM("discount", "product", "voucher", "service"),
      allowNull: false,
      defaultValue: "discount",
    },

    stock_limit: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true, // null means unlimited stock
    },

    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "rewards",
    timestamps: true,
    updatedAt: "updatedAt",
    createdAt: "createdAt",
  }
);

// export default Reward;

module.exports = {Reward };