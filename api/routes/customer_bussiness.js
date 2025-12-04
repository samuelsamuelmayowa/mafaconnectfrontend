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
router.get("/kyc/status", authenticate, requireRole("admin", "manager","customer"), getKYCStatus);
// Get single user (manager)

// All customer-related endpoints require login
router.get("/orders/user/:customerId", authenticate,  requireRole("admin", "manager","customer"), getCustomerRecentOrders);
router.get("/invoices/:customerId", authenticate,  requireRole("admin", "manager","customer"), getCustomerPendingInvoices);
router.get("/orders/stats/:customerId", authenticate,  requireRole("admin", "manager","customer"),getCustomerOrderStats);

router.get("/customer/orders", 
  authenticate, requireRole("admin", "manager","customer"),
   getCustomerOrders);
router.get("/users/:id", authenticate, getSingleUser);
router.post("/login/user", login);
module.exports = router;


