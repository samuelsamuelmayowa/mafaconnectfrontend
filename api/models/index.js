

const { Product } = require("./products");
const { ProductImage } = require("./productimages");
const { User } = require("./user");
const { ProductLocationStock } = require("./ProductLocationStock");
const { Location } = require("./Location");
const { Order, Notification } = require("./Order");
const OrderItem = require("./OrderItem");
const Invoice = require("./Invoice");
const { Message } = require("./message");
const { Conversation } = require("./Conversation");
const { LoyaltyAccount } = require("./LoyaltyAccount");
const { LoyaltyTransaction } = require("./LoyaltyTransaction");
const { Reward } = require("./Reward");
const { RewardRedemption } = require("./RewardRedemption");
const LoyaltyActivity = require("./LoyaltyActivity");

/* ========================================================================
   MODULE EXPORTS
======================================================================== */
module.exports = {
  Product,
  ProductImage,
  User,
  Location,
  ProductLocationStock,
  Order,
  OrderItem,
  Notification,
  Invoice,
  Conversation,
  Message,
  LoyaltyAccount,
  LoyaltyTransaction,
  Reward,
  LoyaltyActivity,
  RewardRedemption,
}
// RewardRedemption <-> Customer
RewardRedemption.belongsTo(User, {
  foreignKey: "customer_id",
  as: "customer"
});

User.hasMany(RewardRedemption, {
  foreignKey: "customer_id",
  as: "redemptions"
});

// RewardRedemption <-> Reward
RewardRedemption.belongsTo(Reward, {
  foreignKey: "reward_id",
  as: "reward"
});

Reward.hasMany(RewardRedemption, {
  foreignKey: "reward_id",
  as: "redemptions"
});



Order.belongsTo(User, {
  foreignKey: "customer_id",
  as: "customers",
});



Order.hasMany(OrderItem, { foreignKey: "order_id" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });
User.hasMany(LoyaltyActivity, {
  foreignKey: "customer_id",
  as: "activities"
});
Order.hasMany(LoyaltyActivity, { foreignKey: "order_id", as: "order_activities" });


User.hasMany(LoyaltyActivity, {
  foreignKey: "customer_id",
  as: "loyalty_history",
});

LoyaltyActivity.belongsTo(User, {
  foreignKey: "customer_id",
  as: "customer",
});


Order.belongsTo(Location, {
  foreignKey: "location_id",
  as: "locations",
});

Order.hasMany(OrderItem, {
  foreignKey: "order_id",
  as: "order_items",
});

User.hasMany(Order, {
  foreignKey: "customer_id",
  as: "customer_orders",
});

/* ========================================================================
   LOYALTY SYSTEM
===OrderItem.belongsTo(Order, {
  foreignKey: "order_id",
  as: "order",
});
===================================================================== */

// LoyaltyAccount → Transactions
LoyaltyAccount.hasMany(LoyaltyTransaction, {
  foreignKey: "loyalty_account_id",
});
LoyaltyTransaction.belongsTo(LoyaltyAccount, {
  foreignKey: "loyalty_account_id",
});

// LoyaltyAccount → RewardRedemptions
LoyaltyAccount.hasMany(RewardRedemption, {
  foreignKey: "loyalty_account_id",
});
RewardRedemption.belongsTo(LoyaltyAccount, {
  foreignKey: "loyalty_account_id",
});

// Reward → RewardRedemptions
Reward.hasMany(RewardRedemption, { foreignKey: "reward_id" });
RewardRedemption.belongsTo(Reward, { foreignKey: "reward_id" });

// User → LoyaltyAccount
User.hasOne(LoyaltyAccount, { foreignKey: "customer_id" });
LoyaltyAccount.belongsTo(User, { foreignKey: "customer_id" });

// User → RewardRedemptions
User.hasMany(RewardRedemption, { foreignKey: "customer_id" });
RewardRedemption.belongsTo(User, { foreignKey: "customer_id" });

/* ========================================================================
   ORDER SYSTEM
======================================================================== */

