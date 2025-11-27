const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User } = require("../models/user");
require("dotenv").config();
const cloudinary = require("../cloudinary");
const { Product, ProductImage, Location, ProductLocationStock } = require("../models");
const { sequelize } = require("../db");
const sendOrderEmail = require("../utils/sendOrderEmail");
const OrderItem = require("../models/OrderItem");
// const Order = require("../models/Order");
const { Order, Notification } = require("../models/Order");
// const { } = require("../models/Order"); // if you need it too
const { LocationProductStock } = require("../models/LocationProductStock");
const crypto = require("crypto");
// exports.createOrder = async (req, res) => {
//   const t = await sequelize.transaction();

//   try {
//     const {
//       user_id,
//       items,
//       pickup_location_id,
//       delivery_type,
//       payment_method,
//       total_amount,
//       contact_email,
//     } = req.body;

//     if (!items || items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Cart is empty",
//       });
//     }

//     // ✅ Generate Order Number
//     const orderNumber = `MF-${Date.now()}`;

//     // ✅ Create Order First
//     const order = await Order.create({
//       order_number: orderNumber,
//       user_id,
//       pickup_location_id,
//       delivery_type,
//       payment_method,
//       total_amount,
//       payment_status: "pending",
//       order_status: "reserved",
//     }, { transaction: t });

//     // ✅ STOCK VALIDATION LOOP
//     for (const item of items) {
//       const { product_id, quantity } = item;

//       // Check location stock
//       const locationStock = await LocationProductStock.findOne({
//         where: {
//           product_id,
//           location_id: pickup_location_id,
//         },
//         transaction: t,
//       });

//       if (!locationStock) {
//         throw new Error(`Product not available at this location`);
//       }

//       if (locationStock.stock_qty < quantity) {
//         throw new Error(`Not enough stock for product ID ${product_id}`);
//       }

//       // ✅ Deduct location stock
//       locationStock.stock_qty -= quantity;
//       await locationStock.save({ transaction: t });

//       // ✅ Deduct global stock
//       const product = await Product.findByPk(product_id, { transaction: t });

//       if (product.stock_quantity < quantity) {
//         throw new Error(`Global stock too low for product`);
//       }

//       product.stock_quantity -= quantity;
//       await product.save({ transaction: t });
//     }

//     await t.commit();

//     // ✅ Send Email
//     if (contact_email) {
//       sendOrderEmail(contact_email, order);
//     }

//     return res.status(201).json({
//       success: true,
//       message: "Order successfully created",
//       order_id: order.id,
//       order_number: order.order_number,
//     });

//   } catch (error) {
//     await t.rollback();

//     console.error("❌ Order error:", error.message);

//     return res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

// exports.createOrder = async (req, res) => {
//   const { 
//     customer_id,
//     sales_agent_id,
//     location_id,
//     items,
//     payment_method,
//     total_amount 
//   } = req.body;

//   const t = await sequelize.transaction();

//   try {

//     // Generate order number
//     const orderNumber = `ORD-${Date.now()}`;

//     // 1️⃣ Check stock
//     for (let item of items) {
//       const locationStock = await LocationProductStock.findOne({
//         where: {
//           product_id: item.product_id,
//           location_id: location_id,
//         },
//         transaction: t
//       });

//       if (!locationStock || locationStock.quantity < item.quantity) {
//         throw new Error(
//           `Insufficient stock for product ID ${item.product_id} at this location`
//         );
//       }
//     }

//     // 2️⃣ Create order
//     const order = await Order.create({
//       order_number: orderNumber,
//       customer_id,
//       sales_agent_id: sales_agent_id || null,
//       location_id,
//       total_amount,
//       payment_method,
//       reservation_expires_at: getExpiryTime(payment_method),
//     }, { transaction: t });

//     // 3️⃣ Create order items + Deduct stock
//     for (let item of items) {
//       const locationStock = await LocationProductStock.findOne({
//         where: { product_id: item.product_id, location_id },
//         transaction: t
//       });

//       await OrderItem.create({
//         order_id: order.id,
//         product_id: item.product_id,
//         quantity: item.quantity,
//         unit_price: item.price,
//         total_price: item.quantity * item.price,
//       }, { transaction: t });

//       // Deduct stock
//       locationStock.quantity -= item.quantity;
//       await locationStock.save({ transaction: t });
//     }

