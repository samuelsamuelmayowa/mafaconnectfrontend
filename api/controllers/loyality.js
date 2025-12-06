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

// exports.awardPointsForOrder = async (orderId) => {
//   try {
//     const order = await Order.findOne({
//       where: { id: orderId },
//       include: [
//         {
//           model: OrderItem,
//           as: "items",
//           include: [{ model: Product }]
//         }
//       ]
//     });

//     if (!order) return;

//     if (order.payment_status !== "paid") {
//       console.log("Order is not paid — no points awarded");
//       return;
//     }

//     // Ensure user loyalty account exists
//     let account = await LoyaltyAccount.findOne({
//       where: { customer_id: order.customer_id }
//     });

//     if (!account) {
//       account = await LoyaltyAccount.create({
//         customer_id: order.customer_id,
//         points_balance: 0,
//         tier: "Bronze",
//       });
//     }

//     // Prevent awarding twice
//     const alreadyAwarded = await LoyaltyTransaction.findOne({
//       where: {
//         account_id: account.id,
//         description: `Order #${order.id}`
//       }
//     });

//     if (alreadyAwarded) {
//       console.log("Points already awarded for this order.");
//       return;
//     }

//     // Calculate points
//     const points = calculatePointsFromOrder(order);

//     // Add points
//     account.points_balance += points;
//     await account.save();

//     // Insert loyalty transaction record
//     await LoyaltyTransaction.create({
//       account_id: account.id,
//       points,
//       description: `Order #${order.id}`
//     });

//     console.log(`POINTS ADDED — ${points} points for Order ${order.id}`);

//   } catch (err) {
//     console.error("EARN POINTS ERROR:", err);
//   }
// };

// async function awardPointsForOrder(orderInput) {
//   try {
//     console.log("Processing points for order:", orderInput);

//     // Reload with needed relations (important)
//      const orderId = typeof orderInput === "object" ? orderInput.id : orderInput;
//     const fullOrder = await Order.findByPk(orderId, {
//       include: [
//         {
//           model: OrderItem,

//           as: "items",
//           include: [{ model: Product, as: "product" }]
//         }
//       ]
//     });

//     if (!fullOrder) {
//       console.log("ORDER NOT FOUND WHEN AWARDING POINTS");
//       return;
//     }

//     if (!fullOrder.items || fullOrder.items.length === 0) {
//       console.log("NO ITEMS — CANNOT AWARD POINTS");
//       return;
//     }

//     // Total points is total KG purchased
//     let totalPoints = 0;

//     fullOrder.items.forEach(item => {
//       const KG = item.product?.bag_size_kg || 0;
//       const qty = item.quantity || 0;

//       totalPoints += KG * qty;
//     });

//     // Get loyalty account
//     let account = await LoyaltyAccount.findOne({
//       where: { customer_id: fullOrder.customer_id }
//     });

//     // Auto-create account if not exist
//     if (!account) {
//       account = await LoyaltyAccount.create({
//         customer_id: fullOrder.customer_id,
//         points_balance: 0,
//         tier: "Bronze"
//       });
//     }

//     // Add points
//     account.points_balance += totalPoints;
//     await account.save();

//     // Log transaction
//     // await LoyaltyTransaction.create({
//     //   loyalty_account_id: account.id,
//     //   points: totalPoints,
//     //   type: "earn",
//     //   source: `Order ${fullOrder.order_number}`
//     // });
//     //     await LoyaltyTransaction.create({
//     //   account_id: account.id,                 // correct field
//     //   points: totalPoints,
//     //   type: "earn",
//     //   description: `Order ${fullOrder.order_number}`,   // correct field
//     // });
//     // await LoyaltyTransaction.create({
//     //   loyalty_account_id: account.id,
//     //   points: totalPoints,
//     //   type: "earn",
//     //   description: `Order ${fullOrder.order_number}`,
//     // });
//      await LoyaltyTransaction.create({
//       loyalty_account_id: account.id,
//       points: totalPoints,
//       type: "earn",
//       description: `Order #${fullOrder.id}`,
//       meta: JSON.stringify({
//         order_id: fullOrder.id,
//         items: fullOrder.items.map(i => ({
//           product: i.product?.name,
//           kg: i.product?.bag_size_kg,
//           qty: i.quantity
//         }))
//       })
//     });

