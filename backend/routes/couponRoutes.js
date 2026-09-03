import express from "express";
import {
  applyCoupon,
  getPublicCoupons,
  createCoupon,
  deactivateCoupon,
} from "../controllers/couponController.js";
import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/apply", protect, applyCoupon);
router.get("/", protect, getPublicCoupons);
router.post("/admin", protect, adminOnly, createCoupon);
router.delete("/admin/:id", protect, adminOnly, deactivateCoupon);

export default router;
