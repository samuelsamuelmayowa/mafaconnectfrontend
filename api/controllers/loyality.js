const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User } = require("../models/user");
require("dotenv").config();
const cloudinary = require("../cloudinary");
const { Product, ProductImage, Location, ProductLocationStock } = require("../models");
const { sequelize } = require("../db");
const { Reward } = require("../models/Reward");
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
