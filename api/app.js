const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");

const { sequelize } = require("./db.js");
const messageroutes =  require("./routes/messages.js");
const adminRoutes = require("./routes/admin");
const loyatityroutes= require('./routes/loyatityroutes.js')
const customer_bussiness = require("./routes/customer_bussiness.js");
const kycroute = require('./routes/kycRoutes.js')
dotenv.config();
app.use(express.json());
const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // limit each IP to 120 requests per minute
  message: {
    success: false,
    message: "Too many requests — slow down.",
  },
});
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // only 5 attempts allowed
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
});

// CORS
app.use(
  cors({
    origin: [
      //"https://mafaconnectfrontend-5d7q.vercel.app",
     // "https://mafaconnectfrontend-ltyc.vercel.app",
     // "https://mafaconnectfrontend.vercel.app",
      "http://localhost:8081",
      "http://127.0.0.1:8081",
      "http://localhost:8080",
      "http://www.mafaconnect.com/auth",
      "http://www.mafaconnect.com",
      "https://www.mafaconnect.com",
      "mafaconnect.com",
      "http://127.0.0.1:8080",
      "http://localhost:8081/auth"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


// ROUTES
app.use('/api/v1',  kycroute);
app.use("/api/v1", adminRoutes);
app.use("/api/v1", customer_bussiness);
app.use("/api/v1", messageroutes);
app.use("/api/v1", loyatityroutes)
// HEALTH CHECK
app.get("/", (req, res) => res.send("MafaConnect Backend is running..."));
app.get("/health", (req, res) => res.send("Healthy "));

// 404 (Not Found)
app.use((req, res, next) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(" Global Error:", err);
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong on the server",
    error: process.env.NODE_ENV === "development" ? err : undefined,
  });
});

// START SERVER
const PORT = process.env.PORT || 9000;

(async () => {
  try {
    await sequelize.authenticate();
    // await sequelize.sync();  
    sequelize.sync({ alter: false, force: false });

    // sequelize.sync({ alter: false, force: false });

    // ✅ TEMPORARY: Auto-create missing tables on first production run
    // await sequelize.sync({ alter: true });

    console.log("✅ Connected to MySQL & Tables Synced");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
})();

// (async () => {
//   try {
//     await sequelize.authenticate();
//     await sequelize.sync();
//     // sequelize.sync({ force: true });

//      await sequelize.sync({ alter: true });
//     console.log("✅ Connected to MySQL");

//     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//   } catch (err) {
//     console.error(" Failed to start server:", err);
//   }
// })();


// const express = require("express");
// const app = express();
// const dotenv = require("dotenv");
// const cors = require("cors");
// const { sequelize } = require("./db.js");
// const adminRoutes = require("./routes/admin");
// const customer_bussiness = require("./routes/customer_bussiness.js");
// dotenv.config();
// app.use(express.json());

// // ✅ Allow both localhost variants
// app.use(
//   cors({
//     origin: [
//       "https://mafaconnectv1.vercel.app/auth",
//       "https://mafaconnectv1.vercel.app",
//       "http://localhost:8081",
//       "https://mafaconnectfrontendv.vercel.app",
//       "http://127.0.0.1:8081",
//       "http://localhost:8080",
//       "http://127.0.0.1:8080",
//       "https://mafaconnectfrontendv.vercel.app/auth",
//     ],
//     credentials: true,
//   })
// );

// // ✅ API routes
// app.use("/api/v1", adminRoutes);
// app.use("/api/v1", customer_bussiness);

// app.get("/", (req, res) => res.send(" MafaConnect Backend is running..."));
// app.get("/health", (req, res) => res.send(" MafaConnect Backend is running..."));
// const PORT = process.env.PORT || 8000;




// // GLOBAL ERROR HANDLER
// app.use((err, req, res, next) => {
//   console.error("🔥 Global Error:", err);

//   return res.status(err.statusCode || 500).json({
//     success: false,
//     message: err.message || "Something went wrong on the server",
//     error: process.env.NODE_ENV === "development" ? err : undefined,
//   });
// });

// (async () => {
//   try {
//     await sequelize.authenticate();
//     await sequelize.sync();
//     // await sequelize.sync({ alter: true });
//     console.log("✅ Connected to MySQL");

//     app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//   } catch (err) {
//     console.error(" Failed to start server:", err);
//   }
// })();





















// // const express = require("express");
// // const dotenv = require("dotenv");
// // const cookieParser = require("cookie-parser");
// // const cors = require("cors");
// // const { sequelize } = require("./db.js"); // adjust path if db.js is inside config/
// // // const authRoutes = require("./routes/auth");
// // // const kycRoutes = require("./routes/kyc");
// // const adminRoutes = require("./routes/admin");
// // dotenv.config();
// // const app = express();
// // // app.use(cors({ origin: "*", credentials: false }));
// // app.use(cors({
// //   origin: "http://localhost:8081",
// //   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
// //   credentials: true
// // }));
// // const PORT = process.env.PORT || 8000;

// // // ✅ Middleware
// // app.use(express.json());
// // app.use(cookieParser());

// // // ✅ Base routes
// // // app.use("/api/auth", authRoutes);
// // // app.use("/api/kyc", kycRoutes);
// // app.use("/api/admin", adminRoutes);

// // // ✅ Health check
// // app.get("/", (req, res) => {
// //   res.send("🚀 MafaConnect Backend API is running...");
// // });

// // // ✅ DB connection + start server
// // (async () => {
// //   try {
// //     await sequelize.authenticate();
// //     // await sequelize.sync({ alter: true });
// //     await sequelize.sync(); // or { force: fal
// //     console.log("✅ Connected to MySQL database");

// //     app.listen(PORT, () => {
// //       console.log(`🚀 Server running on port ${PORT}`);
// //     });
// //   } catch (err) {
// //     console.error("❌ Failed to start server:", err);
// //   }
// // })();

