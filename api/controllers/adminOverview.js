const { Order, Invoice, User, LoyaltyTransaction, LoyaltyAccount } = require("../models");


exports.getAdminOverviewStats = async (req, res) => {
  try {
    const revenue = await Order.sum("total_amount", { where: { payment_status: "paid" } }) || 0;
    const totalSales = await Order.count({ where: { payment_status: "paid" } });

    const activeCustomers = await Order.count({
      distinct: true,
      col: "customer_id",
      where: { payment_status: "paid" }
    });

    const loyaltyDistributed = await LoyaltyTransaction.sum("points", {
      where: { type: "earn" }
    }) || 0;

    res.json({ success: true, revenue, totalSales, activeCustomers, loyaltyDistributed });

  } catch (err) {
    console.error("ADMIN STATS ERROR:", err);
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};

// exports.getAdminOverviewStats = async (req, res) => {
//   try {
//     // 📌 1 — Total Revenue
//     const revenue = await Order.sum("total_amount", { where: { status: "completed" } }) || 0;

//     // 📌 2 — Total Sales Count
//     const totalSales = await Order.count({ where: { status: "completed" } });

//     // 📌 3 — Active Customers (orders within last 30 days)
//     const activeCustomers = await Order.count({
//       distinct: true,
//       col: "customer_id",
//       where: {
//         createdAt: { [Op.gte]: new Date(Date.now() - 30*24*60*60*1000) }
//       }
//     });

//     // 📌 4 — Loyalty Points Distributed (this month)
//     const loyaltyDistributed = await LoyaltyTransaction.sum("points", {
//       where: {
//         type: "earn",
//         createdAt: { [Op.gte]: new Date(Date.now() - 30*24*60*60*1000) }
//       }
//     }) || 0;

//     return res.json({
//       success: true,
//       revenue,
//       totalSales,
//       activeCustomers,
//       loyaltyDistributed
//     });

//   } catch (err) {
//     console.error("ADMIN STATS ERROR:", err);
//     return res.status(500).json({ message: "Failed to load dashboard stats" });
//   }
// };
