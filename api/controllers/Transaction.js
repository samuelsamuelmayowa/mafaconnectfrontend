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



exports.getTransactionDetails = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id },
      include: [
        { model: User, as: "customers" },
        { model: Location, as: "locations" },
        { model: OrderItem, as: "order_items" },
      ],
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    // Calculate totals
    const subtotal = order.order_items.reduce((sum, item) => {
      return sum + item.unit_price * item.quantity;
    }, 0);

    const tax = subtotal * 0.075;
    const total = subtotal + tax;

    return res.json({
      success: true,
      data: {
        transaction_id: order.id,
        order_number: order.order_number,
        status: order.status,
        date: order.created_at,
        customer: order.customers,
        location: order.locations,
        payment_method: order.payment_method,
        items: order.order_items,
        subtotal,
        tax,
        total,
        notes: order.notes,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error fetching transaction details",
    });
  }
};




exports.getCompletedTransactions = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        order_status: {
          [Op.in]: ["completed", "paid", "confirmed"]
        }
      },

      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "name", "email", "phone"]
        },
        {
          model: User,
          as: "sales_agent",
          attributes: ["id", "name"]
        },
        {
          model: Location,
          as: "location",
          attributes: ["id", "name"]
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "productid", "name", "bag_size_kg", "sale_price"]
            }
          ]
        }
      ],

      order: [["createdAt", "DESC"]],
    });

    return res.json({ success: true, data: orders });

  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Could not fetch transaction orders",
    });
  }
};




// exports.getCompletedTransactions = async (req, res) => {
//   try {
//     const orders = await Order.findAll({
//     //   where: {
//         where: { order_status: ["completed", "paid", "confirmed"] },

//         // status: ["completed", "paid", "confirmed"],
//     //   },
//       include: [
//         { model: User, as: "customers" },
//         { model: Location, as: "locations" },
//         { model: OrderItem, as: "order_items" },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     return res.json({ success: true, data: orders });
//   } catch (error) {
//     console.error("Error fetching transactions:", error);
//     res.status(500).json({
//       success: false,
//       message: "Could not fetch transaction orders",
//     });
//   }
// };