//     await t.commit();

//     res.json({
//       success: true,
//       id: order.id,
//       order_number: orderNumber,
//       message: "Order created successfully"
//     });

//   } catch (error) {
//     await t.rollback();
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

function calculateExpiry(payment_method) {
  const now = new Date();

  if (payment_method === "pay_on_pickup") {
    now.setHours(now.getHours() + 24);
  }
  else if (payment_method === "cash_on_delivery") {
    now.setHours(now.getHours() + 48);
  }
  else if (payment_method === "bank_transfer") {
    now.setHours(now.getHours() + 72);
  }

  return now;
}


// exports.createOrder = async (req, res) => {
//   const {
//     customer_id,
//     sales_agent_id,
//     location_id,
//     items,
//     payment_method,
//     total_amount
//   } = req.body;

//   const t = await sequelize.transaction();

//   try {
//     const orderNumber = `ORD-${Date.now()}`;

//     // 🔍 STEP 1: STOCK VALIDATION
//     for (let item of items) {

//       const locationStock = await LocationProductStock.findOne({
//         where: {
//           location_id,
//           product_id: item.product_id,
//         },
//         transaction: t,
//         lock: t.LOCK.UPDATE
//       });

//       const product = await Product.findOne({
//         where: { id: item.product_id },
//         transaction: t,
//         lock: t.LOCK.UPDATE
//       });

//       if (!locationStock) {
//         throw new Error(`Product not available in this location`);
//       }

//       if (locationStock.stock_qty < item.quantity) {
//         throw new Error(
//           `Not enough stock for ${item.product_name} at selected location`
//         );
//       }

//       if (product.stock_qty < item.quantity) {
//         throw new Error(
//           `Global stock for ${item.product_name} is insufficient`
//         );
//       }
//     }

//     // 📦 STEP 2: CREATE ORDER
//     const order = await Order.create({
//       order_number: orderNumber,
//       customer_id,
//       sales_agent_id: sales_agent_id || null,
//       location_id,
//       payment_method,
//       total_amount,
//       order_status: "pending",
//       payment_status: "pending",
//       reservation_expires_at: calculateExpiry(payment_method),
//     }, { transaction: t });

//     // 📦 STEP 3: CREATE ORDER ITEMS + UPDATE STOCK
//     for (let item of items) {

//       const locationStock = await LocationProductStock.findOne({
//         where: {
//           location_id,
//           product_id: item.product_id
//         },
//         transaction: t
//       });

//       const product = await Product.findOne({
//         where: { id: item.product_id },
//         transaction: t
//       });

//       // Deduct location stock
//       locationStock.stock_qty -= item.quantity;
//       await locationStock.save({ transaction: t });

//       // Deduct global stock
//       product.stock_qty -= item.quantity;
//       await product.save({ transaction: t });

//       // Save order item
//       await OrderItem.create({
//         order_id: order.id,
//         product_id: item.product_id,
//         quantity: item.quantity,
//         unit_price: item.unit_price,
//         total_price: item.quantity * item.unit_price,
//       }, { transaction: t });
//     }

//     await t.commit();

//     res.status(200).json({
//       success: true,
//       order_id: order.id,
//       order_number: orderNumber,
//       message: "Order placed successfully"
//     });

//   } catch (error) {
//     await t.rollback();