//     console.log(`POINTS ADDED: ${totalPoints} -> ACCOUNT: ${account.id}`);

//   } catch (err) {
//     console.error("AWARD POINTS ERROR:", err);
//   }
// }
async function awardPointsForOrder(orderInput) {
  try {
    console.log("RAW awardPointsForOrder input:", orderInput);

    const orderId =
      typeof orderInput === "object"
        ? orderInput.id
        : Number(orderInput);

    console.log("Processed Order ID:", orderId);

    if (!orderId) {
      console.log("❌ INVALID ORDER ID:", orderId);
      return;
    }

    const fullOrder = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }]
        }
      ]
    });

    if (!fullOrder) {
      console.log("❌ ORDER NOT FOUND IN DATABASE FOR ID:", orderId);
      return;
    }

    console.log("✅ ORDER FOUND FOR POINTS:", fullOrder.id);

    if (!fullOrder.items || fullOrder.items.length === 0) {
      console.log("❌ NO ITEMS — cannot award points");
      return;
    }

    let totalPoints = 0;
    // fullOrder.items.forEach(item => {
    //   const KG = item.product?.bag_size_kg || 0;
    //   const qty = item.quantity || 0;
    //   totalPoints += KG * qty;
    // });
    fullOrder.items.forEach(item => {
      console.log("ITEM LOG =>", {
        product_id: item.product_id,
        product_name: item.product?.name,
        bag_size_kg: item.product?.bag_size_kg,
        quantity: item.quantity
      });

      const KG = item.product?.bag_size_kg || 0;
      const qty = item.quantity || 0;

      totalPoints += KG * qty;
    });
    let account = await LoyaltyAccount.findOne({
      where: { customer_id: fullOrder.customer_id }
    });

    if (!account) {
      console.log("Creating new loyalty account...");
      account = await LoyaltyAccount.create({
        customer_id: fullOrder.customer_id,
        points_balance: 0,
        tier: "Bronze"
      });
    }

    account.points_balance += totalPoints;
    await account.save();

    await LoyaltyTransaction.create({
      loyalty_account_id: account.id,
      points: totalPoints,
      type: "earn",
      description: `Order #${fullOrder.id}`
    });

    console.log(`🎉 POINTS ADDED: ${totalPoints} to account ${account.id}`);

  } catch (err) {
    console.error("AWARD POINTS ERROR:", err);
  }
}

// exports.earnPointsForOrder = async (orderId, tFromCaller = null) => {
//   const transaction = tFromCaller || (await sequelize.transaction());
//   const commitNeeded = !tFromCaller;

//   try {
//     // 1) Load order + items + product sizes
//     const order = await Order.findOne({
//       where: { id: orderId },
//       include: [
//         {
//           model: OrderItem,
//           as: "items",
//           include: [
//             {
//               model: Product,
//               as: "product",
//               attributes: ["id", "name", "bag_size_kg"], // CHANGE if name differs
//             },
//           ],
//         },
//       ],
//       transaction,
//     });

//     if (!order) {
//       if (commitNeeded) await transaction.rollback();
//       return;
//     }

//     // 2) Calculate points from KG
//     const pointsEarned = calculatePointsFromOrder(order.items || []);

//     if (pointsEarned <= 0) {
//       if (commitNeeded) await transaction.commit();
//       return;
//     }

//     // 3) Get / create loyalty account
//     let account = await getOrCreateLoyaltyAccount(
//       order.customer_id,
//       transaction
//     );

//     // 4) Update balances
//     account.points_balance += pointsEarned;
//     account.lifetime_points_earned += pointsEarned;
//     await account.save({ transaction });

