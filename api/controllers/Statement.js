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
    const customer_id = req.params.customerId;
    const { from, to } = req.query;

    let transactions = [];


    const invoices = await Invoice.findAll({
      where: {
        customer_id,
        issue_date: { [Op.between]: [from, to] },
        status: { [Op.ne]: "cancelled" }
      },
      order: [["issue_date", "ASC"]]
    });

    invoices.forEach(inv => {
      transactions.push({
        date: inv.issue_date,
        description: `Invoice ${inv.invoice_number}`,
        reference: inv.invoice_number,
        debit: Number(inv.total_amount),
        credit: 0,
      });
    });

    const sales = await Sale.findAll({
      where: {
        customer_id,
        status: "completed",
        created_at: { [Op.between]: [from, to] }
      },
      order: [["created_at", "ASC"]]
    });

    sales.forEach(sale => {
      transactions.push({
        date: sale.created_at,
        description: `Payment - ${sale.payment_method || "Unknown"}`,
        reference: sale.id.slice(0, 8).toUpperCase(),
        debit: 0,
        credit: Number(sale.total_amount),
      });
    });

  
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    let runningBalance = 0;
    transactions = transactions.map(t => {
      runningBalance += t.debit - t.credit;
      return { ...t, balance: runningBalance };
    });

    
    const totalCharges = transactions.reduce((sum, t) => sum + t.debit, 0);
    const totalPayments = transactions.reduce((sum, t) => sum + t.credit, 0);

    const summary = {
      openingBalance: 0, // As in your PDF
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
    res.status(500).json({
      success: false,
      message: "Failed to generate customer statement"
    });
  }
};
