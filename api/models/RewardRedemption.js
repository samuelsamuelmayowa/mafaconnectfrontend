// models/RewardRedemption.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const RewardRedemption = sequelize.define(
    "RewardRedemption",
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        loyalty_account_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        reward_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        customer_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            // type: DataTypes.INTEGER, // MUST match users.id
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        // customer_id: {
        //   type: DataTypes.STRING,
        //   allowNull: false,
        // },
        points_spent: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        redemption_code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        // status: {
        //     type: DataTypes.ENUM("active", "used", "expired", "pending"),
        //     allowNull: false,
        //     defaultValue: "pending",
        // },
        status: {
  type: DataTypes.ENUM("pending", "used", "cancelled"),
  defaultValue: "pending"
},
// points_spent: { type: DataTypes.INTEGER, allowNull: false },

        expires_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        used_at: {
            type: DataTypes.DATE,
            allowNull: true,
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
        tableName: "reward_redemptions",
    }
);

module.exports = { RewardRedemption };






// // models/RewardRedemption.js
// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../db");

// const RewardRedemption = sequelize.define("RewardRedemption", {
//   id: {
//     type: DataTypes.INTEGER.UNSIGNED,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   loyalty_account_id: {
//     type: DataTypes.INTEGER.UNSIGNED,
//     allowNull: false,
//   },
//   reward_id: {
//     type: DataTypes.INTEGER.UNSIGNED,
//     allowNull: false,
//   },
//   customer_id: {
//     type: DataTypes.INTEGER.UNSIGNED,
//     allowNull: false,
//   },
//   points_spent: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   status: {
//     type: DataTypes.ENUM("pending", "active", "used", "rejected"),
//     defaultValue: "pending",
//   },
//   redemption_code: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//   },
//   expires_at: {
//     type: DataTypes.DATE,
//     allowNull: true,
//   },
//   used_at: {
//     type: DataTypes.DATE,
//     allowNull: true,
//   },
// }, {
//   tableName: "reward_redemptions",
//   timestamps: true,
// });

// module.exports = RewardRedemption;