//     // 5) Log transaction
//     await LoyaltyTransaction.create(
//       {
//         loyalty_account_id: account.id,
//         type: "earn",
//         points: pointsEarned,
//         source: "order",
//         source_ref: order.order_number || String(order.id),
//         note: `Earned ${pointsEarned} pts from order ${order.order_number || order.id}`,
//       },
//       { transaction }
//     );

//     // 6) Recalculate tier (Bronze / Silver / Gold based on tiers table)
//     await recalculateTierForAccount(account, transaction);

//     if (commitNeeded) await transaction.commit();
//   } catch (err) {
//     console.error("EARN POINTS FOR ORDER (KG) ERROR:", err);
//     if (commitNeeded) await transaction.rollback();
//   }
// };

const earnPointsForOrder = async (orderArg) => {
  try {
    // orderArg can be an ID or object
    const orderId = typeof orderArg === "object" ? orderArg.id : orderArg;

    const order = await Order.findOne({
      where: { id: orderId },
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "bag_size_kg"],
            },
          ],
        },
      ],
    });

    if (!order) return console.log("ORDER NOT FOUND");
    if (order.payment_status !== "paid")
      return console.log("PAYMENT NOT PAID — POINTS SKIPPED");

    // 1. Ensure customer has a loyalty account
    let account = await LoyaltyAccount.findOne({
      where: { customer_id: order.customer_id },
    });

    if (!account) {
      account = await LoyaltyAccount.create({
        customer_id: order.customer_id,
        points_balance: 0,
        tier: "Bronze",
      });
    }

    // 2. Prevent double-earning
    const already = await LoyaltyTransaction.findOne({
      where: {
        loyalty_account_id: account.id,
        description: `Order #${order.id}`,
        type: "earn",
      },
    });

    if (already) {
      console.log("POINTS ALREADY AWARDED FOR THIS ORDER");
      return;
    }

    // 3. Calculate points based on bag_size_kg
    const earnedPoints = calculatePointsFromOrder(order);

    if (earnedPoints <= 0) {
      console.log("NO POINTS EARNED");
      return;
    }

    // 4. Add points
    account.points_balance += earnedPoints;
    await account.save();

    // 5. Save transaction log
    await LoyaltyTransaction.create({
      loyalty_account_id: account.id,
      type: "earn",
      points: earnedPoints,
      description: `Order #${order.id}`,
      meta: JSON.stringify({
        order_id: order.id,
        items: order.items.map((i) => ({
          product: i.product?.name,
          kg: i.product?.bag_size_kg,
          qty: i.quantity,
        })),
      }),
    });

    console.log(`AWARDED ${earnedPoints} POINTS FOR ORDER #${order.id}`);
  } catch (err) {
    console.error("EARN POINTS ERROR:", err);
  }
};



// const redeemReward = async (req, res) => {
//   const customerId = req.user && req.user.id; // from authenticate middleware
//   const { rewardId } = req.body;

//   if (!customerId || !rewardId) {
//     return res.status(400).json({ message: "Missing customer or reward id" });
//   }

//   const t = await sequelize.transaction();

//   try {
//     const account = await getOrCreateLoyaltyAccount(customerId, t);

//     const reward = await Reward.findOne({
//       where: { id: rewardId, active: true },
//       transaction: t,
//       lock: t.LOCK.UPDATE,
//     });

//     if (!reward) {
//       await t.rollback();
//       return res.status(404).json({ message: "Reward not found or inactive" });
//     }

//     if (reward.stock_limit !== null && reward.stock_limit <= 0) {
//       await t.rollback();
//       return res.status(400).json({ message: "Reward out of stock" });
//     }

//     if (account.points_balance < reward.points_cost) {
//       await t.rollback();
//       return res.status(400).json({ message: "Not enough points" });
//     }

//     // Deduct points
//     account.points_balance -= reward.points_cost;
//     account.lifetime_points_redeemed += reward.points_cost;
//     await account.save({ transaction: t });

//     // Log transaction (redeem = negative points)
//     await LoyaltyTransaction.create(
//       {
//         loyalty_account_id: account.id,
//         type: "redeem",
//         points: -reward.points_cost,
//         source: "reward",
//         source_ref: String(reward.id),
//         note: `Redeemed reward: ${reward.title}`,
//       },
//       { transaction: t }
//     );

