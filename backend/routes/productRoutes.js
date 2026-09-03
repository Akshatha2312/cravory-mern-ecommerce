import express from "express";
import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImage,
<<<<<<< HEAD
  getVendorProducts,
  createVendorProduct,
  updateVendorProduct,
  deleteVendorProduct,
  toggleVendorProductStatus,
  uploadVendorProductImage,
  updateVendorProductStock,
  getVendorPublicProducts,
=======
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
} from "../controllers/productController.js";

import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";
<<<<<<< HEAD
import { requireVendor } from "../middleware/vendorMiddleware.js";
=======
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

<<<<<<< HEAD
// Public Product Routes
router.get("/", getAllProducts);
router.get("/public/vendor/:vendorId", getVendorPublicProducts);

// Vendor Product Management Routes (MUST be declared BEFORE /:id)
router.get("/vendor/my-products", protect, requireVendor, getVendorProducts);
router.post("/vendor", protect, requireVendor, createVendorProduct);
router.put("/vendor/:id", protect, requireVendor, updateVendorProduct);
router.delete("/vendor/:id", protect, requireVendor, deleteVendorProduct);
router.patch("/vendor/:id/status", protect, requireVendor, toggleVendorProductStatus);
router.patch("/vendor/:id/stock", protect, requireVendor, updateVendorProductStock);
router.post(
  "/vendor/:id/upload",
  protect,
  requireVendor,
  upload.single("image"),
  uploadVendorProductImage
);

// Admin Product Routes
router.post("/add-product", protect, adminOnly, addProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);
router.post("/:id/upload", protect, adminOnly, upload.single("image"), uploadProductImage);

// Public Single Product Route (MUST be declared LAST among GETs)
router.get("/:id", getProductById);
=======
// Public
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// Admin
router.post("/add-product", protect, adminOnly, addProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

// Image upload
router.post(
  "/:id/upload",
  protect,
  adminOnly,
  upload.single("image"),
  uploadProductImage
);
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d

export default router;
