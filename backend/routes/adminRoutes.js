import express from "express";
import {
  getAdminDashboard,
  getAdminVendors,
  updateVendorStatus,
  getAdminUsers,
  toggleUserStatus,
  getAdminProducts,
  toggleProductAvailability,
  getAdminOrders,
  getAdminAnalytics,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

// All routes are strictly protected by protect + adminOnly middleware
router.use(protect, adminOnly);

router.get("/dashboard", getAdminDashboard);
router.get("/vendors", getAdminVendors);
router.patch("/vendors/:id/status", updateVendorStatus);
router.get("/users", getAdminUsers);
router.patch("/users/:id/status", toggleUserStatus);
router.get("/products", getAdminProducts);
router.patch("/products/:id/availability", toggleProductAvailability);
router.get("/orders", getAdminOrders);
router.get("/analytics", getAdminAnalytics);

export default router;
