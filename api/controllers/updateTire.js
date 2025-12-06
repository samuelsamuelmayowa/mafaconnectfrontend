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


async function assignTierAutomatically(loyaltyAccount, LoyaltyTier) {
  const points = loyaltyAccount.points_balance;

  const tiers = await LoyaltyTier.findAll({
    where: { active: 1 },
    order: [["min_points", "ASC"]],
  });

  let newTier = null;

  for (const tier of tiers) {
    if (points >= tier.min_points && (tier.max_points === null || points <= tier.max_points)) {
      newTier = tier.id;
    }
  }

  // Save only if tier changed
  if (newTier && newTier !== loyaltyAccount.tier_id) {
    loyaltyAccount.tier_id = newTier;
    await loyaltyAccount.save();
    console.log(`✔ Tier Updated → ${newTier}`);
  }
}

module.exports = assignTierAutomatically;
