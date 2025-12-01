const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");



const LoyaltyTier = sequelize.define(
  "LoyaltyTier",
  {
    id: {
      // type: DataTypes.STRING,
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
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
    // benefits: {
    //   type: DataTypes.TEXT, // long text allowed
    //   allowNull: true,
    // },
    //  benefits: {
    //   type: DataTypes.TEXT,
    //   allowNull: true,

    //   // Convert DB TEXT → JS ARRAY
    //   get() {
    //     const raw = this.getDataValue("benefits");
    //     try {
    //       return raw ? JSON.parse(raw) : [];
    //     } catch {
    //       return [];
    //     }
    //   },

    //   // Convert JS ARRAY → DB TEXT
    //   set(value) {
    //     if (Array.isArray(value)) {
    //       this.setDataValue("benefits", JSON.stringify(value));
    //     } else if (typeof value === "string") {
    //       this.setDataValue("benefits", JSON.stringify([value]));
    //     } else {
    //       this.setDataValue("benefits", "[]");
    //     }
    //   },
    // },

    benefits: {
      type: DataTypes.TEXT,
      allowNull: true,

      get() {
        const rawVal = this.getDataValue("benefits");
        if (!rawVal) return [];
        try {
          const parsed = JSON.parse(rawVal);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      },

      set(val) {
        // If frontend sends a single string
        if (typeof val === "string") {
          this.setDataValue("benefits", JSON.stringify([val.trim()]));
          return;
        }

        // If frontend sends array
        if (Array.isArray(val)) {
          const cleaned = val
            .filter((b) => typeof b === "string" && b.trim().length > 0)
            .map((b) => b.trim());

          this.setDataValue("benefits", JSON.stringify(cleaned));
          return;
        }

        // Fallback
        this.setDataValue("benefits", JSON.stringify([]));
      },
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




module.exports = { LoyaltyTier };