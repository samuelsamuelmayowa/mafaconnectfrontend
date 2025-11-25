const { Product } = require("./products");
const { ProductImage } = require("./productimages");
const { User } = require("./user");
const { ProductLocationStock } = require("./ProductLocationStock");
const { Location } = require("./Location");

/* ================================
   PRODUCT ↔ LOCATION (via ProductLocationStock)
================================ */

// Many-to-Many link using ProductLocationStock
Product.belongsToMany(Location, {
  through: ProductLocationStock,
  foreignKey: "product_id",
  otherKey: "location_id",
  as: "locations",
});

Location.belongsToMany(Product, {
  through: ProductLocationStock,
  foreignKey: "location_id",
  otherKey: "product_id",
  as: "products",
});

// Direct stock relationship (very important for queries)
Product.hasMany(ProductLocationStock, {
  foreignKey: "product_id",
  as: "locationStocks",
});

Location.hasMany(ProductLocationStock, {
  foreignKey: "location_id",
  as: "stocks",
});

ProductLocationStock.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

ProductLocationStock.belongsTo(Location, {
  foreignKey: "location_id",
  as: "location",
});


/* ================================
   PRODUCT → IMAGES
================================ */

Product.hasMany(ProductImage, {
  foreignKey: "product_id",
  as: "images",
});

ProductImage.belongsTo(Product, {
  foreignKey: "product_id",
});


/* ================================
   PRODUCT → CREATOR (USER)
================================ */

Product.belongsTo(User, {
  foreignKey: "created_by",
  as: "creator",
});


/* ================================
   USER → LOCATION (STAFF SYSTEM)
================================ */

User.belongsTo(Location, {
  foreignKey: "location_id",
  as: "location",
});

Location.hasMany(User, {
  foreignKey: "location_id",
  as: "staff",
});


module.exports = {
  Product,
  ProductImage,
  Location,
  ProductLocationStock,
  User,
};


// const { Product } = require("./products");
// const { ProductImage } = require("./productimages");
// const { User } = require("./user");
// const { ProductLocationStock } = require("./ProductLocationStock");
// const { Location } = require("./Location");
// const { LocationProductStock } = require("./LocationProductStock");

// // Relations
// Location.belongsToMany(Product, {
//   through: LocationProductStock,
//   foreignKey: "location_id",
//   as: "products"
// });
// Product.belongsToMany(Location, {
//   through: LocationProductStock,
//   foreignKey: "product_id",
//   as: "locations"
// })

// // Product → Images
// Product.hasMany(ProductImage, { foreignKey: "product_id", as: "images" });
// ProductImage.belongsTo(Product, { foreignKey: "product_id" });

// // Product → Creator
// Product.belongsTo(User, { foreignKey: "created_by", as: "creator" });
// // User → Location
// User.belongsTo(Location, { foreignKey: "location_id", as: "location" });
// Location.hasMany(User, { foreignKey: "location_id", as: "staff" });

// // Product → Location → Stock
// Product.hasMany(ProductLocationStock, { foreignKey: "product_id", as: "locationStocks" });
// Location.hasMany(ProductLocationStock, { foreignKey: "location_id", as: "stocks" });

// ProductLocationStock.belongsTo(Product, { foreignKey: "product_id", as: "product" });
// ProductLocationStock.belongsTo(Location, { foreignKey: "location_id", as: "location" });
// module.exports = {
//   Product,
//   ProductImage,
//   Location,
//   ProductLocationStock,
//   User,
// };
