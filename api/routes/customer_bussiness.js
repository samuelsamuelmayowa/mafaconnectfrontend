const express = require("express");
const router = express.Router();
const {
  adminLogin,
  getCurrentUser,
  refreshToken,
  logout,
  getDashboard,
} = require("../controllers/adminController");
const { register, getKYCStatus, getSingleUser, getCustomerOrders } = require("../controllers/userController");
const { login } = require("../controllers/authController");
const { authenticate, requireRole } = require("../middlewares/authMiddleware");
const { getCustomerRecentOrders, getCustomerPendingInvoices, getCustomerOrderStats } = require("../controllers/Ordercontroller");
router.post("/register", register);
const rateLimit = require("express-rate-limit");

// const loginLimiter = rateLimit({
//   windowMs: 10 * 60 * 1000, // 10 minutes
//   max: 5, // only 5 attempts allowed
//   message: {
//     success: false,
//     message: "Too many login attempts. Try again later.",
//   },
// });
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ⏳ 1 hour
  max: 5, // 🚫 only 5 login attempts allowed in 1 hour
  message: {
    success: false,
    message: "Too many login attempts. Try again in 1 hour.",
  },
});
// router.get("/kyc/status", authenticate, requireRole("admin", "manager","customer"), getKYCStatus);
// Get single user (manager)

// All customer-related endpoints require login
router.get("/orders/user/:customerId", authenticate,  requireRole("admin", "manager","customer"), getCustomerRecentOrders);
router.get("/invoices/:customerId", authenticate,  requireRole("admin", "manager","customer"),getCustomerPendingInvoices);
router.get("/orders/stats/:customerId", authenticate,  requireRole("admin", "manager","customer"),getCustomerOrderStats);

router.get("/customer/orders", 
  authenticate, requireRole("customer"),  // admin was here before 
   getCustomerOrders);
router.get("/users/:id", authenticate, getSingleUser);


router.post("/login/user", loginLimiter, login);
module.exports = router;


