const express = require("express");
const router = express.Router();
const { authenticate, requireRole } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multerUpload");
const { Location } = require("../models");
const { createReward, getAllRewards, updateReward, deleteReward, toggleStatus } = require("../controllers/loyality");


router.post("/rewards", authenticate, requireRole("customer", "sales_person", "manager", "admin"),  createReward);
router.get("/rewards", authenticate, requireRole("customer", "sales_person", "manager", "admin"),  getAllRewards);


// router.post("/", authenticate, isStaff, rewardController.createReward);
router.put("/rewards/:id", authenticate, requireRole("customer", "sales_person", "manager", "admin"), updateReward);
router.delete("/rewards/:id", authenticate, requireRole("customer", "sales_person", "manager", "admin"),deleteReward);
router.patch("/rewards/:id/status", authenticate, requireRole("customer", "sales_person", "manager", "admin"), toggleStatus);

module.exports = router;
