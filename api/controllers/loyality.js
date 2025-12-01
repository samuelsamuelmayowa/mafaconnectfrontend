const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User } = require("../models/user");
require("dotenv").config();
const cloudinary = require("../cloudinary");
const { Product, ProductImage, Location, ProductLocationStock } = require("../models");
const { sequelize } = require("../db");
const { Reward } = require("../models/Reward");
const { LoyaltyTier } = require("../models/LoyaltyTier");
// const Reward = require("../models/Reward.js");

exports.createReward = async (req, res) => {
    try {
        const { title, description, points_cost, reward_type, stock_limit, active } = req.body;

        const existing = await Reward.findOne({ where: { title } });
        if (existing) {
            return res.status(409).json({
                message: "Reward title already exists",
            });
        }
        // Validate required fields
        if (!title || !points_cost || !reward_type) {
            return res.status(400).json({
                message: "Missing required fields",
            });
        }

        // Create reward
        const reward = await Reward.create({
            title,
            description,
            points_cost,
            reward_type,
            stock_limit: stock_limit || null,
            active: active ?? true,
        });

        return res.status(201).json({
            message: "Reward created successfully",
            reward,
        });
    } catch (error) {
        console.error("CREATE REWARD ERROR:", error);

        return res.status(500).json({
            message: "Failed to create reward",
            error: error.message,
        });
    }
};



exports.getAllRewards = async (req, res) => {
  try {
    const rewards = await Reward.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(rewards);
  } catch (error) {
    console.error("GET REWARDS ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch rewards",
      error: error.message,
    });
  }
};




exports.updateReward = async (req, res) => {
  try {
    const { id } = req.params;

    const reward = await Reward.findByPk(id);
    if (!reward) return res.status(404).json({ message: "Reward not found" });

    await reward.update({ ...req.body });

    return res.json({
      message: "Reward updated successfully",
      reward,
    });
  } catch (error) {
    console.error("UPDATE REWARD ERROR:", error);
    return res.status(500).json({
      message: "Failed to update reward",
      error: error.message,
    });
  }
};

// ==============================
// DELETE REWARD
// ==============================
exports.deleteReward = async (req, res) => {
  try {
    const { id } = req.params;

    const reward = await Reward.findByPk(id);
    if (!reward) return res.status(404).json({ message: "Reward not found" });

    await reward.destroy();

    return res.json({ message: "Reward deleted successfully" });
  } catch (error) {
    console.error("DELETE REWARD ERROR:", error);
    return res.status(500).json({
      message: "Failed to delete reward",
      error: error.message,
    });
  }
};

// ==============================
// TOGGLE ACTIVE STATUS
// ==============================
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const reward = await Reward.findByPk(id);
    if (!reward) return res.status(404).json({ message: "Reward not found" });

    reward.active = active;
    await reward.save();

    return res.json({
      message: "Reward status updated successfully",
      reward,
    });
  } catch (error) {
    console.error("STATUS UPDATE ERROR:", error);
    return res.status(500).json({
      message: "Failed to update reward status",
      error: error.message,
    });
  }
};



// exports.getAllTiers = async (req, res) => {
//   try {
//     const tiers = await LoyaltyTier.findAll();

//     // Benefits are already arrays because of the model getter
//     const formatted = tiers.map((t) => t.toJSON());

//     return res.json(formatted);

//   } catch (err) {
//     console.error("GET TIERS ERROR:", err);
//     return res.status(500).json({ message: "Failed to fetch tiers" });
//   }
// };
exports.getAllTiers = async (req, res) => {
  try {
    const tiers = await LoyaltyTier.findAll();

    return res.json({
      data: tiers,   // keep consistent API response structure
    });
  } catch (err) {
    console.error("GET TIERS ERROR:", err);
    return res.status(500).json({ message: "Failed to fetch tiers" });
  }
};



// exports.getAllTiers = async (req, res) => {
//   try {
//     const tiers = await LoyaltyTier.findAll({
//       order: [["min_points", "ASC"]],
//     });

