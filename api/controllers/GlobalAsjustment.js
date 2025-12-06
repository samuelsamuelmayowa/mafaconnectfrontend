const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User } = require("../models/user");
require("dotenv").config();
const cloudinary = require("../cloudinary");
const { Product, ProductImage, Location, ProductLocationStock, RewardRedemption, LoyaltyAccount, Reward } = require("../models");
const { sequelize } = require("../db");
// const sendEmail = require("../utils/sendEmail");
const OrderItem = require("../models/OrderItem");
// const Order = require("../models/Order");
const { Order, Notification } = require("../models/Order");
// const { } = require("../models/Order"); // if you need it too
const { LocationProductStock } = require("../models/LocationProductStock");
const crypto = require("crypto");
const Invoice = require("../models/Invoice");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { sendEmail } = require("../utils/sendEmail");
const { LoyaltyTier } = require("../models/LoyaltyTier");



exports.getLoyaltyStats = async (req, res) => {
  try {
    // Total points in circulation (earned - spent + refunded included automatically)
    const totalDistributed = await LoyaltyAccount.sum("points_balance");

    // Total redemptions (completed = used)
    const totalRewardsRedeemed = await RewardRedemption.count({
      where: { status: "used" }
    });

    // How many pending redemptions currently exist
    const pendingRedemptions = await RewardRedemption.count({
      where: { status: "pending" }
    });

    // Total cancelled (for monitoring misuse or refunds)
    const totalCancelled = await RewardRedemption.count({
      where: { status: "cancelled" }
    });

    return res.json({
      success: true,
      data: {
        totalDistributed: totalDistributed || 0,
        totalRewardsRedeemed,
        pendingRedemptions,
        totalCancelled
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getActiveMembers = async (req, res) => {
  try {
    const activeMembers = await LoyaltyAccount.count({
      include: [{
        model: User,
        where: { is_active: true, role: "customer" } // only active real customers
      }]
    });

    res.json({ success: true, activeMembers });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch active members" });
  }
};



// exports.getCustomerRedemptions = async (req, res) => {
//   try {
//     // find loyalty account for logged in user
//     const account = await LoyaltyAccount.findOne({
//       where: { customer_id: req.user.id }
//     });

//     if (!account) return res.status(404).json({ message: "No loyalty account found" });

//     // get redemption history
//     const redemptions = await RewardRedemption.findAll({
//       where: { loyalty_account_id: account.id },
//       include: [
//         { model: Reward },      // so customer sees reward name
//         { model: LoyaltyTier }         // so customer sees tier level
//       ],
//       order: [["createdAt", "DESC"]]
//     });

//     const formatted = redemptions.map(r => ({
//       tier: r.Tier?.name || "No Tier",
//       rewardName: r.Reward?.title || "Reward",
//       quantity: r.quantity || 1,
//       status: r.status,
//       redemptionCode: r.redemption_code,
//       date: r.createdAt
//     }));

//     res.json({ success: true, data: formatted });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// exports.getCustomerRedemptions = async (req, res) => {
//   try {
//     const account = await LoyaltyAccount.findOne({
//       where: { customer_id: req.user.id }
//     });

//     if (!account)
//       return res.status(404).json({ message: "No loyalty account found" });

//     const redemptions = await RewardRedemption.findAll({
//       where: { loyalty_account_id: account.id },
//       include: [
//         { model: Reward, as: "reward" },
//         {
//           model: LoyaltyAccount,
//           as: "account",
//           include: [{ model: LoyaltyTier, as: "tier" }],
//         },
//       ],
//       order: [["createdAt", "DESC"]]
//     });

//     const formatted = redemptions.map(r => ({
//       tier: r.account?.tier?.name || "No Tier",
//       rewardName: r.reward?.title || "Reward",
//       quantity: r.quantity || 1,
//       status: r.status,
//       redemptionCode: r.redemption_code,
//       date: r.createdAt
//     }));

//     res.json({ success: true, data: formatted });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


exports.getCustomerRedemptions = async (req, res) => {
  try {
    const account = await LoyaltyAccount.findOne({
      where: { customer_id: req.user.id }
    });

    if (!account) return res.status(404).json({ message: "No loyalty account found" });

    const redemptions = await RewardRedemption.findAll({
      where: { loyalty_account_id: account.id },
      include: [
        { model: Reward, as: "rewardInfo" }, // <--- updated alias
        {
          model: LoyaltyAccount,
          as: "account",
          include: [{ model: LoyaltyTier, as: "loyaltyTier" }],
        },
      ],
      order: [["createdAt", "DESC"]]
    });

    const formatted = redemptions.map(r => ({
      tier: r.account?.loyaltyTier?.name || "No Tier",
      rewardName: r.rewardInfo?.title || "Reward",
      quantity: r.quantity || 1,
      status: r.status,
      redemptionCode: r.redemption_code,
      date: r.createdAt
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
