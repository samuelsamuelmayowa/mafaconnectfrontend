const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const { Order } = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const { Product, LoyaltyAccount } = require("../models");
const assignTierAutomatically = require("./updateTire");
const { LoyaltyTier } = require("../models/LoyaltyTier");

// const orders = await Order.findAll({
    //   where: { customer_id: userId },
    //   order: [["createdAt", "DESC"]],
    //   include: [
    //     {
    //       model: OrderItem,
    //       as: "items",
    //       include: [
    //         {
    //           model: Product,
    //           as: "product",
    //         },
    //       ],
    //     },
    //   ],
    // });
exports.getCustomerOrders = async (req, res) => {

  try {
    const userId = req.user.id; // or req.params.id

    const orders = await Order.findAll({
      where: { customer_id: userId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
            },
          ],
        },
      ],
    });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Customer orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer orders",
    });
  }
};


exports.getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      where: { id },
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "role",
        "is_active",
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      data: user,
    });

  } catch (error) {
    console.error("❌ Get user error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error fetching user",
    });
  }
};



exports.getKYCStatus = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT
    console.log("REQ.USER ->", req.user); // ADD THIS
    const user = await User.findByPk(userId, {
      attributes: ["id", "name", "email", "kyc_status", "account_number", "customer_type"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "KYC status fetched successfully",
      data: {
        user_id: user.id,
        kyc_status: user.kyc_status,
        account_number: user.account_number || null,
      },
    });

  } catch (error) {
    console.error("KYC Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


function generateAccountNumber(id) {
  const prefix = "MFC";
  const padded = String(id).padStart(8, "0");
  return `${prefix}-${padded}`;
}

function generateAccountNumber(id) {
  return String(id).padStart(8, "0");
}

// ✅ Customer/Business Registration
// exports.register = async (req, res) => {
//   try {
//     const { name, email, phone, password, customer_type, role } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "Name, email, and password are required." });
//     }

//     const existing = await User.findOne({ where: { email } });
//     if (existing) {
//       return res.status(400).json({ message: "Email already exists." });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Step 1: Create user without account number
//     const user = await User.create({
//       name,
//       email,
//       phone,
//       password: hashedPassword,
//       customer_type,
//       role: role || "customer",
//       kyc_status: "pending",
//       is_active: true,
//       account_number: null,
//     });

//     let account = await LoyaltyAccount.findOne({
//       where: { customer_id: newUser.id }
//     });

//     if (!account) {
//       await LoyaltyAccount.create({
//         customer_id: newUser.id,
//         points_balance: 0,
//         tier: "Bronze",
//       });
//     }

//     // Step 2: Generate account number from ID
//     const accountNumber = generateAccountNumber(user.id);

//     // Step 3: Save the account number
//     user.account_number = accountNumber;
//     await user.save();

//     return res.status(201).json({
//       message: "Account created successfully. Waiting for admin approval.",
//       user: {
//         id: user.id,
//         name: user.name,
//         customer_type: user.individual,
//         email: user.email,
//         account_number: user.account_number,
//         role: user.role,
//         kyc_status: user.kyc_status,
//       },
//     });

//   } catch (err) {
//     console.error("Signup error:", err.message);
//     res.status(500).json({ message: "Server error during registration." });
//   }
// };

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, customer_type, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 1: Create user without account number
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      customer_type,
      role: role || "customer",
      kyc_status: "pending",
      is_active: true,
      account_number: null,
    });

    // ---------------------------------------------
    // CREATE LOYALTY ACCOUNT AUTOMATICALLY
    // ---------------------------------------------
    let account = await LoyaltyAccount.findOne({
      where: { customer_id: user.id }, // <-- FIXED
    });

    if (!account) {
      await LoyaltyAccount.create({
        customer_id: user.id, // <-- FIXED
        points_balance: 0,
        tier: "Bronze",
      });
    }

    // Step 2: Generate account number from ID
    const accountNumber = generateAccountNumber(user.id);

    // Step 3: Save the account number
    user.account_number = accountNumber;
    // 🔥 set initial tier at registration
    await assignTierAutomatically(LoyaltyAccount, LoyaltyTier);
    await user.save();

    return res.status(201).json({
      message: "Account created successfully. Waiting for admin approval.",
      user: {
        id: user.id,
        name: user.name,
        customer_type: user.customer_type,
        email: user.email,
        account_number: user.account_number,
        role: user.role,
        kyc_status: user.kyc_status,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "We couldn’t process your request securely. Please try again." });
  }
};





// // ✅ Customer/Business Registration
// exports.register = async (req, res) => {
//   try {
//     const { name, email, phone, password, customer_type, role } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "Name, email, and password are required." });
//     }

//     const existing = await User.findOne({ where: { email } });
//     if (existing) {
//       return res.status(400).json({ message: "Email already exists." });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Step 1: Create user without account number
//     const user = await User.create({
//       name,
//       email,
//       phone,
//       password: hashedPassword,
//       customer_type,
//       role: role || "customer",
//       kyc_status: "pending",
//       is_active: true,
//       account_number: null,
//     });

//     // Step 2: Generate account number using the user ID
//     const accountNumber = generateAccountNumber(user.id);

//     // Step 3: Update user with account number
//     user.account_number = accountNumber;
//     await user.save();

//     return res.status(201).json({
//       message: "Account created successfully. Waiting for admin approval.",
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         account_number: user.account_number,
//         role: user.role,
//         kyc_status: user.kyc_status,
//       },
//     });

//   } catch (err) {
//     console.error("Signup error:", err.message);
//     res.status(500).json({ message: "Server error during registration." });
//   }
// };
// // ✅ Customer/Business Registration
// exports.register = async (req, res) => {
//   try {
//     const { name, email, phone, password, customer_type, role } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "Name, email, and password are required." });
//     }

//     const existing = await User.findOne({ where: { email } });
//     if (existing) {
//       return res.status(400).json({ message: "Email already exists." });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email,
//       phone,
//       password: hashedPassword,
//       customer_type,
//       role: role || "customer", // default
//       kyc_status: "pending", // waiting for admin
//       is_active: true,
//     });

//     res.status(201).json({
//       message: "Account created successfully. Waiting for admin approval.",
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         kyc_status: user.kyc_status,
//       },
//     });
//   } catch (err) {
//     console.error("Signup error:", err.message);
//     res.status(500).json({ message: "Server error during registration." });
//   }
// };




// const bcrypt = require("bcrypt");
// const { User } = require("../models/user");

// // ✅ User Registration
// exports.register = async (req, res) => {
//   try {
//     const { name, email, phone, password, customer_type } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "Name, email, and password are required." });
//     }

//     const existing = await User.findOne({ where: { email } });
//     if (existing) {
//       return res.status(400).json({ message: "Email already exists." });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email,
//       phone,
//       password: hashedPassword,
//       customer_type,
//       role: "customer", // ✅ All signups default to customer role
//     });

//     res.status(201).json({
//       message: "🎉 Account created successfully!",
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         customer_type: user.customer_type,
//       },
//     });
//   } catch (err) {
//     console.error("Signup error:", err.message);
//     res.status(500).json({ message: "Server error during registration." });
//   }
// };