// Order → Customer
Order.belongsTo(User, { foreignKey: "customer_id", as: "customer" });

// Order → Sales Agent
Order.belongsTo(User, { foreignKey: "sales_agent_id", as: "sales_agent" });

// User → Orders (customer)
User.hasMany(Order, { foreignKey: "customer_id" });

// User → Orders (sales agent)
User.hasMany(Order, { foreignKey: "sales_agent_id" });

// Order → Location
Order.belongsTo(Location, { foreignKey: "location_id", as: "location" });
Location.hasMany(Order, { foreignKey: "location_id", as: "orders" });

// Order → Invoice
Order.hasOne(Invoice, { foreignKey: "order_id", as: "invoice" });
Invoice.belongsTo(Order, { foreignKey: "order_id", as: "order" });

// Order → OrderItems
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });

// OrderItem → Product
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
Product.hasMany(OrderItem, { foreignKey: "product_id", as: "orderItems" });

/* ========================================================================
   PRODUCT SYSTEM
======================================================================== */

// Product → Images
Product.hasMany(ProductImage, { foreignKey: "product_id", as: "images" });
ProductImage.belongsTo(Product, { foreignKey: "product_id" });

// Product → Creator
Product.belongsTo(User, { foreignKey: "created_by", as: "creator" });
User.hasMany(Product, { foreignKey: "created_by" });

/* ========================================================================
   PRODUCT ↔ LOCATION (STOCK SYSTEM)
======================================================================== */

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
ProductLocationStock.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

Location.hasMany(ProductLocationStock, {
  foreignKey: "location_id",
  as: "stocks",
});
ProductLocationStock.belongsTo(Location, {
  foreignKey: "location_id",
  as: "location",
});

/* ========================================================================
   MESSAGING SYSTEM
======================================================================== */

// Conversation → Messages
Conversation.hasMany(Message, {
  foreignKey: "conversation_id",
  as: "messages",
  onDelete: "CASCADE",
});
Message.belongsTo(Conversation, {
  foreignKey: "conversation_id",
  as: "conversation",
});

// User → Sent Messages
User.hasMany(Message, {
  foreignKey: "sender_id",
  as: "sentMessages",
});
Message.belongsTo(User, {
  foreignKey: "sender_id",
  as: "sender",
});

// User → Received Messages
User.hasMany(Message, {
  foreignKey: "receiver_id",
  as: "receivedMessages",
});
Message.belongsTo(User, {
  foreignKey: "receiver_id",
  as: "receiver",
});

// User → Conversations
User.hasMany(Conversation, {
  foreignKey: "created_by",
  as: "createdConversations",
});
Conversation.belongsTo(User, {
  foreignKey: "created_by",
  as: "creator",
});

// Assigned conversations
User.hasMany(Conversation, {
  foreignKey: "assigned_to",
  as: "assignedConversations",
});
Conversation.belongsTo(User, {
  foreignKey: "assigned_to",
  as: "assignee",
});








// // const { Product } = require("./products");
// // const { ProductImage } = require("./productimages");
// // const { User } = require("./user");
// // const { ProductLocationStock } = require("./ProductLocationStock");
// // const { Location } = require("./Location");
// // const { Order, Notification } = require("./Order");
// // const OrderItem = require("./OrderItem");
// // const Invoice = require("./Invoice");
// // const { Message } = require("./message");
// // const { Conversation } = require("./Conversation");
// // const { LoyaltyAccount } = require("./LoyaltyAccount");
// // const { LoyaltyTransaction } = require("./LoyaltyTransaction");
// // const { Reward } = require("./Reward");
// // const { RewardRedemption } = require("./RewardRedemption");

// // module.exports = {
// //   LoyaltyAccount,
// //   LoyaltyTransaction,
// //   Reward,
// //   RewardRedemption,
// //   Conversation,
// //   Message,
// //   Product,
// //   ProductImage,
// //   Location,
// //   ProductLocationStock,
// //   User,
// //   Order,
// //   OrderItem,
// //   Notification,
// // };

