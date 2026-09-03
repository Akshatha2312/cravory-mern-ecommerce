<<<<<<< HEAD
import "./config/dns.js";
=======
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
import dotenv from "dotenv";
dotenv.config(); // MUST BE FIRST LINE

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
<<<<<<< HEAD
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";
=======
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d

connectDB();

const app = express();
<<<<<<< HEAD

// Production-Aware CORS Configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL.replace(/\/$/, "")]
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman) or during local development
      if (!origin || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: Access denied for this origin."));
    },
    credentials: true,
  })
);

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
=======
app.use(cors());
app.use(express.json());
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d

app.get("/", (req, res) => {
  res.send("Cravory Backend API is running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
<<<<<<< HEAD
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);
=======
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);
