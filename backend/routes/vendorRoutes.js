import express from "express";
import {
  registerVendor,
  getVendorStatus,
  getVendorProfile,
  updateVendorProfile,
  getPendingVendorsAdmin,
  getAllVendors,
  getPublicVendorById,
  approveVendor,
  updateVendorStatus,
} from "../controllers/vendorController.js";
import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";
import { requireVendor } from "../middleware/vendorMiddleware.js";

const router = express.Router();

// Registration & Vendor Status Management
router.post("/register", protect, registerVendor);
router.get("/me/status", protect, getVendorStatus);
router.get("/me", protect, getVendorProfile);
router.put("/me", protect, requireVendor, updateVendorProfile);

// Admin Specific Routes (Must be declared BEFORE /:id)
router.get("/admin/pending", protect, adminOnly, getPendingVendorsAdmin);
router.patch("/:id/approve", protect, adminOnly, approveVendor);
router.patch("/:id/status", protect, adminOnly, updateVendorStatus);

// Public Marketplace Vendor Details
router.get("/", getAllVendors);
router.get("/:id", getPublicVendorById);

export default router;