// // /* ============================================================================
// //    LOYALTY SYSTEM RELATIONSHIPS
// // ============================================================================ */

// // // LoyaltyAccount <-> Transactions
// // LoyaltyAccount.hasMany(LoyaltyTransaction, {
// //   foreignKey: "loyalty_account_id",
// // });
// // LoyaltyTransaction.belongsTo(LoyaltyAccount, {
// //   foreignKey: "loyalty_account_id",
// // });

// // // LoyaltyAccount <-> RewardRedemptions
// // LoyaltyAccount.hasMany(RewardRedemption, {
// //   foreignKey: "loyalty_account_id",
// // });
// // RewardRedemption.belongsTo(LoyaltyAccount, {
// //   foreignKey: "loyalty_account_id",
// // });

// // // Reward <-> RewardRedemption
// // Reward.hasMany(RewardRedemption, { foreignKey: "reward_id" });
// // RewardRedemption.belongsTo(Reward, { foreignKey: "reward_id" });

// // // User <-> LoyaltyAccount
// // User.hasOne(LoyaltyAccount, { foreignKey: "customer_id", sourceKey: "id" });
// // LoyaltyAccount.belongsTo(User, { foreignKey: "customer_id", targetKey: "id" });

// // // User <-> RewardRedemption
// // User.hasMany(RewardRedemption, { foreignKey: "customer_id" });
// // RewardRedemption.belongsTo(User, { foreignKey: "customer_id" });



// // /* ============================================================================
// //    ORDER SYSTEM RELATIONSHIPS
// // ============================================================================ */

// // // ORDER belongs to USER (customer)
// // Order.belongsTo(User, { foreignKey: "customer_id", as: "customer" });

// // // ORDER belongs to LOCATION
// // Order.belongsTo(Location, { foreignKey: "location_id", as: "location" });

// // // INVOICE <-> ORDER
// // Invoice.belongsTo(Order, { foreignKey: "order_id", as: "order" });
// // Order.hasOne(Invoice, { foreignKey: "order_id", as: "invoice" });

// // // ORDER <-> ORDER ITEMS (PRIMARY)
// // Order.hasMany(OrderItem, {
// //   foreignKey: "order_id",
// //   as: "items",
// // });
// // OrderItem.belongsTo(Order, {
// //   foreignKey: "order_id",
// //   as: "order",
// // });

// // // ORDER ITEM <-> PRODUCT
// // OrderItem.belongsTo(Product, {
// //   foreignKey: "product_id",
// //   as: "product",
// // });
// // Product.hasMany(OrderItem, {
// //   foreignKey: "product_id",
// //   as: "orderItems",
// // });



// // /* ============================================================================
// //    PRODUCT SYSTEM RELATIONSHIPS
// // ============================================================================ */

// // // Product <-> Images
// // Product.hasMany(ProductImage, {
// //   foreignKey: "product_id",
// //   as: "images",
// // });
// // ProductImage.belongsTo(Product, { foreignKey: "product_id" });

// // // Product <-> Creator (User)
// // Product.belongsTo(User, { foreignKey: "created_by", as: "creator" });



// // /* ============================================================================
// //    PRODUCT ↔ LOCATION (Stock Mapping)
// // ============================================================================ */

// // Product.belongsToMany(Location, {
// //   through: ProductLocationStock,
// //   foreignKey: "product_id",
// //   otherKey: "location_id",
// //   as: "locations",
// // });

// // Location.belongsToMany(Product, {
// //   through: ProductLocationStock,
// //   foreignKey: "location_id",
// //   otherKey: "product_id",
// //   as: "products",
// // });

// // Product.hasMany(ProductLocationStock, {
// //   foreignKey: "product_id",
// //   as: "locationStocks",
// // });
// // ProductLocationStock.belongsTo(Product, {
// //   foreignKey: "product_id",
// //   as: "product",
// // });

// // Location.hasMany(ProductLocationStock, {
// //   foreignKey: "location_id",
// //   as: "stocks",
// // });
// // ProductLocationStock.belongsTo(Location, {
// //   foreignKey: "location_id",
// //   as: "location",
// // });