//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      customer_id,
      location_id,
      delivery_type,
      items,
      total_amount,
      shipping_fee,
      payment_method,
    } = req.body;

    // 🔴 BASIC VALIDATIONS
    if (!customer_id) {
      return res.status(400).json({
        success: false,
        message: "customer_id is required",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty or items missing",
      });
    }

    // Only require location if pickup
    if (delivery_type === "pickup" && !location_id) {
      return res.status(400).json({
        success: false,
        message: "Pickup location is required",
      });
    }

    // 🔎 CHECK ITEMS STRUCTURE
    for (let item of items) {
      if (!item.product_id) {
        return res.status(400).json({
          success: false,
          message: "product_id missing from item",
        });
      }

      if (!item.quantity) {
        return res.status(400).json({
          success: false,
          message: "quantity missing for product",
        });
      }
    }

    // ✅ Generate order number
    const order_number =
      "ORD-" + crypto.randomBytes(4).toString("hex").toUpperCase();

    // ✅ Reservation expiry logic
    const reservationExpires = new Date();

    if (payment_method === "bank_transfer") {
      reservationExpires.setHours(reservationExpires.getHours() + 72);
    } else if (payment_method === "pay_on_pickup") {
      reservationExpires.setHours(reservationExpires.getHours() + 24);
    } else {
      reservationExpires.setHours(reservationExpires.getHours() + 48);
    }

    // ✅ IF PICKUP: Check stock availability
    if (delivery_type === "pickup") {
      for (let item of items) {
        const stock = await ProductLocationStock.findOne({
          where: {
            location_id,
            product_id: item.product_id,
          },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!stock) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: `Product ${item.product_id} not available at this location`,
          });
        }

        if (stock.stock_qty < item.quantity) {
          await t.rollback();
          return res.status(400).json({
            success: false,
            message: `Not enough stock for product ${item.product_id}. Available: ${stock.stock_qty}`,
          });
        }
      }
    }

    // ✅ CREATE ORDER
    const order = await Order.create(
      {
        order_number,
        customer_id,
        location_id: delivery_type === "pickup" ? location_id : null,
        payment_method,
        total_amount,
        shipping_fee,
        reservation_expires_at: reservationExpires,
        payment_status: "pending",
        order_status: "pending",
      },
      { transaction: t }
    );
    await Notification.create({
      user_id: customer_id,
      title: "Order Placed ✅",
      message: `Your order ${order_number} has been placed successfully.`,
      order_id: order.id,
    }, { transaction: t });


    // ✅ CREATE ORDER ITEMS + DEDUCT STOCK
    for (let item of items) {
      if (delivery_type === "pickup") {
        await ProductLocationStock.decrement(   // i chnage this part
          { stock_qty: item.quantity },
          {
            where: {
              location_id,
              product_id: item.product_id,
            },
            transaction: t,
          }
        );
      }

      await OrderItem.create(
        {
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
        },
        { transaction: t }
      );
    }

    await t.commit();

    return res.json({
      success: true,
      message: "Order created successfully",
      order_id: order.id,
      order_number,
      reservation_expires_at: reservationExpires,
    });

  } catch (err) {
    await t.rollback();

    console.error("Order creation error:", err);

    res.status(500).json({
      success: false,
      message: "Order processing failed",
    });
  }
};


exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // const order = await Order.findOne({
    //   where: { id },
    //   include: [OrderItem], // optional
    // });
    const order = await Order.findOne({
  where: { order_number: req.params.order_number},
  include: [
    {
      model: OrderItem,
      as: "items"
    }
  ]
});


    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });

  } catch (err) {
    console.error("Get order error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
    });
  }
};


const generateAccessToken = (user) => {
  if (!process.env.JWT_ACCESS_SECRET) throw new Error("Missing JWT_ACCESS_SECRET");
  return jwt.sign(
    { id: user.id, role: user.role, account_number: user.account_number },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "9d" }
  );
};

const generateRefreshToken = (user) => {
  if (!process.env.JWT_REFRESH_SECRET) throw new Error("Missing JWT_REFRESH_SECRET");
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

exports.showAllUser = async (req, res) => {
  try {
    const users = await User.findAll();
    // console.log(users)
    return res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      data: users
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message
    });
  }
};

// ✅ Admin approves user
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.kyc_status === "approved") {
      return res.status(400).json({ message: "User already approved" });
    }

    user.kyc_status = "approved";
    user.account_number = generateAccountNumber();
    await user.save();

    res.json({
      message: "✅ User approved successfully",
      account_number: user.account_number,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        kyc_status: user.kyc_status,
      },
    });
  } catch (err) {
    console.error("Approve error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.assignRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ["admin", "manager", "sales_agent", "customer"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update role
    user.role = role;
    await user.save();

    return res.json({
      success: true,
      message: "Role updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Assign role error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error assigning role",
    });
  }
};


