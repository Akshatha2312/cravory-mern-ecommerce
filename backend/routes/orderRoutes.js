import express from "express";
import {
  createOrder,
  getMyOrders,
<<<<<<< HEAD
  getOrderById,
  getVendorOrders,
  getVendorOrderById,
  updateVendorOrderStatus,
=======
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
  getAllOrders,
  markOrderDelivered,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
<<<<<<< HEAD
import { requireVendor } from "../middleware/vendorMiddleware.js";
=======
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
<<<<<<< HEAD
router.get("/:id", protect, getOrderById);

// Vendor Order Routes
router.get("/vendor/my-orders", protect, requireVendor, getVendorOrders);
router.get("/vendor/:id", protect, requireVendor, getVendorOrderById);
router.patch("/vendor/:id/status", protect, requireVendor, updateVendorOrderStatus);

// Admin Routes
=======

// admin
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id/deliver", protect, adminOnly, markOrderDelivered);

export default router;