// // /* ============================================================================
// //    MESSAGING SYSTEM
// // ============================================================================ */

// // Conversation.hasMany(Message, {
// //   foreignKey: "conversation_id",
// //   as: "messages",
// //   onDelete: "CASCADE",
// // });
// // Message.belongsTo(Conversation, {
// //   foreignKey: "conversation_id",
// //   as: "conversation",
// // });

// // // User <-> Messages (Sender)
// // User.hasMany(Message, {
// //   foreignKey: "sender_id",
// //   as: "sentMessages",
// // });
// // Message.belongsTo(User, {
// //   foreignKey: "sender_id",
// //   as: "sender",
// // });

// // // User <-> Messages (Receiver)
// // User.hasMany(Message, {
// //   foreignKey: "receiver_id",
// //   as: "receivedMessages",
// // });
// // Message.belongsTo(User, {
// //   foreignKey: "receiver_id",
// //   as: "receiver",
// // });

// // // User <-> Conversations
// // User.hasMany(Conversation, {
// //   foreignKey: "created_by",
// //   as: "createdConversations",
// // });
// // Conversation.belongsTo(User, {
// //   foreignKey: "created_by",
// //   as: "creator",
// // });

// // User.hasMany(Conversation, {
// //   foreignKey: "assigned_to",
// //   as: "assignedConversations",
// // });
// // Conversation.belongsTo(User, {
// //   foreignKey: "assigned_to",
// //   as: "assignee",
// // });


// // Product.belongsTo(User, {
// //   foreignKey: "created_by",
// //   onUpdate: "CASCADE",
// //   onDelete: "NO ACTION",
// // });

// // // A User can create many products
// // User.hasMany(Product, {
// //   foreignKey: "created_by",
// // });




































// // // end ehre

// // // const { Product } = require("./products");
// // // const { ProductImage } = require("./productimages");
// // // const { User } = require("./user");
// // // const { ProductLocationStock } = require("./ProductLocationStock");
// // // const { Location } = require("./Location");
// // // const { Order, Notification } = require("./Order");
// // // const OrderItem = require("./OrderItem");
// // // const Invoice = require("./Invoice");
// // // const { Message } = require("./message");
// // // const { Conversation } = require("./Conversation");
// // // const { LoyaltyAccount } = require("./LoyaltyAccount");
// // // const { LoyaltyTransaction } = require("./LoyaltyTransaction");
// // // const { Reward } = require("./Reward");
// // // const { RewardRedemption } = require("./RewardRedemption");


// // // // Basic relations
// // // LoyaltyAccount.hasMany(LoyaltyTransaction, {
// // //   foreignKey: "loyalty_account_id",
// // // });
// // // LoyaltyTransaction.belongsTo(LoyaltyAccount, {
// // //   foreignKey: "loyalty_account_id",
// // // });

// // // LoyaltyAccount.hasMany(RewardRedemption, {
// // //   foreignKey: "loyalty_account_id",
// // // });
// // // RewardRedemption.belongsTo(LoyaltyAccount, {
// // //   foreignKey: "loyalty_account_id",
// // // });

// // // Reward.hasMany(RewardRedemption, { foreignKey: "reward_id" });
// // // RewardRedemption.belongsTo(Reward, { foreignKey: "reward_id" });

// // // // If you have a Customer model, also relate it:

// // // User.hasOne(LoyaltyAccount, { foreignKey: "customer_id", sourceKey: "id" });
// // // LoyaltyAccount.belongsTo(User, { foreignKey: "customer_id", targetKey: "id" });

