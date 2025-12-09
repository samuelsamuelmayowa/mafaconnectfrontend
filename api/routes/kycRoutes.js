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
const KYCController = require("../controllers/KYCController");
const upload = require("../middlewares/multerUpload");
// const { uploader } = require("../cloudinary");
// const upload = require("../middlewares/cloundary");
router.post("/register", register);

// router.get("/kyc/status", authenticate, requireRole("admin", "manager","customer"), getKYCStatus);


// // USER ROUTES
router.get("/kyc/status", authenticate,KYCController.getStatus);
router.post(
  "/kyc/submit-individual",
  authenticate,
  upload.single("photo"), // 👈 Cloudinary
  KYCController.submitIndividual
);

// CORPORATE KYC
router.post(
  "/kyc/submit-corporate",
  authenticate,
  upload.any(), // 👈 Accepts multiple files (CAC + Directors)
  KYCController.submitCorporate
);

// router.post("/api/kyc/submit-individual", authenticate, KYCController.submitIndividual);
// router.post("/api/kyc/submit-corporate", authenticate, KYCController.submitCorporate);
// router.post("/api/kyc/upload", authenticate, KYCController.uploadDocument);

// // ADMIN ROUTES
router.get("/kyc/submissions",
    //  authenticate, requireRole("admin", "manager"),
      KYCController.getAllSubmissions);
router.post("/kyc/approve", authenticate, requireRole("admin", "manager"), KYCController.approveKYC);
router.post("/kyc/reject", authenticate, requireRole("admin", "manager"), KYCController.rejectKYC);


module.exports = router;