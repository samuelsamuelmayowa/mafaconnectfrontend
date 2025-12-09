const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User } = require("../models/user");
require("dotenv").config();
const cloudinary = require("../cloudinary");
const { Product, ProductImage, Location, ProductLocationStock } = require("../models");
const { sequelize } = require("../db");
// const sendEmail = require("../utils/sendEmail");
const OrderItem = require("../models/OrderItem");
// const Order = require("../models/Order");
const { Order, Notification } = require("../models/Order");
// const { } = require("../models/Order"); // if you need it too
const { LocationProductStock } = require("../models/LocationProductStock");
const crypto = require("crypto");
const Invoice = require("../models/Invoice");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { sendEmail } = require("../utils/sendEmail");
// const { default: sendEmail } = require("../utils/sendEmail");
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
// exports.confirmOrderPayment = async (req, res) => {
//   const t = await sequelize.transaction();

//   try {
//     const { id } = req.params;
//     const { payment_reference } = req.body;

//     const order = await Order.findByPk(id, { transaction: t });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     if (order.payment_status === "paid") {
//       return res.status(400).json({
//         success: false,
//         message: "Order already marked as paid",
//       });
//     }

//     order.payment_status = "paid";
//     order.order_status = "confirmed";

//     if (payment_reference) {
//       order.payment_reference = payment_reference;
//     }

//     await order.save({ transaction: t });

//     // 🔔 Create notification for customer
//     await Notification.create({
//       user_id: order.customer_id,
//       title: "Payment Confirmed ✅",
//       message: `Your payment for order ${order.order_number} has been confirmed.`,
//       order_id: order.id,
//     }, { transaction: t });

//     await LoyaltyActivity.create({
//       customer_id,
//       type: "earned",
//       points: +pointsAwarded,
//       description: `${kg}KG Rice Purchase`
//     });

//     await t.commit();

//     res.json({
//       success: true,
//       message: "Payment confirmed successfully",
//     });

//   } catch (err) {
//     await t.rollback();
//     console.error("Confirm payment error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to confirm payment",
//     });
//   }
// };



exports.confirmOrderPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    console.log("\n=========== PAYMENT CONFIRM DEBUG ==========");

    const { id } = req.params;
    const { payment_reference } = req.body;

    console.log("STEP 1: Fetching order with items...");

    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: "items" }],
      transaction: t
    });

    if (!order) {
      console.log("STOP ❌ ORDER NOT FOUND");
      await t.rollback();
      return res.json({ success: false, message: "Order not found" });
    }

    console.log("STEP 2: ORDER FOUND:", order.order_number);
    console.log("STEP 3: Items Count =", order.items?.length);

    // 🔥 Debug items structure (this is CRITICAL)
    console.log("ORDER ITEMS RAW:", JSON.stringify(order.items, null, 2));

    order.payment_status = "paid";
    order.order_status = "confirmed";
    if (payment_reference) order.payment_reference = payment_reference;
    await order.save({ transaction: t });

    console.log("STEP 4: ORDER STATUS UPDATED");

    // =================== POINTS ====================
    let pointsAwarded = 0;

    for (const item of order.items) {
      console.log(`POINT CALC → ${item.product_name} x${item.quantity}`);
      pointsAwarded += item.quantity;
    }

    console.log("STEP 5: POINTS TO ADD =", pointsAwarded);

    const loyalty = await LoyaltyAccount.findOne({
      where: { customer_id: order.customer_id },
      transaction: t,
    });

    if (!loyalty) {
      console.log("STOP ❌ LOYALTY NOT FOUND");
      await t.rollback();
      return res.json({ success: false, message: "No loyalty account" });
    }

    loyalty.points_balance += pointsAwarded;
    await loyalty.save({ transaction: t });

    console.log("STEP 6: LOYALTY UPDATED ->", loyalty.points_balance);

    await LoyaltyTransaction.create({
      loyalty_account_id: loyalty.id,
      type: "earned",
      points: pointsAwarded,
      source: "order",
      note: `Earned from Order #${order.order_number}`,
    }, { transaction: t });

    console.log("STEP 7: TRANSACTION LOGGED");

    // =================== 🔥 STOCK DEDUCTION 🔥 ====================
    console.log("STEP 8: STOCK DEDUCTION STARTING");

    for (const item of order.items) {
      console.log("ITEM STRUCTURE:", item);

      // ❗ check if field name is product_id or productId or something else
      const pid = item.product_id ?? item.productId ?? item.ProductId;
      console.log("PRODUCT ID RESOLVED AS →", pid);

      const product = await Product.findByPk(pid, { transaction: t });

      if (!product) {
        console.log("STOP ❌ PRODUCT NOT FOUND →", pid);
        await t.rollback();
        return res.json({ success: false, message: "Product not found" });
      }

      console.log(`STOCK BEFORE → ${product.name}: ${product.stock_qty}`);
      product.stock_qty -= item.quantity;
      await product.save({ transaction: t });
      console.log(`STOCK AFTER  → ${product.name}: ${product.stock_qty}`);
    }

    console.log("STEP 9: STOCK UPDATED SUCCESSFULLY");

    await Notification.create({
      user_id: order.customer_id,
      title: "Payment Confirmed",
      message: `You earned +${pointsAwarded} points`,
      order_id: order.id,
    }, { transaction: t });

    console.log("STEP 10: NOTIFICATION SAVED");

    await t.commit();
    console.log("=========== SUCCESS — TRANSACTION COMMITTED ==========\n");

    return res.json({ success: true, message: "Payment confirmed" });

  } catch (err) {
    console.log("🔥 ERROR TRACE:", err);
    await t.rollback();
    return res.json({ success: false, message: err.message || "Failed to confirm" });
  }
};




exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_status, notes } = req.body;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.order_status = new_status;

    await order.save();

    // 🔔 Send notification to customer
    await Notification.create({
      user_id: order.customer_id,
      title: "Order Status Updated 🔄",
      message: `Your order ${order.order_number} status is now "${new_status}". ${notes || ""}`,
      order_id: order.id,
    });

    res.json({
      success: true,
      message: "Order status updated successfully",
    });

  } catch (err) {
    console.error("Update order status error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};

exports.getAdminOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};

    if (status && status !== "all") {
      where.order_status = status;
    }

    const orders = await Order.findAll({
      where,
      order: [["createdAt", "DESC"]],
      // include: [
      //   {
      //     model: OrderItem,
      //     as: "items",
      //     include: [
      //       {
      //         model: Product,
      //         as: "product",
      //         attributes: ["id", "name", "sale_price"],
      //       },
      //     ],
      //   },
      //   {
      //     model: Location,
      //     as: "location",
      //     attributes: ["id", "name", "state"],
      //   },
      // ],
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "email", "phone"]
        },
        {
          model: Location,
          as: "location",
          attributes: ["id", "name", "state"]
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "sku", "sale_price"]
            }
          ]
        }
      ],
    });

    res.json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error("Admin fetch orders error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// exports.confirmPayment = async (req, res) => {
//   const t = await sequelize.transaction();

//   try {
//     const orderId = req.params.id;
//     const { payment_reference } = req.body;

//     const order = await Order.findByPk(orderId, { transaction: t });

//     if (!order) {
//       return res.status(404).json({ success: false, message: "Order not found" });
//     }

//     // Update order
//     order.payment_status = "paid";
//     order.order_status = "confirmed";
//     await order.save({ transaction: t });

//     // ✅ Create Invoice
//     const invoiceNumber = "INV-" + crypto.randomBytes(3).toString("hex").toUpperCase();

//     const invoice = await Invoice.create({
//       invoice_number: invoiceNumber,
//       order_id: order.id,
//       customer_id: order.customer_id,
//       total_amount: order.total_amount,
//     }, { transaction: t });

//     await t.commit();

//     return res.json({
//       success: true,
//       message: "Payment confirmed & invoice generated",
//       invoice
//     });

//   } catch (err) {
//     await t.rollback();
//     console.error("Confirm payment error:", err);
//     res.status(500).json({ success: false, message: "Confirm payment failed" });
//   }
// };
// exports.confirmPayment = async (req, res) => {
//   const { id } = req.params;
//   const { payment_reference } = req.body;

//   try {
//     const order = await Order.findByPk(id);

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // ✅ Save reference on order
//     order.payment_reference = payment_reference;
//     order.payment_status = "paid";
//     if (order.payment_status === "paid") {
//   await earnPointsForOrder(order.id);
// }

//     await order.save();

//     const existingInvoice = await Invoice.findOne({
//       where: { order_id: order.id }
//     });

//     // ✅ Automatically generate invoice
//     if (!existingInvoice) {
//       await Invoice.create({
//         invoice_number: `INV-${Date.now()}`,
//         order_id: order.id,
//         customer_id: order.customer_id,
//         total_amount: order.total_amount,
//         payment_method: order.payment_method,
//         payment_reference: payment_reference,   // ✅ IMPORTANT
//         issued_at: new Date(),
//       });
//     }
//     // await order.update({ payment_status: "paid" });

// // Award loyalty points
// await awardPointsForOrder(order.id);
//     return res.json({
//       success: true,
//       message: "Payment confirmed and invoice generated"
//     });

//   } catch (error) {
//     console.error("Confirm payment error:", error);
//     res.status(500).json({ message: "Payment confirmation failed" });
//   }
// };

exports.confirmPayment = async (req, res) => {
  const { id } = req.params;
  const { payment_reference } = req.body;

  try {
    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If already paid, no need to award twice
    const isAlreadyPaid = order.payment_status === "paid";

    // Save payment
    order.payment_reference = payment_reference;
    order.payment_status = "paid";
    await order.save();

    // Generate invoice if missing
    const existingInvoice = await Invoice.findOne({
      where: { order_id: order.id }
    });

    if (!existingInvoice) {
      await Invoice.create({
        invoice_number: `INV-${Date.now()}`,
        order_id: order.id,
        customer_id: order.customer_id,
        total_amount: order.total_amount,
        payment_method: order.payment_method,
        payment_reference,
        issued_at: new Date(),
      });
    }

    // ⭐ Award points ONLY if not already awarded before
    if (!isAlreadyPaid) {
      await awardPointsForOrder(order);
    }

    return res.json({
      success: true,
      message: "Payment confirmed, invoice created, and points awarded."
    });

  } catch (error) {
    console.error("CONFIRM PAYMENT ERROR:", error);
    return res.status(500).json({ message: "Payment confirmation failed" });
  }
};



// exports.getCustomerInvoices = async (req, res) => {
//   try {
//     const customer_id = req.user.id;

//     const invoices = await Invoice.findAll({
//       where: { customer_id },
//       include: [
//         { model: Order, as: "order" }
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     res.json({
//       success: true,
//       data: invoices
//     });

//   } catch (err) {
//     console.error("Invoice fetch error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Failed to load invoices"
//     });
//   }
// };
exports.getCustomerInvoices = async (req, res) => {
  try {
    const customer_id = req.user.id;

    const invoices = await Invoice.findAll({
      where: { customer_id },
      include: [
        {
          model: Order,
          as: "order",
          include: [
            {
              model: OrderItem,
              as: "items",
              include: [
                {
                  model: Product,
                  as: "product",
                  attributes: ["name", "sale_price"]
                }
              ]
            }
          ]
        }
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({
      success: true,
      data: invoices,
    });

  } catch (err) {
    console.error("Invoice fetch error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to load invoices",
    });
  }
};


const { generateInvoicePDF } = require("../utils/generateInvoicePDF");
const { earnPointsForOrder, awardPointsForOrder } = require("./loyality");
const LoyaltyActivity = require("../models/LoyaltyActivity");

exports.downloadInvoicePDF = async (req, res) => {
  try {
    const { invoice_number } = req.params;
    const customer_id = req.user.id;

    const invoice = await Invoice.findOne({
      where: { invoice_number, customer_id },
      include: [
        {
          model: Order,
          as: "order",
          include: [
            {
              model: OrderItem,
              as: "items",
              include: [{ model: Product, as: "product" }],
            }
          ]
        }
      ]
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    generateInvoicePDF(invoice, res);

  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({
      success: false,
      message: "Could not generate PDF",
    });
  }
};

exports.downloadInvoice = async (req, res) => {
  try {
    const { invoice_number } = req.params;
    const customer_id = req.user.id; // logged-in user

    console.log("Requesting invoice:", invoice_number, "Customer:", customer_id);

    // Fetch invoice that belongs to the logged-in customer
    const invoice = await Invoice.findOne({
      where: { invoice_number },
      include: [
        {
          model: Order,
          as: "order",
          required: true,
          where: { customer_id }, // ensure ownership
          include: [
            {
              model: OrderItem,
              as: "items",
              include: [{ model: Product, as: "product" }],
            },
          ],
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found or not authorized.",
      });
    }

    // Return JSON invoice so frontend can build HTML/PDF
    return res.json({
      success: true,
      data: invoice,
    });

  } catch (err) {
    console.error("Invoice fetch error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching invoice.",
    });
  }
};

// GET JSON invoice details (frontend will build PDF)
// exports.getInvoiceDetails = async (req, res) => {
//   try {
//     const { invoice_number } = req.params;
//     const customer_id = req.user.id;

//     console.log("Fetching invoice:", invoice_number, "Customer:", customer_id);

//     const invoice = await Invoice.findOne({
//       where: { invoice_number },
//       include: [
//         {
//           model: Order,
//           as: "order",
//           required: true,
//           where: { customer_id }, // ensure user owns this invoice
//           include: [
//             {
//               model: OrderItem,
//               as: "items",
//               include: [{ model: Product, as: "product" }],
//             },
//           ],
//         },
//       ],
//     });

//     if (!invoice) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice not found or unauthorized",
//       });
//     }

//     return res.json({
//       success: true,
//       data: invoice,
//     });
//   } catch (error) {
//     console.error("Error fetching invoice:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error fetching invoice",
//     });
//   }
// };
// exports.getInvoiceDetails = async (req, res) => {
//   try {
//     const { invoice_number } = req.params;
//     const customer_id = req.user.id;

//     const invoice = await Invoice.findOne({
//       where: { invoice_number },
//       include: [
//         {
//           model: Order,
//           as: "order",
//           required: true,
//           where: { customer_id },
//           include: [
//             {
//               model: OrderItem,
//               as: "items",            // first attempt
//               include: [{ model: Product, as: "product" }],
//             },
//             {
//               model: OrderItem,
//               as: "order_items",      // second attempt (common in many DBs)
//               include: [{ model: Product, as: "product" }],
//             },
//           ],
//         },
//         // If invoice_items exists under invoice
//         {
//           model: InvoiceItem,
//           as: "invoice_items",
//           include: [{ model: Product, as: "product" }],
//         },
//       ],
//     });

//     if (!invoice) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice not found or unauthorized",
//       });
//     }

//     return res.json({
//       success: true,
//       data: invoice,
//     });

//   } catch (error) {
//     console.error("Error fetching invoice:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error fetching invoice",
//     });
//   }
// };

exports.getInvoiceDetails = async (req, res) => {
  try {
    const { invoice_number } = req.params;
    const customer_id = req.user.id;

    const invoice = await Invoice.findOne({
      where: { invoice_number },
      include: [
        {
          model: Order,
          as: "order",
          required: true,
          where: { customer_id },
          include: [
            {
              model: OrderItem,
              as: "items",
              include: [{ model: Product, as: "product" }],
            },
          ],
        },
      ],
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found or unauthorized",
      });
    }

    return res.json({
      success: true,
      data: invoice,
    });

  } catch (error) {
    console.error("Error fetching invoice:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching invoice",
    });
  }
};

// exports.downloadInvoice = async (req, res) => {
//   try {
//     const { invoice_number } = req.params;
//     const customer_id = req.user.id;

//     const invoice = await Invoice.findOne({
//       where: { invoice_number, customer_id },
//       include: [
//         {
//           model: Order,
//           as: "order",
//           include: [
//             {
//               model: OrderItem,
//               as: "items",
//               include: [{ model: Product, as: "product" }],
//             },
//           ],
//         },
//       ],
//     });

//     if (!invoice) {
//       return res.status(404).json({ success: false, message: "Invoice not found" });
//     }

//     // Ensure folder exists
//     const invoicesDir = path.join(__dirname, "..", "invoices");
//     if (!fs.existsSync(invoicesDir)) {
//       fs.mkdirSync(invoicesDir, { recursive: true });
//     }

//     const pdfPath = path.join(
//       invoicesDir,
//       `invoice-${invoice_number}.pdf`
//     );

//     const doc = new PDFDocument({ margin: 50 });

//     // Pipe PDF to file + response (streaming)
//     doc.pipe(fs.createWriteStream(pdfPath));
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename="${invoice_number}.pdf"`
//     );
//     doc.pipe(res);

//     // ---- PDF CONTENT ----  
//     doc.fontSize(20).text("MAFA Rice Mill Limited", { align: "left" });
//     doc.moveDown();
//     doc.fontSize(12).text("Local Government, Off km 11 Hadejia Road Gunduwawa Industrial Estate, Kano, Nigeria");
//     doc.text("Phone: +234 904 028 8888 | Email: sales@mafagroup.org");
//     doc.moveDown();

//     doc.fontSize(16).text(`Invoice #: ${invoice_number}`);
//     doc.text(`Order: ${invoice.order.order_number}`);
//     doc.text(`Issue Date: ${invoice.issue_date}`);
//     doc.text(`Due Date: ${invoice.due_date}`);
//     doc.text(`Status: ${invoice.status.toUpperCase()}`);
//     doc.moveDown();

//     doc.fontSize(14).text("Items", { underline: true });
//     doc.moveDown(0.5);

//     invoice.order.items.forEach((item) => {
//       doc.text(
//         `${item.product.name} (x${item.quantity}) - ₦${item.total_price.toLocaleString()}`
//       );
//     });

//     doc.moveDown();
//     doc.fontSize(14).text(`TOTAL: ₦${invoice.total_amount.toLocaleString()}`);

//     if (invoice.notes) {
//       doc.moveDown();
//       doc.fontSize(12).text(`Notes: ${invoice.notes}`);
//     }

//     doc.end();

//   } catch (err) {
//     console.error("Invoice PDF error:", err);
//     res.status(500).json({ success: false, message: "Failed to generate invoice PDF" });
//   }
// };


// const { generateInvoicePDF } = require("../utils/generateInvoicePDF");

// exports.downloadInvoicePDF = async (req, res) => {
//   try {
//     const { invoice_number } = req.params;
//     const customer_id = req.user.id;

//     const invoice = await Invoice.findOne({
//       where: { invoice_number, customer_id },
//       include: [
//         { model: Order, as: "order" },
//         {
//           model: InvoiceItem,
//           as: "items",
//           include: [{ model: Product, as: "product" }],
//         },
//       ],
//     });

//     if (!invoice) {
//       return res.status(404).json({
//         success: false,
//         message: "Invoice not found",
//       });
//     }

//     generateInvoicePDF(invoice, res);

//   } catch (err) {
//     console.error("PDF generation error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Could not generate PDF",
//     });
//   }
// };



// exports.downloadInvoice = async (req, res) => {
//   try {
//     const orderNumber = req.params.order_number;

//     const invoice = await Invoice.findOne({
//       include: [
//         {
//           model: Order,
//           as: "order",
//           include: [{
//             model: OrderItem,
//             as: "items",
//             include: [{ model: Product, as: "product" }]
//           }]
//         }
//       ],
//       where: { invoice_number: req.params.invoice_number }
//     });

//     if (!invoice) {
//       return res.status(404).json({ message: "Invoice not found" });
//     }

//     const doc = new PDFDocument();
//     const fileName = `invoice-${invoice.invoice_number}.pdf`;
//     const filePath = path.join(__dirname, `../invoices/${fileName}`);

//     const stream = fs.createWriteStream(filePath);
//     doc.pipe(stream);

//     doc.fontSize(20).text("MAFACONNECT INVOICE", { align: "center" });

//     doc.moveDown();
//     doc.text(`Invoice: ${invoice.invoice_number}`);
//     doc.text(`Order: ${invoice.order.order_number}`);
//     doc.text(`Date: ${invoice.createdAt}`);

//     doc.moveDown();

//     doc.text("Items:");
//     invoice.order.items.forEach(item => {
//       doc.text(`${item.product.name} x ${item.quantity} - ₦${item.total_price}`);
//     });

//     doc.moveDown();
//     doc.text(`Total: ₦${invoice.total_amount}`);

//     doc.end();

//     stream.on("finish", () => {
//       res.download(filePath);
//     });

//   } catch (err) {
//     console.error("Invoice PDF error:", err);
//     res.status(500).json({ message: "Failed to generate invoice" });
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
    // await earnPointsForOrder(order.id, t);
    // await awardPointsForOrder(order,t)
    await t.commit();
    // const customer = await User.findByPk(customer_id);
    // if (customer?.email || customer && customer.email) {
    //   try {
    //     await sendEmail({
    //       to: customer.email,
    //       subject: "Your Order Was Placed Successfully",
    //       html: `
    //     <div style="font-family: Arial, sans-serif;">
    //       <h2>Thank you for your order!</h2>
    //       <p>Your order has been successfully created.</p>

    //       <h3>Order Details</h3>
    //       <p><strong>Order Number:</strong> ${order_number}</p>
    //       <p><strong>Total Amount:</strong> ₦${total_amount.toLocaleString()}</p>
    //       <p><strong>Payment Method:</strong> ${payment_method}</p>
    //       <p><strong>Status:</strong> Pending Payment</p>

    //       <p>Please complete your payment to avoid order cancellation.</p>

    //       <br/>
    //       <p>Thanks for choosing MafaConnect!</p>
    //     </div>
    //   `,
    //     });

    //     console.log("Order email sent to:", customer.email);
    //   } catch (err) {
    //     console.error("Failed to send email:", err);
    //   }
    // }
    return res.json({
      success: true,
      message: "Order created successfully",
      order_id: order.id,
      order_number: order.order_number,
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
      where: { order_number: req.params.orderId },
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
      attributes: ["id", "name", "account_number", "email", "role", "kyc_status", "is_active", "customer_type", "phone"],
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
