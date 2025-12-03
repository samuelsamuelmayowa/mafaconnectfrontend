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
// const { Op } = require("sequelize");
exports.getCustomerStatement = async (req, res) => {
  try {
    const customer_id = req.user.id; // using logged-in customer
    const { from, to } = req.query;

    let transactions = [];

    // ------------------------------
    // 1️⃣ FETCH INVOICES → DEBIT
    // ------------------------------
    // const invoices = await Invoice.findAll({
    //   where: {
    //     customer_id,
    //     issue_date: { [Op.between]: [from, to] }
    //   },
    //   order: [["issue_date", "ASC"]]
    // });

    const invoices = await Invoice.findAll({
  where: {
    customer_id,
    [Op.or]: [
      { issue_date: { [Op.between]: [from, to] } },
      { 
        issue_date: null,
        createdAt: { [Op.between]: [from, to] }
      }
    ]
  },
  order: [
    ["issue_date", "ASC"],
    ["createdAt", "ASC"]
  ]
});

    invoices.forEach(inv => {
      transactions.push({
        date: inv.issue_date || inv.createdAt,

        // date: inv.issue_date,
        description: `Invoice ${inv.invoice_number}`,
        reference: inv.invoice_number,
        debit: Number(inv.total_amount),
        credit: 0
      });
    });

    // ------------------------------
    // 2️⃣ FETCH CONFIRMED PICKUPS → CREDIT
    // ------------------------------
    const orders = await Order.findAll({
      where: {
        customer_id,
        order_status: "confirmed",    // <<---- FIXED
        payment_status: "paid",       // <<---- FIXED
        updatedAt: { [Op.between]: [from, to] }
      },
      order: [["updatedAt", "ASC"]]
    });

    orders.forEach(order => {
      transactions.push({
        date: order.updatedAt,
        description: `Pickup Confirmed`,
        reference: order.order_number,
        debit: 0,
        credit: Number(order.total_amount)
      });
    });

    // ------------------------------
    // 3️⃣ SORT TIMELINE
    // ------------------------------
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // ------------------------------
    // 4️⃣ RUNNING BALANCE
    // ------------------------------
    let runningBalance = 0;
    transactions = transactions.map(t => {
      runningBalance += t.debit - t.credit;
      return { ...t, balance: runningBalance };
    });

    // ------------------------------
    // 5️⃣ SUMMARY
    // ------------------------------
    const totalCharges = transactions.reduce((sum, t) => sum + t.debit, 0);
    const totalPayments = transactions.reduce((sum, t) => sum + t.credit, 0);

    const summary = {
      openingBalance: 0,
      totalCharges,
      totalPayments,
      closingBalance: totalCharges - totalPayments
    };

    return res.json({
      success: true,
      data: { transactions, summary }
    });

  } catch (error) {
    console.error("Statement error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate customer statement"
    });
  }
};

// exports.getCustomerStatement = async (req, res) => {
//   try {
//     const customer_id = req.user.id;
//     const { from, to } = req.query;

//     if (!from || !to) {
//       return res.status(400).json({
//         success: false,
//         message: "from and to query parameters are required"
//       });
//     }

//     let transactions = [];

//     // ---------------------------------
//     // 1️⃣ INVOICES = DEBIT (Customer Owes)
//     // ---------------------------------

//     const invoices = await Invoice.findAll({
//       where: {
//         customer_id,
//         [Op.or]: [
//           { issue_date: { [Op.between]: [from, to] } },
//           { issue_date: null, createdAt: { [Op.between]: [from, to] } }
//         ]
//       },
//       order: [["createdAt", "ASC"]]
//     });

//     invoices.forEach(inv => {
//       transactions.push({
//         date: inv.issue_date || inv.createdAt,
//         description: `Invoice ${inv.invoice_number}`,
//         reference: inv.invoice_number,
//         debit: Number(inv.total_amount),
//         credit: 0,
//       });
//     });

//     // ---------------------------------
//     // 2️⃣ PICKUP CONFIRMED = CREDIT (Customer Paid)
//     // ---------------------------------

//     const orders = await Order.findAll({
//       where: {
//         customer_id,
//         order_status: "completed",  // pickup confirmed
//         updatedAt: { [Op.between]: [from, to] }
//       },
//       order: [["updatedAt", "ASC"]]
//     });

