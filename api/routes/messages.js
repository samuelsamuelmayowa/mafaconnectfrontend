const express = require("express");
const router = express.Router();
const {
  adminLogin,
  getCurrentUser,
  refreshToken,
  logout,
  getDashboard, showAllUser,
  assignRole,
  approveUser,
  createProduct,
  getAllProducts,
  getSingleProduct,
  searchProducts,
  updateProduct,
  getSingleProductId,
  createLocation,
  addProductStock,
  getManagers,
  getLocationStats,
  getSingleLocationStats,
  getProductLocations,
  updateLocation,
  getLocationBankDetails,
  getSingleLocation,
  createOrder,
  getOrderById,
  getAdminOrders,confirmOrderPayment, updateOrderStatus,
  getCustomerInvoices,
  downloadInvoice,
  confirmPayment
} = require("../controllers/adminController");
const { authenticate, requireRole } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multerUpload");
const { Location } = require("../models");
const { sendMessage, createConversation, getUserConversations, updateConversationStatus, markConversationAsRead, getConversationMessages, getUnreadMessageCount, getSingleConversation } = require("../controllers/lastestMessage");


// CONVERSATIONS
router.post("/conversations", authenticate, createConversation);
router.get("/conversations", authenticate, getUserConversations);
router.get("/conversations/:id", authenticate, getSingleConversation);
router.put("/conversations/:id/status", authenticate, requireRole("admin", "manager"), updateConversationStatus);

// MESSAGES
router.post("/messages", authenticate, requireRole("admin", "manager", "customer"), sendMessage);
router.get("/messages/:conversationId", authenticate, getConversationMessages);
router.put("/messages/read/:conversationId", authenticate, markConversationAsRead);
router.get("/messages/unread", authenticate, getUnreadMessageCount);








module.exports = router;
