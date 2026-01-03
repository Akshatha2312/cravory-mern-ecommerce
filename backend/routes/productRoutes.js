import express from "express";
import {
  addProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from "../controllers/productController.js";

import { protect } from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

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

export default router;
