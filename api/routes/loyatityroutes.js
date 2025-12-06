const express = require("express");
const router = express.Router();
const { authenticate, requireRole } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multerUpload");
const { Location, LoyaltyActivity, LoyaltyAccount } = require("../models");
const {getAllRedemptions ,markRedemptionUsed,cancelRedemption} =  require("../controllers/redeemController.js");
const { createReward, getAllRewards, updateReward, deleteReward, toggleStatus, getAllTiers, createTier, updateTier, deleteTier, toggleTierStatus, getRecentRedemptions, redeemReward, getAccountTransactions, getLoyaltyAccount, getLoyaltyActivity, markRedemptionAsUsed, cancelRedemptionAndRefund,

} = require("../controllers/loyality");
const { getLoyaltyStats, getActiveMembers } = require("../controllers/GlobalAsjustment.js");
//user side 
// Match your frontend: `${API_BASE}/api/loyalty/${user?.id}`
router.get(
  "/loyalty/:customerId",
  authenticate, requireRole("customer"),
  getLoyaltyAccount
);
/// user side 
router.post("/loyalty/redeem", authenticate, requireRole("customer"), redeemReward)
// REDEMPTIONS
router.put("/redemptions/:id/use", authenticate, requireRole("admin", "manager"), markRedemptionAsUsed);
router.put("/redemptions/:id/cancel", authenticate, requireRole("admin", "manager"), cancelRedemptionAndRefund);




router.get(
  "/dashboard/members/active",
  authenticate,
  requireRole("admin", "manager"),
  getActiveMembers
);

// `${API_BASE}/api/loyalty/accounts/${loyaltyAccount?.id}/transactions?limit=10`
router.get(
  "/loyalty/accounts/:accountId/transactions",
  authenticate, requireRole("customer", "sales_person", "manager", "admin"),
  getAccountTransactions
);
// admin side 
router.get("/dashboard/stats", authenticate, requireRole("admin", "manager"), getLoyaltyStats);

router.get(
  "/loyalty/redemptions/admin",
  // authenticate, requireRole("customer", "sales_person", "manager", "admin"),
  getRecentRedemptions
);


// GET all tiers  , mobile api given 
router.get("/tiers",
  authenticate,
  requireRole("customer", "sales_person", "manager", "admin"),
  getAllTiers);
router.get("/:customerId/activity",
  authenticate, requireRole("customer", "sales_person", "manager", "admin"),
  getLoyaltyActivity);
router.post("/rewards", authenticate, requireRole("customer", "sales_person", "manager", "admin"), createReward);
router.get("/rewards", authenticate, requireRole("customer", "sales_person", "manager", "admin"), getAllRewards);
// router.post("/", authenticate, isStaff, rewardController.createReward);
router.put("/rewards/:id", authenticate, requireRole("customer", "sales_person", "manager", "admin"), updateReward);
router.delete("/rewards/:id", authenticate, requireRole("customer", "sales_person", "manager", "admin"), deleteReward);
router.patch("/rewards/:id/status", authenticate, requireRole("customer", "sales_person", "manager", "admin"), toggleStatus);
// CREATE new tier
router.post("/tiers", authenticate, requireRole("customer", "sales_person", "manager", "admin"), createTier);
// UPDATE tier
router.put("/tiers/:id", authenticate, requireRole("customer", "sales_person", "manager", "admin"), updateTier);
// DELETE tier
router.delete("/tiers/:id", authenticate, requireRole("customer", "sales_person", "manager", "admin"), deleteTier);
// TOGGLE ACTIVE / INACTIVE
router.patch("/tiers/:id/status", authenticate, requireRole("customer", "sales_person", "manager", "admin"), toggleTierStatus);


router.get(
  "/loyalty/redemptions",
  authenticate,
  requireRole("admin", "manager","customer"),
  getAllRedemptions
);


// Redeem reward: POST /api/loyalty/redeem   { rewardId }
// router.post(
//   "/loyalty/redeem",
//   authenticate, requireRole("customer", "sales_person", "manager", "admin"),
//   redeemReward
// );

// Staff: recent redemptions dashboard
// `${API_BASE}/api/loyalty/redemptions/recent?limit=5`
// router.put(
//   "/api/loyalty/redemptions/:id/use",
//   authenticate,
//   requireRole("admin", "manager"),
//   markRedemptionUsed
// );

// router.put(
//   "/api/loyalty/redemptions/:id/cancel",
//   authenticate,
//   requireRole("admin", "manager"),
//   cancelRedemption
// );
module.exports = router;