//     orders.forEach(order => {
//       transactions.push({
//         date: order.updatedAt,
//         description: `Pickup Confirmed`,
//         reference: order.order_number,
//         debit: 0,
//         credit: Number(order.total_amount),
//       });
//     });

//     // ---------------------------------
//     // 3️⃣ SORT + BALANCE
//     // ---------------------------------

//     transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

//     let runningBalance = 0;
//     transactions = transactions.map(t => {
//       runningBalance += t.debit - t.credit;
//       return { ...t, balance: runningBalance };
//     });

//     // ---------------------------------
//     // 4️⃣ SUMMARY
//     // ---------------------------------

//     const totalCharges = transactions.reduce((sum, t) => sum + t.debit, 0);
//     const totalPayments = transactions.reduce((sum, t) => sum + t.credit, 0);

//     const summary = {
//       openingBalance: 0,
//       totalCharges,
//       totalPayments,
//       closingBalance: totalCharges - totalPayments
//     };

//     return res.json({
//       success: true,
//       data: { transactions, summary }
//     });

//   } catch (error) {
//     console.error("Statement error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to generate customer statement"
//     });
//   }
// };

// const { Op } = require("sequelize");
// const Invoice = require("../models/Invoice");
// const Order = require("../models/Order");

// exports.getCustomerStatement = async (req, res) => {
//   try {
//     const customer_id = req.user.id;
//     const { from, to } = req.query;

//     if (!from || !to) {
//       return res.status(400).json({
//         success: false,
//         message: "from and to dates are required",
//       });
//     }

//     let transactions = [];

//     // 1️⃣ INVOICES → DEBIT
//     const invoices = await Invoice.findAll({
//       where: {
//         customer_id,
//         issue_date: { [Op.between]: [from, to] }
//       },
//       order: [["issue_date", "ASC"]]
//     });

//     invoices.forEach(inv => {
//       transactions.push({
//         date: inv.issue_date,
//         description: `Invoice ${inv.invoice_number}`,
//         reference: inv.invoice_number,
//         debit: Number(inv.total_amount),
//         credit: 0,
//       });
//     });

//     // 2️⃣ PAYMENTS → CREDIT
//     const orders = await Order.findAll({
//       where: {
//         customer_id,
//         payment_status: "paid",     // payment confirmed
//         order_status: "completed",  // pickup completed
//         createdAt: { [Op.between]: [from, to] }
//       },
//       order: [["createdAt", "ASC"]]
//     });

//     orders.forEach(order => {
//       transactions.push({
//         date: order.createdAt,
//         description: `Payment - ${order.payment_method || "Method Unknown"}`,
//         reference: order.payment_reference || order.order_number,
//         debit: 0,
//         credit: Number(order.total_amount),
//       });
//     });

//     // 3️⃣ SORT
//     transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

//     // 4️⃣ RUNNING BALANCE
//     let runningBalance = 0;
//     transactions = transactions.map(t => {
//       runningBalance += t.debit - t.credit;
//       return { ...t, balance: runningBalance };
//     });

//     // 5️⃣ SUMMARY
//     const totalCharges = transactions.reduce((sum, t) => sum + t.debit, 0);
//     const totalPayments = transactions.reduce((sum, t) => sum + t.credit, 0);

//     const summary = {
//       openingBalance: 0,
//       totalCharges,
//       totalPayments,
//       closingBalance: totalCharges - totalPayments
//     };

//     return res.json({
//       success: true,
//       data: { transactions, summary }
//     });

//   } catch (error) {
//     console.error("Statement error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to generate customer statement"
//     });
//   }
// };

// exports.getCustomerStatement = async (req, res) => {
//   try {
//     const customer_id = req.user.id;
//     const { from, to } = req.query;

//     if (!from || !to) {
//       return res.status(400).json({
//         success: false,
//         message: "from and to query parameters are required"
//       });
//     }

//     let transactions = [];

//     // 1️⃣ INVOICES → DEBIT
//     const invoices = await Invoice.findAll({
//       where: {
//         customer_id,
//         issue_date: { [Op.between]: [from, to] }
//       },
//       order: [["issue_date", "ASC"]]
//     });

