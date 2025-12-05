const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User } = require("../models/user");
require("dotenv").config();
const cloudinary = require("../cloudinary");
const { Product, ProductImage, Location, ProductLocationStock, Order, OrderItem, LoyaltyTransaction, LoyaltyAccount, RewardRedemption } = require("../models");
const { sequelize } = require("../db");
const { Reward } = require("../models/Reward");
const { LoyaltyTier } = require("../models/LoyaltyTier");
const { calculatePointsFromOrderItems, calculatePointsFromOrder } = require("./calu");
// const Reward = require("../models/Reward.js");


exports.getAllRedemptions = async (req, res) => {
  // try {
  //   const data = await RewardRedemption.findAll({
  //     include: [{ model: Reward }],
  //     order: [["createdAt", "DESC"]]
  //   });
  //   return res.json(data);
  // } catch (err) {
  //   console.log("GET REDEMPTIONS ERROR", err);
  //   res.status(500).json({ message: "Failed to fetch redemptions" });
  // // }
  // try {
  //   const redemptions = await RewardRedemption.findAll({
  //     include: [
  //       {
  //         model: Reward,
  //         as: "reward",
  //         attributes: ["title", "description"]
  //       },
  //       {
  //         model: User,
  //         as: "customer",
  //         attributes: ["name", "redemptions_code", "email"]
  //       }
  //     ],
  //     order: [["createdAt", "DESC"]]
  //   });

  //   return res.json(redemptions);
  // } catch (err) {
  //   console.log("❌ Fetch Redemption Error:", err);
  //   return res.status(500).json({ message: "Failed to load redemptions" });
  // }

  // try {
  //   const redemptions = await RewardRedemption.findAll({
  //     include: [
  //       {
  //         model: Reward,
  //         as: "reward",
  //         attributes: ["title", "description"]
  //       },
  //       {
  //         model: User,
  //         as: "customer",
  //         attributes: ["id", "name", "phone"]
  //       }
  //     ],
  //     order: [["createdAt", "DESC"]]
  //   });

  //   return res.json(redemptions);
  // } catch (err) {
  //   console.log("❌ Fetch Redemption Error:", err);
  //   res.status(500).json({ message: "failed to load redemption list" });
  // }

  // try {
  //   const { limit = 5 } = req.query;

  //   const recent = await RewardRedemption.findAll({
  //     limit: Number(limit),
  //     order: [["createdAt", "DESC"]],

  //     include: [
  //       {
  //         model: Reward,
  //         as: "reward",
  //         attributes: ["title", "description"]
  //       },
  //       {
  //         model: User,
  //         as: "customer",
  //         attributes: ["id", "name", "email", "phone"]
  //       }
  //     ],
  //   });

  //   return res.json(recent);

  // } catch (err) {
  //   console.log("GET RECENT REDEMPTIONS ERROR:", err);
  //   return res.status(500).json({ message: "Failed to load recent redemptions" });
  // }

  // try {
  //   const redemptions = await RewardRedemption.findAll({
  //     include: [
  //       {
  //         model: Reward,
  //         as: "reward",                      // Required alias
  //         attributes: ["id", "title", "description"]
  //       },
  //       {
  //         model: User,
  //         as: "customer",                    // Required alias
  //         attributes: ["id", "name", "email", "phone"]
  //       }
  //     ],
  //     order: [["createdAt", "DESC"]],
  //     limit: parseInt(req.query.limit) || 10
  //   });

  //   return res.json(redemptions);

  // } catch (err) {
  //   console.error("❌ GET RECENT REDEMPTIONS ERROR:", err);
  // //   return res.status(500).json({ message: "Failed to load redemptions" });
  // // }

  // try {
  //   const redemptions = await RewardRedemption.findAll({
  //     include: [
  //       { model: Reward, as: "reward", attributes: ["id","title","description"] },
  //       { model: User, as: "customer", attributes: ["id","name","email","phone"] }
  //     ],
  //     order: [["createdAt", "DESC"]]
  //   });

  //   return res.json(redemptions);

  // } catch (err) {
  //   console.error("❌ Fetch Redemption Error:", err);
  //   return res.status(500).json({ message: "Failed to load redemptions" });
  // }
  try {
    const list = await RewardRedemption.findAll({
      include: [
        { model: Reward, as: "reward", attributes: ["title","description"] },
        { model: User, as: "customer", attributes: ["name","email","phone"] }
      ],
      order: [["createdAt", "DESC"]],
      limit: 10
    });

    return res.json(list);
  } catch (err) {
    console.log("❌ GET RECENT REDEMPTIONS ERROR:", err);
    res.status(500).json({ message: "Failed to load redemptions" });
  }
};

/**
 * PUT — MARK REDEMPTION AS USED
 * Reward successfully claimed/collected
 */
exports.markRedemptionUsed = async (req, res) => {
  try {
    const redemption = await RewardRedemption.findByPk(req.params.id);

    if (!redemption) return res.status(404).json({ message: "Not found" });
    if (redemption.status !== "approved")
      return res.status(400).json({ message: "Only approved redemptions can be used" });

    redemption.status = "used";
    redemption.used_at = new Date();

    await redemption.save();
    res.json({ success: true, message: "Redemption marked as used", redemption });
  } catch (err) {
    res.status(500).json({ message: "Failed to update redemption" });
  }
};

/**
 * PUT — CANCEL REDEMPTION + REFUND POINTS
 */
exports.cancelRedemption = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const redemption = await RewardRedemption.findByPk(req.params.id, { transaction: t });

    if (!redemption) return res.status(404).json({ message: "Not found" });
    if (redemption.status === "used")
      return res.status(400).json({ message: "Cannot cancel, already used" });

    const account = await LoyaltyAccount.findByPk(redemption.loyalty_account_id, { transaction: t });

    // refund points
    account.points_balance += redemption.points_spent;
    await account.save({ transaction: t });

    redemption.status = "cancelled";
    await redemption.save({ transaction: t });

    await t.commit();
    res.json({ success: true, message: "Redemption cancelled, points refunded", redemption });

  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: "Cancellation failed" });
  }
};