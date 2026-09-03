import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getVendorOrders,
  getVendorOrderById,
  updateVendorOrderStatus,
  getAllOrders,
  markOrderDelivered,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireVendor } from "../middleware/vendorMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

// Vendor Order Routes
router.get("/vendor/my-orders", protect, requireVendor, getVendorOrders);
router.get("/vendor/:id", protect, requireVendor, getVendorOrderById);
router.patch("/vendor/:id/status", protect, requireVendor, updateVendorOrderStatus);

// Admin Routes
router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id/deliver", protect, adminOnly, markOrderDelivered);

export default router;
