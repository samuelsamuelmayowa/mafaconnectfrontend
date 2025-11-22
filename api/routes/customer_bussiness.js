const express = require("express");
const router = express.Router();
const {
  adminLogin,
  getCurrentUser,
  refreshToken,
  logout,
  getDashboard,
} = require("../controllers/adminController");
const { register, getKYCStatus } = require("../controllers/userController");
const { login } = require("../controllers/authController");
const { authenticate, requireRole } = require("../middlewares/authMiddleware");
router.post("/register", register);
router.get("/kyc/status", authenticate, requireRole("admin", "manager","customer"), getKYCStatus);
router.post("/login/user", login);
module.exports = router;