//     invoices.forEach(inv => {
//       transactions.push({
//         date: inv.issue_date,
//         description: `Invoice ${inv.invoice_number}`,
//         reference: inv.invoice_number,
//         debit: Number(inv.total_amount),
//         credit: 0,
//       });
//     });

//     // 2️⃣ PAYMENTS (Orders Completed) → CREDIT
//     const orders = await Order.findAll({
//       where: {
//         customer_id,
//         status: "completed",
//         created_at: { [Op.between]: [from, to] }
//       },
//       order: [["created_at", "ASC"]]
//     });

//     orders.forEach(order => {
//       transactions.push({
//         date: order.created_at,
//         description: `Payment - ${order.payment_method || "Order Payment"}`,
//         reference: order.order_number,
//         debit: 0,
//         credit: Number(order.total_amount),
//       });
//     });

//     // 3️⃣ SORT
//     transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

//     // 4️⃣ RUNNING BALANCE
//     let runningBalance = 0;
//     transactions = transactions.map(t => {
//       runningBalance += t.debit - t.credit;
//       return { ...t, balance: runningBalance };
//     });

//     // 5️⃣ SUMMARY
//     const totalCharges = transactions.reduce((sum, t) => sum + t.debit, 0);
//     const totalPayments = transactions.reduce((sum, t) => sum + t.credit, 0);

//     const summary = {
//       openingBalance: 0,
//       totalCharges,
//       totalPayments,
//       closingBalance: totalCharges - totalPayments,
//     };

//     return res.json({
//       success: true,
//       data: { transactions, summary }
//     });

//   } catch (error) {
//     console.error("Statement error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to generate customer statement"
//     });
//   }
// };


// // exports.getCustomerStatement = async (req, res) => {
// //   try {
// //     const customer_id = req.user.id;
//     const { from, to } = req.query;

//     if (!from || !to) {
//       return res.status(400).json({
//         success: false,
//         message: "from and to query parameters are required"
//       });
//     }

//     let transactions = [];

//     // 1️⃣ INVOICES (DEBITS)
//     const invoices = await Invoice.findAll({
//       where: {
//         customer_id,
//         issue_date: { [Op.between]: [from, to] }
//       },
//       order: [["issue_date", "ASC"]]
//     });

//     invoices.forEach(inv => {
//       transactions.push({
//         date: inv.issue_date,
//         description: `Invoice ${inv.invoice_number}`,
//         reference: inv.invoice_number,
//         debit: Number(inv.total_amount),
//         credit: 0,
//       });
//     });

//     // 2️⃣ PAYMENTS / SALES (CREDITS)
//     const sales = await Sale.findAll({
//       where: {
//         customer_id,
//         status: "completed",
//         created_at: { [Op.between]: [from, to] }
//       },
//       order: [["created_at", "ASC"]]
//     });

//     sales.forEach(sale => {
//       transactions.push({
//         date: sale.created_at,
//         description: `Payment - ${sale.payment_method || "Payment"}`,
//         reference: sale.id.slice(0, 8),
//         debit: 0,
//         credit: Number(sale.total_amount),
//       });
//     });

//     // SORT
//     transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

//     // RUNNING BALANCE
//     let runningBalance = 0;
//     transactions = transactions.map(t => {
//       runningBalance += t.debit - t.credit;
//       return { ...t, balance: runningBalance };
//     });

//     // SUMMARY
//     const totalCharges = transactions.reduce((sum, t) => sum + t.debit, 0);
//     const totalPayments = transactions.reduce((sum, t) => sum + t.credit, 0);

//     const summary = {
//       openingBalance: 0,
//       totalCharges,
//       totalPayments,
//       closingBalance: totalCharges - totalPayments
//     };

//     return res.json({ success: true, data: { transactions, summary } });

//   } catch (error) {
//     console.error("Statement error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to generate customer statement"
//     });
//   }
// };

// exports.getCustomerStatement = async (req, res) => {
//   try {
//     const customer_id = req.user.id; // ✔ Correct source of ID
//     const { from, to } = req.query;

//     let transactions = [];