exports.createProduct = async (req, res) => {
  try {
    const userId = req.user.id;


    const product = await Product.create({
      name: req.body.name,
      sku: req.body.sku,
      description: req.body.description || null,
      cost_price: parseFloat(req.body.cost_price),
      sale_price: parseFloat(req.body.sale_price),
      stock_qty: parseInt(req.body.stock_qty),
      reorder_level: parseInt(req.body.reorder_level),
      active: true,
      created_by: userId,
    });

    // 2️⃣ Upload images to Cloudinary
    let uploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "mafaconnect/products",
        });

        uploadedImages.push({
          product_id: product.id,
          image_url: uploadResult.secure_url,
          cloudinary_public_id: uploadResult.public_id,
        });
      }

      await ProductImage.bulkCreate(uploadedImages);
    }

    const productWithImages = await Product.findByPk(product.id, {
      include: [{ model: ProductImage, as: "images" }],
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: productWithImages,
    });

  } catch (err) {
    console.error("Create product error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: ProductImage,
          as: "images",
          attributes: ["id", "image_url", "cloudinary_public_id"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });

  } catch (err) {
    console.error("❌ Fetch products error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching products",
    });
  }
};

exports.getSingleProduct = async (req, res) => {
  try {
    const { productid } = req.params;

    const product = await Product.findOne({
      where: { productid },
      include: [
        {
          model: ProductImage,
          as: "images",
          attributes: ["id", "image_url", "cloudinary_public_id"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });

    // If product not found
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });

  } catch (err) {
    console.error("❌ Fetch single product error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error fetching product",
    });
  }
};

exports.getSingleProductId = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      where: { id },
      include: [
        {
          model: ProductImage,
          as: "images",
          attributes: ["id", "image_url", "cloudinary_public_id"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });

    // If product not found
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });

  } catch (err) {
    console.error("❌ Fetch single product error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error fetching product",
    });
  }
};

// LIVE SEARCH PRODUCTS
exports.searchProducts = async (req, res) => {
  try {
    const keyword = req.query.q;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "Search keyword is required",
      });
    }

    const searchTerm = keyword.toLowerCase();

    const products = await Product.findAll({
      where: {
        active: true,
        [Op.or]: [
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("name")),
            { [Op.like]: `%${searchTerm}%` }
          ),
          Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("sku")),
            { [Op.like]: `%${searchTerm}%` }
          ),
        ],
      },
      include: [
        {
          model: ProductImage,
          as: "images",
          attributes: ["id", "image_url"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name"],
        },
      ],
      limit: 20,
    });

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });

  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during search",
    });
  }
};
// exports.searchProducts = async (req, res) => {
//   try {
//     const { q } = req.query;

//     if (!q) {
//       return res.status(400).json({
//         success: false,
//         message: "Search query is required",
//       });
//     }

//     const products = await Product.findAll({
//       where: {
//         [Op.or]: [
//           { name: { [Op.like]: `%${q}%` } },
//           { sku: { [Op.like]: `%${q}%` } },
//         ],
//         active: true
//       },
//       include: [
//         {
//           model: ProductImage,
//           as: "images",
//           attributes: ["image_url"],
//         },
//       ],
//       limit: 10, // ✅ important for fast search-as-you-type
//     });

//     if (products.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       results: products.length,
//       data: products,
//     });
//   } catch (error) {
//     console.error("Search error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error during search",
//     });
//   }
// };
// exports.searchProducts = async (req, res) => {
//   try {
//     const { q } = req.query;

//     if (!q || q.trim() === "") {
//       return res.json({ success: true, data: [] });
//     }

//     const products = await Product.findAll({
//       where: {
//         active: true,
//         [Op.or]: [
//           { name: { [Op.like]: `%${q}%` } },
//           { sku: { [Op.like]: `%${q}%` } },
//         ],
//       },

//       include: [
//         {
//           model: ProductImage,
//           as: "images",
//           attributes: ["id", "image_url", "cloudinary_public_id"],
//         },
//         {
//           model: User,
//           as: "creator",
//           attributes: ["id", "name", "email", "role"],
//         },
//       ],

//       limit: 20, // fast response
//       order: [["name", "ASC"]],
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Search results",
//       data: products,
//     });

//   } catch (err) {
//     console.error("search error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error while searching",
//     });
//   }
// };

// exports.searchProducts = async (req, res) => {
//   try {
//     const { q } = req.query;

//     // If nothing typed
//     if (!q || q.trim() === "") {
//       return res.status(200).json({
//         success: true,
//         message: "No search query",
//         data: [],
//       });
//     }