//     // Decrease stock
//     if (reward.stock_limit !== null) {
//       reward.stock_limit = reward.stock_limit - 1;
//       await reward.save({ transaction: t });
//     }

//     // Generate redemption code (simple version)
//     const redemptionCode = `RDM-${Date.now()}-${Math.floor(
//       Math.random() * 1000
//     )}`;

//     const expiresAt = null; // or set 30 days ahead if you want

//     const redemption = await RewardRedemption.create(
//       {
//         loyalty_account_id: account.id,
//         reward_id: reward.id,
//         customer_id: customerId,
//         points_spent: reward.points_cost,
//         redemption_code: redemptionCode,
//         status: "active",
//         expires_at: expiresAt,
//       },
//       { transaction: t }
//     );

//     await recalculateTierForAccount(account, t);

//     await t.commit();

//     return res.status(201).json({
//       message: "Reward redeemed successfully",
//       redemption_code: redemption.redemption_code,
//       redemption: {
//         id: redemption.id,
//         status: redemption.status,
//         points_spent: redemption.points_spent,
//         created_at: redemption.createdAt,
//         expires_at: redemption.expires_at,
//         used_at: redemption.used_at,
//         reward: {
//           id: reward.id,
//           title: reward.title,
//           description: reward.description,
//         },
//       },
//     });
//   } catch (err) {
//     console.error("REDEEM REWARD ERROR:", err);
//     await t.rollback();
//     return res.status(500).json({ message: "Failed to redeem reward" });
//   }
// };