//     return res.json(tiers);
//   } catch (error) {
//     console.error("GET TIERS ERROR:", error);
//     return res.status(500).json({ message: "Failed to fetch loyalty tiers" });
//   }
// };

// ===============================
// CREATE NEW TIER
// ===============================
// exports.getAllTiers = async (req, res) => {
//   try {
//     const tiers = await LoyaltyTier.findAll();

//     const formatted = tiers.map((t) => ({
//       ...t.toJSON(),
//       benefits: t.benefits ? JSON.parse(t.benefits) : [],
//     }));

//     return res.json(formatted);
//   } catch (err) {
//     return res.status(500).json({ message: "Failed to fetch tiers" });
//   }
// };

// exports.createTier = async (req, res) => {
//   try {
//     const {name, min_points, max_points, multiplier, benefits } = req.body;

//     // VALIDATION
//     if (!name|| !min_points || !max_points) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     // Prevent duplicate tiertitles
//     const existing = await LoyaltyTier.findOne({ where: {name} });
//     if (existing) {
//       return res.status(400).json({ message: "Tiertitle already exists" });
//     }

//     const tier = await LoyaltyTier.create({
//      name,
//       min_points,
//       max_points,
//       multiplier: multiplier || 1,
//      benefits,
//     //  Array.isArray(benefits) ? JSON.stringify(benefits) : benefits || "",
//       active: true,
//     });

//     return res.status(201).json({
//       message: "Tier created successfully",
//       tier,
//     });
//   } catch (error) {
//     console.error("CREATE TIER ERROR:", error);
//     return res.status(500).json({ message: "Failed to create tier" });
//   }
// };
exports.createTier = async (req, res) => {
  try {
    const { name, min_points, max_points, multiplier, benefits } = req.body;

    // VALIDATION
    if (!name || !min_points || !max_points) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Handle duplicate tier name BEFORE MySQL rejects it
    const existing = await LoyaltyTier.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: "A tier with this name already exists" });
    }

    const tier = await LoyaltyTier.create({
      name,
      min_points,
      max_points,
      multiplier: multiplier || 1,
      benefits: Array.isArray(benefits) ? JSON.stringify(benefits) : benefits || "[]",
      active: true,
    });

    return res.status(201).json({
      message: "Tier created successfully",
      data: tier,
    });
  } catch (error) {
    console.error("CREATE TIER ERROR:", error);

    // 🚨 Catch MySQL duplicate key error
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Tier name already exists. Please use a different name.",
      });
    }

    return res.status(500).json({ message: "Failed to create tier" });
  }
};


// ===============================
// UPDATE TIER
// ===============================
exports.updateTier = async (req, res) => {
  try {
    const { id } = req.params;

    const tier = await LoyaltyTier.findByPk(id);
    if (!tier) {
      return res.status(404).json({ message: "Tier not found" });
    }

    await tier.update(req.body);

    return res.json({
      message: "Tier updated successfully",
      tier,
    });
  } catch (error) {
    console.error("UPDATE TIER ERROR:", error);
    return res.status(500).json({ message: "Failed to update tier" });
  }
};

// ===============================
// DELETE TIER
// ===============================
exports.deleteTier = async (req, res) => {
  try {
    const { id } = req.params;

    const tier = await LoyaltyTier.findByPk(id);
    if (!tier) {
      return res.status(404).json({ message: "Tier not found" });
    }

    await tier.destroy();

    return res.json({ message: "Tier deleted successfully" });
  } catch (error) {
    console.error("DELETE TIER ERROR:", error);
    return res.status(500).json({ message: "Failed to delete tier" });
  }
};

// ===============================
// TOGGLE ACTIVE STATUS
// ===============================
exports.toggleTierStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const tier = await LoyaltyTier.findByPk(id);
    if (!tier) {
      return res.status(404).json({ message: "Tier not found" });
    }

    tier.active = active;
    await tier.save();

    return res.json({
      message: "Tier status updated",
      tier,
    });
  } catch (error) {
    console.error("TOGGLE STATUS ERROR:", error);
    return res.status(500).json({ message: "Failed to update tier status" });
  }
};