//     const products = await Product.findAll({
//       where: {
//         [Op.or]: [
//           { name: { [Op.like]: `%${q}%` } },
//           { sku: { [Op.like]: `%${q}%` } },
//         ],
//       },
//       include: [
//         {
//           model: ProductImage,
//           as: "images",
//           attributes: ["id", "image_url"],
//         },
//         {
//           model: User,
//           as: "creator",
//           attributes: ["id", "name", "role"],
//         },
//       ],

//       // ⚡ Important for fast search dropdown
//       limit: 10,
//       order: [["createdAt", "DESC"]],
//     });

//     return res.status(200).json({
//       success: true,
//       message: products.length ? "Products found" : "No product found",
//       data: products,
//     });

//   } catch (err) {
//     console.error(" Search error:", err);

//     return res.status(500).json({
//       success: false,
//       message: "Server error searching product",
//     });
//   }
// };



exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const product = await Product.findByPk(id, {
      include: [{ model: ProductImage, as: "images" }],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ Update product fields
    await product.update({
      name: req.body.name || product.name,
      sku: req.body.sku || product.sku,
      description: req.body.description || product.description,
      cost_price: req.body.cost_price || product.cost_price,
      sale_price: req.body.sale_price || product.sale_price,
      stock_qty: req.body.stock_qty || product.stock_qty,
      reorder_level: req.body.reorder_level || product.reorder_level,
      active: req.body.active ?? product.active,
      created_by: userId,
    });

    // ✅ If new images are uploaded, replace old ones
    if (req.files && req.files.length > 0) {

      // 1️⃣ Delete old images from Cloudinary
      for (const img of product.images) {
        if (img.cloudinary_public_id) {
          await cloudinary.uploader.destroy(img.cloudinary_public_id);
        }
      }

      // 2️⃣ Remove old images from DB
      await ProductImage.destroy({
        where: { product_id: product.id },
      });

      // 3️⃣ Upload new images
      const newImages = [];

      for (const file of req.files) {
        const upload = await cloudinary.uploader.upload(file.path, {
          folder: "mafaconnect/products",
        });

        newImages.push({
          product_id: product.id,
          image_url: upload.secure_url,
          cloudinary_public_id: upload.public_id,
        });
      }

      // 4️⃣ Save new images
      await ProductImage.bulkCreate(newImages);
    }

    // ✅ Fetch updated product with images
    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        { model: ProductImage, as: "images" },
        { model: User, as: "creator", attributes: ["id", "name", "email"] },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });

  } catch (err) {
    console.error(" Update product error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error updating product",
      error: err.message,
    });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const location = await Location.create({
      name: req.body.name,
      location_type: req.body.location_type,
      address: req.body.address,
      phone: req.body.phone,
      email: req.body.email,
      state: req.body.state,
      zone: req.body.zone,
      capacity_sqft: req.body.capacity_sqft,
      active: req.body.active,
      bank_name: req.body.bank_name,
      account_name: req.body.account_name,
      account_number: req.body.account_number,
      sort_code: req.body.sort_code,

      manager_id: req.body.manager_id || null,
    });

    res.status(201).json({
      success: true,
      message: "Location created successfully",
      data: location,
    });

  } catch (err) {
    console.error("Create location error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await Location.findByPk(id);
    if (!location) {
      return res.status(404).json({ success: false, message: "Location not found" });
    }

    await location.update({
      name: req.body.name,
      location_type: req.body.location_type,
      address: req.body.address,
      phone: req.body.phone,
      email: req.body.email,
      state: req.body.state,
      zone: req.body.zone,
      capacity_sqft: req.body.capacity_sqft,
      active: req.body.active,
      bank_name: req.body.bank_name,
      account_name: req.body.account_name,
      account_number: req.body.account_number,
      sort_code: req.body.sort_code,
      manager_id: req.body.manager_id || null,
    });

    res.json({
      success: true,
      message: "Location updated successfully",
      data: location,
    });
    console.log('updated well')

  } catch (err) {
    console.error("Update location error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getManagers = async (req, res) => {
  try {
    const managers = await User.findAll({
      where: { role: "manager" },
      attributes: ["id", "name", "email", "phone"],
      order: [["name", "ASC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Managers fetched successfully",
      data: managers,
    });

  } catch (err) {
    console.error("❌ Fetch managers error:", err);
    res.status(500).json({
      success: false,
      message: "Server error fetching managers",
    });
  }
};


exports.getLocationBankDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await Location.findByPk(id, {
      attributes: [
        "id",
        "name",
        "bank_name",
        "account_name",
        "account_number",
        "sort_code"
      ],
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        location_id: location.id,
        location_name: location.name,
        bank_name: location.bank_name,
        account_name: location.account_name,
        account_number: location.account_number,
        sort_code: location.sort_code,
      },
    });

  } catch (error) {
    console.error("❌ Bank details error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching bank details",
    });
  }
};