// ===================================================
// 5. RECENT REDEMPTIONS (staff dashboard)
//    GET /api/loyalty/redemptions/recent?limit=5
// ===================================================
const redeemReward = async (req, res) => {
  const customerId = req.user?.id;
  const { rewardId } = req.body;

  if (!customerId || !rewardId) {
    return res.status(400).json({ message: "Missing customer or reward id" });
  }

  const t = await sequelize.transaction();

  try {
    const account = await getOrCreateLoyaltyAccount(customerId, t);

    const reward = await Reward.findOne({
      where: { id: rewardId, active: true },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!reward) {
      await t.rollback();
      return res.status(404).json({ message: "Reward not found or inactive" });
    }

    if (reward.stock_limit !== null && reward.stock_limit <= 0) {
      await t.rollback();
      return res.status(400).json({ message: "Reward out of stock" });
    }

    if (account.points_balance < reward.points_cost) {
      await t.rollback();
      return res.status(400).json({ message: "Not enough points" });
    }

    // Deduct points immediately
    account.points_balance -= reward.points_cost;
    account.lifetime_points_redeemed += reward.points_cost;
    await account.save({ transaction: t });

    // Log transaction as redemption (negative points)
    await LoyaltyTransaction.create(
      {
        loyalty_account_id: account.id,
        type: "redeem",              // SAME AS BEFORE
        points: -reward.points_cost, // subtract
        source: "reward",
        source_ref: String(reward.id),
        note: `Requested reward: ${reward.title}`,
      },
      { transaction: t }
    );

    // Generate code NOW, but not usable yet
    const redemptionCode = `RDM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const redemption = await RewardRedemption.create(
      {
        loyalty_account_id: account.id,
        reward_id: reward.id,
        customer_id: customerId,
        points_spent: reward.points_cost,
        redemption_code: redemptionCode,

        // 🔥 HERE IS THE CHANGE
        status: "pending",  // WAITING FOR ADMIN APPROVAL ❗

        expires_at: null  // you can enable expiry later
      },
      { transaction: t }
    );

    await recalculateTierForAccount(account, t);

    await t.commit();

    return res.status(201).json({
      message: "Redemption submitted — awaiting admin approval",
      redemption: {
        id: redemption.id,
        status: "pending",
        redemption_code: redemptionCode,
        points_spent: redemption.points_spent,
        created_at: redemption.createdAt,
        reward: {
          id: reward.id,
          title: reward.title,
          description: reward.description,
        }
      }
    });

  } catch (err) {
    console.error("REDEEM REWARD ERROR:", err);
    await t.rollback();
    return res.status(500).json({ message: "Failed to redeem reward" });
  }
};




const approveReward = async (req, res) => {
  try {
    const { id } = req.params;

    const redemption = await RewardRedemption.findByPk(id, {
      include: [{ model: Reward }]
    });

    if (!redemption) return res.status(404).json({ message: "Not found" });
    if (redemption.status !== "pending")
      return res.status(400).json({ message: "Already processed" });

    redemption.status = "active";        // 🔥 Admin approves
    redemption.used_at = null;           // will be filled when collected
    await redemption.save();

    return res.json({ message: "Approved!", redemption });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ message: "Failed approval" });
  }
};

const rejectReward = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;

    const redemption = await RewardRedemption.findByPk(id, { transaction: t });
    if (!redemption) return res.json({ message: "Not found" });
    if (redemption.status !== "pending")
      return res.json({ message: "Already approved/rejected" });

    // refund points
    const account = await LoyaltyAccount.findByPk(
      redemption.loyalty_account_id,
      { transaction: t }
    );
    account.points_balance += redemption.points_spent;
    await account.save({ transaction: t });

    redemption.status = "rejected";
    await redemption.save({ transaction: t });

    await LoyaltyTransaction.create(
      {
        loyalty_account_id: account.id,
        type: "refund",
        points: redemption.points_spent,
        note: `Refund for rejected redemption`
      },
      { transaction: t }
    );

    await t.commit();
    return res.json({ message: "Redemption rejected — points refunded" });
  } catch (e) {
    await t.rollback();
    return res.json({ message: "Error rejecting redemption" });
  }
};


const getRecentRedemptions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;

    const redemptions = await RewardRedemption.findAll({
      order: [["createdAt", "DESC"]],
      limit,
      include: [
        { model: Reward, attributes: ["title", "description"] },
        { model: User, attributes: ["name"] },
      ],
    });

    const formatted = redemptions.map((r) => ({
      id: r.id,
      status: r.status,
      points_spent: r.points_spent,
      created_at: r.createdAt,
      expires_at: r.expires_at,
      used_at: r.used_at,
      reward: r.Reward
        ? {
          title: r.Reward.title,
          description: r.Reward.description,
        }
        : null,
      customer: r.Customer ? { name: r.Customer.name } : null,
    }));

    return res.json(formatted);
  } catch (err) {
    console.error("GET RECENT REDEMPTIONS ERROR:", err);
    return res.status(500).json({ message: "Failed to load redemptions" });
  }
};


// const markRedemptionAsUsed = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const redemption = await RewardRedemption.findByPk(id);
//     if (!redemption) return res.status(404).json({ message: "Redemption not found" });

//     if (redemption.status !== "pending")
//       return res.status(400).json({ message: "Only pending redemptions can be marked as used" });

//     // Update status
//     redemption.status = "used";
//     await redemption.save();

//     // ------ 🔥 UPDATE TIER AFTER POINT DEDUCTION ------
//     const loyaltyAccount = await LoyaltyAccount.findByPk(redemption.loyalty_account_id);
//     await assignTierAutomatically(loyaltyAccount, LoyaltyTier);

//     return res.json({ 
//       success: true, 
//       message: "Redemption marked as used + tier recalculated" 
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message || "Server error" });
//   }
// };

// const markRedemptionAsUsed = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const redemption = await RewardRedemption.findByPk(id);
//     if (!redemption) return res.status(404).json({ message: "Redemption not found" });

//     if (redemption.status !== "pending")
//       return res.status(400).json({ message: "Only pending redemptions can be marked as used" });

//     redemption.status = "used";
//     await redemption.save();

//     return res.json({ success: true, message: "Redemption marked as used" });
//   } catch (err) {
//     res.status(500).json({ message: err.message || "Server error" });
//   }
// };

// ============================================================
// CANCEL + REFUND CUSTOMER POINTS
// ============================================================


// exports.cancelRedemptionAndRefund = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const redemption = await RewardRedemption.findByPk(id);
//     if (!redemption) return res.status(404).json({ message: "Redemption not found" });

//     if (redemption.status !== "pending")
//       return res.status(400).json({ message: "Redemption cannot be cancelled" });

//     const loyaltyAccount = await LoyaltyAccount.findByPk(redemption.loyalty_account_id);
//     if (!loyaltyAccount)
//       return res.status(404).json({ message: "Customer loyalty account not found" });

//     // refund points
//     loyaltyAccount.points_balance += redemption.points_spent;
//     await loyaltyAccount.save();

//     redemption.status = "cancelled";
//     await redemption.save();

//     return res.json({ success: true, message: "Redemption cancelled + points refunded" });
//   } catch (err) {
//     res.status(500).json({ message: err.message || "Server error" });
//   }
// };




const markRedemptionAsUsed = async (req, res) => {
  try {
    const { id } = req.params;

    const redemption = await RewardRedemption.findByPk(id);
    if (!redemption) return res.status(404).json({ message: "Redemption not found" });

    if (redemption.status !== "pending")
      return res.status(400).json({ message: "Only pending redemptions can be marked as used" });

    // 🔥 Deduct points from loyalty account
    const loyaltyAccount = await LoyaltyAccount.findByPk(redemption.loyalty_account_id);
    loyaltyAccount.points_balance -= redemption.points_spent;
    if (loyaltyAccount.points_balance < 0) loyaltyAccount.points_balance = 0; // safety
    await loyaltyAccount.save();

    // 🔥 Update tier after deduction
    await assignTierAutomatically(loyaltyAccount, LoyaltyTier);

    redemption.status = "used";
    redemption.used_at = new Date();
    await redemption.save();

    return res.json({
      success: true,
      message: "Redemption used — points deducted + tier updated",
    });

  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};

async function getOrCreateLoyaltyAccount(customerId, t = null) {
  let account = await LoyaltyAccount.findOne({
    where: { customer_id: customerId },
    transaction: t || undefined,
  });

  if (!account) {
    account = await LoyaltyAccount.create(
      {
        customer_id: customerId,
        points_balance: 0,
        lifetime_points_earned: 0,
        lifetime_points_redeemed: 0,
        tier: "Bronze",
      },
      { transaction: t || undefined }
    );
  }

  return account;
}

// ================================
// Helper: recalc tier by points
// ================================
async function recalculateTierForAccount(account, t = null) {
  const tiers = await LoyaltyTier.findAll({
    where: { active: true },
    order: [["min_points", "ASC"]],
    transaction: t || undefined,
  });

  let newTierName = account.tier || "Bronze";

  for (const tier of tiers) {
    if (
      account.points_balance >= tier.min_points &&
      (tier.max_points === null || account.points_balance <= tier.max_points)
    ) {
      newTierName = tier.name;
    }
  }

  if (newTierName !== account.tier) {
    account.tier = newTierName;
    await account.save({ transaction: t || undefined });
  }

  return account;
}

// ===================================================
// 1. GET loyalty account by customerId
//    GET /api/loyalty/:customerId
// ===================================================
const tiers = require("../config/tierLevels");
const LoyaltyActivity = require("../models/LoyaltyActivity");
const assignTierAutomatically = require("./updateTire");
const getLoyaltyAccount = async (req, res) => {
  // try {
  //   const { customerId } = req.params;

  //   let account = await getOrCreateLoyaltyAccount(customerId);

  //   // Ensure tier is up to date
  //   account = await recalculateTierForAccount(account);

  //   return res.json({
  //     id: account.id,
  //     customer_id: account.customer_id,
  //     points_balance: account.points_balance,
  //     lifetime_points_earned: account.lifetime_points_earned,
  //     lifetime_points_redeemed: account.lifetime_points_redeemed,
  //     tier: account.tier,
  //     created_at: account.createdAt,
  //     updated_at: account.updatedAt,
  //   });
  // } catch (err) {
  //   console.error("GET LOYALTY ACCOUNT ERROR:", err);
  //   return res.status(500).json({ message: "Failed to load loyalty account" });
  // }

  // try {
  //   const { customerId } = req.params;

  //   // MUST be integer
  //   const numericId = Number(customerId);

  //   if (isNaN(numericId)) {
  //     return res.status(400).json({
  //       success: false,
  //       message: "customerId must be a valid number",
  //     });
  //   }

  //   const account = await getOrCreateLoyaltyAccount(numericId);

  //   res.json({
  //     success: true,
  //     data: account,
  //   });
  // } catch (error) {
  //   console.error("LOYALTY ACCOUNT ERROR:", error);
  //   res.status(500).json({
  //     success: false,
  //     message: error.message || "Server error",
  //   });
  // }

  // try {
  //   const customerId = Number(req.params.customerId);

  //   if (isNaN(customerId)) {
  //     return res.status(400).json({ success: false, message: "Invalid customer ID" });
  //   }

  //   const user = await User.findByPk(customerId);
  //   if (!user) {
  //     return res.status(404).json({ success: false, message: "User not found" });
  //   }

  //   let account = await LoyaltyAccount.findOne({ where: { customer_id: customerId } });

  //   if (!account) {
  //     account = await LoyaltyAccount.create({
  //       customer_id: customerId,
  //       points_balance: 0,
  //       tier: "Bronze"
  //     });
  //   }

  //   res.json({ success: true, data: account });

  // } catch (error) {
  //   console.error("LOYALTY ERROR:", error);
  //   res.status(500).json({ success: false, message: "Server error" });
  // }


  try {
    const { customerId } = req.params;

    const account = await LoyaltyAccount.findOne({ where: { customer_id: customerId } });

    if (!account) {
      return res.status(404).json({ success: false, message: "No loyalty account found" });
    }

    // 🔥 Detect tier dynamically based on points
    const currentTier = tiers.find(t =>
      account.points_balance >= t.min && account.points_balance <= t.max
    );

    return res.json({
      success: true,
      data: {
        ...account.dataValues,
        tier: currentTier.name,
        tier_range: `${currentTier.min} - ${currentTier.max}`
      }
    });

  } catch (error) {
    console.log("LOYALTY ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};



const getLoyaltyActivity = async (req, res) => {
  try {
    const { customerId } = req.params;

    const history = await LoyaltyActivity.findAll({
      where: { customer_id: customerId },
      order: [["id", "DESC"]],
      limit: 20 // recent 20 activities
    });

    return res.json({
      success: true,
      data: history,
    });

  } catch (error) {
    console.log("Activity fetch error:", error);
    return res.status(500).json({ success: false, message: "Failed to load activity" });
  }
};


// ===================================================
// 2. GET transactions for account
//    GET /api/loyalty/accounts/:accountId/transactions?limit=10
// ===================================================
const getAccountTransactions = async (req, res) => {
  try {
    const { accountId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 10;

    const transactions = await LoyaltyTransaction.findAll({
      where: { loyalty_account_id: accountId },
      order: [["createdAt", "DESC"]],
      limit,
    });

    const formatted = transactions.map((t) => ({
      id: t.id,
      loyalty_account_id: t.loyalty_account_id,
      type: t.type,
      points: t.points,
      source: t.source,
      source_ref: t.source_ref,
      note: t.note,
      created_at: t.createdAt,
    }));

    return res.json(formatted);
  } catch (err) {
    console.error("GET ACCOUNT TRANSACTIONS ERROR:", err);
    return res
      .status(500)
      .json({ message: "Failed to load loyalty transactions" });
  }
};






const createReward = async (req, res) => {
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



const getAllRewards = async (req, res) => {
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




const updateReward = async (req, res) => {
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
const deleteReward = async (req, res) => {
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
const toggleStatus = async (req, res) => {
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
const getAllTiers = async (req, res) => {
  try {
    const tiers = await LoyaltyTier.findAll({
      order: [["min_points", "ASC"]],
    });

    return res.json({
      success: true,
      data: tiers,
    });

  } catch (error) {
    console.log("Tier Fetch Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load tiers list"
    });
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
const createTier = async (req, res) => {
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
const updateTier = async (req, res) => {
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
const deleteTier = async (req, res) => {
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
const toggleTierStatus = async (req, res) => {
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









const getRecentPaidOrders = async (req, res) => {
  // try {
  //   const limit = req.query.limit || 10; // frontend can request ?limit=5 or ?limit=20

  //   const orders = await Order.findAll({
  //     where: { payment_status: "paid" },
  //     include: [
  //       {
  //         model: User,
  //         as: "customer",
  //         attributes: ["id", "name", "phone", "email"],
  //       },
  //       {
  //         model: OrderItem,
  //         as: "items",
  //         include: [
  //           { model: Product, as: "product", attributes: ["id", "name"] }
  //         ],
  //       },
  //     ],
  //     order: [["createdAt", "DESC"]],
  //     limit: parseInt(limit),
  //   });

  //   return res.json({
  //     success: true,
  //     count: orders.length,
  //     orders,
  //   });

  // } catch (err) {
  //   console.error("❌ Recent paid orders error:", err);
  //   res.status(500).json({ success: false, message: "Failed to fetch paid orders" });
  // }
  try {
    const sales = await Order.findAll({
      where: { payment_status: "paid" },

      include: [
        { model: OrderItem, as: "items" },
        { model: User, as: "customer", attributes: ["name"] }
      ],

      limit: 10,
      order: [["createdAt", "DESC"]]
    });

    const formatted = sales.map(order => ({
      id: order.id,
      customer: order.customer?.name || "Walk-in Customer",
      items: order.items?.length || 0,
      amount: Number(order.total_amount) || 0,
      time: order.createdAt
    }));

    res.json(formatted);

  } catch (err) {
    console.log("RECENT SALES ERROR →", err);
    res.status(500).json({ message: "Failed to load recent sales" });
  }
};



// const cancelRedemptionAndRefund = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const redemption = await RewardRedemption.findByPk(id);
//     if (!redemption) return res.status(404).json({ message: "Redemption not found" });

//     if (redemption.status !== "pending")
//       return res.status(400).json({ message: "Redemption cannot be cancelled" });

//     const loyaltyAccount = await LoyaltyAccount.findByPk(redemption.loyalty_account_id);
//     if (!loyaltyAccount)
//       return res.status(404).json({ message: "Customer loyalty account not found" });

//     // refund points
//     loyaltyAccount.points_balance += redemption.points_spent;
//     await loyaltyAccount.save();

//     redemption.status = "cancelled";
//     await redemption.save();

//     return res.json({ success: true, message: "Redemption cancelled + points refunded" });
//   } catch (err) {
//     res.status(500).json({ message: err.message || "Server error" });
//   }
// };
const cancelRedemptionAndRefund = async (req, res) => {
  try {
    const { id } = req.params;
    // markRedemptionAsUsed
    const redemption = await RewardRedemption.findByPk(id);
    if (!redemption) return res.status(404).json({ message: "Redemption not found" });

    const loyaltyAccount = await LoyaltyAccount.findByPk(redemption.loyalty_account_id);

    loyaltyAccount.points_balance += redemption.points_spent;
    await loyaltyAccount.save();

    // 🔥 update tier automatically
    await assignTierAutomatically(loyaltyAccount, LoyaltyTier);

    redemption.status = "cancelled";
    await redemption.save();

    return res.json({ success: true, message: "Redemption cancelled + refunded + tier updated" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  getLoyaltyActivity,
  // Award points
  awardPointsForOrder,
  getRecentPaidOrders,
  earnPointsForOrder,

  // Loyalty Accounts
  getLoyaltyAccount,
  getAccountTransactions,

  // Rewards
  createReward,
  getAllRewards,
  updateReward,
  deleteReward,
  toggleStatus,
  redeemReward,
  // getRecentRedemptions,

  // Tiers
  getAllTiers,
  createTier,
  updateTier,
  deleteTier,
  toggleTierStatus,
  cancelRedemptionAndRefund,

  getRecentRedemptions, markRedemptionAsUsed
};