// // // User.hasMany(RewardRedemption, {
// // //   foreignKey: "customer_id",
// // //   sourceKey: "id",
// // // });
// // // RewardRedemption.belongsTo(User, {
// // //   foreignKey: "customer_id",
// // //   targetKey: "id",
// // // });
// // // /* ================================
// // //    PRODUCT ↔ LOCATION (via ProductLocationStock)
// // // ================================ */
// // // // ORDER → LOCATION
// // // Order.belongsTo(Location, {
// // //   foreignKey: "location_id",
// // //   as: "location",
// // // });
// // // Order.belongsTo(User, {
// // //   foreignKey: "customer_id",
// // //   as: "customer",
// // // });
// // // Invoice.belongsTo(Order, {
// // //   foreignKey: "order_id",
// // //   as: "order",
// // // });

// // // // ✅ Order has one Invoice
// // // Order.hasOne(Invoice, {
// // //   foreignKey: "order_id",
// // //   as: "invoice",
// // // });


// // // // Order -> OrderItem
// // // Order.hasMany(OrderItem, {
// // //   as: "items",
// // //   foreignKey: "order_id",
// // // });

// // // OrderItem.belongsTo(Order, {
// // //   as: "order",
// // //   foreignKey: "order_id",
// // // });

// // // // Product -> OrderItem
// // // Product.hasMany(OrderItem, {
// // //   as: "order_items",
// // //   foreignKey: "product_id",
// // // });

// // // OrderItem.belongsTo(Product, {
// // //   as: "product",
// // //   foreignKey: "product_id",
// // // });
// // // Location.hasMany(Order, {
// // //   foreignKey: "location_id",
// // //   as: "orders",
// // // });

// // // Product.belongsToMany(Location, {
// // //   through: ProductLocationStock,
// // //   foreignKey: "product_id",
// // //   otherKey: "location_id",
// // //   as: "locations",
// // // });

// // // Location.belongsToMany(Product, {
// // //   through: ProductLocationStock,
// // //   foreignKey: "location_id",
// // //   otherKey: "product_id",
// // //   as: "products",
// // // });

// // // Product.hasMany(ProductLocationStock, {
// // //   foreignKey: "product_id",
// // //   as: "locationStocks",
// // // });

// // // Location.hasMany(ProductLocationStock, {
// // //   foreignKey: "location_id",
// // //   as: "stocks",
// // // });

// // // ProductLocationStock.belongsTo(Product, {
// // //   foreignKey: "product_id",
// // //   as: "product",
// // // });

// // // ProductLocationStock.belongsTo(Location, {
// // //   foreignKey: "location_id",
// // //   as: "location",
// // // });

// // // /* ================================
// // //    PRODUCT → IMAGES
// // // ================================ */
// // // Product.hasMany(ProductImage, {
// // //   foreignKey: "product_id",
// // //   as: "images",
// // // });

// // // ProductImage.belongsTo(Product, {
// // //   foreignKey: "product_id",
// // // });

// // // /* ================================
// // //    PRODUCT → CREATOR
// // // ================================ */
// // // Product.belongsTo(User, {
// // //   foreignKey: "created_by",
// // //   as: "creator",
// // // });

// // // /* ================================
// // //    USER → LOCATION
// // // ================================ */
// // // User.belongsTo(Location, {
// // //   foreignKey: "location_id",
// // //   as: "location",
// // // });

// // // Location.hasMany(User, {
// // //   foreignKey: "location_id",
// // //   as: "staff",
// // // });

// // // /* ================================
// // //    ORDER → ORDER ITEMS
// // // ================================ */
// // // Order.hasMany(OrderItem, {
// // //   foreignKey: "order_id",
// // //   as: "items",
// // // });

// // // OrderItem.belongsTo(Order, {
// // //   foreignKey: "order_id",
// // //   as: "order",
// // // });

// // // /* ================================
// // //    ORDER ITEM → PRODUCT
// // // ================================ */
// // // OrderItem.belongsTo(Product, {
// // //   foreignKey: "product_id",
// // //   as: "product",
// // // });

// // // Product.hasMany(OrderItem, {
// // //   foreignKey: "product_id",
// // //   as: "orderItems",
// // // });

// // // /* ================================
// // //    ORDER → NOTIFICATIONS
// // // ================================ */
// // // Order.hasMany(Notification, {
// // //   foreignKey: "order_id",
// // //   as: "notifications",
// // // });

