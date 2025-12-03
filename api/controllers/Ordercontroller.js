const { Order } = require("../models/Order");
const Invoice = require("../models/Invoice");
const { Op } = require("sequelize");

exports.getCustomerRecentOrders = async (req, res) => {
  try {
    const { customerId } = req.params;
    const limit = req.query.limit || 10;

    const orders = await Order.findAll({
      where: { customer_id: customerId },
      order: [["createdAt", "DESC"]],
      limit: Number(limit),
    });

    return res.json({
      success: true,
      data: orders,
    });

  } catch (err) {
    console.error("Error fetching recent orders:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// exports.getCustomerPendingInvoices = async (req, res) => {
//   try {
//     const { customerId } = req.params;
//     const { status } = req.query;

//     const whereClause = { customer_id: customerId };

//     if (status) whereClause.payment_status = status;

//     const invoices = await Invoice.findAll({
//       where: whereClause,
//       order: [["issue_date", "DESC"]],
//     });

//     return res.json({
//       success: true,
//       data: invoices,
//     });

//   } catch (err) {
//     console.error("Error fetching invoices:", err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// exports.getCustomerPendingInvoices = async (req, res) => {
//   try {
//     const { customerId } = req.params;
//     const { status } = req.query;

//     // Base query (customer only)
//     let where = { customer_id: customerId };

//     const invoices = await Invoice.findAll({
//       where,
//       include: [
//         {
//           model: Order,
//           as: "order",
//           attributes: ["payment_status"],
//           where: status ? { payment_status: status } : {},
//         },
//       ],
//       order: [["issue_date", "DESC"]],
//     });

//     return res.json({ success: true, data: invoices });

//   } catch (error) {
//     console.error("Error fetching pending invoices:", error);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };


// exports.getCustomerPendingInvoices = async (req, res) => {
//   try {
//     const { customerId } = req.params;
//     const { status } = req.query; // status=pending

//     const invoices = await Invoice.findAll({
//       where: { customer_id: customerId },
//       include: [
//         {
//           model: Order,
//           as: "order",
//           attributes: ["order_status", "payment_status"], 
//           where: status ? { payment_status: status } : {},
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     return res.json({
//       success: true,
//       data: invoices,
//     });
//   } catch (error) {
//     console.error("Invoice fetch error:", error);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// const { Order } = require("../models/Order");
// const Invoice = require("../models/Invoice");

exports.getCustomerPendingInvoices = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { status } = req.query; // ?status=pending

    // If no status is passed → return all invoices for this customer
    const orderFilter = status ? { payment_status: status } : {};

    const invoices = await Invoice.findAll({
      where: { customer_id: customerId },
      include: [
        {
          model: Order,
          as: "order",
          attributes: ["order_status", "payment_status"],
          where: orderFilter, // <--- THIS MAKES ?status=pending WORK
        },
      ],
      order: [["issue_date", "DESC"]],
    });

    res.json({
      success: true,
      data: invoices,
    });

  } catch (error) {
    console.error("Pending Invoice Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching invoices",
    });
  }
};

exports.getCustomerOrderStats = async (req, res) => {
  try {
    const { customerId } = req.params;

    const totalOrders = await Order.count({
      where: { customer_id: customerId }
    });

    const completedOrders = await Order.count({
      where: { customer_id: customerId, order_status: "completed" }
    });

    const pendingOrders = await Order.count({
      where: { customer_id: customerId, order_status: "pending" }
    });

    const totalAmountSpent = await Order.sum("total_amount", {
      where: { customer_id: customerId, order_status: "completed" }
    });

    return res.json({
      success: true,
      data: {
        totalOrders,
        completedOrders,
        pendingOrders,
        totalAmountSpent: totalAmountSpent || 0,
      }
    });

  } catch (err) {
    console.error("Error fetching stats:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
