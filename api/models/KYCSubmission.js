const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const KYCSubmission = sequelize.define("KYCSubmission", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },

  user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },

  customer_type: {
    type: DataTypes.ENUM("individual", "corporate"),
    allowNull: false,
  },

  kyc_status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending",
  },

  rejection_reason: { type: DataTypes.TEXT, allowNull: true },

  representative: { type: DataTypes.JSON, allowNull: true },

  directors: { type: DataTypes.JSON, allowNull: true },

  documents: { type: DataTypes.JSON, allowNull: true },

}, 
{
  tableName: "kyc_submissions",
  timestamps: true,
});

KYCSubmission.associate = (models) => {
  KYCSubmission.belongsTo(models.User, {
    foreignKey: "user_id",
    as: "user",
  });
};
module.exports = KYCSubmission;