// // // Notification.belongsTo(Order, {
// // //   foreignKey: "order_id",
// // //   as: "order",
// // // });



// // // Conversation.hasMany(Message, {
// // //   foreignKey: "conversation_id",
// // //   as: "messages",
// // //   onDelete: "CASCADE",
// // // });

// // // // A Message belongs to a Conversation
// // // Message.belongsTo(Conversation, {
// // //   foreignKey: "conversation_id",
// // //   as: "conversation",
// // // });

// // // /* ==============================
// // //    USER ↔ MESSAGE
// // // ================================ */

// // // // Sender relationship
// // // User.hasMany(Message, {
// // //   foreignKey: "sender_id",
// // //   as: "sentMessages"
// // // });

// // // Message.belongsTo(User, {
// // //   foreignKey: "sender_id",
// // //   as: "sender"
// // // });

// // // // Receiver relationship
// // // User.hasMany(Message, {
// // //   foreignKey: "receiver_id",
// // //   as: "receivedMessages"
// // // });

// // // Message.belongsTo(User, {
// // //   foreignKey: "receiver_id",
// // //   as: "receiver"
// // // });

// // // /* ==============================
// // //    USER ↔ CONVERSATION
// // // ================================ */

// // // // User creates conversations
// // // User.hasMany(Conversation, {
// // //   foreignKey: "created_by",
// // //   as: "createdConversations"
// // // });

// // // Conversation.belongsTo(User, {
// // //   foreignKey: "created_by",
// // //   as: "creator"
// // // });

// // // // Staff assigned to conversation
// // // User.hasMany(Conversation, {
// // //   foreignKey: "assigned_to",
// // //   as: "assignedConversations"
// // // });

// // // Conversation.belongsTo(User, {
// // //   foreignKey: "assigned_to",
// // //   as: "assignee"
// // // });
// // // module.exports = {
// // //   LoyaltyAccount,
// // //   LoyaltyTransaction,
// // //   Reward,
// // //   RewardRedemption,
// // //   Conversation,
// // //   Message,
// // //   Product,
// // //   ProductImage,
// // //   Location,
// // //   ProductLocationStock,
// // //   User,
// // //   Order,
// // //   OrderItem,
// // //   Notification,
// // // };

// // // // const { Product } = require("./products");
// // // // const { ProductImage } = require("./productimages");
// // // // const { User } = require("./user");
// // // // const { ProductLocationStock } = require("./ProductLocationStock");
// // // // const { Location } = require("./Location");
// // // // const { Order, Notification } = require("./Order");
// // // // const OrderItem = require("./OrderItem");

// // // // /* ================================
// // // //    PRODUCT ↔ LOCATION (via ProductLocationStock)
// // // // ================================ */

// // // // // Many-to-Many link using ProductLocationStock
// // // // Product.belongsToMany(Location, {
// // // //   through: ProductLocationStock,
// // // //   foreignKey: "product_id",
// // // //   otherKey: "location_id",
// // // //   as: "locations",
// // // // });

// // // // Location.belongsToMany(Product, {
// // // //   through: ProductLocationStock,
// // // //   foreignKey: "location_id",
// // // //   otherKey: "product_id",
// // // //   as: "products",
// // // // });

// // // // // Direct stock relationship (very important for queries)
// // // // Product.hasMany(ProductLocationStock, {
// // // //   foreignKey: "product_id",
// // // //   as: "locationStocks",
// // // // });

// // // // Location.hasMany(ProductLocationStock, {
// // // //   foreignKey: "location_id",
// // // //   as: "stocks",
// // // // });

// // // // ProductLocationStock.belongsTo(Product, {
// // // //   foreignKey: "product_id",
// // // //   as: "product",
// // // // });

// // // // ProductLocationStock.belongsTo(Location, {
// // // //   foreignKey: "location_id",
// // // //   as: "location",
// // // // });


// // // // /* ================================
// // // //    PRODUCT → IMAGES
// // // // ================================ */

