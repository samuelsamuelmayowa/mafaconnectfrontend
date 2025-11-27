const { Product } = require("./products");
const { ProductImage } = require("./productimages");
const { User } = require("./user");
const { ProductLocationStock } = require("./ProductLocationStock");
const { Location } = require("./Location");
const { Order, Notification } = require("./Order");
const OrderItem = require("./OrderItem");
const Invoice = require("./Invoice");

/* ================================
   PRODUCT ↔ LOCATION (via ProductLocationStock)
================================ */
// ORDER → LOCATION
Order.belongsTo(Location, {
  foreignKey: "location_id",
  as: "location",
});
Order.belongsTo(User, {
  foreignKey: "customer_id",
  as: "customer",
});
Invoice.belongsTo(Order, {
  foreignKey: "order_id",
  as: "order",
});

// ✅ Order has one Invoice
Order.hasOne(Invoice, {
  foreignKey: "order_id",
  as: "invoice",
});
Location.hasMany(Order, {
  foreignKey: "location_id",
  as: "orders",
});

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
   PRODUCT → CREATOR
================================ */
Product.belongsTo(User, {
  foreignKey: "created_by",
  as: "creator",
});

/* ================================
   USER → LOCATION
================================ */
User.belongsTo(Location, {
  foreignKey: "location_id",
  as: "location",
});

Location.hasMany(User, {
  foreignKey: "location_id",
  as: "staff",
});

/* ================================
   ORDER → ORDER ITEMS
================================ */
Order.hasMany(OrderItem, {
  foreignKey: "order_id",
  as: "items",
});

OrderItem.belongsTo(Order, {
  foreignKey: "order_id",
  as: "order",
});

/* ================================
   ORDER ITEM → PRODUCT
================================ */
OrderItem.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

Product.hasMany(OrderItem, {
  foreignKey: "product_id",
  as: "orderItems",
});

/* ================================
   ORDER → NOTIFICATIONS
================================ */
Order.hasMany(Notification, {
  foreignKey: "order_id",
  as: "notifications",
});

Notification.belongsTo(Order, {
  foreignKey: "order_id",
  as: "order",
});

module.exports = {
  Product,
  ProductImage,
  Location,
  ProductLocationStock,
  User,
  Order,
  OrderItem,
  Notification,
};

// const { Product } = require("./products");
// const { ProductImage } = require("./productimages");
// const { User } = require("./user");
// const { ProductLocationStock } = require("./ProductLocationStock");
// const { Location } = require("./Location");
// const { Order, Notification } = require("./Order");
// const OrderItem = require("./OrderItem");

// /* ================================
//    PRODUCT ↔ LOCATION (via ProductLocationStock)
// ================================ */

// // Many-to-Many link using ProductLocationStock
// Product.belongsToMany(Location, {
//   through: ProductLocationStock,
//   foreignKey: "product_id",
//   otherKey: "location_id",
//   as: "locations",
// });

// Location.belongsToMany(Product, {
//   through: ProductLocationStock,
//   foreignKey: "location_id",
//   otherKey: "product_id",
//   as: "products",
// });

// // Direct stock relationship (very important for queries)
// Product.hasMany(ProductLocationStock, {
//   foreignKey: "product_id",
//   as: "locationStocks",
// });

// Location.hasMany(ProductLocationStock, {
//   foreignKey: "location_id",
//   as: "stocks",
// });

// ProductLocationStock.belongsTo(Product, {
//   foreignKey: "product_id",
//   as: "product",
// });

// ProductLocationStock.belongsTo(Location, {
//   foreignKey: "location_id",
//   as: "location",
// });


// /* ================================
//    PRODUCT → IMAGES
// ================================ */

// Product.hasMany(ProductImage, {
//   foreignKey: "product_id",
//   as: "images",
// });

// ProductImage.belongsTo(Product, {
//   foreignKey: "product_id",
// });


// /* ================================
//    PRODUCT → CREATOR (USER)
// ================================ */

// Product.belongsTo(User, {
//   foreignKey: "created_by",
//   as: "creator",
// });


// /* ================================
//    USER → LOCATION (STAFF SYSTEM)
// ================================ */

// User.belongsTo(Location, {
//   foreignKey: "location_id",
//   as: "location",
// });

// Location.hasMany(User, {
//   foreignKey: "location_id",
//   as: "staff",
// });
// Order.hasMany(Notification, { foreignKey: "order_id" });
// Notification.belongsTo(Order, { foreignKey: "order_id" });

// Order.hasMany(OrderItem, {
//   foreignKey: "order_id",
//   as: "items"
// });

// // Each OrderItem belongs to an Order
// OrderItem.belongsTo(Order, {
//   foreignKey: "order_id",
//   as: "order"
// });
// Order.hasMany(OrderItem, {
//   foreignKey: "order_id",
//   as: "items",
// });

// OrderItem.belongsTo(Order, {
//   foreignKey: "order_id",
//   as: "order",
// });

// // ✅ IMPORTANT: OrderItem → Product association
// OrderItem.belongsTo(Product, {
//   foreignKey: "product_id",
//   as: "product",
// });

// // (optional) reverse if needed
// Product.hasMany(OrderItem, {
//   foreignKey: "product_id",
//   as: "orderItems",
// });


// module.exports = {
//   Product,
//   ProductImage,
//   Location,
//   ProductLocationStock,
//   User,
// };


















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
