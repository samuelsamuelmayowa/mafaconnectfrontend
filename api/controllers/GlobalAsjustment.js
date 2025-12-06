const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User } = require("../models/user");
require("dotenv").config();
const cloudinary = require("../cloudinary");
const { Product, ProductImage, Location, ProductLocationStock, RewardRedemption, LoyaltyAccount } = require("../models");
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