//     // ============================
//     // 1. FETCH INVOICES (DEBITS)
//     // ============================
//     // const invoices = await Invoice.findAll({
//     //   where: {
//     //     customer_id,
//     //     issue_date: { [Op.between]: [from, to] },
//     //     status: { [Op.ne]: "cancelled" }
//     //   },
//     //   order: [["issue_date", "ASC"]]
//     // });

//     const invoices = await Invoice.findAll({
//   where: {
//     customer_id,
//     issue_date: { [Op.between]: [from, to] },
//     // no status filter because your table doesn't have a status column
//   },
//   order: [["issue_date", "ASC"]],
// });

//     invoices.forEach(inv => {
//       transactions.push({
//         date: inv.issue_date,
//         description: `Invoice ${inv.invoice_number}`,
//         reference: inv.invoice_number,
//         debit: Number(inv.total_amount),
//         credit: 0,
//       });
//     });

//     // ============================
//     // 2. FETCH SALES (CREDITS)
//     // ============================
//     const sales = await Sale.findAll({
//       where: {
//         customer_id,
//         status: "completed",
//         created_at: { [Op.between]: [from, to] }
//       },
//       order: [["created_at", "ASC"]]
//     });

//     sales.forEach(sale => {
//       transactions.push({
//         date: sale.created_at,
//         description: `Payment - ${sale.payment_method || "Unknown"}`,
//         reference: sale.id.slice(0, 8).toUpperCase(),
//         debit: 0,
//         credit: Number(sale.total_amount),
//       });
//     });

//     // ============================
//     // 3. SORT BY DATE
//     // ============================
//     transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

//     // ============================
//     // 4. RUNNING BALANCE
//     // ============================
//     let runningBalance = 0;
//     transactions = transactions.map(t => {
//       runningBalance += t.debit - t.credit;
//       return { ...t, balance: runningBalance };
//     });

//     // ============================
//     // 5. SUMMARY
//     // ============================
//     const totalCharges = transactions.reduce((sum, t) => sum + t.debit, 0);
//     const totalPayments = transactions.reduce((sum, t) => sum + t.credit, 0);

//     const summary = {
//       openingBalance: 0,
//       totalCharges,
//       totalPayments,
//       closingBalance: totalCharges - totalPayments,
//     };

//     return res.json({
//       success: true,
//       data: { transactions, summary }
//     });

//   } catch (error) {
//     console.error("Statement error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to generate customer statement"
//     });
//   }
// };

// exports.getCustomerStatement = async (req, res) => {
//   try {
//     const customer_id = req.params.customerId;
//     const { from, to } = req.query;

//     let transactions = [];


//     const invoices = await Invoice.findAll({
//       where: {
//         customer_id,
//         issue_date: { [Op.between]: [from, to] },
//         status: { [Op.ne]: "cancelled" }
//       },
//       order: [["issue_date", "ASC"]]
//     });

//     invoices.forEach(inv => {
//       transactions.push({
//         date: inv.issue_date,
//         description: `Invoice ${inv.invoice_number}`,
//         reference: inv.invoice_number,
//         debit: Number(inv.total_amount),
//         credit: 0,
//       });
//     });

//     const sales = await Sale.findAll({
//       where: {
//         customer_id,
//         status: "completed",
//         created_at: { [Op.between]: [from, to] }
//       },
//       order: [["created_at", "ASC"]]
//     });

//     sales.forEach(sale => {
//       transactions.push({
//         date: sale.created_at,
//         description: `Payment - ${sale.payment_method || "Unknown"}`,
//         reference: sale.id.slice(0, 8).toUpperCase(),
//         debit: 0,
//         credit: Number(sale.total_amount),
//       });
//     });

  
//     transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

//     let runningBalance = 0;
//     transactions = transactions.map(t => {
//       runningBalance += t.debit - t.credit;
//       return { ...t, balance: runningBalance };
//     });

    
//     const totalCharges = transactions.reduce((sum, t) => sum + t.debit, 0);
//     const totalPayments = transactions.reduce((sum, t) => sum + t.credit, 0);

//     const summary = {
//       openingBalance: 0, // As in your PDF
//       totalCharges,
//       totalPayments,
//       closingBalance: totalCharges - totalPayments
//     };

//     return res.json({
//       success: true,
//       data: { transactions, summary }
//     });

//   } catch (error) {
//     console.error("Statement error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to generate customer statement"
//     });
//   }
// };
