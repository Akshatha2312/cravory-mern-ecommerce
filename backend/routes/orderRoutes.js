import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  markOrderDelivered,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);

// admin
router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id/deliver", protect, adminOnly, markOrderDelivered);

export default router;
