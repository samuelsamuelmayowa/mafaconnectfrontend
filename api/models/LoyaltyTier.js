const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");



  const LoyaltyTier = sequelize.define(
    "LoyaltyTier",
    {
      id: {
        // type: DataTypes.STRING,
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      min_points: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      max_points: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      multiplier: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1,
      },
      benefits: {
        type: DataTypes.TEXT, // long text allowed
        allowNull: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "loyalty_tiers",
    }
  );



  
  module.exports = {   LoyaltyTier};