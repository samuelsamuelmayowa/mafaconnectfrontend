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
} = require("../controllers/adminController");
const { authenticate, requireRole } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multerUpload");
const { Location } = require("../models");

// working api for admin side
router.get('/allusers',authenticate, requireRole( "admin"), showAllUser)
router.get("/auth/me", authenticate, requireRole("customer", "sales_person", "manager", "admin"), getCurrentUser);
router.get('/users/:userId/approval',authenticate, requireRole( "admin"), approveUser)
router.post('/users/:userId/roles',authenticate, requireRole( "admin"),assignRole)
router.post(
  "/products",
  authenticate,
  requireRole("admin", "manager"),
  upload.array("images"),
  createProduct
);
// sarch for product for both admin and everyone 
// Live product search
router.get("/products/search", searchProducts);
// admin and manager  logged-in can view products
router.get(
  "/products",
  authenticate,
  requireRole("admin", "manager","customer","sales_agent"),
  getAllProducts
);
// admin and manager and all   logged-in can view products
router.get(
  "/products/:productid",
  authenticate,
  requireRole("admin", "manager",  "customer", "sale_agents"),
  getSingleProduct
)
router.get(
  "/products/:id",
  authenticate,
  requireRole("admin", "manager"),
  getSingleProductId
)
// ✅ UPDATE PRODUCT
router.put(
  "/products/:id",
  authenticate,
  requireRole("admin", "manager"),
  upload.array("images"), // allow multiple image replacement
  updateProduct
);


// Create new depot
router.post("/locations", 
  authenticate, requireRole("admin","manager"), 
  createLocation);

router.put("/locations/:id",
  authenticate,
  requireRole("admin", "manager"),
  updateLocation
);

// Add stock to depot
router.post("/locations/stock", 
  authenticate, 
  requireRole("admin", "manager"),
   addProductStock);

router.get(
  "/users/managers",
  authenticate,
  requireRole("admin", "manager"),
  getManagers
);
router.get("/locations", authenticate,
  requireRole("admin", "manager"),async (req, res) => {
  try {
    const locations = await Location.findAll({
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    console.error("❌ Get locations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch locations",
    });
  }
});

router.get(
  "/locations/stats",
  authenticate,
  requireRole("admin", "manager"),
  getLocationStats
);
/// location infomation 
router.get("/locations/:locationId/stats",  authenticate,
  requireRole("admin", "manager"), getSingleLocationStats);
// view stock
router.get("/product-locations", authenticate,
  requireRole("admin", "manager"), getProductLocations);


  router.get(
  "/locations/:id/bank-details",
  authenticate,
  requireRole("admin", "manager"),
  getLocationBankDetails
);






router.post("/login", adminLogin);

// router.get("/auth/me", authenticate, requireRole("user"), getCurrentUser);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
// Only admins can access dashboard
router.get("/dashboard", authenticate, requireRole("admin"), getDashboard);
// router.get("/dashboard", getDashboard);

module.exports = router;


// router.post(
//   "/products",
//   authenticate,
//   requireRole("admin", "manager"),   
//   upload.array("images"),        
//   createProduct
// );