// // // // Product.hasMany(ProductImage, {
// // // //   foreignKey: "product_id",
// // // //   as: "images",
// // // // });

// // // // ProductImage.belongsTo(Product, {
// // // //   foreignKey: "product_id",
// // // // });


// // // // /* ================================
// // // //    PRODUCT → CREATOR (USER)
// // // // ================================ */

// // // // Product.belongsTo(User, {
// // // //   foreignKey: "created_by",
// // // //   as: "creator",
// // // // });


// // // // /* ================================
// // // //    USER → LOCATION (STAFF SYSTEM)
// // // // ================================ */

// // // // User.belongsTo(Location, {
// // // //   foreignKey: "location_id",
// // // //   as: "location",
// // // // });

// // // // Location.hasMany(User, {
// // // //   foreignKey: "location_id",
// // // //   as: "staff",
// // // // });
// // // // Order.hasMany(Notification, { foreignKey: "order_id" });
// // // // Notification.belongsTo(Order, { foreignKey: "order_id" });

// // // // Order.hasMany(OrderItem, {
// // // //   foreignKey: "order_id",
// // // //   as: "items"
// // // // });

// // // // // Each OrderItem belongs to an Order
// // // // OrderItem.belongsTo(Order, {
// // // //   foreignKey: "order_id",
// // // //   as: "order"
// // // // });
// // // // Order.hasMany(OrderItem, {
// // // //   foreignKey: "order_id",
// // // //   as: "items",
// // // // });

// // // // OrderItem.belongsTo(Order, {
// // // //   foreignKey: "order_id",
// // // //   as: "order",
// // // // });

// // // // // ✅ IMPORTANT: OrderItem → Product association
// // // // OrderItem.belongsTo(Product, {
// // // //   foreignKey: "product_id",
// // // //   as: "product",
// // // // });

// // // // // (optional) reverse if needed
// // // // Product.hasMany(OrderItem, {
// // // //   foreignKey: "product_id",
// // // //   as: "orderItems",
// // // // });


// // // // module.exports = {
// // // //   Product,
// // // //   ProductImage,
// // // //   Location,
// // // //   ProductLocationStock,
// // // //   User,
// // // // };


















// // // // const { Product } = require("./products");
// // // // const { ProductImage } = require("./productimages");
// // // // const { User } = require("./user");
// // // // const { ProductLocationStock } = require("./ProductLocationStock");
// // // // const { Location } = require("./Location");
// // // // const { LocationProductStock } = require("./LocationProductStock");

// // // // // Relations
// // // // Location.belongsToMany(Product, {
// // // //   through: LocationProductStock,
// // // //   foreignKey: "location_id",
// // // //   as: "products"
// // // // });
// // // // Product.belongsToMany(Location, {
// // // //   through: LocationProductStock,
// // // //   foreignKey: "product_id",
// // // //   as: "locations"
// // // // })

// // // // // Product → Images
// // // // Product.hasMany(ProductImage, { foreignKey: "product_id", as: "images" });
// // // // ProductImage.belongsTo(Product, { foreignKey: "product_id" });

// // // // // Product → Creator
// // // // Product.belongsTo(User, { foreignKey: "created_by", as: "creator" });
// // // // // User → Location
// // // // User.belongsTo(Location, { foreignKey: "location_id", as: "location" });
// // // // Location.hasMany(User, { foreignKey: "location_id", as: "staff" });

// // // // // Product → Location → Stock
// // // // Product.hasMany(ProductLocationStock, { foreignKey: "product_id", as: "locationStocks" });
// // // // Location.hasMany(ProductLocationStock, { foreignKey: "location_id", as: "stocks" });

// // // // ProductLocationStock.belongsTo(Product, { foreignKey: "product_id", as: "product" });
// // // // ProductLocationStock.belongsTo(Location, { foreignKey: "location_id", as: "location" });
// // // // module.exports = {
// // // //   Product,
// // // //   ProductImage,
// // // //   Location,
// // // //   ProductLocationStock,
// // // //   User,
// // // // };