exports.addProductStock = async (req, res) => {
  try {
    // const { productId, locationId, stockQty, reorderLevel, orders } = req.body;

    // if (!productId || !locationId) {
    const { product_id, location_id, stock_qty, reorder_level } = req.body;

    if (!product_id || !location_id) {
      return res.status(400).json({
        success: false,
        message: "Product ID and Location ID are required",
      });
    }

    // 1. Check if product is already assigned to this location
    const existingStock = await ProductLocationStock.findOne({
      where: {
        product_id: product_id,
        location_id: location_id,
      },
    });

    if (existingStock) {
      return res.status(400).json({
        success: false,
        message: "This product is already assigned to this location",
      });
    }

    // 2. Create new assignment
    const stock = await ProductLocationStock.create({
      product_id: product_id,
      location_id: location_id,
      stock_qty: stock_qty || 0,
      orders: 0,
      reorder_level: reorder_level || 20,
    });

    return res.json({
      success: true,
      message: "Product successfully assigned to location",
      data: stock,
    });

  } catch (err) {
    console.error("Stock error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while assigning product to location",
    });
  }
};



exports.getSingleLocationStats = async (req, res) => {
  try {
    const { locationId } = req.params;

    const [stats] = await sequelize.query(`
      SELECT 
        l.id AS location_id,
        l.name AS location_name,

        -- Total assigned product types
        COALESCE(COUNT(DISTINCT pls.product_id), 0) AS total_products,

        -- Total units in this location
        COALESCE(SUM(pls.stock_qty), 0) AS total_units,

        -- Total stock value
        COALESCE(SUM(pls.stock_qty * p.sale_price), 0) AS total_stock_value,

        -- Low stock count
        COALESCE(SUM(
          CASE 
            WHEN pls.stock_qty <= pls.reorder_level 
            THEN 1 
            ELSE 0 
          END
        ), 0) AS low_stock_items

      FROM locations l
      LEFT JOIN product_location_stocks pls 
        ON pls.location_id = l.id
      LEFT JOIN products p 
        ON pls.product_id = p.id
      WHERE l.id = :locationId
      GROUP BY l.id
    `, {
      replacements: { locationId },
      type: sequelize.QueryTypes.SELECT
    });

    // Orders for this location
    const [orders] = await sequelize.query(`
      SELECT 
        COUNT(*) AS total_orders,
        COALESCE(SUM(total_amount), 0) AS total_sales
      FROM orders
      WHERE location_id = :locationId
    `, {
      replacements: { locationId },
      type: sequelize.QueryTypes.SELECT
    });

    return res.json({
      success: true,
      message: "Location stats fetched successfully",
      data: {
        ...stats,
        total_orders: orders.total_orders,
        total_sales: orders.total_sales,
      },
    });

  } catch (err) {
    console.error("❌ Location stats error:", err);
    return res.status(500).json({
      success: false,
      message: "Error fetching location stats",
      error: err.message,
    });
  }
};

exports.getLocationStats = async (req, res) => {
  try {
    const stats = await sequelize.query(`
      SELECT 
        l.id AS location_id,
        l.name AS location_name,

        COUNT(DISTINCT pls.product_id) AS total_products,
        COALESCE(SUM(pls.stock_qty), 0) AS total_units,
        COALESCE(SUM(pls.stock_qty * p.sale_price), 0) AS total_stock_value,

        COALESCE(SUM(
          CASE 
            WHEN pls.stock_qty <= pls.reorder_level 
            THEN 1 ELSE 0 
          END
        ), 0) AS low_stock_items

      FROM locations l
      LEFT JOIN product_location_stocks pls 
        ON pls.location_id = l.id
      LEFT JOIN products p 
        ON pls.product_id = p.id
      GROUP BY l.id
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    return res.json({
      success: true,
      data: stats
    });

  } catch (err) {
    console.error("❌ Location stats error:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching location stats",
      error: err.message
    });
  }
};


exports.getProductLocations = async (req, res) => {
  try {
    const stocks = await ProductLocationStock.findAll({
      include: [
        {
          model: Location,
          as: "location",
          attributes: ["id", "name", "state"],
        },
        {
          model: Product,
          as: "product",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: stocks,
    });
  } catch (err) {
    console.error("❌ Error fetching product locations:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product locations",
      error: err.message,
    });
  }
}



// GET /locations/:id
exports.getSingleLocation = async (req, res) => {
  const { id } = req.params;

  const location = await Location.findByPk(id);

  if (!location) {
    return res.status(404).json({
      success: false,
      message: "Location not found",
    });
  }

  res.json({
    success: true,
    data: {
      ...location.toJSON(),
      bank_details: {
        bank_name: location.bank_name,
        account_name: location.account_name,
        account_number: location.account_number,
        sort_code: location.sort_code,
      },
    },
  });
};

// exports.addProductStock = async (req, res) => {
//   try {
//     const { productId, locationId, stockQty, reorderLevel } = req.body;

//     const stock = await ProductLocationStock.create({

//       product_id: productId,
//       location_id: locationId,
//       stock_qty: stockQty || 0,
//       reorder_level: reorderLevel || 20,
//     });

//     return res.json({
//       success: true,
//       message: "Stock added to location successfully",
//       data: stock,
//     });

//   } catch (err) {
//     console.error("Stock error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };



// exports.getLocationStats = async (req, res) => {
//   try {
//     const stats = await sequelize.query(`
//       SELECT 
//         l.id AS location_id,
//         l.name AS location_name,

//         COALESCE(COUNT(DISTINCT ps.product_id), 0) AS total_products,
//         COALESCE(SUM(ps.stock_qty), 0) AS total_units,

//         COALESCE(SUM(ps.stock_qty * p.sale_price), 0) AS total_stock_value,

//         COALESCE(SUM(
//           CASE 
//             WHEN ps.stock_qty <= ps.reorder_level 
//             THEN 1 ELSE 0 
//           END
//         ), 0) AS low_stock_items

//       FROM locations l
//       LEFT JOIN location_product_stocks ps ON ps.location_id = l.id
//       LEFT JOIN products p ON ps.product_id = p.id
//       GROUP BY l.id
//     `, {
//       type: sequelize.QueryTypes.SELECT
//     });

//     return res.json({
//       success: true,
//       message: "Location stats fetched",
//       data: stats
//     });

//   } catch (err) {
//     console.error("❌ Location stats error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching location stats",
//       error: err.message
//     });
//   }
// };

// exports.getLocationStats = async (req, res) => {
//   try {
//     const stats = await sequelize.query(`
//       SELECT 
//         l.id AS location_id,
//         l.name AS location_name,
//         COUNT(DISTINCT ps.product_id) AS total_products,
//         SUM(ps.stock_qty) AS total_units,
//         SUM(ps.stock_qty * p.sale_price) AS total_stock_value,
//         SUM(
//           CASE 
//             WHEN ps.stock_qty <= ps.reorder_level 
//             THEN 1 ELSE 0 
//           END
//         ) AS low_stock_items
//       FROM locations l
//       LEFT JOIN location_product_stocks ps ON ps.location_id = l.id
//       LEFT JOIN products p ON ps.product_id = p.id
//       GROUP BY l.id
//       ORDER BY l.createdAt DESC
//     `, { type: sequelize.QueryTypes.SELECT });

//     return res.status(200).json({
//       success: true,
//       message: "Location statistics fetched successfully",
//       data: stats,
//     });

//   } catch (err) {
//     console.error("❌ Location stats error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error fetching location statistics",
//     });
//   }
// };


// exports.createLocation = async (req, res) => {
//   try {
//     const {
//       name,
//       address,
//       city,
//       bank_name,
//       bank_account_name,
//       bank_account_number,
//       bank_code
//     } = req.body;

//     const location = await Location.create({
//       name,
//       address,
//       city,
//       bank_name,
//       bank_account_name,
//       bank_account_number,
//       bank_code
//     });

//     return res.status(201).json({
//       success: true,
//       message: "Depot created successfully",
//       data: location,
//     });

//   } catch (err) {
//     console.error("Create depot error:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };





// const { ProductLocationStock } = require("../models/ProductLocationStock");



















exports.adminLogin = async (req, res) => {
  try {
    const { account_number, password } = req.body;

    // Find admin
    const admin = await User.findOne({ where: { account_number, role: "admin" } });
    if (!admin) return res.status(401).json({ message: "Invalid admin credentials" });
    if (!admin.is_active) return res.status(403).json({ message: "Admin account inactive" });

    // Verify password
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ message: "Incorrect password" });

    // Generate tokens
    const accessToken = generateAccessToken(admin);
    const refreshToken = generateRefreshToken(admin);

    // Store refresh token in secure cookie
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "✅ Admin login successful",
      accessToken,
      admin: {
        id: admin.id,
        name: admin.name,
        account_number: admin.account_number,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
};
exports.getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "name", "account_number", "email", "role", "kyc_status", "is_active", "customer_type"],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("Get user error:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
exports.refreshToken = (req, res) => {
  try {
    const token = req.cookies.refresh_token;
    if (!token) return res.status(401).json({ message: "No refresh token provided" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh error:", err.message);
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
}
exports.logout = async (req, res) => {
  res.clearCookie("refresh_token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res.status(200).json({ message: "Logged out successfully" });
};

/**
 * ✅ Admin Dashboard (sample)
 */
exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const pendingKyc = await User.count({ where: { kyc_status: "pending" } });
    const approvedKyc = await User.count({ where: { kyc_status: "approved" } });

    res.json({
      message: "Admin dashboard data",
      stats: { totalUsers, pendingKyc, approvedKyc },
    });
  } catch (err) {
    console.error("Dashboard error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


// Generate a unique account number
function generateAccountNumber() {
  const random = Math.floor(10000000 + Math.random() * 90000000);
  return random.toString(); // e.g. "82643109"
}



























































// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const { User } = require("../models/user"); // your user model
// // Admin Login
// require("dotenv").config();

// exports.adminLogin = async (req, res) => {
//   try {
//     const { account_number, password } = req.body;

//     // Find admin by account number
//     const admin = await User.findOne({ where: { account_number, role: "admin" } });
//     if (!admin) return res.status(401).json({ message: "Invalid admin credentials" });

//     if (!admin.is_active) {
//       return res.status(403).json({ message: "Admin account inactive. Contact system owner." });
//     }

//     const valid = await bcrypt.compare(password, admin.password);
//     if (!valid) return res.status(401).json({ message: "Incorrect password" });

//     const token = jwt.sign(
//       { id: admin.id, role: admin.role, account_number: admin.account_number },
//       process.env.JWT_ACCESS_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.json({
//       message: "✅ Admin login successful",
//       accessToken: token,
//       admin: {
//         id: admin.id,
//         name: admin.name,
//         account_number: admin.account_number,
//         role: admin.role,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// exports.getCurrentUser = async (req, res) => {
//   try {
//     const authHeader = req.headers["authorization"];
//     if (!authHeader) return res.status(401).json({ message: "No token provided" });

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

//     const user = await User.findByPk(decoded.id, {
//       attributes: ["id", "name", "account_number", "email", "role", "kyc_status", "is_active"],
//     });

//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json({ user });
//   } catch (err) {
//     console.error(err);
//     res.status(401).json({ message: "Invalid or expired token" });
//   }
// };
// exports.logout = async (req, res) => {
//   try {
//     // Optional: verify token before logout
//     const authHeader = req.headers["authorization"];
//     if (!authHeader) return res.status(401).json({ message: "No token provided" });

//     const token = authHeader.split(" ")[1];
//     if (!token) return res.status(401).json({ message: "No token provided" });

//     // In production, you could blacklist this token
//     // For now, just respond OK
//     return res.status(200).json({ message: "Logged out successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error during logout" });
//   }
// };

// // Admin Dashboard Data
// exports.getDashboard = async (req, res) => {
//   try {
//     const totalUsers = await User.count();
//     const pendingKyc = await User.count({ where: { kyc_status: "pending" } });
//     const approvedKyc = await User.count({ where: { kyc_status: "approved" } });

//     res.json({
//       message: "Admin dashboard data",
//       stats: {
//         totalUsers,
//         pendingKyc,
//         approvedKyc,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
